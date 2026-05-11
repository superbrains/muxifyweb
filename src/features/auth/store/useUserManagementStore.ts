import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDbStorage } from "@/shared/lib/indexedDbStorage";
import type { UserProfileDto } from "@/features/onboarding/types";

// User type definitions
export type UserType = "artist" | "company" | "ad-manager";
export type ArtistSubType = "artist" | "musician" | "creator" | "dj" | "podcaster";
export type CompanySubType = "record_label" | "distribution" | "publisher" | "management";
export type AdManagerSubType = "personal" | "business" | "agency" | "enterprise";

// Director information interface
export interface DirectorInfo {
  name: string;
  meansOfIdentification: string;
  identityNumber: string;
  // Extended fields (v2) for record-label onboarding
  email?: string;
  phone?: string;
  position?: string; // CEO | COO | Director | Secretary | Other
  isPrimaryContact?: boolean;
}

// Artist-specific data
export interface ArtistOnboardingData {
  // Registration
  userType: ArtistSubType;
  email: string;
  phone: string;
  
  // Complete Information
  fullName?: string;
  performingName?: string;
  recordLabel?: string;
  country?: string;
  state?: string;
  residentAddress?: string;
  
  // Display Picture
  displayPicture?: string; // Base64 or URL
  
  // Email verification
  emailVerified?: boolean;
  
  // Identity verification
  identityVerified?: boolean;
  identityVerificationDocuments?: {
    idType?: string;
    idNumber?: string;
    idDocument?: string; // Base64 or URL
  };
}

// Company-specific data
export interface CompanyOnboardingData {
  // Registration
  userType: CompanySubType;
  email: string;
  phone: string;
  
  // Company Information
  legalCompanyName?: string;
  companyName?: string;
  natureOfBusiness?: string;
  country?: string;
  state?: string;
  companyAddress?: string;
  
  // Directors Information
  directors?: DirectorInfo[];
  artists?: string[];
  
  // Label Logo
  labelLogo?: string; // Base64 or URL
  
  // Email verification
  emailVerified?: boolean;
  
  // Identity verification
  identityVerified?: boolean;
  identityVerificationDocuments?: {
    registrationDocuments?: string[]; // Array of base64 or URLs
  };
}

// Ad Manager-specific data
export interface AdManagerOnboardingData {
  // Registration
  userType: AdManagerSubType;
  email: string;
  phone: string;
  
  // Complete Information
  fullName?: string;
  cacRegistrationNumber?: string;
  yearOfRegistration?: string;
  country?: string;
  state?: string;
  residentAddress?: string;
  
  // Directors Information
  directors?: DirectorInfo[];
  
  // Company Logo
  companyLogo?: string; // Base64 or URL
  
  // Email verification
  emailVerified?: boolean;
}

// Union type for all user onboarding data
export type OnboardingData = ArtistOnboardingData | CompanyOnboardingData | AdManagerOnboardingData;

// Main store state
interface UserManagementState {
  // Current user's primary type (artist, company, or ad-manager)
  primaryUserType: UserType | null;
  
