import { useUserManagementStore } from '../store/useUserManagementStore';

/**
 * Hook to get current user type information
 */
export const useUserType = () => {
  const { getCurrentUserData, getCurrentUserType } = useUserManagementStore();
  const userData = getCurrentUserData();
  const userType = getCurrentUserType();
  
  const artistSubType = userType === 'artist' ? (userData as any)?.userType : null;
  const companySubType = userType === 'company' ? (userData as any)?.userType : null;
  
  return {
    userType,
    artistSubType, // 'artist' | 'musician' | 'creator' | 'dj' | 'podcaster' | null
    companySubType, // 'record_label' | 'distribution' | 'publisher' | 'management' | null
    isPodcaster: artistSubType === 'podcaster',
    isDJ: artistSubType === 'dj',
    isMusician: artistSubType === 'musician',
    isArtist: artistSubType === 'artist',
    isCreator: artistSubType === 'creator',
    isRecordLabel: companySubType === 'record_label' || companySubType === 'distribution',
    isRecordLabelOnly: companySubType === 'record_label',
    isAdManager: userType === 'ad-manager',
    userData,
  };
};

