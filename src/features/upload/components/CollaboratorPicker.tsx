import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    chakra,
    Dialog,
    HStack,
    Input,
    Portal,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiCheck, FiSearch, FiUser, FiUsers } from 'react-icons/fi';
import {
    userSearchService,
    type CollaboratorAccountType,
    type CollaboratorSearchResult,
} from '../services/userSearchService';
import type { PickedRecipient } from '@/features/record-label/components/RecipientPicker';

interface CollaboratorPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (recipient: PickedRecipient) => void;
    /** Recipient userIds already on the splits draft — disabled in results. */
    excludedIds: Set<string>;
}

const DEBOUNCE_MS = 250;

const ACCOUNT_TYPE_STYLES: Record<
    CollaboratorAccountType,
    { bg: string; color: string }
> = {
    Artist: { bg: 'primary.50', color: 'primary.600' },
    DJ: { bg: 'purple.50', color: 'purple.600' },
    Creator: { bg: 'orange.50', color: 'orange.600' },
    Label: { bg: 'blue.50', color: 'blue.600' },
    Podcaster: { bg: 'green.50', color: 'green.600' },
};

export const CollaboratorPicker: React.FC<CollaboratorPickerProps> = ({
    open,
    onClose,
    onSelect,
    excludedIds,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CollaboratorSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when the dialog re-opens so each session starts fresh.
    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setError(null);
            setLoading(false);
            // Defer focus to next tick so Chakra has mounted the input.
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        if (query.trim().length === 0) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = window.setTimeout(async () => {
            try {
                const data = await userSearchService.search(query);
                setResults(data);
                setError(null);
            } catch (e) {
                console.error('Collaborator search failed', e);
                setError('Could not search right now. Try again.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [query, open]);

    const trimmedQuery = query.trim();
    const hasQuery = trimmedQuery.length > 0;
    const isEmpty = !loading && hasQuery && results.length === 0 && !error;

    const handlePick = (r: CollaboratorSearchResult) => {
        onSelect({
            id: r.userId,
            name: r.displayName,
            avatarUrl: r.avatarUrl ?? undefined,
            isVerified: r.isVerified,
            // PickedRecipient.accountType is 'Artist' | 'Label'; coerce other
            // creator types to 'Artist' for downstream compatibility while
            // the visible role chip is set per-account-type via defaultRole.
            accountType: r.accountType === 'Label' ? 'Label' : 'Artist',
            defaultRole: r.defaultRole,
        });
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            size="md"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(2px)" />
                <Dialog.Positioner>
                    <Dialog.Content
                        borderRadius="20px"
                        p={0}
                        maxW="480px"
                        boxShadow="0 24px 48px rgba(15, 54, 89, 0.18)"
                        overflow="hidden"
                    >
                        <Dialog.Header
                            px={5}
                            pt={5}
                            pb={3}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                        >
                            <VStack align="start" gap={1}>
                                <Dialog.Title fontSize="md" fontWeight="semibold" color="gray.900">
                                    Add split recipient
                                </Dialog.Title>
                                <Text fontSize="11px" color="gray.500">
                                    Search any Muxify artist, DJ, label, or podcaster.
                                </Text>
                            </VStack>
                        </Dialog.Header>

                        <Box px={5} pt={4} pb={2}>
                            <HStack
                                gap={2}
                                bg="gray.50"
                                borderRadius="12px"
                                px={3}
                                py={2.5}
                                border="1px solid"
                                borderColor="gray.100"
                                _focusWithin={{
                                    borderColor: 'primary.400',
                                    bg: 'white',
                                    boxShadow: '0 0 0 3px rgba(249, 68, 68, 0.08)',
                                }}
                                transition="all 0.12s ease"
                            >
                                <Box color="gray.400">
                                    <FiSearch size={16} />
                                </Box>
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name…"
                                    variant="subtle"
                                    bg="transparent"
                                    border="none"
                                    size="sm"
                                    fontSize="sm"
                                    px={0}
                                    color="gray.900"
                                    _placeholder={{ color: 'gray.400' }}
                                    _focus={{ boxShadow: 'none', outline: 'none' }}
                                />
                                {loading && <Spinner size="xs" color="primary.500" />}
                            </HStack>
                        </Box>

                        <Box
                            px={2}
                            pb={2}
                            minH="220px"
                            maxH="50vh"
                            overflowY="auto"
                        >
                            {!hasQuery ? (
                                <EmptyHint
                                    icon={<FiUsers size={20} />}
                                    title="Start typing to search"
                                    body="We'll look up Muxify accounts as you type. Pick anyone to add them to this split."
                                />
                            ) : isEmpty ? (
                                <EmptyHint
                                    icon={<FiUser size={20} />}
                                    title="No matches"
                                    body={`No Muxify account matches "${trimmedQuery}". Double-check the spelling.`}
                                />
                            ) : error ? (
                                <EmptyHint
                                    icon={<FiUser size={20} />}
                                    title="Something went wrong"
                                    body={error}
                                />
                            ) : (
                                <Stack gap={1} pt={1} px={1}>
                                    {results.map((r) => (
                                        <ResultRow
                                            key={r.userId}
                                            result={r}
                                            disabled={excludedIds.has(r.userId)}
                                            onClick={() => handlePick(r)}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        <Dialog.Footer
                            px={5}
                            py={3}
                            borderTop="1px solid"
                            borderColor="gray.100"
                            bg="gray.25"
                        >
                            <HStack justify="space-between" w="full">
                                <Text fontSize="11px" color="gray.500">
                                    {hasQuery && !loading && !error && results.length > 0 && (
                                        <>
                                            {results.length} result{results.length === 1 ? '' : 's'}
                                        </>
                                    )}
                                </Text>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    borderColor="gray.200"
                                    color="gray.700"
                                    _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

interface ResultRowProps {
    result: CollaboratorSearchResult;
    disabled: boolean;
    onClick: () => void;
}

const ResultRow: React.FC<ResultRowProps> = ({ result, disabled, onClick }) => {
    const palette = ACCOUNT_TYPE_STYLES[result.accountType] ?? ACCOUNT_TYPE_STYLES.Artist;
    return (
        <chakra.button
            type="button"
            onClick={disabled ? undefined : onClick}
            display="flex"
            gap={3}
            alignItems="center"
            py={2.5}
            px={2.5}
            borderRadius="12px"
            bg="transparent"
            _hover={disabled ? undefined : { bg: 'gray.50' }}
            _active={disabled ? undefined : { bg: 'gray.100' }}
            opacity={disabled ? 0.5 : 1}
            cursor={disabled ? 'not-allowed' : 'pointer'}
            textAlign="left"
            width="100%"
            aria-disabled={disabled}
            transition="background 0.12s ease"
        >
            <Avatar.Root size="md">
                {result.avatarUrl ? <Avatar.Image src={result.avatarUrl} /> : null}
                <Avatar.Fallback name={result.displayName}>
                    <FiUser />
                </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" gap={0.5} flex={1} minW={0}>
                <HStack gap={1.5} align="center" w="full">
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.900"
                        lineClamp={1}
                    >
                        {result.displayName}
                    </Text>
                    {result.isVerified && (
                        <Box color="primary.500" lineHeight={0} title="Verified">
                            <FiCheck size={13} strokeWidth={3} />
                        </Box>
                    )}
                </HStack>
                <HStack gap={2} fontSize="11px" color="gray.500">
                    <Box
                        as="span"
                        bg={palette.bg}
                        color={palette.color}
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontWeight="semibold"
                        fontSize="10px"
                    >
                        {result.accountTypeLabel}
                    </Box>
                    {result.fullName !== result.displayName && (
                        <Text as="span" lineClamp={1}>
                            {result.fullName}
                        </Text>
                    )}
                </HStack>
            </VStack>
            {disabled && (
                <Text fontSize="10px" color="gray.400" whiteSpace="nowrap">
                    Already added
                </Text>
            )}
        </chakra.button>
    );
};

interface EmptyHintProps {
    icon: React.ReactNode;
    title: string;
    body: string;
}

const EmptyHint: React.FC<EmptyHintProps> = ({ icon, title, body }) => (
    <VStack
        gap={1.5}
        py={10}
        px={6}
        align="center"
        textAlign="center"
        color="gray.500"
    >
        <Box
            bg="gray.50"
            color="gray.400"
            w="40px"
            h="40px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            {icon}
        </Box>
        <Text fontSize="xs" fontWeight="semibold" color="gray.700">
            {title}
        </Text>
        <Text fontSize="11px" maxW="280px">
            {body}
        </Text>
    </VStack>
);
