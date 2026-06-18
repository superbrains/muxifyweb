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
import { FiUploadCloud, FiX, FiPaperclip } from 'react-icons/fi';
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from '@/components/ui/select';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { useRaiseDispute } from '../hooks/useDisputes';
import { CatalogPicker } from './CatalogPicker';
import type { CatalogItem, DisputeRoleConfig, DisputeSubjectOption } from '../config/roleConfig';
import {
    ACCEPTED_EVIDENCE_ACCEPT,
    ACCEPTED_EVIDENCE_TYPES,
    MAX_EVIDENCE_BYTES,
    MAX_EVIDENCE_FILES,
    formatFileSize,
} from '../lib/disputeFamily';

interface RaiseDisputeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    config: DisputeRoleConfig;
    onSubmitted?: (id: string) => void;
}

const SectionLabel: React.FC<{ step: number; children: React.ReactNode }> = ({ step, children }) => (
    <HStack gap={2} mb={1.5}>
        <Box
            boxSize="18px"
            borderRadius="full"
            bg="primary.500"
            color="white"
            fontSize="10px"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
        >
            {step}
        </Box>
        <Text fontSize="xs" fontWeight="semibold" color="gray.700">
            {children}
        </Text>
    </HStack>
);

/**
 * The shared "Raise a dispute" dialog for every non-fan role. Branches on the
 * selected subject's family: copyright subjects pin the case to a catalogue item
 * (track/video/ad), payment subjects collect an optional amount. Evidence files
 * are uploaded to the created case when the role's endpoint supports attachments.
 */
