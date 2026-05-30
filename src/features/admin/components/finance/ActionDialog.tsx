import React from 'react';
import { Box, Button, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { ManagementDialog } from '../management/ManagementDialog';

export interface OptionalField {
    key: string;
    label: string;
    placeholder?: string;
}

interface ActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    confirmLabel: string;
    /** When set, a required reason textarea with this label is shown. */
    reasonLabel?: string;
    /** Extra optional single-line inputs (e.g. payment reference). */
    optionalFields?: OptionalField[];
    onConfirm: (payload: { reason: string; fields: Record<string, string> }) => void;
    isLoading?: boolean;
    danger?: boolean;
}

const ACCENT = '#f94444';

/**
 * Generic confirm dialog for finance actions. Optionally collects a required
 * reason and a few optional fields, then hands them back on confirm.
 */
export function ActionDialog({
    isOpen,
    onClose,
    title,
    description,
    confirmLabel,
    reasonLabel,
    optionalFields = [],
    onConfirm,
    isLoading,
    danger,
}: ActionDialogProps) {
    const [reason, setReason] = React.useState('');
    const [fields, setFields] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        if (isOpen) {
            setReason('');
            setFields({});
        }
    }, [isOpen]);

    const reasonRequired = Boolean(reasonLabel);
    const canConfirm = !reasonRequired || reason.trim().length > 0;

    return (
        <ManagementDialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={description}
            footer={
                <HStack justify="flex-end" gap={2} w="100%">
                    <Button variant="outline" borderColor="gray.200" borderRadius="lg" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        borderRadius="lg"
                        bg={danger ? ACCENT : 'gray.900'}
                        color="white"
                        _hover={{ opacity: 0.9 }}
                        loading={isLoading}
                        disabled={!canConfirm}
                        onClick={() => onConfirm({ reason: reason.trim(), fields })}
                    >
                        {confirmLabel}
                    </Button>
                </HStack>
            }
        >
            <VStack align="stretch" gap={3}>
                {optionalFields.map((f) => (
                    <Box key={f.key}>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                            {f.label}
                        </Text>
                        <Input
                            value={fields[f.key] ?? ''}
                            onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            size="sm"
                            fontSize="xs"
                            borderColor="gray.200"
                            borderRadius="lg"
                        />
                    </Box>
                ))}
                {reasonLabel && (
                    <Box>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                            {reasonLabel}
                        </Text>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Required — recorded in the audit log"
                            rows={3}
                            fontSize="xs"
                            borderColor="gray.200"
                            borderRadius="lg"
                        />
                    </Box>
                )}
            </VStack>
        </ManagementDialog>
    );
}
