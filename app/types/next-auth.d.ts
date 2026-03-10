import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId?: string;
    user: {
      userId?: string;
      userProfile?: {
        firstName: string;
        lastName: string;
        email: string;
        roles: string[];
        avatar: string;
        document?: string;
        documentType?: string;
        phone?: string;
      };
      ownership?: {
        name: string;
        id: string;
        tax_id?: string;
        address?: string;
        city?: string;
        country?: string;
        state?: string;
      }[];
    } & DefaultSession["user"];
  }

  interface User {
    userProfile?: any;
    ownership?: any;
    accessToken?: string;
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userProfile?: any;
    ownership?: any;
    accessToken?: string;
  }
}

export interface UserAuth{
  userProfile: {
    email: string,
    firstName: string,
    lastName: string,
    document: string,
    documentType: string,
    phone: string,
    avatar: string,
    roles: string[]
  },
  userId: string,
  ownership: {
    id: string,
    name: string,
    tax_id: string,
    address: string,
    city: string,
    country: string,
    state: string
  },
  scope: string
}

export interface SelectProviderResponse {
  result: {
    authorization: any;
    temp_token: string;
  };
}

export interface ValidateLoginResponse {
  result: {
    access_token: string;
    user: User;
  };
}

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}