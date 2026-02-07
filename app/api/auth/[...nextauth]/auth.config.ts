import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  selectProvider,
  validateLogin,
  getProfile,
} from "@/app/lib/services/auth.service";
const PROVIDER_DEFAULT = process?.env?.AUTH_PROVIDER_DEFAULT ?? "accessEmail";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "clave_super_secreta_de_emergencia",
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
              const profileData = await getProfile(
                String(access_token_backend),
              );
              
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
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { 
        token.accessToken = (user as any).accessToken;
        token.profile = {
           userProfile: (user as any).userProfile,
           ownership: (user as any).ownership,
           userId: (user as any).userId,
           scope: (user as any).scope
        };
      }
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
