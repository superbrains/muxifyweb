import { useQuery } from '@tanstack/react-query';
import { fanService } from '../services/fanService';

/** Query-key factory for fan-profile data. */
export const fanKeys = {
  all: ['fans'] as const,
  profile: (fanId: string) => [...fanKeys.all, 'profile', fanId] as const,
  activity: (fanId: string, page: number) =>
    [...fanKeys.all, 'activity', fanId, page] as const,
  supported: (fanId: string) => [...fanKeys.all, 'supported', fanId] as const,
  followed: (fanId: string) => [...fanKeys.all, 'followed', fanId] as const,
  badges: (fanId: string) => [...fanKeys.all, 'badges', fanId] as const,
  medals: (fanId: string) => [...fanKeys.all, 'medals', fanId] as const,
};

export const useFanProfile = (fanId: string | null) =>
  useQuery({
    queryKey: fanKeys.profile(fanId ?? ''),
    queryFn: () => fanService.getFanProfile(fanId as string),
    enabled: !!fanId,
  });

export const useFanActivity = (fanId: string | null, page = 1) =>
  useQuery({
    queryKey: fanKeys.activity(fanId ?? '', page),
    queryFn: () => fanService.getFanActivity(fanId as string, page),
    enabled: !!fanId,
  });

export const useSupportedArtists = (fanId: string | null) =>
  useQuery({
    queryKey: fanKeys.supported(fanId ?? ''),
    queryFn: () => fanService.getSupportedArtists(fanId as string),
    enabled: !!fanId,
  });

export const useFollowedArtists = (fanId: string | null) =>
  useQuery({
    queryKey: fanKeys.followed(fanId ?? ''),
    queryFn: () => fanService.getFollowedArtists(fanId as string),
    enabled: !!fanId,
  });

export const useFanBadges = (fanId: string | null) =>
  useQuery({
    queryKey: fanKeys.badges(fanId ?? ''),
    queryFn: () => fanService.getFanBadges(fanId as string),
    enabled: !!fanId,
  });

export const useFanMedals = (fanId: string | null) =>
  useQuery({
    queryKey: fanKeys.medals(fanId ?? ''),
    queryFn: () => fanService.getFanMedals(fanId as string),
    enabled: !!fanId,
  });
