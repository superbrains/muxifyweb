import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Input,
    Portal,
    Spinner,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { FiCreditCard } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    DetailDrawer,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { adminDate, adminDateTime, formatMinorAmount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useAdWallets,
    useAdWalletTransactions,
    useCreditWallet,
    useRefundWallet,
} from '../../hooks/useAdvertising';
import type {
    AdWalletDto,
    AdWalletQuery,
    AdWalletTransactionDto,
} from '../../types/advertising';
import { NoAccess } from './NoAccess';

const PAGE_SIZE = 20;
const TXN_PAGE_SIZE = 20;

/** Advertiser wallets — balances list, transaction ledger drawer and credit/refund actions. */
const AdWalletPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const canManage = useHasPermission('AdvertisingManage');
    const [query, setQuery] = React.useState<AdWalletQuery>({ page: 1, pageSize: PAGE_SIZE });
    const [selected, setSelected] = React.useState<AdWalletDto | null>(null);
    const { data, isLoading, error } = useAdWallets(query);

    const columns: DataColumn<AdWalletDto>[] = [
        {
            key: 'advertiser',
            header: 'Advertiser',
            render: (w) => <IdentityCell name={w.advertiserName} secondary={w.userId} />,
        },
        {
            key: 'balance',
            header: 'Balance',
            align: 'right',
            render: (w) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatMinorAmount(w.balanceMinor, w.currency)}
                </Text>
            ),
        },
        {
            key: 'deposited',
            header: 'Deposited',
            align: 'right',
            render: (w) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(w.totalDepositedMinor, w.currency)}
                </Text>
            ),
        },
        {
            key: 'spent',
            header: 'Spent',
            align: 'right',
            render: (w) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(w.totalSpentMinor, w.currency)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (w) => <StatusBadge status={w.isActive ? 'Active' : 'Inactive'} />,
        },
        {
            key: 'created',
            header: 'Opened',
            render: (w) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(w.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Ad Wallets"
            subtitle="Advertiser prepaid wallets — balances, ledgers and manual credit/refund."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Ad Wallets' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : (
                <>
                    <FilterBar
                        search={{
                            value: query.search ?? '',
                            onChange: (v) =>
                                setQuery((q) => ({ ...q, search: v || undefined, page: 1 })),
                            placeholder: 'Search by advertiser',
                        }}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load wallets." />
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={data?.items ?? []}
                            rowKey={(w) => w.id}
                            loading={isLoading && !data}
                            onRowClick={(w) => setSelected(w)}
                            emptyIcon={FiCreditCard}
                            emptyTitle="No wallets"
                            emptyDescription="No advertiser wallets match the current filters."
                            pagination={
                                data
                                    ? {
                                          page: data.page,
                                          pageSize: data.pageSize,
                                          total: data.total,
                                          onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                                      }
                                    : undefined
                            }
                        />
                    )}

                    <WalletDrawer
                        wallet={selected}
                        canManage={canManage}
                        onClose={() => setSelected(null)}
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default AdWalletPage;

/* ------------------------------ Detail drawer ----------------------------- */

