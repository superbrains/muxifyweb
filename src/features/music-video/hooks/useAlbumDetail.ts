import { useQuery } from "@tanstack/react-query";
import { contentService } from "@shared/services/contentService";

export const useAlbumDetail = (id: string) =>
  useQuery({
    queryKey: ["content", "album", id],
    queryFn: () => contentService.getAlbumDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });
