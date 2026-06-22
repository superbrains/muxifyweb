import React, { useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    chakra,
    HStack,
    IconButton,
    Input,
    Menu,
    Portal,
    Progress,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    FiCheck,
    FiChevronDown,
    FiInfo,
    FiPlus,
    FiRotateCcw,
    FiSliders,
    FiTrash2,
} from 'react-icons/fi';
import {
    formatPercentBps,
    percentBpsFromString,
} from '@/features/record-label/lib/format';
import {
    SPLIT_ROLES,
    type ReleaseSplitDto,
    type SplitRecipientRole,
} from '@/features/record-label/types';
import {
    RecipientPicker,
    type PickedRecipient,
} from '@/features/record-label/components/RecipientPicker';
import { CollaboratorPicker } from './CollaboratorPicker';

export type SplitsPickerMode = 'roster' | 'global';

export interface SplitsEditorProps {
    value: ReleaseSplitDto[];
    onChange: (next: ReleaseSplitDto[]) => void;
    /**
     * The currently signed-in user. Used to highlight "You" in the recipient
     * row subtitle and to label the picker's "Self" option when a label is
     * adding itself as a recipient.
     */
    self?: { id: string; name: string } | null;
    /**
     * Optional initial row to reset back to when the user clicks "Reset to
     * artist 100%". When omitted, Reset is disabled.
     */
    resetTo?: ReleaseSplitDto | null;
    /**
     * Which picker dialog to open when the user clicks "Add recipient".
     * - `'roster'` (default) — used by the Record Label post-upload editor.
     *   Only the label's roster artists + the label itself are pickable.
     * - `'global'` — used by the audio upload wizard. Searches every
     *   Muxify creator account (Artist, DJ, Label, Podcaster).
     */
    pickerMode?: SplitsPickerMode;
}

