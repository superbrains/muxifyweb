import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Center,
    HStack,
    Input,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useSetSplits, useTrackSplits } from '../hooks/useSplits';
import { formatPercentBps, percentBpsFromString } from '../lib/format';
import type { ReleaseSplitDto, SplitRecipientRole } from '../types';

const SplitEditorPage: React.FC = () => {
    const { trackId } = useParams<{ trackId: string }>();
    const navigate = useNavigate();
    const { data, isLoading, error } = useTrackSplits(trackId);
    const setSplits = useSetSplits(trackId!);

    const [draft, setDraft] = useState<ReleaseSplitDto[]>([]);

    useEffect(() => {
        if (data) setDraft(data.splits);
    }, [data]);

    const totalBps = useMemo(() => draft.reduce((acc, r) => acc + (r.percentBps || 0), 0), [draft]);
    const isValid = totalBps === 10000;

    const handleChange = (idx: number, value: string) => {
        const bps = percentBpsFromString(value);
        setDraft((prev) => prev.map((r, i) => (i === idx ? { ...r, percentBps: bps } : r)));
    };

    const handleRoleChange = (idx: number, role: SplitRecipientRole) => {
        setDraft((prev) => prev.map((r, i) => (i === idx ? { ...r, recipientRole: role } : r)));
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

    return (
        <VStack
            gap={4}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
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
                    bg={isValid ? '#E7FFF7' : 'primary.70'}
                    color={isValid ? 'green.600' : 'primary.500'}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                >
                    Total {formatPercentBps(totalBps)}%
                </Box>
            </HStack>

            <Box bg="white" borderRadius="20px" p={4}>
                <Stack gap={3}>
                    {draft.map((row, i) => (
                        <HStack key={row.recipientUserId + i} gap={3} align="center">
                            <Avatar.Root size="sm">
                                <Avatar.Fallback name={row.recipientName} />
                            </Avatar.Root>
                            <VStack align="start" gap={0} flex={1}>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                    {row.recipientName}
                                </Text>
                                <HStack gap={1}>
                                    {(['Artist', 'Label', 'Featured'] as SplitRecipientRole[]).map((role) => (
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
                                    onChange={(e) => handleChange(i, e.target.value)}
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
                        </HStack>
                    ))}
                </Stack>
            </Box>

            <HStack justify="end" gap={3}>
                <Button onClick={() => navigate('/label/splits')} variant="ghost" size="sm" fontSize="xs">
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
        </VStack>
    );
};

export default SplitEditorPage;
