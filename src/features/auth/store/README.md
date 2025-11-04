# User Management Store

A comprehensive Zustand store for managing user onboarding data across all user types (Artist, Company, Ad Manager).

## Features

- Persists user data to localStorage
- Supports multiple user types with specific data structures
- Tracks onboarding completion status
- Stores all onboarding flow data

## Usage

### Initialize a User

```typescript
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';

const { initializeUser } = useUserManagementStore();

// Initialize an artist
const userId = initializeUser('artist', 'user@example.com', '+1234567890', 'artist');

// Initialize a company
const userId = initializeUser('company', 'company@example.com', '+1234567890', 'record_label');

// Initialize an ad-manager
const userId = initializeUser('ad-manager', 'manager@example.com', '+1234567890', 'business');
```

### Save Data During Onboarding

```typescript
const { saveArtistInformation, saveCompanyInformation, saveAdManagerInformation } = useUserManagementStore();

// For artist
saveArtistInformation(userId, {
  fullName: 'John Doe',
  performingName: 'Johnny',
  country: 'NG',
  state: 'Lagos',
  residentAddress: '123 Main St',
});

// For company
saveCompanyInformation(userId, {
  legalCompanyName: 'ABC Records Ltd',
  natureOfBusiness: 'record_label',
  country: 'NG',
  state: 'Lagos',
  companyAddress: '456 Business Ave',
});

// For ad-manager
saveAdManagerInformation(userId, {
  fullName: 'Jane Smith',
  cacRegistrationNumber: 'RC123456',
  yearOfRegistration: '2020',
  country: 'NG',
  state: 'Lagos',
  residentAddress: '789 Manager St',
});
```

### Get User Data

```typescript
const { getCurrentUserData, getUserData, getCurrentUserType } = useUserManagementStore();

// Get current user's data
const userData = getCurrentUserData();

// Get specific user's data
const userData = getUserData(userId);

// Get current user type
const userType = getCurrentUserType(); // 'artist' | 'company' | 'ad-manager' | null
```

### Complete Onboarding

```typescript
const { completeOnboarding, markEmailVerified, markIdentityVerified } = useUserManagementStore();

// Mark email as verified
markEmailVerified(userId);

// Mark identity as verified (artist/company only)
markIdentityVerified(userId);

// Complete onboarding
completeOnboarding(userId);
```

### Type Guards

When working with user data, you may need to check the user type:

```typescript
const userData = getCurrentUserData();
const userType = getCurrentUserType();

if (userType === 'artist') {
  const artistData = userData as ArtistOnboardingData;
  console.log(artistData.performingName);
} else if (userType === 'company') {
  const companyData = userData as CompanyOnboardingData;
  console.log(companyData.legalCompanyName);
} else if (userType === 'ad-manager') {
  const adManagerData = userData as AdManagerOnboardingData;
  console.log(adManagerData.cacRegistrationNumber);
}
```

## Data Structure

### Artist Onboarding Data
- Registration: email, phone, userType (artist/creator/dj/podcaster)
- Complete Information: fullName, performingName, recordLabel, country, state, residentAddress
- Display Picture: base64 or URL
- Email verification status
- Identity verification status and documents

### Company Onboarding Data
- Registration: email, phone, userType (record_label/distribution/publisher/management)
- Company Information: legalCompanyName, companyName, natureOfBusiness, country, state, companyAddress
- Directors: array of director info (name, meansOfIdentification, identityNumber)
- Label Logo: base64 or URL
- Email verification status
- Identity verification status

### Ad Manager Onboarding Data
- Registration: email, phone, userType (personal/business/agency/enterprise)
- Complete Information: fullName, cacRegistrationNumber, yearOfRegistration, country, state, residentAddress
- Directors: array of director info
- Company Logo: base64 or URL
- Email verification status

## Testing

The store supports multiple users for testing purposes. You can:

```typescript
const { users, setCurrentUser, clearUser, clearAllUsers } = useUserManagementStore();

// Switch between users
setCurrentUser(userId);

// Clear a specific user
clearUser(userId);

// Clear all users
clearAllUsers();
```

