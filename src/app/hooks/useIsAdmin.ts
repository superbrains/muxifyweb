import { useUserStore } from "@app/store/useUserStore";

/**
 * True when the logged-in user is a Muxify Super Admin.
 *
 * Reads the authoritative `role` on the `User` (set at login) rather than the
 * onboarding store — mirrors {@link useIsRecordLabel}. Do NOT use `useUserType`
 * for this: it is onboarding-store based and has no `admin` concept.
 */
export const useIsAdmin = (): boolean => {
  const user = useUserStore((state) => state.user);
  return user?.role === "admin";
};
