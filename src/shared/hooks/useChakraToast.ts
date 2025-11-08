import { toaster } from "@/components/ui/toaster-instance";

export const useChakraToast = () => {
  const success = (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: "success",
    });
  };

  const error = (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: "error",
    });
  };

  const warning = (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: "warning",
    });
  };

  const info = (title: string, description?: string) => {
    toaster.create({
      title,
      description,
      type: "info",
    });
  };

  const loading = (title: string, description?: string) => {
    return toaster.create({
      title,
      description,
      type: "loading",
    });
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
  };
};
