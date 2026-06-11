import React from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import {
    FiBell,
    FiCheck,
    FiMail,
    FiRadio,
    FiSend,
    FiSmartphone,
    FiUsers,
} from 'react-icons/fi';
import {
    AdminPageLayout,
    AdminError,
    ConfirmActionModal,
    DataTable,
    KpiStrip,
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
const TITLE_MAX = 120;
const MESSAGE_MAX = 600;

type ChannelKey = 'inApp' | 'push' | 'email';

interface ChannelDef {
    key: ChannelKey;
    /** Server-side channel name as returned in Broadcast.channels. */
    serverName: string;
    label: string;
    icon: React.ElementType;
    fg: string;
    bg: string;
    border: string;
    hint: string;
}

const CHANNELS: ChannelDef[] = [
    {
        key: 'inApp',
        serverName: 'InApp',
        label: 'In-app',
        icon: FiBell,
        fg: '#1D4ED8',
        bg: '#ECF7FF',
        border: '#BFDBFE',
        hint: 'Real-time bell + feed',
    },
    {
        key: 'push',
        serverName: 'Push',
        label: 'Push',
        icon: FiSmartphone,
        fg: '#7C3AED',
        bg: '#F6F1FF',
        border: '#DDD0FB',
        hint: 'Mobile lock-screen alert',
    },
    {
        key: 'email',
        serverName: 'Email',
        label: 'Email',
        icon: FiMail,
        fg: '#E61E45',
        bg: '#FFF5F6',
        border: '#FBD0D8',
        hint: 'Branded email to inboxes',
    },
];

const labelForRole = (role: string) =>
    TARGET_OPTIONS.find((o) => o.value === role)?.label ?? 'All users';

const labelForType = (type: string) =>
    TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

/* -------------------------------------------------------------------------- */
/*                              Channel selector                              */
/* -------------------------------------------------------------------------- */

const ChannelToggle: React.FC<{
    def: ChannelDef;
    active: boolean;
    onToggle: () => void;
}> = ({ def, active, onToggle }) => (
    <Box
        as="button"
        onClick={onToggle}
        textAlign="left"
        flex="1"
        minW="150px"
        borderRadius="14px"
        border="1.5px solid"
        borderColor={active ? def.border : 'gray.200'}
        bg={active ? def.bg : 'white'}
        px={3.5}
        py={3}
        position="relative"
        transition="all 0.16s ease"
        cursor="pointer"
        _hover={{ borderColor: active ? def.border : 'gray.300', transform: 'translateY(-1px)' }}
    >
        <HStack gap={2.5} align="center">
            <Flex
                boxSize="32px"
                borderRadius="9px"
                align="center"
                justify="center"
                bg={active ? 'white' : 'gray.50'}
                color={active ? def.fg : 'gray.400'}
                transition="all 0.16s ease"
                flexShrink={0}
            >
                <Icon as={def.icon} boxSize={4} />
            </Flex>
            <Box flex="1" minW={0}>
                <Text fontSize="13px" fontWeight="semibold" color={active ? 'gray.900' : 'gray.700'}>
                    {def.label}
                </Text>
                <Text fontSize="10.5px" color={active ? 'gray.600' : 'gray.400'} lineClamp={1}>
                    {def.hint}
                </Text>
            </Box>
            <Flex
                boxSize="18px"
                borderRadius="full"
                align="center"
                justify="center"
                bg={active ? def.fg : 'transparent'}
                border={active ? 'none' : '1.5px solid'}
                borderColor="gray.300"
                flexShrink={0}
            >
                {active && <Icon as={FiCheck} boxSize={3} color="white" />}
            </Flex>
        </HStack>
    </Box>
);

/* -------------------------------------------------------------------------- */
/*                              Live preview card                             */
/* -------------------------------------------------------------------------- */

const BroadcastPreview: React.FC<{
    title: string;
    message: string;
    typeLabel: string;
    audienceLabel: string;
    channels: Record<ChannelKey, boolean>;
}> = ({ title, message, typeLabel, audienceLabel, channels }) => {
    const activeChannels = CHANNELS.filter((c) => channels[c.key]);
    return (
        <Box
            borderRadius="18px"
            p="1px"
            bg="linear-gradient(135deg, #FFE3E9, #EAF2FF)"
            position="sticky"
            top={4}
        >
            <Box bg="#0E1525" borderRadius="17px" p={5} overflow="hidden" position="relative">
                {/* ambient glow */}
                <Box
                    position="absolute"
                    top="-40px"
                    right="-30px"
                    boxSize="160px"
                    bg="#FF2D55"
                    opacity={0.18}
                    filter="blur(60px)"
                    pointerEvents="none"
                />
                <HStack justify="space-between" mb={4} position="relative">
                    <HStack gap={2}>
                        <Icon as={FiRadio} color="#FF6B81" boxSize={3.5} />
                        <Text fontSize="10px" fontWeight="bold" letterSpacing="1.2px" color="whiteAlpha.700" textTransform="uppercase">
                            Live preview
                        </Text>
                    </HStack>
                    <Text fontSize="10px" color="whiteAlpha.500">
                        {audienceLabel}
                    </Text>
                </HStack>

                {/* Notification mock */}
                <Box bg="white" borderRadius="14px" p={4} boxShadow="0 18px 40px rgba(0,0,0,0.35)" position="relative">
                    <HStack align="flex-start" gap={3}>
                        <Flex
                            boxSize="38px"
                            borderRadius="11px"
                            align="center"
                            justify="center"
                            bg="linear-gradient(135deg, #FF2D55, #FF6B81)"
                            flexShrink={0}
                        >
                            <Icon as={FiBell} color="white" boxSize={4} />
                        </Flex>
                        <Box flex="1" minW={0}>
                            <HStack justify="space-between" align="center" mb={0.5}>
                                <Text fontSize="11px" fontWeight="bold" color="gray.900">
                                    Muxify
                                </Text>
                                <Text fontSize="9.5px" color="gray.400">
                                    now
                                </Text>
                            </HStack>
                            <Text
                                fontSize="13px"
                                fontWeight="bold"
                                color="gray.900"
                                lineClamp={2}
                                fontFamily="Poppins"
                            >
                                {title.trim() || 'Your broadcast headline'}
                            </Text>
                            <Text fontSize="11.5px" color="gray.600" mt={1} lineClamp={3} whiteSpace="pre-wrap">
                                {message.trim() || 'The message your users will read appears right here as you type.'}
                            </Text>
                            <Box
                                mt={2.5}
                                display="inline-block"
                                bg="#FFF5F6"
                                color="#E61E45"
                                fontSize="9px"
                                fontWeight="bold"
                                letterSpacing="0.6px"
                                textTransform="uppercase"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                            >
                                {typeLabel}
                            </Box>
                        </Box>
                    </HStack>
                </Box>

                {/* Destination channels */}
                <Box mt={4} position="relative">
                    <Text fontSize="9.5px" color="whiteAlpha.500" mb={2} letterSpacing="0.6px" textTransform="uppercase">
                        Delivers to
                    </Text>
                    {activeChannels.length === 0 ? (
                        <Text fontSize="11px" color="#FF8FA0">
                            Select at least one channel
                        </Text>
                    ) : (
                        <HStack gap={2} flexWrap="wrap">
                            {activeChannels.map((c) => (
                                <HStack
                                    key={c.key}
                                    gap={1.5}
                                    bg="whiteAlpha.100"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    px={2.5}
                                    py={1}
                                    borderRadius="full"
                                >
                                    <Icon as={c.icon} boxSize={3} color="#FF8FA0" />
                                    <Text fontSize="10.5px" color="whiteAlpha.900" fontWeight="medium">
                                        {c.label}
                                    </Text>
                                </HStack>
                            ))}
                        </HStack>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

/* -------------------------------------------------------------------------- */
/*                              Compose broadcast                             */
/* -------------------------------------------------------------------------- */

const fieldLabel = (text: string) => (
    <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
        {text}
    </Text>
);

const ComposeBroadcast: React.FC = () => {
    const [title, setTitle] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [type, setType] = React.useState('announcement');
    const [targetRole, setTargetRole] = React.useState('');
    const [channels, setChannels] = React.useState<Record<ChannelKey, boolean>>({
        inApp: true,
        push: true,
        email: false,
    });
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const create = useCreateBroadcast();

    const hasChannel = channels.inApp || channels.push || channels.email;
    const canSubmit = title.trim().length > 0 && message.trim().length > 0 && hasChannel;

    const toggleChannel = (key: ChannelKey) =>
        setChannels((prev) => ({ ...prev, [key]: !prev[key] }));

    const audienceLabel = labelForRole(targetRole);
    const typeLabel = labelForType(type);

    const reset = () => {
        setTitle('');
        setMessage('');
        setType('announcement');
        setTargetRole('');
        setChannels({ inApp: true, push: true, email: false });
    };

    const confirmAndSend = () => {
        create.mutate(
            {
                title: title.trim(),
                message: message.trim(),
                type,
                targetRole: targetRole || null,
                sendInApp: channels.inApp,
                sendPush: channels.push,
                sendEmail: channels.email,
            },
            {
                onSuccess: () => {
                    setConfirmOpen(false);
                    reset();
                },
            },
        );
    };

    const selectedChannelLabels = CHANNELS.filter((c) => channels[c.key]).map((c) => c.label);

    return (
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflow="hidden">
            {/* Header band */}
            <Flex
                align="center"
                justify="space-between"
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="gray.100"
                bg="linear-gradient(to right, #FFF7F8, white)"
            >
                <HStack gap={3}>
                    <Flex
                        boxSize="38px"
                        borderRadius="11px"
                        align="center"
                        justify="center"
                        bgGradient="linear(135deg, #FF2D55, #FF6B81)"
                        color="white"
                    >
                        <Icon as={FiSend} boxSize={4} />
                    </Flex>
                    <Box>
                        <Text fontSize="15px" fontWeight="bold" color="gray.900" fontFamily="Poppins">
                            Compose broadcast
                        </Text>
                        <Text fontSize="11.5px" color="gray.500">
                            Reach the whole platform or a single audience across your chosen channels
                        </Text>
                    </Box>
                </HStack>
            </Flex>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} p={5}>
                {/* Left — form */}
                <VStack align="stretch" gap={4}>
                    <Box>
                        <Flex justify="space-between" align="baseline">
                            {fieldLabel('Title')}
                            <Text fontSize="10px" color={title.length > TITLE_MAX ? 'primary.500' : 'gray.400'}>
                                {title.length}/{TITLE_MAX}
                            </Text>
                        </Flex>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                            placeholder="Short, clear headline"
                            size="md"
                            fontSize="sm"
                            borderColor="gray.200"
                            borderRadius="lg"
                            _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px #FF2D55' }}
                        />
                    </Box>

                    <Box>
                        <Flex justify="space-between" align="baseline">
                            {fieldLabel('Message')}
                            <Text fontSize="10px" color={message.length > MESSAGE_MAX ? 'primary.500' : 'gray.400'}>
                                {message.length}/{MESSAGE_MAX}
                            </Text>
                        </Flex>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                            placeholder="What do you want to tell users?"
                            rows={5}
                            fontSize="sm"
                            resize="none"
                            borderColor="gray.200"
                            borderRadius="lg"
                            _focus={{ borderColor: 'primary.500', boxShadow: '0 0 0 1px #FF2D55' }}
                        />
                    </Box>

                    <SimpleGrid columns={2} gap={3}>
                        <Box>
                            {fieldLabel('Type')}
                            <Select
                                options={TYPE_OPTIONS}
                                value={type}
                                onChange={setType}
                                width="100%"
                                borderColor="gray.200"
                                borderRadius="10px"
                            />
                        </Box>
                        <Box>
                            {fieldLabel('Audience')}
                            <Select
                                options={TARGET_OPTIONS}
                                value={targetRole}
                                onChange={setTargetRole}
                                width="100%"
                                borderColor="gray.200"
                                borderRadius="10px"
                            />
                        </Box>
                    </SimpleGrid>

                    <Box>
                        {fieldLabel('Delivery channels')}
                        <HStack gap={2.5} flexWrap="wrap" align="stretch">
                            {CHANNELS.map((def) => (
                                <ChannelToggle
                                    key={def.key}
                                    def={def}
                                    active={channels[def.key]}
                                    onToggle={() => toggleChannel(def.key)}
                                />
                            ))}
                        </HStack>
                        {channels.email && (
                            <HStack gap={1.5} mt={2} color="#B23149">
                                <Icon as={FiMail} boxSize={3} />
                                <Text fontSize="10.5px">
                                    Email sends a real message to every targeted user — use with care.
                                </Text>
                            </HStack>
                        )}
                    </Box>

                    <Flex
                        align="center"
                        justify="space-between"
                        flexWrap="wrap"
                        gap={3}
                        pt={1}
                    >
                        <HStack gap={2} color="gray.500">
                            <Icon as={FiUsers} boxSize={3.5} />
                            <Text fontSize="11.5px">
                                Audience:{' '}
                                <Text as="span" fontWeight="semibold" color="gray.700">
                                    {audienceLabel}
                                </Text>
                            </Text>
                        </HStack>
                        <Button
                            size="md"
                            fontSize="sm"
                            bg="primary.500"
                            color="white"
                            borderRadius="11px"
                            px={6}
                            disabled={!canSubmit}
                            onClick={() => setConfirmOpen(true)}
                            _hover={{ bg: '#E61E45' }}
                            _disabled={{ opacity: 0.45, cursor: 'not-allowed' }}
                        >
                            <Icon as={FiSend} boxSize={3.5} mr={2} />
                            Send broadcast
                        </Button>
                    </Flex>
                </VStack>

                {/* Right — preview */}
                <BroadcastPreview
                    title={title}
                    message={message}
                    typeLabel={typeLabel}
                    audienceLabel={audienceLabel}
                    channels={channels}
                />
            </SimpleGrid>

            <ConfirmActionModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmAndSend}
                title="Send this broadcast?"
                message={`“${title.trim()}” will be delivered to ${audienceLabel.toLowerCase()} via ${selectedChannelLabels.join(', ')}.${
                    channels.email ? ' This sends a real email to every targeted user.' : ''
                }`}
                requireReason={false}
                tone="primary"
                confirmText="Send broadcast"
                isLoading={create.isPending}
            />
        </Box>
    );
};

/* -------------------------------------------------------------------------- */
/*                              History channels                              */
/* -------------------------------------------------------------------------- */

const ChannelPills: React.FC<{ channels: string[] }> = ({ channels }) => {
    if (!channels || channels.length === 0) {
        return (
            <Text fontSize="11px" color="gray.400">
                —
            </Text>
        );
    }
    return (
        <HStack gap={1.5} flexWrap="wrap">
            {CHANNELS.filter((c) => channels.includes(c.serverName)).map((c) => (
                <HStack
                    key={c.key}
                    gap={1}
                    bg={c.bg}
                    color={c.fg}
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    border="1px solid"
                    borderColor={c.border}
                >
                    <Icon as={c.icon} boxSize={2.5} />
                    <Text fontSize="9.5px" fontWeight="semibold">
                        {c.label}
                    </Text>
                </HStack>
            ))}
        </HStack>
    );
};

/* -------------------------------------------------------------------------- */
/*                                   Page                                      */
/* -------------------------------------------------------------------------- */

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
                <Box maxW="340px">
                    <Text fontWeight="semibold" color="gray.900">
                        {b.title}
                    </Text>
                    <Text fontSize="11px" color="gray.500" lineClamp={1}>
                        {b.message}
                    </Text>
                </Box>
            ),
        },
        {
            key: 'channels',
            header: 'Channels',
            render: (b) => <ChannelPills channels={b.channels} />,
        },
        {
            key: 'target',
            header: 'Audience',
            render: (b) => (
                <Text textTransform="capitalize">
                    {b.targetRole ? b.targetRole.replace(/_/g, ' ') : 'All users'}
                </Text>
            ),
        },
        {
            key: 'recipients',
            header: 'Recipients',
            align: 'right',
            render: (b) => (
                <Box>
                    <Text fontWeight="semibold" color="gray.900">
                        {formatCount(b.recipientCount)}
                    </Text>
                    {b.emailRecipientCount > 0 && (
                        <Text fontSize="10px" color="#B23149">
                            {formatCount(b.emailRecipientCount)} emailed
                        </Text>
                    )}
                </Box>
            ),
        },
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

            <Box>
                <Text fontSize="13px" fontWeight="semibold" color="gray.900" mb={3} fontFamily="Poppins">
                    Broadcast history
                </Text>
                {broadcasts.error ? (
                    <AdminError
                        error={broadcasts.error}
                        message={getApiErrorMessage(broadcasts.error, 'Could not load broadcasts.')}
                    />
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
            </Box>
        </AdminPageLayout>
    );
};

export default NotificationsConsolePage;
