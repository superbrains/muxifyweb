import { PAYOUT_STATUSES, payoutStatusStyle } from '../payoutStatusColor';
import type { PayoutStatus } from '../../types';

describe('payoutStatusStyle', () => {
    it('returns a style for every defined PayoutStatus', () => {
        for (const status of PAYOUT_STATUSES) {
            const style = payoutStatusStyle(status);
            expect(style).toBeTruthy();
            expect(style.bg).toBeTruthy();
            expect(style.color).toBeTruthy();
            expect(style.dot).toBeTruthy();
            expect(style.label).toBe(status);
        }
    });

    it('maps Paid to a green-leaning palette and Failed to a red-leaning one', () => {
        const paid = payoutStatusStyle('Paid');
        const failed = payoutStatusStyle('Failed');
        // The green hexes start with #1 (16A...) for both color and dot; the red hexes start with #C/#E.
        expect(paid.dot.toUpperCase()).toMatch(/^#16/);
        expect(failed.dot.toUpperCase()).toMatch(/^#E5/);
        expect(paid.bg).not.toBe(failed.bg);
    });

    it('falls back to Pending styling for unknown statuses', () => {
        const fallback = payoutStatusStyle('Unknown' as PayoutStatus);
        const pending = payoutStatusStyle('Pending');
        expect(fallback).toEqual(pending);
    });
});
