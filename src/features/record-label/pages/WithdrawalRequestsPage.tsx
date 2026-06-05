import React from 'react';
import {
    Box,
    Button,
    Center,
    Dialog,
    HStack,
    Portal,
    Skeleton,
    Stack,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import {
    useApproveWithdrawalRequest,
    useRejectWithdrawalRequest,
    useWithdrawalRequests,
} from '../hooks/useWithdrawalRequests';
import { RequestOwnPayoutDialog } from '../components/RequestOwnPayoutDialog';
import { WithdrawalStatusBadge } from '@/features/payments/components/WithdrawalStatusBadge';
import { formatMinorAmount } from '../lib/format';
import type { LabelWithdrawalRequestDto } from '../types';

const STATUS_TABS: Array<{ value: string; label: string }> = [
    { value: 'PendingLabelApproval', label: 'Awaiting you' },
    { value: 'Pending', label: 'With Muxify' },
    { value: 'Completed', label: 'Paid' },
    { value: 'Rejected', label: 'Rejected' },
    { value: '', label: 'All' },
];

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const WithdrawalRequestsPage: React.FC = () => {
    const [status, setStatus] = React.useState('PendingLabelApproval');
    const [requestOwnOpen, setRequestOwnOpen] = React.useState(false);
    const [decision, setDecision] = React.useState<
        { mode: 'approve' | 'reject'; req: LabelWithdrawalRequestDto } | null
    >(null);

    const { data, isLoading } = useWithdrawalRequests({ status: status || undefined, page: 1, pageSize: 50 });
    const items = data?.items ?? [];

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <HStack justify="space-between" align="center">
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                        Withdrawal Requests
                    </Text>
                    <Text fontSize="11px" color="gray.600">
                        Review payout requests from your roster, then send approvals to Muxify.
                    </Text>
                </Box>
                <Button
                    onClick={() => setRequestOwnOpen(true)}
                    bg="primary.500"
                    color="white"
                    size="sm"
                    fontSize="xs"
                    fontWeight="medium"
                    borderRadius="10px"
                    _hover={{ bg: 'primary.600' }}
                >
                    Request my payout
                </Button>
            </HStack>

            {/* Status tabs */}
            <HStack gap={2} flexWrap="wrap">
                {STATUS_TABS.map((tab) => {
                    const active = status === tab.value;
                    return (
                        <Button
                            key={tab.value || 'all'}
                            onClick={() => setStatus(tab.value)}
                            size="xs"
                            borderRadius="full"
                            fontSize="11px"
                            bg={active ? 'primary.500' : 'white'}
                            color={active ? 'white' : 'gray.600'}
                            borderWidth="1px"
                            borderColor={active ? 'primary.500' : 'gray.200'}
                            _hover={{ bg: active ? 'primary.600' : 'gray.50' }}
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </HStack>

            {/* List */}
            <Box bg="white" borderRadius="14px" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                {isLoading ? (
                    <Stack gap={0}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} h="64px" m={3} borderRadius="10px" />
                        ))}
                    </Stack>
                ) : items.length === 0 ? (
                    <Center py={16}>
                        <VStack gap={1}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                Nothing here
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                No withdrawal requests in this view.
                            </Text>
                        </VStack>
                    </Center>
                ) : (
                    <Stack gap={0}>
                        {items.map((req, idx) => (
                            <Box
                                key={req.id}
                                px={4}
                                py={3}
                                borderTopWidth={idx === 0 ? '0' : '1px'}
                                borderColor="gray.100"
                            >
                                <HStack justify="space-between" align="start" gap={4}>
                                    <VStack align="start" gap={0.5} flex="1" minW={0}>
                                        <Text fontSize="sm" fontWeight="medium" color="gray.900">
                                            {req.artistName}
                                        </Text>
                                        <Text fontSize="11px" color="gray.500">
                                            {req.bankName} · {req.accountNumber}
                                        </Text>
                                        <HStack gap={2} pt={1}>
                                            <WithdrawalStatusBadge status={req.status} />
                                            <Text fontSize="10px" color="gray.400">
                                                {formatDate(req.requestedAt)}
                                            </Text>
                                        </HStack>
                                        {req.status === 'Rejected' && req.labelRejectionReason && (
                                            <Text fontSize="11px" color="red.600" pt={1}>
                                                Reason: {req.labelRejectionReason}
                                            </Text>
                                        )}
                                    </VStack>

                                    <VStack align="end" gap={1} flexShrink={0}>
                                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                            {formatMinorAmount(req.amountMinor, req.currency)}
                                        </Text>
                                        <Text fontSize="10px" color="gray.400">
                                            Net {formatMinorAmount(req.netAmountMinor, req.currency)}
                                        </Text>
                                        {req.status === 'PendingLabelApproval' && (
                                            <HStack gap={2} pt={1}>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    borderColor="red.300"
                                                    color="red.500"
                                                    borderRadius="8px"
                                                    fontSize="11px"
                                                    _hover={{ bg: 'red.50' }}
                                                    onClick={() => setDecision({ mode: 'reject', req })}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    bg="primary.500"
                                                    color="white"
                                                    borderRadius="8px"
                                                    fontSize="11px"
                                                    _hover={{ bg: 'primary.600' }}
                                                    onClick={() => setDecision({ mode: 'approve', req })}
                                                >
                                                    Approve
                                                </Button>
                                            </HStack>
                                        )}
                                    </VStack>
                                </HStack>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            <RequestOwnPayoutDialog open={requestOwnOpen} onClose={() => setRequestOwnOpen(false)} />
            <DecisionDialog decision={decision} onClose={() => setDecision(null)} />
        </VStack>
    );
};

// ---------------------------------------------------------------------------
// Approve (optional note) / Reject (required reason) dialog
// ---------------------------------------------------------------------------
interface DecisionDialogProps {
    decision: { mode: 'approve' | 'reject'; req: LabelWithdrawalRequestDto } | null;
    onClose: () => void;
}

const DecisionDialog: React.FC<DecisionDialogProps> = ({ decision, onClose }) => {
    const [text, setText] = React.useState('');
    const approve = useApproveWithdrawalRequest();
    const reject = useRejectWithdrawalRequest();

    React.useEffect(() => {
        setText('');
    }, [decision]);

    if (!decision) return null;
    const { mode, req } = decision;
    const isReject = mode === 'reject';
    const busy = approve.isPending || reject.isPending;
    const disabled = busy || (isReject && text.trim().length === 0);

    const submit = async () => {
        try {
            if (isReject) {
                await reject.mutateAsync({ id: req.id, reason: text.trim() });
            } else {
                await approve.mutateAsync({ id: req.id, note: text.trim() || undefined });
            }
            onClose();
        } catch {
            // Error toast fired inside the mutation; keep dialog open to retry.
        }
    };

    return (
        <Dialog.Root open={Boolean(decision)} onOpenChange={(d) => !d.open && onClose()} size="md" placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="20px" p={2}>
                        <Dialog.Header>
                            <Dialog.Title fontSize="sm" fontWeight="semibold" fontFamily="Poppins">
                                {isReject ? 'Reject request' : 'Approve request'}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={3}>
                                <Text fontSize="xs" color="gray.600">
                                    {req.artistName} · {formatMinorAmount(req.amountMinor, req.currency)}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                    {isReject
                                        ? 'Tell the artist why this request is being rejected. They will see this reason.'
                                        : 'Add an optional note. Approving sends this request to Muxify for final approval.'}
                                </Text>
                                <Textarea
                                    placeholder={isReject ? 'Reason for rejection (required)' : 'Optional note'}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    size="sm"
                                    borderRadius="10px"
                                    rows={3}
                                />
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <HStack gap={2} justify="flex-end" w="full">
                                <Button variant="ghost" size="sm" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    borderRadius="10px"
                                    bg={isReject ? 'red.500' : 'primary.500'}
                                    color="white"
                                    _hover={{ bg: isReject ? 'red.600' : 'primary.600' }}
                                    onClick={submit}
                                    disabled={disabled}
                                    loading={busy}
                                    loadingText={isReject ? 'Rejecting...' : 'Approving...'}
                                >
                                    {isReject ? 'Reject' : 'Approve'}
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export default WithdrawalRequestsPage;
