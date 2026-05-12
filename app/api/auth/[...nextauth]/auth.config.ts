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

const PROVIDER_DEFAULT = process.env.AUTH_PROVIDER_DEFAULT ?? "accessEmail";
const SESSION_TIMEOUT = parseInt(process.env.NEXTAUTH_SESSION_TIMEOUT ?? "3600", 10);
const ACCESS_TOKEN_SAFETY_WINDOW_MS = 30 * 1000; // 30 segundos de margen para refrescar

class LoginCredentialsError extends CredentialsSignin {
  code: string;
  constructor(message: string) {
    super();
    this.code = message || "credentials";
  }
}

// Calcula el timestamp de expiración sumando segundos al tiempo actual
const computeExpiresAt = (expiresInSeconds?: number) => 
  expiresInSeconds && !Number.isNaN(expiresInSeconds) 
    ? Date.now() + expiresInSeconds * 1000 
    : undefined;

// Normaliza y limpia los roles para asegurar que siempre sea un array de strings 
const normalizeRoleNames = (roles: Array<string | { name: string }> | undefined): string[] => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => (typeof role === "string" ? role : role?.name || ""))
    .filter((role) => role.length > 0);
};

// Normaliza scopes en caso de que backend envíe strings JSON serializados dentro del arreglo.
const normalizeScopes = (scope: unknown): string[] => {
  if (!Array.isArray(scope)) return [];

  const values: string[] = [];

  for (const item of scope) {
    if (typeof item !== "string") continue;

    const trimmed = item.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (typeof p === "string" && p.trim()) {
              values.push(p.trim());
            }
          }
          continue;
        }
      } catch {
        // Si no es JSON válido, se trata como scope plano.
      }
    }

    values.push(trimmed);
  }

  return Array.from(new Set(values));
};

// Lógica central de Refresh Token Rotation 
async function refreshJwtToken(token: JWT): Promise<JWT> {
  try {
    if (!token?.refreshToken) return { ...token, error: "MissingRefreshToken" };

    const refreshed = await refreshAccessToken(String(token.refreshToken));
    const result = refreshed?.result;

    if (!result?.access_token || !result?.expires_in) {
      return { ...token, accessToken: undefined, error: "InvalidRefreshPayload" };
    }

    return {
      ...token,
      accessToken: result.access_token,
      accessTokenExpiresAt: computeExpiresAt(result.expires_in),
      refreshToken: result.refresh_token || token.refreshToken, // Mantiene el actual si no llega uno nuevo
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_TIMEOUT,
    updateAge: 60, // Frecuencia de actualización de la cookie
  },
  trustHost: true,
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
            throw new LoginCredentialsError("Email y contraseña requeridos");
          }

          // 1. Obtención de autorización del provider
          const providerResponse = await selectProvider(PROVIDER_DEFAULT);
          const providerToken = providerResponse?.result?.authorization?.token;
          if (!providerToken) throw new Error("Error de comunicación con el proveedor");

          // 2. Validación de credenciales contra el backend
          const loginResponse = await validateLogin(
            providerToken,
            credentials.email as string,
            credentials.password as string
          );

          const { access_token, refresh_token, expires_in, refresh_expires_in } = loginResponse?.result || {};
          if (!access_token) throw new LoginCredentialsError("Credenciales inválidas");

          // 3. Obtención del perfil para la sesión
          const profileData = await getProfile(access_token);
          if (!profileData?.userId) throw new Error("Perfil incompleto: userId faltante");

          return {
            ...profileData,
            id: profileData.userId,
            accessToken: access_token,
            refreshToken: refresh_token,
            accessTokenExpiresIn: expires_in,
            refreshTokenExpiresIn: refresh_expires_in,
          } as AuthUser;

        } catch (error) {
          console.error("[AUTHORIZE ERROR]", error);
          if (error instanceof LoginCredentialsError) throw error;
          throw new LoginCredentialsError(error instanceof Error ? error.message : "Error de servidor");
        }
      },
    }),
  ],

  pages: { signIn: "/auth/login" },

  events: {
    async signOut(message) {
      // Intenta revocar el token en el servidor remoto al cerrar sesión
      const token = "token" in message ? message.token : null;
      if (token?.refreshToken) {
        try {
          await revokeRefreshToken(String(token.refreshToken));
        } catch (e) {
          console.error("[REVOKE ERROR]", e);
        }
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      // 1. Login inicial: se recibe el objeto `user` desde `authorize`, se construye el JWT con los datos de autenticación y perfil
      if (user) {
        const u = user as AuthUser;
        const resolvedUserId = (u.userId || "").trim();
        const resolvedEmail = (u.userProfile?.email || u.email || "").trim();
        const resolvedName = (u.userProfile?.firstName || u.firstName || "Usuario").trim() || "Usuario";
        const resolvedRoles = normalizeRoleNames(u.userProfile?.roles);
        const resolvedScope = normalizeScopes(u.scope);

        // Si faltan claims críticos, marcamos error para forzar reautenticación.
        if (!resolvedUserId || !resolvedEmail) {
          return {
            ...token,
            accessToken: undefined,
            refreshToken: undefined,
            error: "InvalidSessionProfile",
          };
        }

        return {
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpiresAt: computeExpiresAt(u.accessTokenExpiresIn),
          refreshTokenExpiresAt: computeExpiresAt(u.refreshTokenExpiresIn),
          profile: {
            userId: resolvedUserId,
            scope: resolvedScope,
            roles: resolvedRoles,
            email: resolvedEmail,
            name: resolvedName,
          },
        };
      }

      // Verificación de expiración del Access Token en cada llamada 
      const now = Date.now();
      const accessTokenExpiresAt = Number(token.accessTokenExpiresAt || 0);

      // Si aún es válido y no estamos en la ventana de seguridad, devolvemos el token tal cual
      if (accessTokenExpiresAt - ACCESS_TOKEN_SAFETY_WINDOW_MS > now) {
        return token;
      }

        // 3. Si el Access Token ha expirado o está por expirar, verificamos el Refresh Token
      const refreshTokenExpiresAt = Number(token.refreshTokenExpiresAt || 0);
      if (refreshTokenExpiresAt && refreshTokenExpiresAt <= now) {
        return { ...token, error: "RefreshTokenExpired" };
      }

      // Ejecutamos la rotación de tokens
      return refreshJwtToken(token);
    },

    async session({ session, token }) {
      // Mapeamos los datos del JWT de vuelta a la sesión que verá el cliente
      if (token) {
        const profile = token.profile as AuthTokenProfile | undefined;
        const resolvedId = profile?.userId || token.sub || "";
        const resolvedName = profile?.name || "Usuario";
        const resolvedEmail = profile?.email || "";
        const resolvedRoles = Array.isArray(profile?.roles) ? profile.roles : [];
        const resolvedScope = Array.isArray(profile?.scope) ? profile.scope : [];

        session.accessToken = token.accessToken;
        session.accessTokenExpiresAt = token.accessTokenExpiresAt;
        session.error = token.error;

        if (!resolvedId || !resolvedEmail) {
          session.error = "InvalidSessionProfile";
        }

        session.user = {
          ...session.user,
          id: resolvedId,
          scope: resolvedScope,
          roles: resolvedRoles,
          email: resolvedEmail,
          name: resolvedName,
        };
      }
      return session;
    },
  },
});