import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  selectProvider,
  validateLogin,
  getProfile,
} from "@/app/services/auth.service";
const PROVIDER_DEFAULT = process?.env?.AUTH_PROVIDER_DEFAULT ?? "accessEmail";
const SESSION_TIMEOUT = parseInt(process?.env?.NEXTAUTH_SESSION_TIMEOUT ?? "3600", 10);

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
          const providerTk = await selectProvider(PROVIDER_DEFAULT);

          if (providerTk?.result?.authorization?.token) {
            const startLogin = await validateLogin(
              String(providerTk?.result?.authorization?.token),
              String(credentials?.email),
              String(credentials?.password),
            );

            if (startLogin?.result?.access_token) {
              const access_token_backend = startLogin?.result?.access_token;
              let profileData = await getProfile(
                String(access_token_backend),
              );
              
              if(profileData?.ownership){
                //profileData.ownership= profileData?.ownership[profileData.ownership];
              }

              return {
                ...profileData,
                id: profileData?.userId || "ID_UNICO",
                accessToken: access_token_backend,
              };
            }
          }
          return null;
        } catch (e) {
          console.error("[ERROR] selectProvider", e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { 
        token.accessToken = (user as any).accessToken;
        token.profile = {
           userProfile: (user as any).userProfile,
           ownership: (user as any).ownership,
           userId: (user as any).userId,
           scope: (user as any).scope
        };
      }
      // Set expiration time
      const now = Math.floor(Date.now() / 1000);
      token.exp = now + SESSION_TIMEOUT;
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.user = token.profile as any;
      }
      return session;
    },
  },
});