export const SplitsEditor: React.FC<SplitsEditorProps> = ({
    value,
    onChange,
    self,
    resetTo,
    pickerMode = 'roster',
}) => {
    const [pickerOpen, setPickerOpen] = useState(false);

    const totalBps = useMemo(
        () => value.reduce((acc, r) => acc + (r.percentBps || 0), 0),
        [value],
    );
    const isExact = totalBps === 10000;
    const isOver = totalBps > 10000;
    const usedIds = useMemo(
        () => new Set(value.map((r) => r.recipientUserId).filter(Boolean)),
        [value],
    );

    const isPristineDefault = useMemo(() => {
        if (!resetTo) return true;
        if (value.length !== 1) return false;
        const [only] = value;
        return (
            only.recipientUserId === resetTo.recipientUserId &&
            only.percentBps === 10000 &&
            only.recipientRole === resetTo.recipientRole
        );
    }, [value, resetTo]);

    const handlePercentChange = (idx: number, raw: string) => {
        const bps = percentBpsFromString(raw);
        onChange(
            value.map((r, i) => (i === idx ? { ...r, percentBps: bps } : r)),
        );
    };

    const handleRoleChange = (idx: number, role: SplitRecipientRole) => {
        onChange(
            value.map((r, i) => (i === idx ? { ...r, recipientRole: role } : r)),
        );
    };

    const handleRemove = (idx: number) => {
        onChange(value.filter((_, i) => i !== idx));
    };

    const handleAddRecipient = (rec: PickedRecipient) => {
        onChange([
            ...value,
            {
                recipientUserId: rec.id,
                recipientName: rec.name,
                recipientAvatarUrl: rec.avatarUrl,
                recipientRole: rec.defaultRole,
                accountType: rec.accountType,
                isVerified: rec.isVerified,
                percentBps: 0,
                pending: rec.pending,
            },
        ]);
        setPickerOpen(false);
    };

    const handleSplitEqually = () => {
        const n = value.length;
        if (n === 0) return;
        const base = Math.floor(10000 / n);
        const remainder = 10000 - base * n;
        onChange(
            value.map((r, i) => ({
                ...r,
                percentBps: base + (i === 0 ? remainder : 0),
            })),
        );
    };

    const handleReset = () => {
        if (!resetTo) return;
        onChange([{ ...resetTo, percentBps: 10000 }]);
    };

    const totalPillBg = isExact ? '#E7FFF7' : isOver ? 'red.50' : 'primary.70';
    const totalPillColor = isExact
        ? 'green.600'
        : isOver
        ? 'red.500'
        : 'primary.500';
    const barColor = isExact
        ? 'green.500'
        : isOver
        ? 'red.500'
        : 'primary.500';
    const remainingMessage = isExact
        ? 'Splits balanced — ready to save.'
        : isOver
        ? `Over by ${formatPercentBps(totalBps - 10000)}%`
        : `${formatPercentBps(10000 - totalBps)}% remaining`;

    return (
        <>
            <VStack gap={4} align="stretch">
                <HStack justify="flex-end">
                    <Box
                        bg={totalPillBg}
                        color={totalPillColor}
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="semibold"
                        whiteSpace="nowrap"
                    >
                        Total {formatPercentBps(totalBps)}%
                    </Box>
                </HStack>

                <Box bg="white" borderRadius="20px" p={{ base: 3, md: 4 }}>
                    <Progress.Root
                        value={Math.min(totalBps / 100, 100)}
                        size="sm"
                    >
                        <Progress.Track bg="gray.100" borderRadius="full">
                            <Progress.Range bg={barColor} borderRadius="full" />
                        </Progress.Track>
                    </Progress.Root>
                    <HStack justify="space-between" mt={2} fontSize="11px" color="gray.500">
                        <Text>{formatPercentBps(totalBps)}% of 100%</Text>
                        <Text color={isExact ? 'green.600' : isOver ? 'red.500' : 'gray.500'}>
                            {remainingMessage}
                        </Text>
                    </HStack>
                </Box>

                {value.length > 0 && (
                    <HStack gap={2} flexWrap="wrap">
                        <Button
                            onClick={handleSplitEqually}
                            variant="outline"
                            size="xs"
                            fontSize="11px"
                            borderRadius="10px"
                            borderColor="gray.200"
                            color="gray.700"
                            disabled={value.length < 2}
                            _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                        >
                            <FiSliders /> Split equally
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="xs"
                            fontSize="11px"
                            borderRadius="10px"
                            borderColor="gray.200"
                            color="gray.700"
                            disabled={!resetTo || isPristineDefault}
                            _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                        >
                            <FiRotateCcw /> Reset to artist 100%
                        </Button>
                    </HStack>
                )}

                {value.length === 0 ? (
                    <Center
                        bg="white"
                        borderRadius="20px"
                        py={10}
                        px={4}
                        minH="30vh"
                    >
                        <VStack gap={3}>
                            <Text fontSize="xs" color="gray.500">
                                No recipients yet. Add the first split recipient to get started.
                            </Text>
                            <Button
                                onClick={() => setPickerOpen(true)}
                                bg="primary.500"
                                color="white"
                                size="sm"
                                fontSize="xs"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                <FiPlus /> Add recipient
                            </Button>
                        </VStack>
                    </Center>
                ) : (
                    <Box bg="white" borderRadius="20px" p={{ base: 3, md: 4 }}>
                        <Stack gap={0} separator={<Box h="1px" bg="gray.100" />}>
                            {value.map((row, i) => (
                                <RecipientRow
                                    key={(row.recipientUserId || 'new') + i}
                                    row={row}
                                    isSelf={!!self && row.recipientUserId === self.id}
                                    onRoleChange={(role) => handleRoleChange(i, role)}
                                    onPercentChange={(v) => handlePercentChange(i, v)}
                                    onRemove={() => handleRemove(i)}
                                />
                            ))}
                        </Stack>

                        <Button
                            onClick={() => setPickerOpen(true)}
                            variant="ghost"
                            size="sm"
                            fontSize="xs"
                            color="primary.500"
                            mt={3}
                            _hover={{ bg: 'primary.50' }}
                        >
                            <FiPlus /> Add recipient
                        </Button>
                    </Box>
                )}

                <HStack
                    gap={2}
                    fontSize="11px"
                    color="gray.500"
                    px={1}
                    align="flex-start"
                >
                    <Box pt="2px" color="gray.400">
                        <FiInfo size={12} />
                    </Box>
                    <Text>
                        Splits apply to every payout calculated after the release is
                        published. Existing unpaid earnings already attributed to a
                        previous split set are unaffected.
                    </Text>
                </HStack>
            </VStack>

            {pickerMode === 'global' ? (
                <CollaboratorPicker
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onSelect={handleAddRecipient}
                    excludedIds={usedIds}
                />
            ) : (
                <RecipientPicker
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    onSelect={handleAddRecipient}
                    excludedIds={usedIds}
                    labelSelf={self ?? null}
                />
            )}
        </>
    );
};

