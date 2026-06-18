import { useState, useEffect } from 'react';
import { leaderboardService } from '@/features/leaderboard/services/leaderboardService';
import { dashboardService, type RecentSaleDto } from '@/features/dashboard/services/dashboardService';
import type {
  FanMediaType,
  FanEngagementSummaryDto,
  ArtistTopFanDto,
  ArtistTopUnlockerDto,
  CountryStatDto,
  HighestUnlockedContentDto,
} from '@/features/leaderboard/types';
import { mapTimeFilterToPeriod, type TimeFilter } from '../types';

/**
 * Everything the Fans & Subscribers tab renders, all scoped to the selected
 * artist, media vertical and time period. Empty (not null) before the first
 * fetch so the UI can render skeletons without null guards everywhere.
 */
export interface FanAnalyticsData {
  summary: FanEngagementSummaryDto | null;
  topGivers: ArtistTopFanDto[];
  topUnlockers: ArtistTopUnlockerDto[];
  topUnlockedContent: HighestUnlockedContentDto[];
  activity: RecentSaleDto[];
  playsByCountry: CountryStatDto[];
  giftsByCountry: CountryStatDto[];
  unlocksByCountry: CountryStatDto[];
}

const EMPTY: FanAnalyticsData = {
  summary: null,
  topGivers: [],
  topUnlockers: [],
  topUnlockedContent: [],
  activity: [],
  playsByCountry: [],
  giftsByCountry: [],
  unlocksByCountry: [],
};

/**
 * Fetches the full fan-analytics payload in parallel whenever the artist,
 * media type or period changes. Mirrors the dashboard's load pattern.
 */
export function useFanAnalytics(
  artistId: string | undefined,
  mediaType: FanMediaType,
  timeFilter: TimeFilter
) {
  const [data, setData] = useState<FanAnalyticsData>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!artistId) return;

    let cancelled = false;
    const period = mapTimeFilterToPeriod(timeFilter);
    const contentType: 'track' | 'video' = mediaType === 'video' ? 'video' : 'track';
    const capMediaType: 'Music' | 'Video' = mediaType === 'video' ? 'Video' : 'Music';

    setIsLoading(true);
    setError(null);

    Promise.all([
      leaderboardService.getFanEngagementSummary(artistId, period, mediaType),
      leaderboardService.getArtistTopFans(artistId, 5, period, mediaType),
      leaderboardService.getArtistTopUnlockers(artistId, 5, period, mediaType),
      leaderboardService.getHighestUnlocked(5, period, contentType, 'mine'),
      dashboardService.getRecentSales(25, capMediaType),
      leaderboardService.getFanCountryBreakdown(artistId, 'plays', 5, period, mediaType),
      leaderboardService.getFanCountryBreakdown(artistId, 'gifts', 5, period, mediaType),
      leaderboardService.getFanCountryBreakdown(artistId, 'unlocks', 5, period, mediaType),
    ])
      .then(([summary, givers, unlockers, unlockedContent, sales, plays, gifts, unlocks]) => {
        if (cancelled) return;
        setData({
          summary,
          topGivers: givers.entries ?? [],
          topUnlockers: unlockers.entries ?? [],
          topUnlockedContent: unlockedContent.entries ?? [],
          activity: sales.data.sales ?? [],
          playsByCountry: plays.entries ?? [],
          giftsByCountry: gifts.entries ?? [],
          unlocksByCountry: unlocks.entries ?? [],
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load fan analytics');
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          setHasFetched(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [artistId, mediaType, timeFilter]);

  return { data, isLoading, error, hasFetched };
}
