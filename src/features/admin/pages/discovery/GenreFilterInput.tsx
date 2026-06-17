import React from 'react';
import { Input } from '@chakra-ui/react';
import type { DiscoveryItemsController } from './useDiscoveryItems';

/**
 * Genre-name filter for the music vertical. The mobile feed track queries filter by genre NAME
 * (not id), so this passes a free-text name through as `genre`. Hidden on the video vertical, where
 * the feed queries don't take a genre filter.
 */
export const GenreFilterInput: React.FC<{ controller: DiscoveryItemsController }> = ({ controller: c }) => {
    if (c.query.vertical === 'video') return null;
    return (
        <Input
            size="sm"
            fontSize="xs"
            maxW="220px"
            placeholder="Filter by genre name"
            value={c.query.genre ?? ''}
            onChange={(e) => c.setQuery((q) => ({ ...q, genre: e.target.value || undefined, page: 1 }))}
        />
    );
};
