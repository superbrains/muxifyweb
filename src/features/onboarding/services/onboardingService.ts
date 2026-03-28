import { api } from "@shared/services/api";
import type {
  CheckUsernameRequest,
  CheckUsernameResult,
  SetUsernameRequest,
  PresetAvatarsResult,
  AvatarResult,
  SuggestedArtistDto,
  FollowArtistsRequest,
} from "../types";

export const onboardingService = {
  /**
   * Check if a username is available
   * POST /api/v1/onboarding/check-username
   */
  checkUsername: async (
    username: string
  ): Promise<CheckUsernameResult> => {
    const request: CheckUsernameRequest = { username };
    const response = await api.post<CheckUsernameResult>(
      "/onboarding/check-username",
      request
    );
    return response.data;
  },

  /**
   * Set the user's username during onboarding
   * POST /api/v1/onboarding/set-username
   */
  setUsername: async (username: string): Promise<void> => {
    const request: SetUsernameRequest = { username };
    await api.post("/onboarding/set-username", request);
  },

  /**
   * Get preset avatar options organized by gender
   * GET /api/v1/onboarding/avatars
   */
  getAvatars: async (): Promise<PresetAvatarsResult> => {
    const response = await api.get<PresetAvatarsResult>("/onboarding/avatars");
    return response.data;
  },

  /**
   * Set avatar using a preset URL
   * POST /api/v1/onboarding/set-avatar
   */
  setAvatarUrl: async (avatarUrl: string): Promise<AvatarResult> => {
    const formData = new FormData();
    formData.append("avatarUrl", avatarUrl);

    const response = await api.post<AvatarResult>(
      "/onboarding/set-avatar",
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
   * Set avatar by uploading a file
   * POST /api/v1/onboarding/set-avatar
   */
  setAvatarFile: async (file: File): Promise<AvatarResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<AvatarResult>(
      "/onboarding/set-avatar",
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
   * Get suggested artists to follow during onboarding
   * GET /api/v1/onboarding/suggested-artists
   */
  getSuggestedArtists: async (
    count: number = 10
  ): Promise<SuggestedArtistDto[]> => {
    const response = await api.get<SuggestedArtistDto[]>(
      "/onboarding/suggested-artists",
      {
        params: { count },
      }
    );
    return response.data;
  },

  /**
   * Bulk follow artists during onboarding
   * POST /api/v1/onboarding/follow-artists
   */
  followArtists: async (artistIds: string[]): Promise<void> => {
    const request: FollowArtistsRequest = { artistIds };
    await api.post("/onboarding/follow-artists", request);
  },

  /**
   * Mark onboarding as complete
   * POST /api/v1/onboarding/complete
   */
  completeOnboarding: async (): Promise<void> => {
    await api.post("/onboarding/complete");
  },
};
