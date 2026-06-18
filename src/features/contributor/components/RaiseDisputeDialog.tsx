import React from 'react';
import {
    Box,
    Button,
    Dialog,
    HStack,
    Icon,
    IconButton,
    Input,
    Text,
    Textarea,
    VStack,
    createListCollection,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from '@/components/ui/select';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { useRaiseContributorDispute } from '../hooks/useContributor';
import type { ContributorDisputeSubject } from '../services/contributorService';

const SUBJECT_OPTIONS: { value: ContributorDisputeSubject; label: string }[] = [
    { value: 'Withdrawal', label: 'A payout / withdrawal' },
    { value: 'Earning', label: 'An earning' },
    { value: 'Split', label: 'A royalty split' },
    { value: 'Other', label: 'Something else' },
];

const subjectLabel = (value: string): string =>
    SUBJECT_OPTIONS.find((o) => o.value === value)?.label ?? 'Something else';

interface RaiseDisputeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-select what the dispute is about (e.g. opened from a payout row). */
    defaultSubjectType?: ContributorDisputeSubject;
    /** Id of the specific record being disputed (withdrawal id, track id, …). */
    subjectId?: string | null;
    /** Human-readable context shown read-only (e.g. a track title or payout ref). */
    contextLabel?: string;
    /** When set, the "about" selector is locked to {@link defaultSubjectType}. */
    lockSubject?: boolean;
    /** Pre-fill a disputed amount (minor units / kobo). */
    defaultAmountMinor?: number | null;
    /** Fired after a successful submit (e.g. to open the detail drawer). */
    onSubmitted?: (id: string) => void;
}

/**
 * Shared "Raise a dispute" modal. Used from the Disputes page, a payout row, or a
 * split row — pre-filling the subject when launched in context. Opens a Tower 26
 * dispute case the Muxify team then works through.
 */
export const RaiseDisputeDialog: React.FC<RaiseDisputeDialogProps> = ({
    isOpen,
    onClose,
    defaultSubjectType = 'Earning',
    subjectId,
    contextLabel,
    lockSubject = false,
    defaultAmountMinor,
    onSubmitted,
}) => {
    const toast = useChakraToast();
    const raise = useRaiseContributorDispute();

    const [subjectType, setSubjectType] = React.useState<ContributorDisputeSubject>(defaultSubjectType);
    const [description, setDescription] = React.useState('');
    const [amount, setAmount] = React.useState(
        defaultAmountMinor ? (defaultAmountMinor / 100).toString() : '',
    );

    // Re-seed the form whenever the dialog is (re)opened in a new context.
    React.useEffect(() => {
        if (isOpen) {
            setSubjectType(defaultSubjectType);
            setDescription('');
            setAmount(defaultAmountMinor ? (defaultAmountMinor / 100).toString() : '');
        }
    }, [isOpen, defaultSubjectType, defaultAmountMinor]);

    const subjectCollection = React.useMemo(
        () => createListCollection({ items: SUBJECT_OPTIONS }),
        [],
    );

    const trimmed = description.trim();
    const canSubmit = trimmed.length >= 10 && !raise.isPending;

    const handleSubmit = async () => {
        if (trimmed.length < 10) {
            toast.error('Add a few details', 'Please describe the issue in at least 10 characters.');
            return;
        }
        const parsedAmount = parseFloat(amount);
        const amountMinor =
            Number.isFinite(parsedAmount) && parsedAmount > 0
                ? Math.round(parsedAmount * 100)
                : undefined;

        try {
            const dispute = await raise.mutateAsync({
                subjectType,
                subjectId: subjectId ?? undefined,
                description: trimmed,
                amountMinor,
            });
            toast.success(
                'Dispute submitted',
                `Reference ${dispute.reference}. Our team will review it shortly.`,
            );
            onClose();
            onSubmitted?.(dispute.id);
        } catch (err) {
            toast.error('Could not submit', getApiErrorMessage(err, 'Please try again.'));
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="440px" p={6} position="relative" borderRadius="20px">
                    <Dialog.Header p={0} mb={1}>
                        <VStack align="start" gap={0.5} w="full">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                                Raise a dispute
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Tell us what looks wrong and our team will investigate.
                            </Text>
                        </VStack>
                        <IconButton
                            aria-label="Close"
                            variant="ghost"
                            size="sm"
                            color="gray.400"
                            position="absolute"
                            right={4}
                            top={4}
                            _hover={{ color: 'gray.700' }}
                            onClick={onClose}
                        >
                            <Icon as={MdClose} />
                        </IconButton>
                    </Dialog.Header>

                    <VStack gap={4} w="full" mt={4} align="stretch">
                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                What is this about?
                            </Text>
                            {lockSubject ? (
                                <Box
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="10px"
                                    px={3}
                                    py={2.5}
                                    fontSize="sm"
                                    color="gray.800"
                                >
                                    {subjectLabel(subjectType)}
                                </Box>
                            ) : (
                                <SelectRoot
                                    collection={subjectCollection}
                                    value={[subjectType]}
                                    onValueChange={(e) =>
                                        setSubjectType((e.value[0] as ContributorDisputeSubject) || 'Earning')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValueText placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUBJECT_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} item={opt}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectRoot>
                            )}
                            {contextLabel && (
                                <Text fontSize="11px" color="gray.500" mt={1.5}>
                                    Regarding: <Text as="span" color="gray.700" fontWeight="medium">{contextLabel}</Text>
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Disputed amount (NGN) <Text as="span" color="gray.400">— optional</Text>
                            </Text>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                size="md"
                                bg="gray.50"
                                borderColor="gray.200"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>
                                Describe the issue
                            </Text>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. My payout of ₦20,000 on 12 June shows as paid but I haven't received it."
                                rows={4}
                                resize="none"
                                bg="gray.50"
                                borderColor="gray.200"
                                fontSize="sm"
                                _focus={{ borderColor: 'primary.500', boxShadow: 'none' }}
                            />
                            <Text fontSize="11px" color={trimmed.length >= 10 ? 'green.500' : 'gray.400'} mt={1}>
                                {trimmed.length}/10 characters minimum
                            </Text>
                        </Box>

                        <HStack gap={3} justify="flex-end" pt={1}>
                            <Button
                                variant="outline"
                                size="md"
                                fontSize="sm"
                                borderColor="gray.200"
                                color="gray.700"
                                borderRadius="10px"
                                _hover={{ bg: 'gray.50' }}
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                bg="primary.500"
                                color="white"
                                size="md"
                                fontSize="sm"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                                loading={raise.isPending}
                                loadingText="Submitting..."
                                disabled={!canSubmit}
                                onClick={handleSubmit}
                            >
                                Submit dispute
                            </Button>
                        </HStack>
                    </VStack>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
