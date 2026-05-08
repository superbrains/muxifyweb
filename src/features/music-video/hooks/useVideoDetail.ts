import { useQuery } from "@tanstack/react-query";
import { contentService } from "@shared/services/contentService";

export const useVideoDetail = (id: string) =>
  useQuery({
    queryKey: ["content", "video", id],
    queryFn: () => contentService.getVideoDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });
