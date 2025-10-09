import { useUserStore } from "@app/store/useUserStore";

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, updateUser } = useUserStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };
};
