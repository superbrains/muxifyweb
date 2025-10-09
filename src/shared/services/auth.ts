import { api } from "./api";
import type { User } from "@shared/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "artist" | "dj" | "creator" | "record_label";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/login", credentials),

  register: (data: RegisterData) =>
    api.post<AuthResponse>("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  refreshToken: () => api.post<{ token: string }>("/auth/refresh"),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};
