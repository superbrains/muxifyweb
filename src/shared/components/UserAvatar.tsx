import React from 'react';
import { Avatar } from '@chakra-ui/react';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { getInitials } from '@/shared/lib/getInitials';

type AvatarSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UserAvatarProps {
    /** Display name — used to derive the two-letter initials fallback. */
    name?: string | null;
    /** Profile picture URL. May be a JWT-gated `/api/v1/media/...` proxy path. */
    src?: string | null;
    /** Chakra avatar size token. Defaults to `sm`. */
    size?: AvatarSize;
    /** Background colour of the initials fallback. */
    bg?: string;
    /** Text colour of the initials fallback. */
    color?: string;
}

/**
 * Canonical user avatar: renders the profile picture when one exists, and
 * otherwise falls back to the person's two-letter initials.
 *
 * Backend avatars come back as `/api/v1/media/...` proxy paths that require an
 * Authorization header, so the `src` is resolved to a blob URL via
 * {@link useAuthedImageSrc} before being handed to the `<img>`.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
    name,
    src,
    size = 'sm',
    bg = 'red.500',
    color = 'white',
}) => {
    const resolvedSrc = useAuthedImageSrc(src);

    return (
        <Avatar.Root size={size} flexShrink={0}>
            {resolvedSrc && (
                <Avatar.Image src={resolvedSrc} alt={name ?? 'User'} />
            )}
            <Avatar.Fallback bg={bg} color={color} fontWeight="bold">
                {getInitials(name)}
            </Avatar.Fallback>
        </Avatar.Root>
    );
};