interface RecipientRowProps {
    row: ReleaseSplitDto;
    isSelf: boolean;
    onRoleChange: (role: SplitRecipientRole) => void;
    onPercentChange: (value: string) => void;
    onRemove: () => void;
}

const RecipientRow: React.FC<RecipientRowProps> = ({
    row,
    isSelf,
    onRoleChange,
    onPercentChange,
    onRemove,
}) => {
    const subtitle = buildSubtitle(row, isSelf);
    return (
        <HStack
            gap={3}
            align="center"
            flexWrap={{ base: 'wrap', md: 'nowrap' }}
            py={3}
        >
            <Avatar.Root size="md">
                {row.recipientAvatarUrl ? (
                    <Avatar.Image src={row.recipientAvatarUrl} alt={row.recipientName} />
                ) : null}
                <Avatar.Fallback name={row.recipientName} />
            </Avatar.Root>

            <VStack align="start" gap={0.5} flex={1} minW="200px">
                <HStack gap={1.5} align="center">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        {row.recipientName}
                    </Text>
                    {row.isVerified && (
                        <Box color="primary.500" title="Verified" lineHeight={0}>
                            <FiCheck size={14} strokeWidth={3} />
                        </Box>
                    )}
                    {row.pending && (
                        <Box
                            as="span"
                            bg="orange.50"
                            color="orange.600"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontWeight="semibold"
                            fontSize="10px"
                            whiteSpace="nowrap"
                            title="Invitation emailed — awaiting account claim"
                        >
                            Pending invite
                        </Box>
                    )}
                </HStack>
                {subtitle && (
                    <Text fontSize="11px" color="gray.500">
                        {subtitle}
                    </Text>
                )}
            </VStack>

            <Menu.Root>
                <Menu.Trigger asChild>
                    <chakra.button
                        type="button"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        bg="primary.50"
                        color="primary.600"
                        fontWeight="medium"
                        fontSize="11px"
                        px={2.5}
                        py={1}
                        borderRadius="full"
                        _hover={{ bg: 'primary.100' }}
                        aria-label={`Change role, current ${row.recipientRole}`}
                    >
                        {row.recipientRole}
                        <FiChevronDown size={12} />
                    </chakra.button>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content
                            minW="160px"
                            borderRadius="10px"
                            p={1}
                            boxShadow="0 8px 24px rgba(0,0,0,0.08)"
                        >
                            {SPLIT_ROLES.map((role) => (
                                <Menu.Item
                                    key={role}
                                    value={role}
                                    onClick={() => onRoleChange(role)}
                                    fontSize="xs"
                                    borderRadius="6px"
                                    px={2}
                                    py={1.5}
                                >
                                    <HStack justify="space-between" w="full">
                                        <Text>{role}</Text>
                                        {row.recipientRole === role && (
                                            <Box color="primary.500" lineHeight={0}>
                                                <FiCheck size={12} strokeWidth={3} />
                                            </Box>
                                        )}
                                    </HStack>
                                </Menu.Item>
                            ))}
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            <HStack gap={1}>
                <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={formatPercentBps(row.percentBps)}
                    onChange={(e) => onPercentChange(e.target.value)}
                    variant="subtle"
                    size="sm"
                    fontSize="xs"
                    w="100px"
                    textAlign="right"
                    _focus={{
                        borderColor: 'primary.500',
                        boxShadow: '0 0 0 1px #f94444',
                    }}
                />
                <Text fontSize="xs" color="gray.500">
                    %
                </Text>
            </HStack>
            <IconButton
                aria-label="Remove recipient"
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'red.500', bg: 'red.50' }}
                onClick={onRemove}
            >
                <FiTrash2 />
            </IconButton>
        </HStack>
    );
};

const buildSubtitle = (row: ReleaseSplitDto, isSelf: boolean): string => {
    if (row.pending) {
        return `Invited contributor · ${row.recipientRole}`;
    }
    if (row.accountType === 'Artist') {
        return row.isVerified ? 'Verified artist' : 'Roster artist';
    }
    if (row.accountType === 'Label') {
        return isSelf ? 'You · Record label' : 'Record label';
    }
    return '';
};

export const splitsAreValid = (rows: ReleaseSplitDto[]): boolean => {
    if (rows.length === 0) return false;
    const total = rows.reduce((acc, r) => acc + (r.percentBps || 0), 0);
    return total === 10000 && rows.every((r) => !!r.recipientUserId);
};
