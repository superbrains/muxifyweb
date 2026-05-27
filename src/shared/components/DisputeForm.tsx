import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Spinner,
    Text,
    Textarea,
} from '@chakra-ui/react';

interface DisputeFormProps {
    /** Submits the trimmed reason. Parent decides what to do on success. */
    onSubmit: (reason: string) => void;
    /** Optional secondary action (e.g. "Cancel"). When supplied, renders alongside Submit. */
    onCancel?: () => void;
    /** Pre-fill the textarea — used when updating a previously-submitted dispute. */
    defaultReason?: string;
    /** Label on the primary action. */
    submitLabel?: string;
    /** When true, disables inputs and shows a spinner in place of the submit button. */
    isLoading?: boolean;
    /** Optional helper line below the textarea. */
    helperText?: string;
    /** Inline form layout (used on the dispute page) tightens the spacing. */
    layout?: 'modal' | 'inline';
}

const MIN_REASON_LENGTH = 10;

/**
 * Form body for submitting (or updating) a duplicate-detection dispute. Shared between
 * the in-context <DisputeModal> (album editor) and the dedicated /disputes page so the
 * validation rules and copy stay in lockstep.
 */
export const DisputeForm: React.FC<DisputeFormProps> = ({
    onSubmit,
    onCancel,
    defaultReason = '',
    submitLabel = 'Submit dispute',
    isLoading = false,
    helperText = 'Please give us at least a sentence so the team can act on it.',
    layout = 'modal',
}) => {
    const [reason, setReason] = useState(defaultReason);

    useEffect(() => {
        setReason(defaultReason);
    }, [defaultReason]);

    const trimmed = reason.trim();
    const tooShort = trimmed.length < MIN_REASON_LENGTH;
    const isInline = layout === 'inline';

    return (
        <Box>
            <Text fontSize="xs" fontWeight="600" color="gray.700" mb={1.5}>
                Why is this not an infringing duplicate?
            </Text>
            <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. This is my own original recording, or I hold a valid licence / distribution agreement for it."
                rows={isInline ? 6 : 5}
                fontSize="sm"
                resize="vertical"
                disabled={isLoading}
                borderColor="gray.300"
                _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px #f94444' }}
            />
            <Text fontSize="11px" color="gray.500" mt={1}>
                {helperText}
            </Text>

            <HStack gap={3} w="full" justify={isInline ? 'flex-start' : 'flex-end'} mt={4}>
                {onCancel && (
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        size="md"
                        fontSize="sm"
                        fontWeight="medium"
                        px={6}
                        borderRadius="md"
                        _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    bg="#f94444"
                    color="white"
                    size="md"
                    fontSize="sm"
                    fontWeight="medium"
                    px={6}
                    borderRadius="md"
                    onClick={() => onSubmit(trimmed)}
                    disabled={isLoading || tooShort}
                    _hover={{ bg: '#e53939' }}
                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    display="flex"
                    alignItems="center"
                    gap={2}
                >
                    {isLoading ? (
                        <>
                            <Spinner size="sm" color="white" />
                            <Text>Submitting…</Text>
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </HStack>
        </Box>
    );
};
