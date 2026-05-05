import { api } from "@shared/services/api";
import type {
  UserProfileDto,
  UserSummaryDto,
  UpdateProfileRequest,
} from "@/features/onboarding/types";

// Re-export types for convenience
export type { UserProfileDto, UserSummaryDto, UpdateProfileRequest };

export interface AvatarResult {
  avatarUrl: string;
}

export const userService = {
  /**
   * Get the current authenticated user's profile
   * GET /api/v1/users/me
   */
  getCurrentUser: async (): Promise<UserProfileDto> => {
    const response = await api.get<UserProfileDto>("/users/me");
    return response.data;
  },

  /**
   * Update the current user's profile
   * PUT /api/v1/users/me
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<UserProfileDto> => {
    const response = await api.put<UserProfileDto>("/users/me", data);
    return response.data;
  },

  /**
   * Upload a new avatar for the current user
   * POST /api/v1/users/me/avatar
   */
  uploadAvatar: async (file: File): Promise<AvatarResult> => {
    const formData = new FormData();
    formData.append("file", file);

    // Don't set Content-Type header manually - Axios will set it automatically with the correct boundary
    const response = await api.post<AvatarResult>("/users/me/avatar", formData);
    return response.data;
  },

  /**
   * Get a user's public profile by ID
   * GET /api/v1/users/{id}
   */
  getUserById: async (userId: string): Promise<UserSummaryDto> => {
    const response = await api.get<UserSummaryDto>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Deactivate the current user's account
   * DELETE /api/v1/users/me
   */
  deactivateAccount: async (): Promise<void> => {
    await api.delete("/users/me");
  },
};
