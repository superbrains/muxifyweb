import React from 'react';
import { Box, Flex, Text, Textarea } from '@chakra-ui/react';
import {
    detectLyricsFormat,
    LYRICS_MAX_LENGTH,
    type LyricsFormat,
} from '../lib/lyricsFormat';

interface LyricsFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    helperText?: string;
    rows?: number;
}

/**
 * Lyrics input shared by the upload form and the edit-lyrics modal. Accepts both
 * plain text and synchronized LRC; a live badge reflects which one the artist has
 * entered so they understand whether playback will be karaoke-synced. Styled to
 * match the rest of the upload form (12px semibold gray labels, primary focus).
 */
export const LyricsField: React.FC<LyricsFieldProps> = ({
    value,
    onChange,
    error,
    label = 'Lyrics',
    helperText = 'Paste plain lyrics, or LRC with [mm:ss] timestamps for karaoke-style sync.',
    rows = 8,
}) => {
    const format = detectLyricsFormat(value);
    const charCount = value.length;
    const overLimit = charCount > LYRICS_MAX_LENGTH;
    const nearLimit = !overLimit && charCount > LYRICS_MAX_LENGTH * 0.9;

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={2} gap={2}>
                <Text fontSize="12px" fontWeight="semibold" color="gray.900">
                    {label}{' '}
                    <Text as="span" color="gray.400" fontWeight="normal">
                        (optional)
                    </Text>
                </Text>
                <LyricsFormatBadge format={format} />
            </Flex>

            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                    'Add the words to your track…\n\nVerse 1\nFirst line\nSecond line\n\n— or paste synced LRC —\n[00:12.30]First line\n[00:15.80]Second line'
                }
                rows={rows}
                fontSize="13px"
                fontFamily={format === 'synced' ? 'mono' : undefined}
                lineHeight="1.6"
                resize="vertical"
                borderColor={error ? 'red.300' : 'gray.200'}
                _hover={{ borderColor: error ? 'red.400' : 'gray.300' }}
                _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px #f94444' }}
                _placeholder={{ color: 'gray.400', fontSize: '12px' }}
            />

            <Flex justify="space-between" align="flex-start" mt={1.5} gap={3}>
                <Text fontSize="11px" color={error ? 'red.500' : 'gray.500'} lineHeight="1.4">
                    {error || helperText}
                </Text>
                <Text
                    fontSize="10px"
                    whiteSpace="nowrap"
                    color={overLimit ? 'red.500' : nearLimit ? 'orange.500' : 'gray.400'}
                >
                    {charCount.toLocaleString()} / {LYRICS_MAX_LENGTH.toLocaleString()}
                </Text>
            </Flex>
        </Box>
    );
};

/**
 * Signature element: a quiet pill that reflects the detected format. Synced
 * lyrics get the primary accent; plain text stays neutral. Reused across the
 * upload field, the review screen, and the edit modal for a consistent vocabulary.
 */
export const LyricsFormatBadge: React.FC<{ format: LyricsFormat }> = ({ format }) => {
    if (format === 'empty') return null;
    const synced = format === 'synced';

    return (
        <Flex
            align="center"
            gap={1.5}
            px={2}
            py={0.5}
            borderRadius="full"
            flexShrink={0}
            bg={synced ? 'primary.50' : 'gray.100'}
            color={synced ? 'primary.600' : 'gray.600'}
        >
            <Box w="6px" h="6px" borderRadius="full" bg={synced ? 'primary.500' : 'gray.400'} />
            <Text fontSize="10px" fontWeight="semibold" letterSpacing="0.02em">
                {synced ? 'Synced · LRC' : 'Plain text'}
            </Text>
        </Flex>
    );
};
