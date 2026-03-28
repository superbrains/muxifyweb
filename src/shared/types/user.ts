export type UserRole =
  | "fan"
  | "artist"
  | "dj"
  | "creator"
  | "record_label"
  | "ad_manager"
  | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    spotify?: string;
  };
}
