import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {
  selectProvider,
  validateLogin,
  getProfile,
  refreshAccessToken,
  revokeRefreshToken,
} from "@/app/services/auth.service";
import type { JWT } from "next-auth/jwt";
import type { AuthTokenProfile, AuthUser } from "@/app/types/next-auth";

const PROVIDER_DEFAULT = process?.env?.AUTH_PROVIDER_DEFAULT ?? "accessEmail";
const SESSION_TIMEOUT = parseInt(process?.env?.NEXTAUTH_SESSION_TIMEOUT ?? "3600", 10);
const ACCESS_TOKEN_SAFETY_WINDOW_MS = 30 * 1000;

class LoginCredentialsError extends CredentialsSignin {
  code: string;

  constructor(message: string) {
    super();
    this.code = message || "credentials";
  }
}

function computeExpiresAt(expiresInSeconds?: number) {
  if (!expiresInSeconds || Number.isNaN(expiresInSeconds)) {
    return undefined;
  }
  return Date.now() + expiresInSeconds * 1000;
}

async function refreshJwtToken(token: JWT): Promise<JWT> {
  try {
    if (!token?.refreshToken) {
      return { ...token, error: "MissingRefreshToken" };
    }

    const refreshed = await refreshAccessToken(String(token.refreshToken));
    const result = refreshed?.result;

    if (!result?.access_token || !result?.expires_in) {
      return {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        error: "InvalidRefreshPayload",
      };
    }

    return {
      ...token,
      accessToken: result.access_token,
      accessTokenExpiresAt: computeExpiresAt(result.expires_in),
      refreshToken: result.refresh_token || token.refreshToken,
      refreshTokenExpiresAt: result.refresh_expires_in
        ? computeExpiresAt(result.refresh_expires_in)
        : token.refreshTokenExpiresAt,
      error: undefined,
    };
  } catch (error) {
    console.error("[AUTH REFRESH ERROR]", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

function getRequiredFirstName(
  firstNameFromUser?: string,
  firstNameFromProfile?: string
): string {
  return firstNameFromUser || firstNameFromProfile || "Usuario";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "clave_super_secreta_de_emergencia",
  session: {
    strategy: "jwt",
    maxAge: SESSION_TIMEOUT,
    updateAge: 60,
  },
  jwt: {
    maxAge: SESSION_TIMEOUT,
  },
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new LoginCredentialsError("Email y contraseña son requeridos");
          }

          // Obtener token del provider
          const providerResponse = await selectProvider(PROVIDER_DEFAULT);

          const providerToken =
            providerResponse?.result?.authorization?.token;

          if (!providerToken) {
            throw new Error("No se pudo obtener token de autorización");
          }

          // Validar login
          const loginResponse = await validateLogin(
            providerToken,
            credentials.email as string,
            credentials.password as string
          );

          const accessToken = loginResponse?.result?.access_token;
          const refreshToken = loginResponse?.result?.refresh_token;
          const accessTokenExpiresIn = loginResponse?.result?.expires_in;
          const refreshTokenExpiresIn = loginResponse?.result?.refresh_expires_in;

          if (!accessToken) {
            throw new LoginCredentialsError("Email o contraseña incorrectos");
          }

          // Obtener perfil
          const profileData = await getProfile(accessToken);

          if (!profileData?.userId) {
            throw new Error("userId no recibido desde el backend");
          }

          const user: AuthUser = {
            ...profileData,
            id: profileData.userId,
            accessToken,
            refreshToken,
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
            // Asume ownership principal como el primero de la lista
            ownership: Array.isArray(profileData.ownerships) ? profileData.ownerships[0] : profileData.ownerships,
            ownerships: Array.isArray(profileData.ownerships)
              ? profileData.ownerships
              : profileData.ownerships
                ? [profileData.ownerships]
                : [],
          };

          return user;
        } catch (error) {
          console.error("[AUTH ERROR]", error);

          if (error instanceof LoginCredentialsError) {
            throw error;
          }

          if (error instanceof Error) {
            throw new LoginCredentialsError(error.message);
          }

          throw new LoginCredentialsError("No se pudo iniciar sesión");
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },

  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      const refreshToken = token?.refreshToken;
      if (!refreshToken) return;

      try {
        await revokeRefreshToken(String(refreshToken));
      } catch (error) {
        // No bloquea cierre local de sesión si falla el logout remoto.
        console.error("[AUTH LOGOUT ERROR]", error);
      }
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const incomingUser = user as AuthUser;

        const userProfile = incomingUser.userProfile;

        const firstName = getRequiredFirstName(
          incomingUser.firstName,
          userProfile?.firstName
        );

        token.accessToken = incomingUser.accessToken;
        token.refreshToken = incomingUser.refreshToken;
        token.accessTokenExpiresAt = computeExpiresAt(incomingUser.accessTokenExpiresIn);
        token.refreshTokenExpiresAt = incomingUser.refreshTokenExpiresIn
          ? computeExpiresAt(incomingUser.refreshTokenExpiresIn)
          : undefined;
        token.error = undefined;

        token.profile = {
          userProfile,
          ownerships: incomingUser.ownerships,
          userId: incomingUser.userId,
          scope: incomingUser.scope,
          firstName,
        } as AuthTokenProfile;
      }

      if (token.error) {
        return token;
      }

      if (!token.accessTokenExpiresAt) {
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          error: "MissingAccessTokenExpiry",
        };
      }
      // Set expiration time
      const now = Math.floor(Date.now() / 1000);
      token.exp = now + SESSION_TIMEOUT;
      
      const accessTokenExpiresAt = Number(token.accessTokenExpiresAt || 0);
      if (accessTokenExpiresAt - ACCESS_TOKEN_SAFETY_WINDOW_MS > Date.now()) {
        return token;
      }

      const refreshTokenExpiresAt = Number(token.refreshTokenExpiresAt || 0);
      if (refreshTokenExpiresAt && refreshTokenExpiresAt <= Date.now()) {
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          error: "RefreshTokenExpired",
        };
      }

      return refreshJwtToken(token);
    },

    async session({ session, token }) {
      if (token) {
        const profile = (token.profile ?? {}) as AuthTokenProfile;
        const userProfile = profile.userProfile;
        const ownership = Array.isArray(profile.ownerships)
          ? profile.ownerships[0]
          : profile.ownerships;

        const firstName = getRequiredFirstName(
          profile.firstName,
          userProfile?.firstName
        );

        session.accessToken = token.accessToken;
        session.accessTokenExpiresAt = token.accessTokenExpiresAt;
        session.error = token.error;

        session.user = {
          ...(session.user || {}),
          ownership,
          ownerships: profile.ownerships,
          userId: profile.userId,
          scope: profile.scope,
          userProfile,
          name: firstName,
          firstName,
        };
      }

      return session;
    },
  },
});