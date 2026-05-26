import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Center,
    HStack,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useAuth } from '@app/hooks/useAuth';
import { useSetSplits, useTrackSplits } from '../hooks/useSplits';
import { formatPercentBps } from '../lib/format';
import type { ReleaseSplitDto } from '../types';
import {
    SplitsEditor,
    splitsAreValid,
} from '@/features/upload/components/SplitsEditor';

const SplitEditorPage: React.FC = () => {
    const { trackId } = useParams<{ trackId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data, isLoading, error } = useTrackSplits(trackId);
    const setSplits = useSetSplits(trackId!);

    const [draft, setDraft] = useState<ReleaseSplitDto[]>([]);

    useEffect(() => {
        if (data) setDraft(data.splits);
    }, [data]);

    const totalBps = useMemo(
        () => draft.reduce((acc, r) => acc + (r.percentBps || 0), 0),
        [draft],
    );
    const isExact = totalBps === 10000;
    const isOver = totalBps > 10000;
    const isValid = splitsAreValid(draft);

    const resetTo = useMemo<ReleaseSplitDto | null>(() => {
        if (!data || data.splits.length === 0) return null;
        const artistRow =
            data.splits.find((s) => s.recipientRole === 'Artist') ?? data.splits[0];
        return { ...artistRow, percentBps: 10000 };
    }, [data]);

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
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Splits for this release
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        Decide how every dollar earned by this track is shared.
                    </Text>
                </Box>

                <SplitsEditor
                    value={draft}
                    onChange={setDraft}
                    self={user ? { id: user.id, name: user.name } : null}
                    resetTo={resetTo}
                />
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
        </>
    );
};

export default SplitEditorPage;
