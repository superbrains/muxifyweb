import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLabelReleases } from '../hooks/useLabelReleases';

/**
 * Renders only when there are tracks with incomplete royalty splits (not 100%).
 * Hidden entirely otherwise — this is an actionable alert, not a status panel,
 * so there is no "all clear" state to display.
 */
export const SplitsAttentionCard: React.FC = () => {
    const navigate = useNavigate();
    const { data } = useLabelReleases({ kind: 'track', sort: 'recent', pageSize: 50 });

    const incomplete = (data?.items ?? [])
        .filter((r) => r.kind === 'track' && r.splitsComplete === false)
        .slice(0, 5);

    if (incomplete.length === 0) return null;

    return (
        <Box
            bg="#FFF9E6"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="#F59E0B33"
            p={4}
        >
            <HStack gap={2} mb={3}>
                <Box
                    w="24px"
                    h="24px"
                    borderRadius="full"
                    bg="#F59E0B22"
                    color="#92660C"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <FiAlertTriangle size={12} />
                </Box>
                <VStack align="start" gap={0}>
                    <Text fontSize="11px" fontWeight="semibold" color="#92660C">
                        Splits need attention
                    </Text>
                    <Text fontSize="9px" color="#92660C" opacity={0.75}>
                        These tracks won&apos;t pay out cleanly until splits sum to 100%.
                    </Text>
                </VStack>
            </HStack>

            <VStack align="stretch" gap={1.5}>
                {incomplete.map((r) => (
                    <HStack
                        key={r.id}
                        bg="white"
                        borderRadius="md"
                        px={2.5}
                        py={2}
                        justify="space-between"
                    >
                        <VStack align="start" gap={0} flex={1} minW={0}>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900" truncate w="full">
                                {r.title}
                            </Text>
                            <Text fontSize="10px" color="gray.500" truncate w="full">
                                {r.artistName}
                            </Text>
                        </VStack>
                        <Button
                            size="xs"
                            bg="#92660C"
                            color="white"
                            fontSize="10px"
                            fontWeight="semibold"
                            borderRadius="md"
                            _hover={{ bg: '#7a5410' }}
                            onClick={() => navigate(`/label/splits/${r.id}`)}
                        >
                            Set splits
                        </Button>
                    </HStack>
                ))}
            </VStack>
        </Box>
    );
};
