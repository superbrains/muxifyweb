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
    SimpleGrid,
    Spinner,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import { CURATION_ACTIONS, type CurationAction } from '../../types/discovery';

/** The captured promote/demote intent — pages map this onto the upsert/batch request. */
export interface CurationOverrideDraft {
    action: CurationAction;
    weight: number | null;
    pinnedRank: number | null;
    startDate: string | null; // ISO-8601 or null
    endDate: string | null; // ISO-8601 or null
    reason: string;
}

const ACTION_META: Record<
    CurationAction,
    { accent: string; hover: string; blurb: string }
> = {
    Pin: {
        accent: '#3B82F6',
        hover: '#2563EB',
        blurb: 'Lock to a fixed rank slot regardless of organic score.',
    },
    Boost: {
        accent: '#16A34A',
        hover: '#15803D',
        blurb: 'Add weight so it ranks above its organic position.',
    },
    Suppress: {
        accent: '#D97706',
        hover: '#B45309',
        blurb: 'Push it down the ranking without removing it.',
    },
    Exclude: {
        accent: '#E53E3E',
        hover: '#C53030',
        blurb: 'Remove it from this surface entirely.',
    },
};

interface CurationOverrideModalProps {
    open: boolean;
    onClose: () => void;
    /** The action being applied. In edit mode the user may change it (see `actionEditable`). */
    action: CurationAction;
    /** Allow switching the action inside the modal (used by the overrides editor). */
    actionEditable?: boolean;
    title?: string;
    /** Extra context line, e.g. the content title or "12 selected items". */
    contextLabel?: string;
    initial?: Partial<CurationOverrideDraft>;
    confirmText?: string;
    loading?: boolean;
    onConfirm: (draft: CurationOverrideDraft) => void;
}

/**
 * Rich promote/demote capture — extends the reason-only flow with the controls
 * the backend already accepts: pinned rank (Pin), weight (Boost/Suppress) and an
 * optional schedule window. Used for single-row curation, batch curation and
 * editing an existing override. Presentation + local state only; the caller maps
 * the returned {@link CurationOverrideDraft} onto its mutation.
 */
export const CurationOverrideModal: React.FC<CurationOverrideModalProps> = ({
    open,
    onClose,
    action: initialAction,
    actionEditable = false,
    title,
    contextLabel,
    initial,
    confirmText,
    loading = false,
    onConfirm,
}) => {
    const [action, setAction] = React.useState<CurationAction>(initialAction);
    const [weight, setWeight] = React.useState('');
    const [pinnedRank, setPinnedRank] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [reason, setReason] = React.useState('');

    // Reset the form whenever the modal (re)opens or the seed action changes.
    React.useEffect(() => {
        if (!open) return;
        setAction(initial?.action ?? initialAction);
        setWeight(initial?.weight != null ? String(initial.weight) : '');
        setPinnedRank(initial?.pinnedRank != null ? String(initial.pinnedRank) : '');
        setStartDate(toLocalInput(initial?.startDate ?? undefined));
        setEndDate(toLocalInput(initial?.endDate ?? undefined));
        setReason(initial?.reason ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialAction]);

    const meta = ACTION_META[action];
    const trimmed = reason.trim();
    const reasonTooShort = trimmed.length < 10;
    const scheduleInvalid =
        !!startDate && !!endDate && new Date(endDate).getTime() <= new Date(startDate).getTime();
    const invalid = reasonTooShort || scheduleInvalid || loading;

    const submit = () => {
        if (invalid) return;
        onConfirm({
            action,
            weight: action === 'Boost' || action === 'Suppress' ? toNum(weight) : null,
            pinnedRank: action === 'Pin' ? toNum(pinnedRank) : null,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
            reason: trimmed,
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} placement="center">
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.500" />
                <Dialog.Positioner>
                    <Dialog.Content maxW="480px" p={6} borderRadius="20px" position="relative">
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

                        <VStack align="stretch" gap={4}>
                            <Box pr={6}>
                                <Text
                                    fontSize="md"
                                    fontWeight="semibold"
                                    color="gray.900"
                                    fontFamily="Poppins"
                                >
                                    {title ?? `${action} content`}
                                </Text>
                                {contextLabel && (
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        {contextLabel}
                                    </Text>
                                )}
                                <Text fontSize="11px" color="gray.500" mt={1}>
                                    {meta.blurb} Recorded in the audit log.
                                </Text>
                            </Box>

                            {actionEditable && (
                                <Field label="Action">
                                    <NativeSelect
                                        value={action}
                                        onChange={(v) => setAction(v as CurationAction)}
                                        options={CURATION_ACTIONS}
                                    />
                                </Field>
                            )}

                            {action === 'Pin' && (
                                <Field label="Pinned rank (1 = top)">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={pinnedRank}
                                        onChange={(e) => setPinnedRank(e.target.value)}
                                        size="sm"
                                        placeholder="e.g. 1"
                                    />
                                </Field>
                            )}

                            {(action === 'Boost' || action === 'Suppress') && (
                                <Field label="Weight (higher = stronger effect)">
                                    <Input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        size="sm"
                                        placeholder="e.g. 50"
                                    />
                                </Field>
                            )}

                            <SimpleGrid columns={2} gap={3}>
                                <Field label="Start (optional)">
                                    <Input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        size="sm"
                                    />
                                </Field>
                                <Field label="End (optional)">
                                    <Input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        size="sm"
                                    />
                                </Field>
                            </SimpleGrid>
                            {scheduleInvalid && (
                                <Text fontSize="10px" color="#E53E3E" mt={-2}>
                                    End must be after the start.
                                </Text>
                            )}

                            <Field label="Reason">
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    fontSize="xs"
                                    resize="none"
                                    placeholder="Explain why — recorded in the audit log."
                                    _focus={{
                                        borderColor: meta.accent,
                                        boxShadow: `0 0 0 1px ${meta.accent}`,
                                    }}
                                />
                                {reasonTooShort && trimmed.length > 0 && (
                                    <Text fontSize="10px" color="primary.500" mt={1}>
                                        Please add a little more detail (10+ characters).
                                    </Text>
                                )}
                            </Field>

                            <HStack gap={3} justify="flex-end" pt={1}>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    borderColor="gray.300"
                                    color="gray.700"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submit}
                                    bg={meta.accent}
                                    color="white"
                                    size="sm"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    disabled={invalid}
                                    _hover={{ bg: meta.hover }}
                                    _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                    {loading ? (
                                        <Spinner size="xs" color="white" />
                                    ) : (
                                        confirmText ?? `${action}`
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

/* ------------------------------- small pieces ------------------------------ */

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
            {label}
        </Text>
        {children}
    </Box>
);

const NativeSelect: React.FC<{
    value: string;
    onChange: (v: string) => void;
    options: readonly string[];
}> = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: 'white',
            width: '100%',
        }}
    >
        {options.map((o) => (
            <option key={o} value={o}>
                {o}
            </option>
        ))}
    </select>
);

const toNum = (v: string): number | null => {
    const n = Number(v);
    return v.trim() === '' || Number.isNaN(n) ? null : n;
};

/** ISO → value for <input type="datetime-local"> (local time, minute precision). */
function toLocalInput(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