  // Store data for each user type (supports multiple users for testing)
  users: {
    [userId: string]: {
      userType: UserType;
      data: OnboardingData;
      onboardingComplete: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  
  // Current active user ID (for testing multiple users)
  currentUserId: string | null;
  
  // Actions
  initializeUser: (userType: UserType, email: string, phone: string, userSubType: string) => string; // Returns userId
  setCurrentUser: (userId: string) => void;
  saveArtistInformation: (userId: string, data: Partial<ArtistOnboardingData>) => void;
  saveCompanyInformation: (userId: string, data: Partial<CompanyOnboardingData>) => void;
  saveAdManagerInformation: (userId: string, data: Partial<AdManagerOnboardingData>) => void;
  saveDisplayPicture: (userId: string, imageUrl: string) => void;
  saveLabelLogo: (userId: string, imageUrl: string) => void;
  saveCompanyLogo: (userId: string, imageUrl: string) => void;
  saveDirectorsInfo: (userId: string, directors: DirectorInfo[]) => void;
  markEmailVerified: (userId: string) => void;
  markIdentityVerified: (userId: string) => void;
  completeOnboarding: (userId: string) => void;
  getUserData: (userId: string) => OnboardingData | null;
  getCurrentUserData: () => OnboardingData | null;
  getCurrentUserType: () => UserType | null;
  clearUser: (userId: string) => void;
  clearAllUsers: () => void;
  hydrateFromProfile: (profile: UserProfileDto) => void;
}

// Generate a unique user ID
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Map backend role string (artist, dj, creator, record_label, ad_manager, fan, admin)
// onto the frontend's coarser UserType. Returns null for roles that don't have a
// matching slot (fan, admin) so callers can skip hydration safely.
const mapBackendRoleToUserType = (role: string): UserType | null => {
  switch (role) {
    case "artist":
    case "dj":
    case "creator":
      return "artist";
    case "record_label":
      return "company";
    case "ad_manager":
      return "ad-manager";
    default:
      return null;
  }
};

const mapBackendRoleToArtistSubType = (role: string): ArtistSubType | null => {
  switch (role) {
    case "artist":
      return "artist";
    case "dj":
      return "dj";
    case "creator":
      return "creator";
    default:
      return null;
  }
};

// Profile.location comes back as "State, Country" (or just "Country") — split it
// so the existing onboarding fields stay populated.
const parseLocationParts = (location?: string): { state?: string; country?: string } => {
  if (!location) return {};
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { country: parts[0] };
  return { state: parts[0], country: parts[parts.length - 1] };
};

export const useUserManagementStore = create<UserManagementState>()(
  persist(
    (set, get) => ({
      primaryUserType: null,
      users: {},
      currentUserId: null,

      initializeUser: (userType: UserType, email: string, phone: string, userSubType: string) => {
        const userId = generateUserId();
        const now = new Date().toISOString();

        let initialData: OnboardingData;
        
        if (userType === "artist") {
          initialData = {
            userType: userSubType as ArtistSubType,
            email,
            phone,
          } as ArtistOnboardingData;
        } else if (userType === "company") {
          initialData = {
            userType: userSubType as CompanySubType,
            email,
            phone,
          } as CompanyOnboardingData;
        } else {
          initialData = {
            userType: userSubType as AdManagerSubType,
            email,
            phone,
          } as AdManagerOnboardingData;
        }

        set((state) => ({
          users: {
            ...state.users,
            [userId]: {
              userType,
              data: initialData,
              onboardingComplete: false,
              createdAt: now,
              updatedAt: now,
            },
          },
          currentUserId: userId,
          primaryUserType: userType,
        }));

        return userId;
      },

      setCurrentUser: (userId: string) => {
        const user = get().users[userId];
        if (user) {
          set({
            currentUserId: userId,
            primaryUserType: user.userType,
          });
        }
      },

      saveArtistInformation: (userId: string, data: Partial<ArtistOnboardingData>) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "artist") return;

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: {
                ...(user.data as ArtistOnboardingData),
                ...data,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      saveCompanyInformation: (userId: string, data: Partial<CompanyOnboardingData>) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "company") return;

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: {
                ...(user.data as CompanyOnboardingData),
                ...data,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      saveAdManagerInformation: (userId: string, data: Partial<AdManagerOnboardingData>) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "ad-manager") return;

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: {
                ...(user.data as AdManagerOnboardingData),
                ...data,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      saveDisplayPicture: (userId: string, imageUrl: string) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "artist") return;

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: {
                ...(user.data as ArtistOnboardingData),
                displayPicture: imageUrl,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      saveLabelLogo: (userId: string, imageUrl: string) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "company") return;

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: {
                ...(user.data as CompanyOnboardingData),
                labelLogo: imageUrl,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      saveCompanyLogo: (userId: string, imageUrl: string) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "ad-manager") return;

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: {
                ...(user.data as AdManagerOnboardingData),
                companyLogo: imageUrl,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      saveDirectorsInfo: (userId: string, directors: DirectorInfo[]) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || (user.userType !== "company" && user.userType !== "ad-manager")) return;

        if (user.userType === "company") {
          set({
            users: {
              ...state.users,
              [userId]: {
                ...user,
                data: {
                  ...(user.data as CompanyOnboardingData),
                  directors,
                },
                updatedAt: new Date().toISOString(),
              },
            },
          });
        } else {
          set({
            users: {
              ...state.users,
              [userId]: {
                ...user,
                data: {
                  ...(user.data as AdManagerOnboardingData),
                  directors,
                },
                updatedAt: new Date().toISOString(),
              },
            },
          });
        }
      },

      markEmailVerified: (userId: string) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user) return;

        const updatedData = {
          ...user.data,
          emailVerified: true,
        };

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: updatedData as OnboardingData,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      markIdentityVerified: (userId: string) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user || user.userType !== "artist" && user.userType !== "company") return;

        if (user.userType === "artist") {
          const artistData = user.data as ArtistOnboardingData;
          set({
            users: {
              ...state.users,
              [userId]: {
                ...user,
                data: {
                  ...artistData,
                  identityVerified: true,
                },
                updatedAt: new Date().toISOString(),
              },
            },
          });
        } else {
          const companyData = user.data as CompanyOnboardingData;
          set({
            users: {
              ...state.users,
              [userId]: {
                ...user,
                data: {
                  ...companyData,
                  identityVerified: true,
                },
                updatedAt: new Date().toISOString(),
              },
            },
          });
        }
      },

