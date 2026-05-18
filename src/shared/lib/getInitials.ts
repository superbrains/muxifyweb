/**
 * Derives up to two uppercase initials from a person's / company's name.
 *
 *   "John Doe"        -> "JD"
 *   "Madonna"         -> "M"
 *   "Stellar Records" -> "SR"
 *   ""  / undefined   -> "U"   (unknown)
 *
 * Used as the avatar fallback when a user has no profile picture.
 */
export const getInitials = (name?: string | null): string => {
  const words = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "U";

  const first = words[0].charAt(0);
  const second = words.length > 1 ? words[words.length - 1].charAt(0) : "";

  return (first + second).toUpperCase();
};
