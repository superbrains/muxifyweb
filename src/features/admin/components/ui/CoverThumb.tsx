import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiMusic } from 'react-icons/fi';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';

type Sizing = string | Record<string, string>;

interface CoverThumbProps {
    /**
     * Cover-art / thumbnail URL. Backend cover URLs are JWT-gated
     * `/api/v1/media/cover/...` proxy paths that 401 on a raw `<img src>`, so the
     * value is resolved to a blob URL via {@link useAuthedImageSrc} first.
     */
    src?: string | null;
    alt?: string;
    /** Square edge length — a token/px string or a responsive object. */
    size?: Sizing;
    /** Corner radius. Defaults to `8px`. */
    radius?: string;
    /** Placeholder icon shown when there's no cover. Defaults to a music note. */
    icon?: IconType;
    /** Font size of the placeholder icon. */
    fallbackFontSize?: Sizing;
}

/**
 * Square authed cover-art thumbnail with a tinted icon fallback. This is the
 * single authed-image surface for content covers (mirroring how `UserAvatar`
 * centralises authed avatars) — every consumer renders covers correctly without
 * repeating the `useAuthedImageSrc` plumbing.
 */
export const CoverThumb: React.FC<CoverThumbProps> = ({
    src,
    alt = '',
    size = '40px',
    radius = '8px',
    icon: Icon = FiMusic,
    fallbackFontSize = '16px',
}) => {
    const resolved = useAuthedImageSrc(src ?? undefined);

    return (
        <Box
            w={size}
            h={size}
            borderRadius={radius}
            overflow="hidden"
            flexShrink={0}
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            {resolved ? (
                <Image src={resolved} alt={alt} w="100%" h="100%" objectFit="cover" />
            ) : (
                <Box color="gray.400" fontSize={fallbackFontSize} display="flex">
                    <Icon />
                </Box>
            )}
        </Box>
    );
};
