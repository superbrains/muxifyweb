import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Spinner,
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
import { useAuth } from '@app/hooks/useAuth';
import { useSetSplits, useTrackSplits } from '../hooks/useSplits';
import { formatPercentBps, percentBpsFromString } from '../lib/format';
import {
    SPLIT_ROLES,
    type ReleaseSplitDto,
    type SplitRecipientRole,
} from '../types';
import { RecipientPicker, type PickedRecipient } from '../components/RecipientPicker';

const SplitEditorPage: React.FC = () => {
    const { trackId } = useParams<{ trackId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data, isLoading, error } = useTrackSplits(trackId);
    const setSplits = useSetSplits(trackId!);

    const [draft, setDraft] = useState<ReleaseSplitDto[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        if (data) setDraft(data.splits);
    }, [data]);

    const totalBps = useMemo(
        () => draft.reduce((acc, r) => acc + (r.percentBps || 0), 0),
        [draft],
    );
    const isExact = totalBps === 10000;
    const isOver = totalBps > 10000;
    const allHaveRecipient = draft.every((r) => !!r.recipientUserId);
    const isValid = isExact && draft.length > 0 && allHaveRecipient;
    const usedIds = useMemo(
        () => new Set(draft.map((r) => r.recipientUserId).filter(Boolean)),
        [draft],
    );

    const isPristineDefault = useMemo(() => {
        // True when the draft matches the server's "default 100% to artist" state.
        // Used to disable Reset when there's nothing to reset.
        if (draft.length !== 1) return false;
        const [only] = draft;
        return only.percentBps === 10000 && only.recipientRole === 'Artist';
    }, [draft]);

    const handlePercentChange = (idx: number, value: string) => {
        const bps = percentBpsFromString(value);
        setDraft((prev) =>
            prev.map((r, i) => (i === idx ? { ...r, percentBps: bps } : r)),
        );
    };

    const handleRoleChange = (idx: number, role: SplitRecipientRole) => {
        setDraft((prev) =>
            prev.map((r, i) => (i === idx ? { ...r, recipientRole: role } : r)),
        );
    };

    const handleRemove = (idx: number) => {
        setDraft((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleAddRecipient = (rec: PickedRecipient) => {
        setDraft((prev) => [
            ...prev,
            {
                recipientUserId: rec.id,
                recipientName: rec.name,
                recipientAvatarUrl: rec.avatarUrl,
                recipientRole: rec.defaultRole,
                accountType: rec.accountType,
                isVerified: rec.isVerified,
                percentBps: 0,
            },
        ]);
        setPickerOpen(false);
    };

    const handleSplitEqually = () => {
        const n = draft.length;
        if (n === 0) return;
        const base = Math.floor(10000 / n);
        const remainder = 10000 - base * n;
        setDraft((prev) =>
            prev.map((r, i) => ({
                ...r,
                percentBps: base + (i === 0 ? remainder : 0),
            })),
        );
    };

    const handleReset = () => {
        if (!data || data.splits.length === 0) return;
        const artistRow =
            data.splits.find((s) => s.recipientRole === 'Artist') ?? data.splits[0];
        setDraft([{ ...artistRow, percentBps: 10000 }]);
    };

    const handleSave = async () => {
        if (!isValid || !trackId) return;
        await setSplits.mutateAsync({
            splits: draft.map((r) => ({
                recipientUserId: r.recipientUserId,
                recipientRole: r.recipientRole,
                percentBps: r.percentBps,
            })),
        });
        navigate('/label/splits');
    };

    if (isLoading) {
        return (
            <Center minH="60vh" bg="gray.50">
                <Spinner size="lg" color="primary.500" />
            </Center>
        );
    }

    if (error || !data) {
        return (
            <Center minH="60vh" bg="gray.50">
                <Text fontSize="sm" color="gray.500">
                    Could not load splits for this release.
                </Text>
            </Center>
        );
    }

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
            <VStack
                gap={4}
                bg="gray.50"
                minH="100vh"
                align="stretch"
                px={{ base: 3, md: 6 }}
                py={{ base: 4, md: 6 }}
                pb={{ base: '120px', md: '110px' }}
            >
                <HStack justify="space-between" align="flex-start" gap={3}>
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                            Splits for this release
                        </Text>
                        <Text fontSize="11px" color="gray.600">
                            Decide how every dollar earned by this track is shared.
                        </Text>
                    </Box>
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

                {draft.length > 0 && (
                    <HStack gap={2} flexWrap="wrap">
                        <Button
                            onClick={handleSplitEqually}
                            variant="outline"
                            size="xs"
                            fontSize="11px"
                            borderRadius="10px"
                            borderColor="gray.200"
                            color="gray.700"
                            disabled={draft.length < 2}
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
                            disabled={isPristineDefault}
                            _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                        >
                            <FiRotateCcw /> Reset to artist 100%
                        </Button>
                    </HStack>
                )}

                {draft.length === 0 ? (
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
                            {draft.map((row, i) => (
                                <RecipientRow
                                    key={(row.recipientUserId || 'new') + i}
                                    row={row}
                                    isSelf={!!user && row.recipientUserId === user.id}
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
                        Splits apply to every payout calculated after you save. Existing
                        unpaid earnings already attributed to a previous split set are
                        unaffected.
                    </Text>
                </HStack>
            </VStack>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.100"
                px={{ base: 3, md: 6 }}
                py={3}
                zIndex={10}
            >
                <HStack justify="space-between" gap={3}>
                    <Text
                        fontSize="xs"
                        color={isExact ? 'green.600' : isOver ? 'red.500' : 'gray.500'}
                    >
                        {remainingMessage}
                    </Text>
                    <HStack gap={2}>
                        <Button
                            onClick={() => navigate('/label/splits')}
                            variant="ghost"
                            size="sm"
                            fontSize="xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            loading={setSplits.isPending}
                            disabled={!isValid}
                            bg="primary.500"
                            color="white"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            borderRadius="10px"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Save splits
                        </Button>
                    </HStack>
                </HStack>
            </Box>

            <RecipientPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleAddRecipient}
                excludedIds={usedIds}
                labelSelf={user ? { id: user.id, name: user.name } : null}
            />
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
    if (row.accountType === 'Artist') {
        return row.isVerified ? 'Verified artist' : 'Roster artist';
    }
    if (row.accountType === 'Label') {
        return isSelf ? 'You · Record label' : 'Record label';
    }
    return '';
};

export default SplitEditorPage;
