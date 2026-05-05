// Profile & Onboarding DTOs matching backend endpoints

// Social Links DTO
export interface SocialLinksDto {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  spotify?: string;
  tiktok?: string;
  facebook?: string;
}

// Address DTO
export interface AddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

// Update Address DTO (all fields optional)
export interface UpdateAddressDto {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Director DTOs
export interface DirectorDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  position: string;
  isPrimaryContact: boolean;
}

export interface DirectorRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  position: string;
  isPrimaryContact: boolean;
}

// Complete Artist Profile Request
export interface CompleteArtistProfileRequest {
  performingName: string;
  bio?: string;
  country: string;
  state?: string;
  website?: string;
  socialLinks?: SocialLinksDto;
}

// Complete Company Profile Request
export interface CompleteCompanyProfileRequest {
  legalName: string;
  tradingName?: string;
  natureOfBusiness: string;
  registrationNumber?: string;
  address: UpdateAddressDto;
  website?: string;
  socialLinks?: SocialLinksDto;
  directors?: DirectorRequest[];
}

// User Profile DTO (response from GET /users/me)
export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;

  // Profile-specific fields
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinksDto;

  // Artist-specific fields
  performingName?: string;
  followerCount?: number;
  trackCount?: number;
  totalEarnings?: number;

  // Company-specific fields
  legalName?: string;
  tradingName?: string;
  natureOfBusiness?: string;
  artistCount?: number;

  // Fan-specific fields
  username?: string;
  displayName?: string;
  coinBalance?: number;
  currentMedal?: string;
  followingCount?: number;
  onboardingCompleted?: boolean;

  // Ad Manager specific fields
  companyName?: string;
  industry?: string;
  activeCampaignCount?: number;
}

// User Summary DTO (public profile)
export interface UserSummaryDto {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
}

// Update Profile Request
export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  phone?: string;
  website?: string;
  country?: string;
  state?: string;
  socialLinks?: SocialLinksDto;

  // Artist-specific
  performingName?: string;

  // Company-specific
  legalName?: string;
  tradingName?: string;
  natureOfBusiness?: string;
  address?: UpdateAddressDto;

  // Fan-specific
  displayName?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  dateOfBirth?: string;
  preferredGenres?: string;

  // Ad Manager specific
  companyName?: string;
  industry?: string;
  businessPhone?: string;
}

// Onboarding DTOs

// Check Username
export interface CheckUsernameRequest {
  username: string;
}

export interface CheckUsernameResult {
  isAvailable: boolean;
  suggestions?: string[];
}

// Set Username
export interface SetUsernameRequest {
  username: string;
}

// Preset Avatars
export interface PresetAvatarsResult {
  male: string[];
  female: string[];
  neutral: string[];
}

// Set Avatar (can be preset URL or file upload)
export interface SetAvatarRequest {
  avatarUrl?: string;
  // File upload is handled via FormData
}

export interface AvatarResult {
  avatarUrl: string;
}

// Suggested Artists
export interface SuggestedArtistDto {
  id: string;
  name: string;
  avatar?: string;
  genre?: string;
  followerCount: number;
}

// Follow Artists
export interface FollowArtistsRequest {
  artistIds: string[];
}
