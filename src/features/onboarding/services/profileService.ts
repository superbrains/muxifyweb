import { api } from "@shared/services/api";
import type {
  CompleteArtistProfileRequest,
  CompleteCompanyProfileRequest,
  DirectorDto,
  DirectorRequest,
  UserProfileDto,
} from "../types";

export const profileService = {
  /**
   * Complete artist profile during onboarding
   * POST /api/v1/profile/artist
   */
  completeArtistProfile: async (
    data: CompleteArtistProfileRequest
  ): Promise<UserProfileDto> => {
    const response = await api.post<UserProfileDto>("/profile/artist", data);
    return response.data;
  },

  /**
   * Complete company/record label profile during onboarding
   * POST /api/v1/profile/company
   */
  completeCompanyProfile: async (
    data: CompleteCompanyProfileRequest
  ): Promise<UserProfileDto> => {
    const response = await api.post<UserProfileDto>("/profile/company", data);
    return response.data;
  },

  /**
   * Upload verification documents
   * POST /api/v1/profile/verification
   */
  uploadVerificationDocs: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    await api.post("/profile/verification", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Upload or replace the record-label company logo
   * POST /api/v1/profile/company/logo
   */
  uploadCompanyLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{ logoUrl: string }>(
      "/profile/company/logo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Add a director to company profile
   * POST /api/v1/profile/directors
   */
  addDirector: async (data: DirectorRequest): Promise<DirectorDto> => {
    const response = await api.post<DirectorDto>("/profile/directors", data);
    return response.data;
  },

  /**
   * Remove a director from company profile
   * DELETE /api/v1/profile/directors/{id}
   */
  removeDirector: async (directorId: string): Promise<void> => {
    await api.delete(`/profile/directors/${directorId}`);
  },

  /**
   * Mark profile onboarding as complete
   * POST /api/v1/profile/complete
   */
  completeProfileOnboarding: async (): Promise<void> => {
    await api.post("/profile/complete");
  },
};
