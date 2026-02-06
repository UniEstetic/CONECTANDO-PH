import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      userProfile?: {
        firstName: string;
        lastName: string;
        email: string;
        roles: string[];
        avatar: string;
      };
      ownership?: {
        name: string;
        id: string;
      };
    } & DefaultSession["user"];
  }

  interface User {
    userProfile?: any;
    ownership?: any;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userProfile?: any;
    ownership?: any;
    accessToken?: string;
  }
}
