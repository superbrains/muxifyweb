import { useEffect, useState } from 'react';
import { adsService } from '../../services/adsService';
import type { AdRateCardDto, AdRatesDto } from '../../types';

export type AdFormat = 'photo' | 'video' | 'audio';

/**
 * Fetches the admin-configurable CPC/CPI rates once and returns the card for the
 * given creative format. Used by the create-campaign wizard so the per-click /
 * per-reach pricing and the budget estimate come from real platform settings
 * instead of hardcoded kobo strings.
 */
export function useAdRates(format: AdFormat): { rates: AdRatesDto | null; card: AdRateCardDto | null } {
    const [rates, setRates] = useState<AdRatesDto | null>(null);

    useEffect(() => {
        let cancelled = false;
        adsService
            .getRates()
            .then((r) => !cancelled && setRates(r))
            .catch(() => !cancelled && setRates(null));
        return () => {
            cancelled = true;
        };
    }, []);

    return { rates, card: rates ? rates[format] : null };
}
