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
    } catch (error: any) {
      toast.error(
        "Login failed",
        error.response?.data?.message || "Invalid credentials"
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
