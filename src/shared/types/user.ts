export interface User {
  id: string;
  email: string;
  name: string;
  role: "artist" | "dj" | "creator" | "record_label";
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
