import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/hooks/useAuth";
import { useChakraToast } from "@shared/hooks";
import { authService } from "../services/authService";
import type { LoginCredentials } from "../services/authService";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useChakraToast();
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      localStorage.setItem("auth_token", token);
      login(user);

      toast.success("Welcome back!", "You have been successfully logged in.");
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);

      toast.error(
        "Login failed",
        errorMessage
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
  };
};

const extractErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: unknown } }).response !== null
  ) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: string }).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  return "Invalid credentials";
};
