import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    HStack,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRoster } from '../hooks/useRoster';
import { formatMinorAmount } from '../lib/format';

export const TopArtistsCard: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useRoster();

    const top = [...(data ?? [])]
        .sort((a, b) => b.monthlyStreams - a.monthlyStreams)
        .slice(0, 5);

    return (
        <Box
            bg="white"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="gray.100"
            overflow="hidden"
        >
            <Box px={4} pt={4} pb={2}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                    Top artists
                </Text>
                <Text fontSize="9px" color="gray.500">
                    By streams over the last 30 days
                </Text>
            </Box>

            <Box px={2} pb={2}>
                {isLoading ? (
                    <Center py={8}>
                        <Spinner size="sm" color="primary.500" />
                    </Center>
                ) : top.length === 0 ? (
                    <VStack py={6} gap={2}>
                        <Text fontSize="xs" color="gray.500">
                            Your roster is empty.
                        </Text>
                        <Button
                            size="xs"
                            bg="primary.500"
                            color="white"
                            borderRadius="lg"
                            _hover={{ bg: 'primary.600' }}
                            onClick={() => navigate('/label/roster')}
                        >
                            Invite your first artist
                        </Button>
                    </VStack>
                ) : (
                    <VStack align="stretch" gap={0}>
                        {top.map((a, i) => (
                            <HStack
                                key={a.artistUserId}
                                px={2}
                                py={2.5}
                                gap={3}
                                borderRadius="lg"
                                _hover={{ bg: 'gray.50' }}
                                cursor="pointer"
                                onClick={() => navigate('/label/roster')}
                            >
                                <Text fontSize="10px" color="gray.400" fontWeight="bold" w="14px">
                                    {i + 1}
                                </Text>
                                <Avatar.Root size="sm">
                                    <Avatar.Fallback name={a.performingName} />
                                    {a.avatarUrl && <Avatar.Image src={a.avatarUrl} />}
                                </Avatar.Root>
                                <VStack align="start" gap={0} flex={1} minW={0}>
                                    <HStack gap={1} w="full">
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="gray.900"
                                            truncate
                                        >
                                            {a.performingName}
                                        </Text>
                                        {a.isVerified && (
                                            <Box
                                                w="11px"
                                                h="11px"
                                                bg="primary.500"
                                                borderRadius="full"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                flexShrink={0}
                                            >
                                                <FiCheck size={8} color="white" />
                                            </Box>
                                        )}
                                    </HStack>
                                    <Text fontSize="10px" color="gray.500" truncate w="full">
                                        {a.monthlyStreams.toLocaleString()} plays
                                    </Text>
                                </VStack>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                                    {formatMinorAmount(a.monthlyRevenueMinor, 'NGN')}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Box>

            {top.length > 0 && (
                <Box
                    as="button"
                    borderTopWidth="1px"
                    borderColor="gray.100"
                    w="full"
                    py={2.5}
                    bg="white"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => navigate('/label/roster')}
                    cursor="pointer"
                >
                    <HStack justify="center" gap={1}>
                        <Text fontSize="10px" fontWeight="semibold" color="primary.500">
                            See full roster
                        </Text>
                        <FiArrowRight size={10} color="#f94444" />
                    </HStack>
                </Box>
            )}
        </Box>
    );
};
