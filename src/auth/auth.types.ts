export interface User {
  id: number | string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  fundsAvailable?: string | number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  passwordChangedAt?: string;
}

export interface AuthToken {
  token: string;
  expires: string;
}

export interface AuthTokens {
  access: AuthToken;
  refresh: AuthToken;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  portal?: string;
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}
