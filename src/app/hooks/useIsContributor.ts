import { useUserStore } from "@app/store/useUserStore";

/**
 * True when the logged-in user is a CR2 contributor.
 *
 * Reads the authoritative `role` on the `User` (set at login) rather than the
 * onboarding store — mirrors {@link useIsRecordLabel} and {@link useIsAdmin}.
 * `useUserType` is onboarding-store based and has no `contributor` concept.
 */
export const useIsContributor = (): boolean => {
  const user = useUserStore((state) => state.user);
  return user?.role === "contributor";
};
