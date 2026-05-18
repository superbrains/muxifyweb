import React from 'react';
import {
    Box,
    Button,
    Drawer,
    HStack,
    Portal,
    Separator,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import { ConfirmModal } from '@shared/components';
import { IdentityCell } from '../IdentityCell';
import { StatusBadge } from '../StatusBadge';
import { ReasonDialog } from '../ReasonDialog';
import { DocumentViewer } from './DocumentViewer';
import { verificationStatusStyle } from '../../lib/statusColor';
import { adminDateTime } from '../../lib/format';
import {
    useApproveVerification,
    useRejectVerification,
    useVerification,
} from '../../hooks/useVerifications';

interface VerificationReviewDrawerProps {
    verificationId: string | null;
    onClose: () => void;
}

const ProfileRow: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
}) => (
    <HStack justify="space-between" align="start" gap={4}>
        <Text
            fontSize="10px"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.4px"
            fontWeight="semibold"
            flexShrink={0}
        >
            {label}
        </Text>
        <Text fontSize="xs" color="gray.800" textAlign="right" wordBreak="break-word">
            {value || '—'}
        </Text>
    </HStack>
);

/**
 * Side drawer for reviewing a single verification request: applicant context,
 * submitted documents, and approve / reject actions. Reject requires a reason
 * which is persisted and surfaced to the applicant.
 */
export const VerificationReviewDrawer: React.FC<VerificationReviewDrawerProps> = ({
    verificationId,
    onClose,
}) => {
    const open = verificationId !== null;
    const { data, isLoading } = useVerification(verificationId);
    const approve = useApproveVerification();
    const reject = useRejectVerification();

    const [confirmApprove, setConfirmApprove] = React.useState(false);
    const [rejectOpen, setRejectOpen] = React.useState(false);

    const handleApprove = () => {
        if (!verificationId) return;
        approve.mutate(verificationId, { onSuccess: onClose });
    };

    const handleReject = (reason: string) => {
        if (!verificationId) return;
        reject.mutate(
            { id: verificationId, reason },
            {
                onSuccess: () => {
                    setRejectOpen(false);
                    onClose();
                },
            },
        );
    };

    const isPending = data?.status === 'Pending';

    return (
        <>
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
                                    >
                                        Review verification
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
                                        <HStack justify="space-between" align="start">
                                            <IdentityCell
                                                name={data.displayName}
                                                secondary={data.email}
                                                avatarUrl={data.avatarUrl}
                                                size="md"
                                            />
                                            <StatusBadge
                                                style={verificationStatusStyle(data.status)}
                                            />
                                        </HStack>

                                        <Box
                                            bg="gray.50"
                                            borderRadius="12px"
                                            border="1px solid"
                                            borderColor="gray.100"
                                            px={4}
                                            py={3}
                                        >
                                            <Stack gap={2}>
                                                <ProfileRow
                                                    label="Type"
                                                    value={
                                                        data.entityType === 'label'
                                                            ? 'Record Label'
                                                            : 'Artist'
                                                    }
                                                />
                                                <ProfileRow
                                                    label="Submitted"
                                                    value={adminDateTime(data.submittedAt)}
                                                />
                                                {data.reviewedAt && (
                                                    <ProfileRow
                                                        label="Reviewed"
                                                        value={adminDateTime(data.reviewedAt)}
                                                    />
                                                )}
                                            </Stack>
                                        </Box>

                                        {Object.keys(data.profile ?? {}).length > 0 && (
                                            <Box
                                                border="1px solid"
                                                borderColor="gray.100"
                                                borderRadius="12px"
                                                px={4}
                                                py={3}
                                            >
                                                <Text
                                                    fontSize="11px"
                                                    fontWeight="semibold"
                                                    color="gray.900"
                                                    mb={2}
                                                >
                                                    Profile details
                                                </Text>
                                                <Stack gap={2}>
                                                    {Object.entries(data.profile).map(
                                                        ([k, v]) => (
                                                            <ProfileRow
                                                                key={k}
                                                                label={k}
                                                                value={
                                                                    v === null ||
                                                                    v === undefined
                                                                        ? '—'
                                                                        : String(v)
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Stack>
                                            </Box>
                                        )}

                                        {data.rejectionReason && (
                                            <Box
                                                bg="#FEF2F2"
                                                color="#C53030"
                                                borderRadius="12px"
                                                border="1px solid"
                                                borderColor="#FECACA"
                                                px={3}
                                                py={2.5}
                                                fontSize="xs"
                                            >
                                                <Text fontWeight="semibold" mb={1}>
                                                    Rejection reason
                                                </Text>
                                                <Text>{data.rejectionReason}</Text>
                                            </Box>
                                        )}

                                        <Separator />

                                        <Box>
                                            <Text
                                                fontSize="11px"
                                                fontWeight="semibold"
                                                color="gray.900"
                                                mb={2}
                                            >
                                                Submitted documents
                                            </Text>
                                            <DocumentViewer documents={data.documents ?? []} />
                                        </Box>
                                    </Stack>
                                )}
                            </Drawer.Body>

                            <Drawer.Footer
                                borderTop="1px solid"
                                borderColor="gray.100"
                                px={5}
                                py={3}
                            >
                                {isPending ? (
                                    <HStack gap={2} w="100%">
                                        <Button
                                            flex={1}
                                            size="sm"
                                            variant="outline"
                                            borderColor="#FECACA"
                                            color="#C53030"
                                            fontSize="xs"
                                            borderRadius="10px"
                                            _hover={{ bg: '#FEF2F2' }}
                                            onClick={() => setRejectOpen(true)}
                                            disabled={approve.isPending || reject.isPending}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            flex={1}
                                            size="sm"
                                            bg="#16A34A"
                                            color="white"
                                            fontSize="xs"
                                            fontWeight="medium"
                                            borderRadius="10px"
                                            _hover={{ bg: '#15803D' }}
                                            onClick={() => setConfirmApprove(true)}
                                            disabled={approve.isPending || reject.isPending}
                                        >
                                            Approve
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        w="100%"
                                        onClick={onClose}
                                        size="sm"
                                        bg="primary.500"
                                        color="white"
                                        fontSize="xs"
                                        fontWeight="medium"
                                        borderRadius="10px"
                                        _hover={{ bg: 'primary.600' }}
                                    >
                                        Close
                                    </Button>
                                )}
                            </Drawer.Footer>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>

            <ConfirmModal
                isOpen={confirmApprove}
                onClose={() => setConfirmApprove(false)}
                onConfirm={handleApprove}
                title="Approve verification?"
                message="This marks the applicant as verified across Muxify. You can review the documents again before confirming."
                confirmText="Approve"
                confirmColor="blue"
                isLoading={approve.isPending}
            />

            <ReasonDialog
                isOpen={rejectOpen}
                onClose={() => setRejectOpen(false)}
                onConfirm={handleReject}
                title="Reject verification"
                message="The applicant will be notified and asked to resubmit."
                reasonLabel="Rejection reason"
                placeholder="e.g. The uploaded ID is blurry and the name does not match the profile."
                confirmText="Reject verification"
                confirmColor="red"
                isLoading={reject.isPending}
            />
        </>
    );
};