export const RaiseDisputeDialog: React.FC<RaiseDisputeDialogProps> = ({
    isOpen,
    onClose,
    config,
    onSubmitted,
}) => {
    const toast = useChakraToast();
    const raise = useRaiseDispute(config.endpointBase);

    const [subjectType, setSubjectType] = React.useState<string>(config.subjects[0]?.value ?? 'Other');
    const [picked, setPicked] = React.useState<CatalogItem | null>(null);
    const [description, setDescription] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [files, setFiles] = React.useState<File[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Re-seed the form each time the dialog opens.
    React.useEffect(() => {
        if (isOpen) {
            setSubjectType(config.subjects[0]?.value ?? 'Other');
            setPicked(null);
            setDescription('');
            setAmount('');
            setFiles([]);
        }
    }, [isOpen, config]);

    const subject: DisputeSubjectOption | undefined = config.subjects.find((s) => s.value === subjectType);
    const isCopyright = subject?.family === 'copyright';

    const subjectCollection = React.useMemo(
        () => createListCollection({ items: config.subjects.map((s) => ({ value: s.value, label: s.label })) }),
        [config.subjects],
    );

    const trimmed = description.trim();
    const copyrightReady = !isCopyright || !!picked;
    const canSubmit = trimmed.length >= 10 && copyrightReady && !raise.isPending;

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const next = [...files];
        for (const f of Array.from(incoming)) {
            if (next.length >= MAX_EVIDENCE_FILES) {
                toast.error('Too many files', `You can attach up to ${MAX_EVIDENCE_FILES} files.`);
                break;
            }
            if (!ACCEPTED_EVIDENCE_TYPES.includes(f.type)) {
                toast.error('Unsupported file', `${f.name} isn't a supported evidence type.`);
                continue;
            }
            if (f.size > MAX_EVIDENCE_BYTES) {
                toast.error('File too large', `${f.name} is over ${MAX_EVIDENCE_BYTES / (1024 * 1024)} MB.`);
                continue;
            }
            if (!next.some((e) => e.name === f.name && e.size === f.size)) next.push(f);
        }
        setFiles(next);
    };

    const handleSubmit = async () => {
        if (trimmed.length < 10) {
            toast.error('Add a few details', 'Please describe the issue in at least 10 characters.');
            return;
        }
        if (isCopyright && !picked) {
            toast.error('Pick an item', 'Choose the track, video or campaign this dispute is about.');
            return;
        }

        const parsedAmount = parseFloat(amount);
        const amountMinor =
            !isCopyright && Number.isFinite(parsedAmount) && parsedAmount > 0
                ? Math.round(parsedAmount * 100)
                : undefined;

        try {
            const dispute = await raise.mutateAsync({
                payload: {
                    subjectType,
                    subjectId: isCopyright ? picked?.id : undefined,
                    description: trimmed,
                    amountMinor,
                },
                files: config.supportsAttachments ? files : undefined,
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
                <Dialog.Content maxW="460px" maxH="88vh" overflowY="auto" p={6} position="relative" borderRadius="20px">
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

                    <VStack gap={5} w="full" mt={4} align="stretch">
                        {/* 1 — category */}
                        <Box>
                            <SectionLabel step={1}>What is this about?</SectionLabel>
                            <SelectRoot
                                collection={subjectCollection}
                                value={[subjectType]}
                                onValueChange={(e) => {
                                    setSubjectType(e.value[0] ?? config.subjects[0]?.value);
                                    setPicked(null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValueText placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {config.subjects.map((opt) => (
                                        <SelectItem key={opt.value} item={{ value: opt.value, label: opt.label }}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </Box>

                        {/* 2 — catalog (copyright) or amount (payment) */}
                        {isCopyright && subject?.loadCatalog ? (
                            <Box>
                                <SectionLabel step={2}>Which item?</SectionLabel>
                                <CatalogPicker
                                    cacheKey={`${config.role}:${subject.value}`}
                                    load={subject.loadCatalog}
                                    placeholder={subject.catalogPlaceholder}
                                    selectedId={picked?.id ?? null}
                                    onSelect={setPicked}
                                />
                                {picked && (
                                    <Text fontSize="11px" color="gray.500" mt={1.5}>
                                        Disputing:{' '}
                                        <Text as="span" color="gray.800" fontWeight="medium">
                                            {picked.title}
                                        </Text>
                                    </Text>
                                )}
                            </Box>
                        ) : (
                            <Box>
                                <SectionLabel step={2}>
                                    Disputed amount (NGN){' '}
                                    <Text as="span" color="gray.400" fontWeight="normal">
                                        — optional
                                    </Text>
                                </SectionLabel>
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
                        )}

                        {/* 3 — description */}
                        <Box>
                            <SectionLabel step={3}>Describe the issue</SectionLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={
                                    isCopyright
                                        ? 'e.g. This track uses my original recording without authorisation. I own the master rights.'
                                        : 'e.g. My payout of ₦20,000 on 12 June shows as paid but I haven’t received it.'
                                }
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

                        {/* 4 — evidence */}
                        {config.supportsAttachments && (
                            <Box>
                                <SectionLabel step={4}>
                                    Evidence{' '}
                                    <Text as="span" color="gray.400" fontWeight="normal">
                                        — optional
                                    </Text>
                                </SectionLabel>
                                <Box
                                    role="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        addFiles(e.dataTransfer.files);
                                    }}
                                    border="1.5px dashed"
                                    borderColor="gray.300"
                                    borderRadius="12px"
                                    py={5}
                                    px={4}
                                    textAlign="center"
                                    cursor="pointer"
                                    _hover={{ borderColor: 'primary.500', bg: 'primary.50' }}
                                    transition="all 0.15s"
                                >
                                    <Icon as={FiUploadCloud} boxSize={6} color="gray.400" mb={1} />
                                    <Text fontSize="xs" color="gray.600">
                                        Drag &amp; drop or <Text as="span" color="primary.500" fontWeight="medium">browse</Text>
                                    </Text>
                                    <Text fontSize="10px" color="gray.400" mt={0.5}>
                                        Images, PDF or Word · up to {MAX_EVIDENCE_FILES} files · {MAX_EVIDENCE_BYTES / (1024 * 1024)} MB each
                                    </Text>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept={ACCEPTED_EVIDENCE_ACCEPT}
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            addFiles(e.target.files);
                                            e.target.value = '';
                                        }}
                                    />
                                </Box>
                                {files.length > 0 && (
                                    <VStack align="stretch" gap={1.5} mt={2}>
                                        {files.map((f, i) => (
                                            <HStack
                                                key={`${f.name}-${i}`}
                                                justify="space-between"
                                                bg="gray.50"
                                                borderRadius="8px"
                                                px={2.5}
                                                py={1.5}
                                            >
                                                <HStack gap={2} minW={0}>
                                                    <Icon as={FiPaperclip} boxSize={3.5} color="gray.400" flexShrink={0} />
                                                    <Text fontSize="11px" color="gray.700" truncate>
                                                        {f.name}
                                                    </Text>
                                                    <Text fontSize="10px" color="gray.400" flexShrink={0}>
                                                        {formatFileSize(f.size)}
                                                    </Text>
                                                </HStack>
                                                <IconButton
                                                    aria-label="Remove file"
                                                    variant="ghost"
                                                    size="2xs"
                                                    color="gray.400"
                                                    _hover={{ color: 'red.500' }}
                                                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                                >
                                                    <Icon as={FiX} />
                                                </IconButton>
                                            </HStack>
                                        ))}
                                    </VStack>
                                )}
                            </Box>
                        )}

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
                                loadingText="Submitting…"
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
