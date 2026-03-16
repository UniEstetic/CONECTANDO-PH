import NextAuth, { DefaultSession } from "next-auth";

export interface AuthProfileUser {
  email: string;
  firstName: string;
  lastName: string;
  document: string;
  documentType: string;
  phone: string;
  avatar: string;
  roles: string[];
}

export interface AuthOwnership {
  id: string;
  name: string;
  tax_id: string;
  address: string;
  city: string;
  country: string;
  state: string;
}

export interface AuthTokenProfile {
  userProfile?: AuthProfileUser;
  ownership?: AuthOwnership;
  userId?: string;
  scope?: string[];
  firstName?: string;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    userId?: string;
    error?: string;
    user: {
      userId?: string;
      scope?: string[];
      firstName?: string;
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
      };
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
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    refreshTokenExpiresAt?: number;
    error?: string;
    profile?: AuthTokenProfile;
  }
}

export interface UserAuth{
  userProfile: AuthProfileUser,
  userId: string,
  ownership: AuthOwnership,
  scope: string[]
}

export interface AuthUser extends UserAuth {
  id: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
  firstName?: string;
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
    expires_in?: number;
    token_type?: string;
    refresh_token?: string;
    refresh_expires_in?: number;
    user?: User;
  };
}

export interface RefreshTokenResponse {
  result: {
    access_token: string;
    expires_in?: number;
    token_type?: string;
    refresh_token?: string;
    refresh_expires_in?: number;
  };
}

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}