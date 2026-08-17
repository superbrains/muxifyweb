import React from 'react';
import { Box, Button, Drawer, HStack, Portal, Spinner, Text, VStack } from '@chakra-ui/react';
import { StatusBadge } from '../StatusBadge';
import { financeStatusStyle, transactionTypeStyle } from '../../lib/financeStatusColor';
import { adminDateTime, formatCount } from '@shared/console/lib/format';
import { useFinanceTransaction, useRefundPurchase } from '../../hooks/useFinance';
import { ActionDialog } from './ActionDialog';
import { WalletAdjustDialog } from './WalletAdjustDialog';

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
    if (value === undefined || value === null || value === '') return null;
    return (
        <HStack justify="space-between" align="start" gap={4}>
            <Text fontSize="11px" color="gray.500" textTransform="uppercase" letterSpacing="0.3px">{label}</Text>
            <Box fontSize="xs" color="gray.800" textAlign="right" maxW="60%">{value}</Box>
        </HStack>
    );
}

export function TransactionDetailDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
    const { data, isLoading } = useFinanceTransaction(id);
    const tx = data?.transaction;
    const refund = useRefundPurchase();
    const [showRefund, setShowRefund] = React.useState(false);
    const [showAdjust, setShowAdjust] = React.useState(false);

    const canRefund = tx?.type === 'Purchase' && tx?.status === 'Completed';

    return (
        <Drawer.Root open={id !== null} onOpenChange={(e) => { if (!e.open) onClose(); }} placement="end" size="md">
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>
                        <Drawer.Header borderBottom="1px solid" borderColor="gray.100">
                            <Text fontSize="sm" fontWeight="semibold" fontFamily="Poppins">Transaction detail</Text>
                        </Drawer.Header>
                        <Drawer.Body>
                            {isLoading || !tx ? (
                                <HStack justify="center" py={16}><Spinner color="primary.500" /></HStack>
                            ) : (
                                <VStack align="stretch" gap={3} py={2}>
                                    <HStack gap={2}>
                                        <StatusBadge style={transactionTypeStyle(tx.type, tx.isCredit)} />
                                        {tx.status && <StatusBadge style={financeStatusStyle(tx.status)} />}
                                    </HStack>
                                    <Text fontSize="2xl" fontWeight="bold" color={tx.isCredit ? '#0F7B5C' : '#C53030'}>
                                        {tx.isCredit ? '+' : '-'}{formatCount(tx.amount)} coins
                                    </Text>
                                    <Box h="1px" bg="gray.100" />
                                    <Row label="User" value={`${tx.userDisplayName}${tx.userEmail ? ` · ${tx.userEmail}` : ''}`} />
                                    <Row label="Balance after" value={`${formatCount(tx.balanceAfter)} coins`} />
                                    <Row label="Description" value={tx.description} />
                                    <Row label="Counterparty" value={tx.counterpartyName} />
                                    <Row label="Reference" value={tx.referenceType} />
                                    <Row label="Date" value={adminDateTime(tx.transactionDate)} />
                                    {data?.fundingAmountMinor != null && (
                                        <>
                                            <Box h="1px" bg="gray.100" />
                                            <Text fontSize="11px" color="gray.500" fontWeight="semibold">FUNDING</Text>
                                            <Row label="Provider" value={data.fundingProvider} />
                                            <Row label="Payment ref" value={data.fundingPaymentReference} />
                                            <Row label="Gateway txn" value={data.fundingGatewayTransactionId} />
                                        </>
                                    )}
                                    {data?.giftType && (
                                        <>
                                            <Box h="1px" bg="gray.100" />
                                            <Text fontSize="11px" color="gray.500" fontWeight="semibold">GIFT</Text>
                                            <Row label="Type" value={data.giftType} />
                                            <Row label="Message" value={data.giftMessage} />
                                        </>
                                    )}
                                </VStack>
                            )}
                        </Drawer.Body>
                        {tx && (
                            <Drawer.Footer borderTop="1px solid" borderColor="gray.100">
                                <HStack gap={2} w="100%">
                                    <Button flex="1" size="sm" variant="outline" borderColor="gray.200" borderRadius="lg" fontSize="xs" onClick={() => setShowAdjust(true)}>
                                        Adjust wallet
                                    </Button>
                                    {canRefund && (
                                        <Button flex="1" size="sm" borderRadius="lg" bg="#f94444" color="white" _hover={{ opacity: 0.9 }} fontSize="xs" onClick={() => setShowRefund(true)}>
                                            Refund purchase
                                        </Button>
                                    )}
                                </HStack>
                            </Drawer.Footer>
                        )}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>

            <ActionDialog
                isOpen={showRefund}
                onClose={() => setShowRefund(false)}
                title="Refund purchase"
                description="Marks the purchase refunded and claws back the purchased coins. Requires sufficient wallet balance."
                confirmLabel="Refund"
                reasonLabel="Reason"
                danger
                isLoading={refund.isPending}
                onConfirm={({ reason }) => id && refund.mutate({ id, reason }, { onSuccess: () => setShowRefund(false) })}
            />
            <WalletAdjustDialog isOpen={showAdjust} onClose={() => setShowAdjust(false)} userId={tx?.userId ?? null} userName={tx?.userDisplayName} />
        </Drawer.Root>
    );
}
