import React, { useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
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
import { FiSearch, FiUser } from 'react-icons/fi';
import { useRoster } from '../hooks/useRoster';
import type { SplitRecipientRole } from '../types';

export interface PickedRecipient {
    id: string;
    name: string;
    avatarUrl?: string;
    isVerified: boolean;
    accountType: 'Artist' | 'Label';
    defaultRole: SplitRecipientRole;
}

interface RecipientPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (recipient: PickedRecipient) => void;
    /** IDs already used on the splits draft — shown but disabled. */
    excludedIds: Set<string>;
    /** Logged-in label account, offered at the top as the "Label" recipient. */
    labelSelf: { id: string; name: string } | null;
}

export const RecipientPicker: React.FC<RecipientPickerProps> = ({
    open,
    onClose,
    onSelect,
    excludedIds,
    labelSelf,
}) => {
    const [query, setQuery] = useState('');
    const { data: roster, isLoading } = useRoster();

    const filteredRoster = useMemo(() => {
        // Only fully-onboarded artists can be split recipients: their profile
        // must exist so payouts can actually reach them.
        const onboarded = (roster ?? []).filter(
            (r) => r.onboardingStatus === 'Active',
        );
        const q = query.trim().toLowerCase();
        if (!q) return onboarded;
        return onboarded.filter(
            (r) =>
                r.performingName.toLowerCase().includes(q) ||
                r.fullName.toLowerCase().includes(q),
        );
    }, [roster, query]);

    const matchesSelf = !!labelSelf && (
        !query.trim() ||
        labelSelf.name.toLowerCase().includes(query.trim().toLowerCase())
    );

    const empty = !isLoading && filteredRoster.length === 0 && !matchesSelf;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            size="sm"
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold">
                                Add split recipient
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={3}>
                                <HStack
                                    gap={2}
                                    bg="gray.50"
                                    borderRadius="10px"
                                    px={3}
                                    py={2}
                                >
                                    <Box color="gray.400">
                                        <FiSearch size={14} />
                                    </Box>
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search roster"
                                        variant="subtle"
                                        bg="transparent"
                                        border="none"
                                        size="sm"
                                        fontSize="xs"
                                        px={0}
                                        _focus={{ boxShadow: 'none' }}
                                    />
                                </HStack>

                                {isLoading ? (
                                    <Center py={6}>
                                        <Spinner size="sm" color="primary.500" />
                                    </Center>
                                ) : empty ? (
                                    <Center py={6}>
                                        <Text fontSize="xs" color="gray.500">
                                            No matches. Invite the artist to your roster first.
                                        </Text>
                                    </Center>
                                ) : (
                                    <Stack gap={1} maxH="50vh" overflowY="auto">
                                        {labelSelf && matchesSelf && (
                                            <RecipientRow
                                                avatarName={labelSelf.name}
                                                name={labelSelf.name}
                                                subtitle="You (label account)"
                                                disabled={excludedIds.has(labelSelf.id)}
                                                onClick={() =>
                                                    onSelect({
                                                        id: labelSelf.id,
                                                        name: labelSelf.name,
                                                        isVerified: false,
                                                        accountType: 'Label',
                                                        defaultRole: 'Label',
                                                    })
                                                }
                                            />
                                        )}
                                        {filteredRoster.map((r) => (
                                            <RecipientRow
                                                key={r.artistUserId}
                                                avatarName={r.performingName || r.fullName}
                                                avatarUrl={r.avatarUrl}
                                                name={r.performingName || r.fullName}
                                                subtitle={r.fullName !== r.performingName ? r.fullName : 'Roster artist'}
                                                disabled={excludedIds.has(r.artistUserId)}
                                                onClick={() =>
                                                    onSelect({
                                                        id: r.artistUserId,
                                                        name: r.performingName || r.fullName,
                                                        avatarUrl: r.avatarUrl,
                                                        isVerified: r.isVerified,
                                                        accountType: 'Artist',
                                                        defaultRole: 'Artist',
                                                    })
                                                }
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button onClick={onClose} variant="ghost" size="sm" fontSize="xs">
                                Cancel
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

interface RecipientRowProps {
    avatarName: string;
    avatarUrl?: string;
    name: string;
    subtitle: string;
    disabled: boolean;
    onClick: () => void;
}

const RecipientRow: React.FC<RecipientRowProps> = ({
    avatarName,
    avatarUrl,
    name,
    subtitle,
    disabled,
    onClick,
}) => (
    <chakra.button
        type="button"
        onClick={disabled ? undefined : onClick}
        display="flex"
        gap={3}
        alignItems="center"
        py={2}
        px={2}
        borderRadius="10px"
        bg="transparent"
        _hover={disabled ? undefined : { bg: 'primary.50' }}
        opacity={disabled ? 0.45 : 1}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        textAlign="left"
        width="100%"
        aria-disabled={disabled}
    >
        <Avatar.Root size="sm">
            {avatarUrl ? <Avatar.Image src={avatarUrl} /> : null}
            <Avatar.Fallback name={avatarName}>
                <FiUser />
            </Avatar.Fallback>
        </Avatar.Root>
        <VStack align="start" gap={0} flex={1}>
            <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                {name}
            </Text>
            <Text fontSize="10px" color="gray.500">
                {disabled ? 'Already added' : subtitle}
            </Text>
        </VStack>
    </chakra.button>
);
