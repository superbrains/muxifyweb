import React, { useState } from 'react';
import { Box, Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import {
    FiAlertTriangle,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiX,
} from 'react-icons/fi';
import { useSubmitLabelVerification } from '../../hooks/useLabelSettings';
import type { LabelSettingsDto } from '../../types';
import { UploadIdentityDocDialog } from './UploadIdentityDocDialog';

interface VerificationSettingsProps {
    settings: LabelSettingsDto;
}

const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
};

const isProfileComplete = (s: LabelSettingsDto): boolean =>
    !!s.legalName?.trim() &&
    !!s.natureOfBusiness?.trim() &&
    !!s.address?.street?.trim() &&
    !!s.address?.city?.trim() &&
    !!s.address?.state?.trim() &&
    !!s.address?.country?.trim();

export const VerificationSettings: React.FC<VerificationSettingsProps> = ({
    settings,
}) => {
    const [open, setOpen] = useState(false);
    const submit = useSubmitLabelVerification();

    const handleUpload = async (file: File) => {
        await submit.mutateAsync(file);
    };

    const status = settings.verificationStatus;

    if (status === 'Verified') {
        return (
            <Box
                p={5}
                borderRadius="12px"
                bg="green.50"
                borderWidth="1px"
                borderColor="green.200"
            >
                <HStack gap={3} align="start">
                    <Box
                        bg="green.100"
                        borderRadius="full"
                        p={2}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Icon as={FiCheckCircle} color="green.600" boxSize="20px" />
                    </Box>
                    <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="green.800">
                            Label verified
                        </Text>
                        <Text fontSize="xs" color="green.700">
                            {settings.verificationReviewedAt
                                ? `Verified on ${formatDate(settings.verificationReviewedAt)}. You can now invite artists and trigger payouts.`
                                : 'You can now invite artists and trigger payouts.'}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        );
    }

    if (status === 'Pending') {
        return (
            <Box
                p={5}
                borderRadius="12px"
                bg="yellow.50"
                borderWidth="1px"
                borderColor="yellow.200"
            >
                <HStack gap={3} align="start">
                    <Box bg="yellow.100" borderRadius="full" p={2}>
                        <Icon as={FiClock} color="yellow.700" boxSize="20px" />
                    </Box>
                    <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="yellow.900">
                            Verification in review
                        </Text>
                        <Text fontSize="xs" color="yellow.800">
                            {settings.verificationSubmittedAt
                                ? `Submitted on ${formatDate(settings.verificationSubmittedAt)}. Typical turnaround is 2 business days.`
                                : 'Typical turnaround is 2 business days.'}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        );
    }

    const checklist = [
        { label: 'Company profile complete', done: isProfileComplete(settings) },
        {
            label: 'At least one director added',
            done: settings.directors.length >= 1,
        },
        {
            label: 'Primary contact has identity document on file',
            done: settings.directors.some(
                (d) => d.isPrimaryContact && !!d.identityDocumentUrl,
            ),
        },
    ];

    const canSubmit = checklist.every((c) => c.done);
    const isRejected = status === 'Rejected';

    return (
        <Box>
            {isRejected && (
                <Box
                    p={5}
                    borderRadius="12px"
                    bg="red.50"
                    borderWidth="1px"
                    borderColor="red.200"
                    mb={4}
                >
                    <HStack gap={3} align="start">
                        <Box bg="red.100" borderRadius="full" p={2}>
                            <Icon as={FiX} color="red.600" boxSize="20px" />
                        </Box>
                        <VStack align="start" gap={1}>
                            <Text fontSize="sm" fontWeight="semibold" color="red.800">
                                Verification was rejected
                            </Text>
                            <Text fontSize="xs" color="red.700">
                                {settings.verificationRejectionReason ||
                                    'Your previous submission could not be approved. Please review the requirements and resubmit a clearer document.'}
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            )}

            <Box
                p={5}
                borderRadius="12px"
                borderWidth="1px"
                borderColor="gray.200"
                bg="white"
            >
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={1}>
                    {isRejected ? 'Resubmit for verification' : 'Submit for verification'}
                </Text>
                <Text fontSize="xs" color="gray.500" mb={4}>
                    Verification unlocks payouts, artist invitations, and the public label
                    page badge. Upload a clear copy of your business registration
                    certificate (CAC or equivalent).
                </Text>

                <VStack align="stretch" gap={2} mb={4}>
                    {checklist.map((item) => (
                        <HStack key={item.label} gap={2}>
                            <Icon
                                as={item.done ? FiCheck : FiAlertTriangle}
                                color={item.done ? 'green.500' : 'orange.500'}
                                boxSize="14px"
                            />
                            <Text
                                fontSize="xs"
                                color={item.done ? 'gray.700' : 'gray.500'}
                            >
                                {item.label}
                            </Text>
                        </HStack>
                    ))}
                </VStack>

                <Button
                    size="sm"
                    fontSize="xs"
                    bg="primary.500"
                    color="white"
                    _hover={{ bg: 'primary.600' }}
                    onClick={() => setOpen(true)}
                    disabled={!canSubmit}
                >
                    {isRejected ? 'Re-upload document' : 'Upload verification document'}
                </Button>
                {!canSubmit && (
                    <Text fontSize="11px" color="gray.500" mt={2}>
                        Complete the checklist above before submitting.
                    </Text>
                )}
            </Box>

            <UploadIdentityDocDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                title={
                    isRejected ? 'Resubmit verification document' : 'Upload verification document'
                }
                subtitle="Business registration certificate (JPG, PNG, or PDF). Max 10 MB."
                onUpload={handleUpload}
                submitting={submit.isPending}
            />
        </Box>
    );
};
