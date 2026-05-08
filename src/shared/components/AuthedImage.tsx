import React, { useEffect, useState, type ReactNode } from "react";
import { Image, type ImageProps } from "@chakra-ui/react";
import { fetchAuthedBlobUrl, isProxyPath } from "../lib/authedImage";

interface AuthedImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallback?: ReactNode;
}

export const AuthedImage: React.FC<AuthedImageProps> = ({
  src,
  fallback = null,
  ...rest
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(
    isProxyPath(src) ? undefined : src ?? undefined,
  );
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!isProxyPath(src)) {
      setResolvedSrc(src ?? undefined);
      setErrored(false);
      return;
    }

    let cancelled = false;
    setResolvedSrc(undefined);
    setErrored(false);

    fetchAuthedBlobUrl(src)
      .then((blobUrl) => {
        if (!cancelled) setResolvedSrc(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src || errored || !resolvedSrc) return <>{fallback}</>;

  return <Image src={resolvedSrc} {...rest} />;
};
