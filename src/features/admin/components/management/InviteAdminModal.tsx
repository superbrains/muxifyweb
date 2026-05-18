import React from 'react';
import { Box, Button, Input, Spinner, Text, Textarea } from '@chakra-ui/react';
import { ManagementDialog } from './ManagementDialog';
import { useInviteAdmin, useRoles } from '../../hooks/useAdminManagement';

interface InviteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const selectStyles = {
    width: '100%',
    fontSize: '12px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid var(--chakra-colors-gray-200)',
    background: 'white',
    color: 'var(--chakra-colors-gray-800)',
} as const;

/** Invite a new staff admin by email — they set their own password from the link. */
export const InviteAdminModal: React.FC<InviteAdminModalProps> = ({ isOpen, onClose }) => {
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const invite = useInviteAdmin();

    const [email, setEmail] = React.useState('');
    const [roleId, setRoleId] = React.useState('');
    const [note, setNote] = React.useState('');

    React.useEffect(() => {
        if (!isOpen) return;
        setEmail('');
        setRoleId('');
        setNote('');
    }, [isOpen]);

    const assignableRoles = (roles ?? []).filter((r) => r.isActive);
    const emailValid = EMAIL_RE.test(email.trim());
    const canSend = emailValid && !!roleId && !invite.isPending;

    const handleSend = () => {
        if (!canSend) return;
        invite.mutate(
            { email: email.trim(), roleId, personalNote: note.trim() || undefined },
            { onSuccess: onClose },
        );
    };

    return (
        <ManagementDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Invite an admin"
            subtitle="They'll get an email to set their own password and activate their account."
            footer={
                <>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        size="sm"
                        fontSize="xs"
                        borderRadius="10px"
                        disabled={invite.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        bg="primary.500"
                        color="white"
                        size="sm"
                        fontSize="xs"
                        fontWeight="medium"
                        borderRadius="10px"
                        disabled={!canSend}
                        _hover={{ bg: 'primary.600' }}
                        _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        {invite.isPending ? <Spinner size="xs" /> : 'Send invitation'}
                    </Button>
                </>
            }
        >
            <Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                    Email address
                </Text>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    fontSize="xs"
                    autoFocus
                />
                {email.length > 0 && !emailValid && (
                    <Text fontSize="10px" color="primary.500" mt={1}>
                        Enter a valid email address.
                    </Text>
                )}
            </Box>

            <Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                    Role
                </Text>
                {rolesLoading ? (
                    <Spinner size="sm" color="primary.500" />
                ) : (
                    <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        style={selectStyles}
                    >
                        <option value="">Select a role…</option>
                        {assignableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                                {role.isSystemRole ? ' (full access)' : ''}
                            </option>
                        ))}
                    </select>
                )}
                <Text fontSize="10px" color="gray.500" mt={1}>
                    The role decides what this admin can see and do. You can change it later.
                </Text>
            </Box>

            <Box>
                <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                    Personal note{' '}
                    <Text as="span" color="gray.400" fontWeight="normal">
                        (optional)
                    </Text>
                </Text>
                <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a short message to the invitation email."
                    rows={2}
                    fontSize="xs"
                    resize="none"
                    maxLength={1000}
                />
            </Box>
        </ManagementDialog>
    );
};
