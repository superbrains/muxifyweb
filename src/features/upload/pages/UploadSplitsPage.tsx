import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    HStack,
    Icon,
    IconButton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@app/hooks/useAuth';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useUploadMusicStore } from '@/features/upload-music/store/useUploadMusicStore';
import {
    SplitsEditor,
    splitsAreValid,
} from '../components/SplitsEditor';
import { shouldUseExtendedAudioWizard } from '../lib/wizardFlow';
import { formatPercentBps } from '@/features/record-label/lib/format';
import type { MixSplitRow } from '../types/wizard';

const UploadSplitsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { isArtist, isRecordLabel } = useUserType();

    const { mix, mixSetSplits } = useUploadMusicStore();

    const mixId = searchParams.get('mixId');
    const querySuffix = mixId ? `?mixId=${mixId}` : '';

    // Build the default starting row for the uploading user.
    const selfRow = useMemo<MixSplitRow | null>(() => {
        if (!user) return null;
        return {
            recipientUserId: user.id,
            recipientName: user.name,
            recipientAvatarUrl: user.avatar,
            recipientRole: isRecordLabel ? 'Label' : 'Artist',
            accountType: isRecordLabel ? 'Label' : 'Artist',
            isVerified: user.isVerified,
            percentBps: 10000,
        };
    }, [user, isRecordLabel]);

    // Guard: redirect non-eligible roles or empty mix state back to review/upload.
    useEffect(() => {
        if (!shouldUseExtendedAudioWizard({ isArtist, isRecordLabel }, 'mix', 'music')) {
            navigate(`/upload/review${querySuffix}`, { replace: true });
            return;
        }
        if (mix.tracks.length === 0) {
            navigate(`/upload${querySuffix}`, { replace: true });
        }
    }, [isArtist, isRecordLabel, mix.tracks.length, navigate, querySuffix]);

    // Initialize with self at 100% the first time the user lands here.
    useEffect(() => {
        if (mix.splits.length === 0 && selfRow) {
            mixSetSplits([selfRow]);
        }
    }, [mix.splits.length, selfRow, mixSetSplits]);

    const isValid = splitsAreValid(mix.splits);
    const totalBps = mix.splits.reduce((acc, r) => acc + (r.percentBps || 0), 0);
    const isExact = totalBps === 10000;
    const isOver = totalBps > 10000;
    const remainingMessage = isExact
        ? 'Splits balanced — ready to continue.'
        : isOver
        ? `Over by ${formatPercentBps(totalBps - 10000)}%`
        : `${formatPercentBps(10000 - totalBps)}% remaining`;

    const handleContinue = () => {
        if (!isValid) return;
        navigate(`/upload/rights${querySuffix}`);
    };

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
                <HStack gap={2} align="center">
                    <IconButton
                        aria-label="Back to track details"
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/upload${querySuffix}`)}
                    >
                        <FiArrowLeft />
                    </IconButton>
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                            Royalty Splits
                        </Text>
                        <Text fontSize="11px" color="gray.600">
                            Assign percentage shares to each collaborator. Must sum to 100%.
                        </Text>
                    </Box>
                </HStack>

                <SplitsEditor
                    value={mix.splits}
                    onChange={mixSetSplits}
                    self={user ? { id: user.id, name: user.name } : null}
                    resetTo={selfRow}
                    pickerMode="global"
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
                            onClick={() => navigate(`/upload${querySuffix}`)}
                            variant="ghost"
                            size="sm"
                            fontSize="xs"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={!isValid}
                            bg="primary.500"
                            color="white"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            borderRadius="10px"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Continue
                            <Icon as={FiArrowRight} boxSize={4} ml={2} />
                        </Button>
                    </HStack>
                </HStack>
            </Box>
        </>
    );
};

export default UploadSplitsPage;
