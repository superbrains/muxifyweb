import { useUserStore } from "@app/store/useUserStore";

/**
 * Prefer the authoritative role on the logged-in `User` over the onboarding
 * store, so RDC detection works correctly after a fresh login (when the
 * onboarding store may not have been hydrated).
 */
export const useIsRecordLabel = (): boolean => {
  const user = useUserStore((state) => state.user);
  return user?.role === "record_label";
};
