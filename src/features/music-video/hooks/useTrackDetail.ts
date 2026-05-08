import { useQuery } from "@tanstack/react-query";
import { contentService } from "@shared/services/contentService";

export const useTrackDetail = (id: string) =>
  useQuery({
    queryKey: ["content", "track", id],
    queryFn: () => contentService.getTrackDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });
