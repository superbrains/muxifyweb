export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

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
