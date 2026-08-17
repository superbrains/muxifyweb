import React from 'react';
import { HStack, IconButton, Text } from '@chakra-ui/react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';

interface CopyableIdProps {
    /** The value to display and copy (id, ISRC, UPC, ISWC, session id, …). */
    value?: string | null;
    /** Optional label used in the success toast, e.g. "ISRC". Defaults to "Value". */
    label?: string;
    /** Truncate the displayed value to this many chars (full value still copied). */
    truncate?: number;
    /** Font size of the mono value. */
    fontSize?: string;
}

/**
 * Monospace value with a one-tap copy button — for IDs and codes that admins
 * routinely paste elsewhere (content/owner IDs, ISRC/UPC/ISWC, session IDs).
 */
export const CopyableId: React.FC<CopyableIdProps> = ({
    value,
    label = 'Value',
    truncate,
    fontSize = '11px',
}) => {
    const toast = useChakraToast();
    const [copied, setCopied] = React.useState(false);

    if (!value) {
        return (
            <Text fontSize={fontSize} color="gray.400">
                —
            </Text>
        );
    }

    const display = truncate && value.length > truncate ? `${value.slice(0, truncate)}…` : value;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success(`${label} copied`);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error('Could not copy', 'Clipboard is unavailable.');
        }
    };

    return (
        <HStack gap={1.5} minW={0}>
            <Text
                fontFamily="mono"
                fontSize={fontSize}
                color="gray.700"
                lineClamp={1}
                title={value}
            >
                {display}
            </Text>
            <IconButton
                aria-label={`Copy ${label}`}
                size="2xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'primary.500', bg: 'gray.100' }}
                onClick={handleCopy}
            >
                {copied ? <FiCheck /> : <FiCopy />}
            </IconButton>
        </HStack>
    );
};