const WalletDrawer: React.FC<{
    wallet: AdWalletDto | null;
    canManage: boolean;
    onClose: () => void;
}> = ({ wallet, canManage, onClose }) => {
    const userId = wallet?.userId ?? null;
    const [txnPage, setTxnPage] = React.useState(1);
    const [dialog, setDialog] = React.useState<'credit' | 'refund' | null>(null);

    React.useEffect(() => {
        setTxnPage(1);
    }, [userId]);

    const { data, isLoading, error } = useAdWalletTransactions(userId, {
        page: txnPage,
        pageSize: TXN_PAGE_SIZE,
    });

    const columns: DataColumn<AdWalletTransactionDto>[] = [
        {
            key: 'type',
            header: 'Type',
            render: (t) => <StatusBadge status={t.type} />,
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (t) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatMinorAmount(t.amountMinor, t.currency)}
                </Text>
            ),
        },
        {
            key: 'balance',
            header: 'Balance after',
            align: 'right',
            render: (t) => (
                <Text fontSize="11px" color="gray.600">
                    {formatMinorAmount(t.balanceAfterMinor, t.currency)}
                </Text>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (t) => (
                <Text fontSize="11px" color="gray.600" lineClamp={2}>
                    {t.description}
                </Text>
            ),
        },
        {
            key: 'created',
            header: 'When',
            render: (t) => (
                <Text fontSize="11px" color="gray.500">
                    {adminDateTime(t.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <DetailDrawer
            open={wallet !== null}
            onClose={onClose}
            title={wallet?.advertiserName ?? 'Wallet'}
            subtitle={wallet ? formatMinorAmount(wallet.balanceMinor, wallet.currency) : undefined}
            size="lg"
            footer={
                canManage && wallet ? (
                    <HStack gap={2} justify="flex-end" w="100%">
                        <Button
                            size="sm"
                            fontSize="xs"
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.700"
                            borderRadius="10px"
                            onClick={() => setDialog('refund')}
                        >
                            Refund
                        </Button>
                        <Button
                            size="sm"
                            fontSize="xs"
                            bg="primary.500"
                            color="white"
                            borderRadius="10px"
                            _hover={{ bg: '#E61E45' }}
                            onClick={() => setDialog('credit')}
                        >
                            Credit
                        </Button>
                    </HStack>
                ) : undefined
            }
        >
            {error ? (
                <AdminError error={error} message="Could not load transactions." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(t) => t.id}
                    emptyIcon={FiCreditCard}
                    emptyTitle="No transactions"
                    emptyDescription="This wallet has no recorded transactions."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: setTxnPage,
                              }
                            : undefined
                    }
                />
            )}

            {dialog && userId && wallet && (
                <WalletAdjustDialog
                    mode={dialog}
                    userId={userId}
                    currency={wallet.currency}
                    onClose={() => setDialog(null)}
                />
            )}
        </DetailDrawer>
    );
};

/* ------------------------------ Credit / refund --------------------------- */

const WalletAdjustDialog: React.FC<{
    mode: 'credit' | 'refund';
    userId: string;
    currency: string;
    onClose: () => void;
}> = ({ mode, userId, currency, onClose }) => {
    const toast = useChakraToast();
    const credit = useCreditWallet();
    const refund = useRefundWallet();

    const [amountMajor, setAmountMajor] = React.useState('');
    const [reason, setReason] = React.useState('');

    const amountMinor = Math.round((parseFloat(amountMajor) || 0) * 100);
    const valid = amountMinor > 0 && reason.trim().length >= 5;
    const pending = credit.isPending || refund.isPending;

    const submit = () => {
        if (!valid) {
            toast.error('Missing fields', 'A positive amount and a short reason are required.');
            return;
        }
        const payload = { amountMinor, reason: reason.trim() };
        const fn = mode === 'credit' ? credit : refund;
        fn.mutate({ userId, payload }, { onSuccess: onClose });
    };

    return (
        <Dialog.Root open onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="460px" p={6} borderRadius="20px" position="relative">
                        <IconButton
                            aria-label="Close"
                            variant="ghost"
                            size="sm"
                            color="gray.500"
                            position="absolute"
                            right={3}
                            top={3}
                            onClick={onClose}
                        >
                            <Icon as={MdClose} />
                        </IconButton>
                        <Text fontSize="md" fontWeight="semibold" color="gray.900" fontFamily="Poppins" mb={4}>
                            {mode === 'credit' ? 'Credit wallet' : 'Refund wallet'}
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Amount ({currency} major units)
                                </Text>
                                <Input
                                    type="number"
                                    value={amountMajor}
                                    onChange={(e) => setAmountMajor(e.target.value)}
                                    size="sm"
                                    placeholder="e.g. 5000"
                                />
                            </Box>
                            <Box>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                    Reason
                                </Text>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    fontSize="xs"
                                    resize="none"
                                    placeholder="Recorded in the audit log."
                                />
                            </Box>
                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={pending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg="primary.500"
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={!valid || pending}
                                    _hover={{ bg: '#E61E45' }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {pending ? (
                                        <Spinner size="xs" color="white" />
                                    ) : mode === 'credit' ? (
                                        'Credit'
                                    ) : (
                                        'Refund'
                                    )}
                                </Button>
                            </HStack>
                        </VStack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
