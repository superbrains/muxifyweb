/**
 * Unlock price tiers offered to artists, **in coins**.
 *
 * Coins are the canonical unit everywhere in the platform — the wallet, the
 * paywall, and the artist earning ledger all count coins, and Naira is derived
 * from the admin-editable rate. So the artist picks a coin amount and we show
 * the Naira equivalent alongside it, rather than the other way round.
 *
 * At the current 10 coins = ₦1 rate these read as ₦10 / ₦50 / ₦100 / ₦500.
 */
export const UNLOCK_COST_COIN_TIERS = [100, 500, 1000, 5000] as const;

/** Preselected tier for a new upload: 1,000 coins = ₦100. */
export const DEFAULT_UNLOCK_COST_COINS = 1000;

const coinFormatter = new Intl.NumberFormat("en-NG");

/**
 * Builds the dropdown options. The value submitted is the raw coin integer as
 * a string (the upload stores hold `string[]`); the label carries the Naira
 * equivalent so the artist can see what they are charging.
 */
export function buildUnlockCostOptions(
    coinsPerNairaMajor: number,
): Array<{ label: string; value: string }> {
    const rate = coinsPerNairaMajor > 0 ? coinsPerNairaMajor : 10;

    return UNLOCK_COST_COIN_TIERS.map((coins) => ({
        value: String(coins),
        label: `${coinFormatter.format(coins)} coins · ≈₦${(coins / rate).toLocaleString(
            "en-NG",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        )}`,
    }));
}

/** "1,000 coins · ≈₦100.00" — used on the review screens. */
export function formatUnlockCost(
    coins: number,
    coinsPerNairaMajor: number,
): string {
    if (!coins || coins <= 0) return "Free";
    const rate = coinsPerNairaMajor > 0 ? coinsPerNairaMajor : 10;
    return `${coinFormatter.format(coins)} coins · ≈₦${(coins / rate).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Reads the coin integer out of an upload store's `unlockCost: string[]`.
 * Tolerates the legacy "100.00" Naira-decimal strings left in old drafts by
 * truncating rather than producing a fractional coin count.
 */
export function parseUnlockCostCoins(unlockCost: string[] | undefined): number {
    const raw = unlockCost?.[0];
    if (!raw) return DEFAULT_UNLOCK_COST_COINS;
    const parsed = Math.trunc(Number(raw));
    return Number.isFinite(parsed) && parsed >= 0
        ? parsed
        : DEFAULT_UNLOCK_COST_COINS;
}
