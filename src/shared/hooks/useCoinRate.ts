import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/services/api";

/**
 * Coins are the platform's canonical unit; Naira is always derived from them.
 * The rate is admin-editable (Coin Economy → Conversion & Fee), so never
 * hardcode it at a call site — read it from here.
 */
export interface CoinRate {
    /** How many coins one Naira buys. 10 means 1,000 coins = ₦100. */
    coinsPerNairaMajor: number;
    currency: string;
}

/**
 * Used only until the live rate lands, and if the request fails. Keep in sync
 * with the backend seed in CoinEconomySettingsConfiguration.
 */
export const FALLBACK_COIN_RATE: CoinRate = {
    coinsPerNairaMajor: 10,
    currency: "NGN",
};

/**
 * Reads the public coin↔Naira rate. This is the artist/fan-facing endpoint —
 * the admin `useCoinEconomySettings` hook hits /admin/coin-economy, which
 * ordinary users are not authorised to call.
 */
export function useCoinRate() {
    const query = useQuery({
        queryKey: ["wallet", "coinRate"],
        queryFn: async ({ signal }) => {
            const { data } = await api.get<CoinRate>("/wallet/rate", { signal });
            return data;
        },
        // The rate changes about as often as a pricing decision does.
        staleTime: 5 * 60_000,
    });

    const rate =
        query.data?.coinsPerNairaMajor && query.data.coinsPerNairaMajor > 0
            ? query.data.coinsPerNairaMajor
            : FALLBACK_COIN_RATE.coinsPerNairaMajor;

    return {
        ...query,
        /** Coins per ₦1, guaranteed > 0. */
        rate,
        currency: query.data?.currency ?? FALLBACK_COIN_RATE.currency,
        /** Naira value of a coin amount, e.g. 1000 → 100. */
        nairaFor: (coins: number) => coins / rate,
        /** Formatted Naira value, e.g. 1000 → "₦100.00". */
        nairaLabel: (coins: number) =>
            `₦${(coins / rate).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
    };
}
