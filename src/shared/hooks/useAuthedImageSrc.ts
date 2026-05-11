import { useEffect, useState } from "react";
import { fetchAuthedBlobUrl, isProxyPath } from "@/shared/lib/authedImage";

/**
 * Resolves a possibly-protected image URL into something an `<img>` or
 * `background-image` rule can render.
 *
 * Backend URLs that point at the JWT-gated media proxy (`/api/v1/media/...`)
 * can't be loaded directly by the browser — they need to be fetched with the
 * Authorization header and converted to a blob URL. Pass any URL in; if it
 * isn't a proxy path the hook returns it unchanged.
 */
export const useAuthedImageSrc = (src?: string | null): string | undefined => {
  const initial = isProxyPath(src) ? undefined : src ?? undefined;
  const [resolved, setResolved] = useState<string | undefined>(initial);

  useEffect(() => {
    if (!isProxyPath(src)) {
      setResolved(src ?? undefined);
      return;
    }

    let cancelled = false;
    setResolved(undefined);

    fetchAuthedBlobUrl(src)
      .then((blobUrl) => {
        if (!cancelled) setResolved(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setResolved(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
};