      completeOnboarding: (userId: string) => {
        const state = get();
        const user = state.users[userId];
        
        if (!user) return;

        // For record-label company users, initialize empty artists array
        let updatedData = user.data;
        if (user.userType === 'company') {
          const companyData = user.data as CompanyOnboardingData;
          if (companyData.userType === 'record_label' || companyData.userType === 'distribution') {
            // Inject empty artists array into user data
            updatedData = {
              ...companyData,
              artists: companyData.artists ?? [],
            };
          }
        }

        set({
          users: {
            ...state.users,
            [userId]: {
              ...user,
              data: updatedData,
              onboardingComplete: true,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      getUserData: (userId: string) => {
        const user = get().users[userId];
        return user ? user.data : null;
      },

      getCurrentUserData: () => {
        const state = get();
        const currentUserId = state.currentUserId;
        if (!currentUserId) return null;
        return state.getUserData(currentUserId);
      },

      getCurrentUserType: () => {
        return get().primaryUserType;
      },

      clearUser: (userId: string) => {
        const state = get();
        const remainingUsers = { ...state.users };
        if (userId in remainingUsers) {
          delete remainingUsers[userId];
        }

        set({
          users: remainingUsers,
          currentUserId: state.currentUserId === userId ? null : state.currentUserId,
          primaryUserType: state.currentUserId === userId ? null : state.primaryUserType,
        });
      },

      clearAllUsers: () => {
        set({
          users: {},
          currentUserId: null,
          primaryUserType: null,
        });
      },

      hydrateFromProfile: (profile: UserProfileDto) => {
        const userType = mapBackendRoleToUserType(profile.role);
        if (!userType) return;

        const userId = profile.id;
        const state = get();
        const existing = state.users[userId];
        const now = new Date().toISOString();
        const location = parseLocationParts(profile.location);

        let data: OnboardingData;

        if (userType === "artist") {
          const previous = existing?.data as ArtistOnboardingData | undefined;
          data = {
            userType: (mapBackendRoleToArtistSubType(profile.role) ??
              previous?.userType ??
              "artist") as ArtistSubType,
            email: profile.email,
            phone: (previous?.phone as string | undefined) ?? "",
            fullName: profile.name,
            performingName: profile.performingName,
            recordLabel: previous?.recordLabel,
            country: location.country ?? previous?.country,
            state: location.state ?? previous?.state,
            residentAddress: previous?.residentAddress,
            displayPicture: profile.avatar ?? previous?.displayPicture,
            emailVerified: profile.isVerified || previous?.emailVerified,
            identityVerified: profile.isVerified || previous?.identityVerified,
            identityVerificationDocuments: previous?.identityVerificationDocuments,
          } as ArtistOnboardingData;
        } else if (userType === "company") {
          const previous = existing?.data as CompanyOnboardingData | undefined;
          data = {
            userType: (previous?.userType ?? "record_label") as CompanySubType,
            email: profile.email,
            phone: (previous?.phone as string | undefined) ?? "",
            legalCompanyName: profile.legalName ?? previous?.legalCompanyName,
            companyName: profile.tradingName ?? profile.name ?? previous?.companyName,
            natureOfBusiness: profile.natureOfBusiness ?? previous?.natureOfBusiness,
            country: location.country ?? previous?.country,
            state: location.state ?? previous?.state,
            companyAddress: previous?.companyAddress,
            directors: previous?.directors,
            artists: previous?.artists,
            labelLogo: profile.avatar ?? previous?.labelLogo,
            emailVerified: profile.isVerified || previous?.emailVerified,
            identityVerified: profile.isVerified || previous?.identityVerified,
            identityVerificationDocuments: previous?.identityVerificationDocuments,
          } as CompanyOnboardingData;
        } else {
          const previous = existing?.data as AdManagerOnboardingData | undefined;
          data = {
            userType: (previous?.userType ?? "business") as AdManagerSubType,
            email: profile.email,
            phone: (previous?.phone as string | undefined) ?? "",
            fullName: profile.name,
            cacRegistrationNumber: previous?.cacRegistrationNumber,
            yearOfRegistration: previous?.yearOfRegistration,
            country: location.country ?? previous?.country,
            state: location.state ?? previous?.state,
            residentAddress: previous?.residentAddress,
            directors: previous?.directors,
            companyLogo: profile.avatar ?? previous?.companyLogo,
            emailVerified: profile.isVerified || previous?.emailVerified,
          } as AdManagerOnboardingData;
        }

        set({
          users: {
            ...state.users,
            [userId]: {
              userType,
              data,
              onboardingComplete: profile.onboardingCompleted ?? existing?.onboardingComplete ?? false,
              createdAt: existing?.createdAt ?? profile.createdAt ?? now,
              updatedAt: now,
            },
          },
          currentUserId: userId,
          primaryUserType: userType,
        });
      },
    }),
    {
      name: "user-management-storage",
      storage: indexedDbStorage,
      version: 2,
      // v1 → v2: DirectorInfo gained email/phone/position/isPrimaryContact.
      // Older in-flight sessions don't carry these fields; reset to an empty
      // store so the new onboarding form starts clean rather than rendering
      // half-populated rows.
      migrate: () => ({
        users: {},
        currentUserId: null,
        primaryUserType: null,
      }),
      partialize: (state) => ({
        users: state.users,
        currentUserId: state.currentUserId,
        primaryUserType: state.primaryUserType,
      }),
    }
  )
);

