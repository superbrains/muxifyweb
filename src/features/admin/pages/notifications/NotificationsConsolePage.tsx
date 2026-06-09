import React from 'react';
import { Box, Button, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import {
    AdminPageLayout,
    AdminError,
    DataTable,
    KpiStrip,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { Select } from '@shared/components';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime, formatCount, isoDaysAgo, todayIso } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import {
    useBroadcasts,
    useCreateBroadcast,
    useDeliveryStats,
} from '../../hooks/usePlatform';
import type { Broadcast } from '../../types/platform';

const TYPE_OPTIONS = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'alert', label: 'Alert' },
    { value: 'maintenance', label: 'Maintenance' },
];

const TARGET_OPTIONS = [
    { value: '', label: 'All users' },
    { value: 'fan', label: 'Fans' },
    { value: 'artist', label: 'Artists' },
    { value: 'dj', label: 'DJs' },
    { value: 'creator', label: 'Creators' },
    { value: 'podcaster', label: 'Podcasters' },
    { value: 'record_label', label: 'Record Labels' },
    { value: 'ad_manager', label: 'Ad Managers' },
    { value: 'contributor', label: 'Contributors' },
];

const PAGE_SIZE = 10;

const ComposeBroadcast: React.FC = () => {
    const [title, setTitle] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [type, setType] = React.useState('announcement');
    const [targetRole, setTargetRole] = React.useState('');
    const create = useCreateBroadcast();

    const canSubmit = title.trim().length > 0 && message.trim().length > 0;

    const submit = () => {
        if (!canSubmit) return;
        create.mutate(
            {
                title: title.trim(),
                message: message.trim(),
                type,
                targetRole: targetRole || null,
            },
            {
                onSuccess: () => {
                    setTitle('');
                    setMessage('');
                    setType('announcement');
                    setTargetRole('');
                },
            },
        );
    };

    return (
        <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={4}>
            <Text fontSize="13px" fontWeight="semibold" color="gray.900" mb={3} fontFamily="Poppins">
                Compose broadcast
            </Text>
            <VStack align="stretch" gap={3}>
                <Box>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                        Title
                    </Text>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short, clear headline"
                        size="sm"
                        fontSize="xs"
                        borderColor="gray.200"
                        borderRadius="lg"
                    />
                </Box>
                <Box>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                        Message
                    </Text>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What do you want to tell users?"
                        rows={4}
                        fontSize="xs"
                        resize="none"
                        borderColor="gray.200"
                        borderRadius="lg"
                    />
                </Box>
                <HStack gap={3} flexWrap="wrap" align="flex-end">
                    <Box>
                        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                            Type
                        </Text>
                        <Select
                            options={TYPE_OPTIONS}
                            value={type}
                            onChange={setType}
                            width="170px"
                            borderColor="gray.200"
                            borderRadius="10px"
                        />
                    </Box>
                    <Box>
                        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                            Audience
                        </Text>
                        <Select
                            options={TARGET_OPTIONS}
                            value={targetRole}
                            onChange={setTargetRole}
                            width="180px"
                            borderColor="gray.200"
                            borderRadius="10px"
                        />
                    </Box>
                    <Button
                        ml={{ md: 'auto' }}
                        size="sm"
                        fontSize="xs"
                        bg="primary.500"
                        color="white"
                        borderRadius="10px"
                        disabled={!canSubmit}
                        loading={create.isPending}
                        onClick={submit}
                        _hover={{ bg: '#E61E45' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        <FiSend style={{ marginRight: 6 }} />
                        Send broadcast
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
};

/** Notifications console — compose broadcasts, review history and delivery stats. */
const NotificationsConsolePage: React.FC = () => {
    const canManage = useHasPermission('NotificationsManage');
    const [page, setPage] = React.useState(1);
    const broadcasts = useBroadcasts({ page, pageSize: PAGE_SIZE });
    const stats = useDeliveryStats({ from: isoDaysAgo(30), to: todayIso() });

    const statItems: KpiItem[] = stats.data
        ? [
              { label: 'Total Delivered', value: formatCount(stats.data.total) },
              { label: 'In-App', value: formatCount(stats.data.byChannel.inApp) },
              { label: 'Push', value: formatCount(stats.data.byChannel.push) },
              { label: 'Email', value: formatCount(stats.data.byChannel.email) },
              { label: 'Sent', value: formatCount(stats.data.byStatus.sent) },
              { label: 'Failed', value: formatCount(stats.data.byStatus.failed) },
          ]
        : [];

    const columns: DataColumn<Broadcast>[] = [
        {
            key: 'title',
            header: 'Broadcast',
            render: (b) => (
                <Box>
                    <Text fontWeight="medium" color="gray.900">{b.title}</Text>
                    <Text fontSize="11px" color="gray.500" lineClamp={1}>{b.message}</Text>
                </Box>
            ),
        },
        { key: 'type', header: 'Type', render: (b) => <StatusBadge status={b.type} label={b.type} /> },
        {
            key: 'target',
            header: 'Audience',
            render: (b) => (
                <Text textTransform="capitalize">{b.targetRole ? b.targetRole.replace(/_/g, ' ') : 'All users'}</Text>
            ),
        },
        { key: 'recipients', header: 'Recipients', align: 'right', render: (b) => formatCount(b.recipientCount) },
        { key: 'createdAt', header: 'Sent', align: 'right', render: (b) => adminDateTime(b.createdAt) },
    ];

    return (
        <AdminPageLayout
            title="Notifications"
            subtitle="Broadcast to the platform and track delivery"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Notifications' }]}
        >
            {!stats.error && <KpiStrip items={statItems} columns={{ base: 2, md: 3, xl: 6 }} />}

            {canManage && <ComposeBroadcast />}

            {broadcasts.error ? (
                <AdminError error={broadcasts.error} message={getApiErrorMessage(broadcasts.error, 'Could not load broadcasts.')} />
            ) : (
                <DataTable
                    columns={columns}
                    rows={broadcasts.data?.items ?? []}
                    rowKey={(b) => b.id}
                    loading={broadcasts.isLoading && !broadcasts.data}
                    emptyIcon={FiSend}
                    emptyTitle="No broadcasts yet"
                    emptyDescription="Compose a broadcast above to reach your users."
                    pagination={
                        broadcasts.data
                            ? {
                                  page: broadcasts.data.page,
                                  pageSize: broadcasts.data.pageSize,
                                  total: broadcasts.data.total,
                                  onPageChange: setPage,
                              }
                            : undefined
                    }
                />
            )}
        </AdminPageLayout>
    );
};

export default NotificationsConsolePage;
