import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Center,
    HStack,
    IconButton,
    Input,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
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
                recipientRole: rec.defaultRole,
                percentBps: 0,
            },
        ]);
        setPickerOpen(false);
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
                <HStack justify="space-between" align="center">
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                            Splits for this release
                        </Text>
                        <Text fontSize="11px" color="gray.600">
                            Total must equal exactly 100.00%
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
                    >
                        Total {formatPercentBps(totalBps)}%
                    </Box>
                </HStack>

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
                    <Box bg="white" borderRadius="20px" p={4}>
                        <Stack gap={3}>
                            {draft.map((row, i) => (
                                <HStack
                                    key={(row.recipientUserId || 'new') + i}
                                    gap={3}
                                    align="center"
                                    flexWrap={{ base: 'wrap', md: 'nowrap' }}
                                >
                                    <Avatar.Root size="sm">
                                        <Avatar.Fallback name={row.recipientName} />
                                    </Avatar.Root>
                                    <VStack align="start" gap={1} flex={1} minW="200px">
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                            {row.recipientName || 'Unknown recipient'}
                                        </Text>
                                        <HStack gap={1} flexWrap="wrap">
                                            {SPLIT_ROLES.map((role) => (
                                                <Box
                                                    key={role}
                                                    as="button"
                                                    type="button"
                                                    onClick={() => handleRoleChange(i, role)}
                                                    fontSize="9px"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="full"
                                                    bg={row.recipientRole === role ? 'primary.50' : 'gray.100'}
                                                    color={row.recipientRole === role ? 'primary.600' : 'gray.500'}
                                                    fontWeight="medium"
                                                    aria-pressed={row.recipientRole === role}
                                                >
                                                    {role}
                                                </Box>
                                            ))}
                                        </HStack>
                                    </VStack>
                                    <HStack gap={1}>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            max={100}
                                            value={formatPercentBps(row.percentBps)}
                                            onChange={(e) => handlePercentChange(i, e.target.value)}
                                            variant="subtle"
                                            size="sm"
                                            fontSize="xs"
                                            w="90px"
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
                                        onClick={() => handleRemove(i)}
                                    >
                                        <FiTrash2 />
                                    </IconButton>
                                </HStack>
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
                    <Text fontSize="xs" color={isExact ? 'green.600' : isOver ? 'red.500' : 'gray.500'}>
                        {isExact
                            ? 'Splits balanced — ready to save.'
                            : isOver
                            ? `Over by ${formatPercentBps(totalBps - 10000)}%`
                            : `${formatPercentBps(10000 - totalBps)}% remaining`}
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

export default SplitEditorPage;
