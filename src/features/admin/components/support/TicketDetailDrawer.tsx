import React from 'react';
import {
    Box,
    Button,
    Drawer,
    HStack,
    Portal,
    Spinner,
    Stack,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { Select } from '@shared/components';
import { StatusBadge } from '../StatusBadge';
import { ticketPriorityStyle, ticketStatusStyle } from '../../lib/statusColor';
import { adminDateTime } from '../../lib/format';
import { roleLabel } from '../../lib/statusColor';
import { useReplyToTicket, useTicket, useUpdateTicketStatus } from '../../hooks/useSupport';
import type { TicketMessageDto, TicketStatus } from '../../types';

interface TicketDetailDrawerProps {
    ticketId: string | null;
    onClose: () => void;
}

const STATUS_OPTIONS = [
    { value: 'Open', label: 'Open' },
    { value: 'InProgress', label: 'In progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' },
];

const MessageBubble: React.FC<{ message: TicketMessageDto }> = ({ message }) => {
    const isStaff = message.authorRole === 'admin';
    return (
        <Box
            alignSelf={isStaff ? 'flex-end' : 'flex-start'}
            maxW="85%"
            bg={isStaff ? 'primary.50' : 'gray.50'}
            border="1px solid"
            borderColor={isStaff ? 'primary.100' : 'gray.100'}
            borderRadius="12px"
            px={3}
            py={2}
        >
            <HStack justify="space-between" gap={3} mb={1}>
                <Text fontSize="10px" fontWeight="semibold" color="gray.800">
                    {message.authorName}
                    <Text as="span" color="gray.400" fontWeight="normal">
                        {' · '}
                        {roleLabel(message.authorRole)}
                    </Text>
                </Text>
                <Text fontSize="9px" color="gray.400" flexShrink={0}>
                    {adminDateTime(message.createdAt)}
                </Text>
            </HStack>
            <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap">
                {message.body}
            </Text>
        </Box>
    );
};

/** Side drawer showing a support ticket thread with reply + status controls. */
export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
    ticketId,
    onClose,
}) => {
    const open = ticketId !== null;
    const { data, isLoading } = useTicket(ticketId);
    const reply = useReplyToTicket();
    const updateStatus = useUpdateTicketStatus();

    const [draft, setDraft] = React.useState('');

    React.useEffect(() => {
        if (open) setDraft('');
    }, [open, ticketId]);

    const handleSend = () => {
        const message = draft.trim();
        if (!message || !ticketId) return;
        reply.mutate({ id: ticketId, message }, { onSuccess: () => setDraft('') });
    };

    return (
        <Drawer.Root
            open={open}
            onOpenChange={(d) => !d.open && onClose()}
            placement="end"
            size="md"
        >
            <Portal>
                <Drawer.Backdrop bg="blackAlpha.500" />
                <Drawer.Positioner>
                    <Drawer.Content bg="white">
                        <Drawer.Header
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            px={5}
                            py={4}
                        >
                            <HStack justify="space-between" align="center" w="100%">
                                <Drawer.Title
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="gray.900"
                                    fontFamily="Poppins"
                                    lineClamp={1}
                                >
                                    {data?.subject ?? 'Support ticket'}
                                </Drawer.Title>
                                <Box
                                    as="button"
                                    onClick={onClose}
                                    color="gray.400"
                                    _hover={{ color: 'gray.700' }}
                                    aria-label="Close drawer"
                                >
                                    <FiX />
                                </Box>
                            </HStack>
                        </Drawer.Header>

                        <Drawer.Body px={5} py={4}>
                            {isLoading || !data ? (
                                <HStack py={10} justify="center">
                                    <Spinner size="sm" color="primary.500" />
                                </HStack>
                            ) : (
                                <Stack gap={4}>
                                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                                {data.requesterName}
                                            </Text>
                                            <Text fontSize="10px" color="gray.500">
                                                Opened {adminDateTime(data.createdAt)}
                                            </Text>
                                        </VStack>
                                        <HStack gap={2}>
                                            <StatusBadge
                                                style={ticketPriorityStyle(data.priority)}
                                            />
                                            <StatusBadge
                                                style={ticketStatusStyle(data.status)}
                                            />
                                        </HStack>
                                    </HStack>

                                    <Box>
                                        <Text
                                            fontSize="10px"
                                            fontWeight="semibold"
                                            color="gray.500"
                                            textTransform="uppercase"
                                            mb={1.5}
                                        >
                                            Status
                                        </Text>
                                        <Select
                                            options={STATUS_OPTIONS}
                                            value={data.status}
                                            onChange={(v) =>
                                                updateStatus.mutate({
                                                    id: data.id,
                                                    status: v as TicketStatus,
                                                })
                                            }
                                            width="180px"
                                            borderColor="gray.200"
                                            borderRadius="10px"
                                            disabled={updateStatus.isPending}
                                        />
                                    </Box>

                                    <VStack align="stretch" gap={2.5}>
                                        {data.messages.length === 0 ? (
                                            <Text fontSize="xs" color="gray.500">
                                                No messages on this ticket yet.
                                            </Text>
                                        ) : (
                                            data.messages.map((m) => (
                                                <MessageBubble key={m.id} message={m} />
                                            ))
                                        )}
                                    </VStack>
                                </Stack>
                            )}
                        </Drawer.Body>

                        <Drawer.Footer
                            borderTop="1px solid"
                            borderColor="gray.100"
                            px={5}
                            py={3}
                        >
                            <VStack align="stretch" gap={2} w="100%">
                                <Textarea
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Write a reply to the requester…"
                                    rows={3}
                                    fontSize="xs"
                                    resize="none"
                                    _focus={{
                                        borderColor: 'primary.500',
                                        boxShadow: '0 0 0 1px #f94444',
                                    }}
                                />
                                <Button
                                    alignSelf="flex-end"
                                    size="sm"
                                    bg="primary.500"
                                    color="white"
                                    fontSize="xs"
                                    fontWeight="medium"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                    onClick={handleSend}
                                    disabled={!draft.trim() || reply.isPending}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {reply.isPending ? 'Sending…' : 'Send reply'}
                                </Button>
                            </VStack>
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};
