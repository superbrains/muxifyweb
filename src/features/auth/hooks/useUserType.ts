import { useUserManagementStore } from "../store/useUserManagementStore";
import type {
  ArtistOnboardingData,
  ArtistSubType,
  CompanyOnboardingData,
  CompanySubType,
  OnboardingData,
} from "../store/useUserManagementStore";

const ARTIST_SUB_TYPES: ReadonlyArray<ArtistSubType> = [
  "artist",
  "musician",
  "creator",
  "dj",
  "podcaster",
];
const COMPANY_SUB_TYPES: ReadonlyArray<CompanySubType> = [
  "record_label",
  "distribution",
  "publisher",
  "management",
];
const MUSICIAN_SUB_TYPE: ArtistSubType = "musician";

const isArtistData = (
  data: OnboardingData | null
): data is ArtistOnboardingData =>
  !!data && ARTIST_SUB_TYPES.includes(data.userType as ArtistSubType);

const isCompanyData = (
  data: OnboardingData | null
): data is CompanyOnboardingData =>
  !!data && COMPANY_SUB_TYPES.includes(data.userType as CompanySubType);

/**
 * Hook to get current user type information
 */
export const useUserType = () => {
  const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
  const userData = getCurrentUserData();
  const userType = getCurrentUserType();

  const artistSubType =
    userType === "artist" && isArtistData(userData) ? userData.userType : null;
  const companySubType =
    userType === "company" && isCompanyData(userData)
      ? userData.userType
      : null;

  return {
    userType,
    artistSubType, // 'artist' | 'musician' | 'creator' | 'dj' | 'podcaster' | null
    companySubType, // 'record_label' | 'distribution' | 'publisher' | 'management' | null
    isPodcaster: artistSubType === "podcaster",
    isDJ: artistSubType === "dj",
    isMusician: artistSubType === MUSICIAN_SUB_TYPE,
    isArtist: artistSubType === "artist",
    isCreator: artistSubType === "creator",
    isRecordLabel:
      companySubType === "record_label" || companySubType === "distribution",
    isRecordLabelOnly: companySubType === "record_label",
    isAdManager: userType === "ad-manager",
    userData,
  };
};
