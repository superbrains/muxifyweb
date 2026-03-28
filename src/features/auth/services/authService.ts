import { api } from "@shared/services/api";
import { tokenStorage } from "@app/lib/axiosInstance";
import type { User } from "@shared/types";

// Request DTOs matching backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: "artist" | "dj" | "creator" | "record_label";
}

export interface LogoutRequest {
  refreshToken?: string;
  revokeAll?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  code: string;
}

// Response DTOs matching backend
export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenResult {
  token: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

// Legacy type aliases for backward compatibility
export type LoginCredentials = LoginRequest;
export type RegisterData = RegisterRequest;
export type AuthResponse = AuthResult;

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResult> => {
    const response = await api.post<AuthResult>("/auth/login", credentials);
    const { token, refreshToken } = response.data;
    tokenStorage.setTokens(token, refreshToken);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResult> => {
    const response = await api.post<AuthResult>("/auth/register", data);
    const { token, refreshToken } = response.data;
    tokenStorage.setTokens(token, refreshToken);
    return response.data;
  },

  logout: async (request?: LogoutRequest): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();
    await api.post("/auth/logout", {
      refreshToken: request?.refreshToken ?? refreshToken,
      revokeAll: request?.revokeAll ?? true,
    });
    tokenStorage.clearTokens();
  },

  refreshToken: async (): Promise<TokenResult> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await api.post<TokenResult>("/auth/refresh", {
      refreshToken,
    });
    const { token, refreshToken: newRefreshToken } = response.data;
    tokenStorage.setTokens(token, newRefreshToken);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  verifyEmail: async (code: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>("/auth/verify-email", {
      code,
    });
    return response.data;
  },
};
