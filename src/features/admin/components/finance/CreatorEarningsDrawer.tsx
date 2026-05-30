import React from 'react';
import { Badge, Box, Drawer, HStack, Portal, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { adminDate, formatCount, formatMinorAmount } from '../../lib/format';
import { useCreatorEarnings, useCreatorSplits } from '../../hooks/useFinance';

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <Box bg="gray.50" borderRadius="lg" px={3} py={2}>
            <Text fontSize="10px" color="gray.500" textTransform="uppercase">{label}</Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.900">{value}</Text>
        </Box>
    );
}

export function CreatorEarningsDrawer({ artistId, onClose }: { artistId: string | null; onClose: () => void }) {
    const [page, setPage] = React.useState(1);
    React.useEffect(() => setPage(1), [artistId]);

    const { data, isLoading } = useCreatorEarnings(artistId, { page, pageSize: 10 });
    const { data: splits } = useCreatorSplits(artistId);
    const cur = data?.currency ?? 'NGN';

    return (
        <Drawer.Root open={artistId !== null} onOpenChange={(e) => { if (!e.open) onClose(); }} placement="end" size="lg">
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>
                        <Drawer.Header borderBottom="1px solid" borderColor="gray.100">
                            <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="semibold" fontFamily="Poppins">
                                    {data?.artistName ?? 'Creator earnings'}
                                </Text>
                                {data?.artistEmail && <Text fontSize="11px" color="gray.500">{data.artistEmail}</Text>}
                            </VStack>
                        </Drawer.Header>
                        <Drawer.Body>
                            {isLoading || !data ? (
                                <HStack justify="center" py={16}><Spinner color="primary.500" /></HStack>
                            ) : (
                                <VStack align="stretch" gap={4} py={2}>
                                    <SimpleGrid columns={2} gap={2}>
                                        <Stat label="Net earned" value={formatMinorAmount(data.totalNetMinor, cur)} />
                                        <Stat label="Unwithdrawn" value={formatMinorAmount(data.unwithdrawnMinor, cur)} />
                                    </SimpleGrid>

                                    {splits && splits.length > 0 && (
                                        <Box>
                                            <Text fontSize="11px" color="gray.500" fontWeight="semibold" textTransform="uppercase" mb={2}>
                                                Royalty splits by track
                                            </Text>
                                            <VStack align="stretch" gap={2}>
                                                {splits.map((tr) => (
                                                    <Box key={tr.trackId} border="1px solid" borderColor="gray.100" borderRadius="lg" p={3}>
                                                        <HStack justify="space-between" mb={1.5}>
                                                            <Text fontSize="xs" fontWeight="semibold" color="gray.900">{tr.trackTitle}</Text>
                                                            <Text fontSize="xs" color="gray.500">{formatMinorAmount(tr.trackNetEarnedMinor, cur)}</Text>
                                                        </HStack>
                                                        <VStack align="stretch" gap={1}>
                                                            {tr.recipients.map((r) => (
                                                                <HStack key={r.recipientUserId} justify="space-between">
                                                                    <HStack gap={1.5}>
                                                                        <Text fontSize="11px" color="gray.700">{r.recipientName}</Text>
                                                                        <Badge fontSize="9px" variant="subtle">{r.role}</Badge>
                                                                    </HStack>
                                                                    <Text fontSize="11px" color="gray.600">
                                                                        {(r.percentBps / 100).toFixed(1)}% · {formatMinorAmount(r.allocatedNetMinor, cur)}
                                                                    </Text>
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}

                                    <Box>
                                        <Text fontSize="11px" color="gray.500" fontWeight="semibold" textTransform="uppercase" mb={2}>
                                            Earning history
                                        </Text>
                                        <VStack align="stretch" gap={1.5}>
                                            {data.earnings.items.map((e) => (
                                                <HStack key={e.id} justify="space-between" borderBottom="1px solid" borderColor="gray.50" pb={1.5}>
                                                    <VStack align="start" gap={0}>
                                                        <Text fontSize="xs" color="gray.800">{e.type}{e.trackTitle ? ` · ${e.trackTitle}` : ''}</Text>
                                                        <Text fontSize="10px" color="gray.400">{adminDate(e.earnedAt)} · {formatCount(e.coinAmount)} coins</Text>
                                                    </VStack>
                                                    <VStack align="end" gap={0}>
                                                        <Text fontSize="xs" fontWeight="semibold" color="#0F7B5C">{formatMinorAmount(e.netAmountMinor, e.currency)}</Text>
                                                        {e.isWithdrawn && <Text fontSize="9px" color="gray.400">withdrawn</Text>}
                                                    </VStack>
                                                </HStack>
                                            ))}
                                            {data.earnings.items.length === 0 && (
                                                <Text fontSize="xs" color="gray.400">No earnings in range.</Text>
                                            )}
                                        </VStack>
                                        {data.earnings.total > data.earnings.pageSize && (
                                            <HStack justify="space-between" mt={3}>
                                                <Text
                                                    fontSize="xs"
                                                    color={page > 1 ? 'primary.500' : 'gray.300'}
                                                    cursor={page > 1 ? 'pointer' : 'default'}
                                                    onClick={() => page > 1 && setPage((p) => p - 1)}
                                                >
                                                    ‹ Prev
                                                </Text>
                                                <Text fontSize="11px" color="gray.500">Page {data.earnings.page}</Text>
                                                <Text
                                                    fontSize="xs"
                                                    color={page * data.earnings.pageSize < data.earnings.total ? 'primary.500' : 'gray.300'}
                                                    cursor={page * data.earnings.pageSize < data.earnings.total ? 'pointer' : 'default'}
                                                    onClick={() => page * data.earnings.pageSize < data.earnings.total && setPage((p) => p + 1)}
                                                >
                                                    Next ›
                                                </Text>
                                            </HStack>
                                        )}
                                    </Box>
                                </VStack>
                            )}
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}
