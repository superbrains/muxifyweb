import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7084/api/v1";

// Token storage keys
const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Token management utilities
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for development (was 10s)
  headers: {
    "Content-Type": "application/json",
  },
});

// Singleton refresh promise. Every concurrent 401 awaits the SAME promise so only one
// POST /auth/refresh ever flies. Required because the backend rotates refresh tokens
// single-use — two parallel refreshes with the same token would race and the loser
// would log the user out mid-session.
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<{
    token: string;
    refreshToken: string;
  }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

  tokenStorage.setTokens(response.data.token, response.data.refreshToken);
  return response.data.token;
}

function decodeJwtExp(jwt: string): number | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

/**
 * Ensure the stored access token has at least `minSeconds` of life remaining,
 * refreshing it if not. Use this before long-tail requests (e.g. resumable
 * upload `/complete` calls that fire after many minutes of block uploads to
 * Azure) so the request doesn't depend on the 401-retry interceptor — under
 * concurrent uploads the retry path can race with refresh-token rotation.
 *
 * Coalesces onto the same singleton `refreshPromise` as the response
 * interceptor, so parallel uploads still produce only one /auth/refresh call.
 */
export async function ensureFreshAccessToken(minSeconds = 60): Promise<void> {
  const token = tokenStorage.getAccessToken();
  if (!token) return;
  const exp = decodeJwtExp(token);
  if (exp === null) return;
  const remaining = exp - Math.floor(Date.now() / 1000);
  if (remaining > minSeconds) return;
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  try {
    await refreshPromise;
  } catch {
    // Swallow — the subsequent request will 401 and the response interceptor
    // takes over (clear tokens, redirect to /login).
  }
}

// Request interceptor to add auth token and handle FormData
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData - let the browser set it with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if we're on the refresh or login endpoint
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Coalesce concurrent 401s onto a single refresh call.
    if (!refreshPromise) {
      refreshPromise = performRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const newToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      tokenStorage.clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);
