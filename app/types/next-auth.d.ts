import NextAuth, { DefaultSession } from "next-auth";

export interface AuthProfileUser {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  document?: string;
  documentType?: string;
  phone?: string;
  avatar?: string;
  roles: Array<string | { name: string }>;
}

export interface AuthTokenProfile {
  userId: string;
  scope: string[];
  roles: string[];
  email: string;
  name: string;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      scope: string[];
    } & DefaultSession["user"];
  }

  interface User {
    userProfile?: any;
    accessToken?: string;
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userProfile?: any;
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
  scope: string[],
  roles?: string[]
}

export interface AuthUser extends UserAuth {
  email: string;
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