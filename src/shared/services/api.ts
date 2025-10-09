import { axiosInstance } from "@app/lib/axiosInstance";

export const api = {
  get: <T>(url: string) => axiosInstance.get<T>(url),
  post: <T>(url: string, data?: any) => axiosInstance.post<T>(url, data),
  put: <T>(url: string, data?: any) => axiosInstance.put<T>(url, data),
  delete: <T>(url: string) => axiosInstance.delete<T>(url),
  patch: <T>(url: string, data?: any) => axiosInstance.patch<T>(url, data),
};
