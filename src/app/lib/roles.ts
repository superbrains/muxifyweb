export type UserRole = "artist" | "dj" | "creator" | "record_label";

export const USER_ROLES = {
  ARTIST: "artist" as const,
  DJ: "dj" as const,
  CREATOR: "creator" as const,
  RECORD_LABEL: "record_label" as const,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  artist: "Artist",
  dj: "DJ",
  creator: "Creator",
  record_label: "Record Label",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  artist: "Upload and distribute your music",
  dj: "Create and share DJ mixes",
  creator: "Create and share video content",
  record_label: "Manage multiple artists and their content",
};
