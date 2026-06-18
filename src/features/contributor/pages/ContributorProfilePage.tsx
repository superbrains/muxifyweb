import React from 'react';
import {
    Box,
    Button,
    HStack,
    Icon,
    Input,
    Link,
    SimpleGrid,
    Skeleton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FiCheckCircle, FiClock, FiExternalLink, FiXCircle, FiShield } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { StatusBadge } from '@/features/admin/components/ui';
import {
    useContributorProfile,
    useSaveContributorProfile,
    contributorKeys,
} from '../hooks/useContributor';
import { ContributorPageShell } from '../components/ContributorPageShell';

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <Box>
        <Text fontSize="11px" color="gray.500" mb={0.5}>{label}</Text>
        <Text fontSize="sm" color="gray.900" fontWeight="medium">{value || '—'}</Text>
    </Box>
);

const ContributorProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useChakraToast();
    const qc = useQueryClient();
    const { data: profile, isLoading } = useContributorProfile();
    const save = useSaveContributorProfile();

    const [editing, setEditing] = React.useState(false);
    const [displayName, setDisplayName] = React.useState('');
    const [legalName, setLegalName] = React.useState('');
    const [country, setCountry] = React.useState('');

    const beginEdit = () => {
        setDisplayName(profile?.displayName ?? '');
        setLegalName(profile?.legalName ?? '');
        setCountry(profile?.country ?? '');
        setEditing(true);
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            toast.error('Display name required', 'Please enter a display / credit name.');
            return;
        }
        try {
            await save.mutateAsync({
                displayName: displayName.trim(),
                legalName: legalName.trim(),
                country: country.trim(),
            });
            await qc.invalidateQueries({ queryKey: contributorKeys.profile() });
            toast.success('Profile updated', 'Your details have been saved.');
            setEditing(false);
        } catch (err) {
            toast.error('Could not save', getApiErrorMessage(err, 'Please try again.'));
        }
    };

    const status = profile?.verificationStatus;

    const verification = (() => {
        switch (status) {
            case 'Verified':
                return {
                    icon: FiCheckCircle,
                    color: '#16A34A',
                    bg: '#E7FFF7',
                    title: 'Your account is verified',
                    body: 'You can request payouts to your linked bank accounts.',
                };
            case 'Pending':
                return {
                    icon: FiClock,
                    color: '#D97706',
                    bg: '#FFF9E6',
                    title: 'Verification under review',
                    body: 'We are reviewing your identity document. Payouts unlock once approved.',
                };
            case 'Rejected':
                return {
                    icon: FiXCircle,
                    color: '#E53E3E',
                    bg: '#FEF2F2',
                    title: 'Verification rejected',
                    body: profile?.verificationRejectionReason
                        ? `Reason: ${profile.verificationRejectionReason}`
                        : 'Please resubmit a valid identity document.',
                };
            default:
                return {
                    icon: FiShield,
                    color: '#64748B',
                    bg: '#F1F5F9',
                    title: 'Verify your identity',
                    body: 'Submit an identity document to unlock payouts.',
                };
        }
    })();

    return (
        <ContributorPageShell
            title="Profile"
            subtitle="Your identity, contact details and verification status."
        >
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={4}>
                {/* Identity */}
                <Box
                    gridColumn={{ lg: 'span 2' }}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="xl"
                    p={5}
                >
                    <HStack justify="space-between" mb={4}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            Identity & contact
                        </Text>
                        {!isLoading && !editing && (
                            <Button
                                size="xs"
                                variant="outline"
                                borderColor="gray.200"
                                color="gray.700"
                                fontSize="xs"
                                borderRadius="8px"
                                _hover={{ bg: 'gray.50' }}
                                onClick={beginEdit}
                            >
                                Edit
                            </Button>
                        )}
                    </HStack>

                    {isLoading ? (
                        <VStack align="stretch" gap={4}>
                            {[0, 1, 2].map((i) => (
                                <Skeleton key={i} height="40px" borderRadius="8px" />
                            ))}
                        </VStack>
                    ) : editing ? (
                        <VStack align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>Display name</Text>
                                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                                    size="md" bg="gray.50" borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>Legal name</Text>
                                <Input value={legalName} onChange={(e) => setLegalName(e.target.value)}
                                    placeholder="As it appears on your bank account"
                                    size="md" bg="gray.50" borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }} />
                            </Box>
                            <Box>
                                <Text fontSize="xs" fontWeight="medium" color="gray.700" mb={1}>Country</Text>
                                <Input value={country} onChange={(e) => setCountry(e.target.value)}
                                    size="md" bg="gray.50" borderColor="gray.200"
                                    _focus={{ borderColor: 'primary.500', boxShadow: 'none' }} />
                            </Box>
                            <HStack justify="flex-end" gap={3} pt={1}>
                                <Button size="sm" variant="outline" borderColor="gray.200" color="gray.700"
                                    fontSize="xs" borderRadius="10px" _hover={{ bg: 'gray.50' }}
                                    onClick={() => setEditing(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" bg="primary.500" color="white" fontSize="xs" borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }} loading={save.isPending} loadingText="Saving..."
                                    onClick={handleSave}>
                                    Save changes
                                </Button>
                            </HStack>
                        </VStack>
                    ) : (
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5}>
                            <Field label="Display name" value={profile?.displayName} />
                            <Field label="Legal name" value={profile?.legalName} />
                            <Field label="Country" value={profile?.country} />
                            <Field label="Email" value={profile?.email} />
                        </SimpleGrid>
                    )}
                </Box>

                {/* Verification */}
                <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={5}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900" mb={4}>
                        Verification
                    </Text>
                    {isLoading ? (
                        <Skeleton height="120px" borderRadius="12px" />
                    ) : (
                        <VStack align="stretch" gap={4}>
                            <HStack justify="space-between">
                                <Text fontSize="xs" color="gray.600">Status</Text>
                                <StatusBadge status={status} />
                            </HStack>
                            <VStack align="start" gap={2} bg={verification.bg} borderRadius="12px" p={4}>
                                <HStack gap={2}>
                                    <Icon as={verification.icon} color={verification.color} boxSize={4} />
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                        {verification.title}
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">{verification.body}</Text>
                            </VStack>

                            {profile?.identityDocumentUrl && (
                                <Link
                                    href={profile.identityDocumentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    fontSize="xs"
                                    color="primary.500"
                                    fontWeight="medium"
                                >
                                    <HStack gap={1}>
                                        <Text>View submitted document</Text>
                                        <Icon as={FiExternalLink} boxSize={3} />
                                    </HStack>
                                </Link>
                            )}

                            {status !== 'Verified' && (
                                <Button
                                    size="sm"
                                    bg="primary.500"
                                    color="white"
                                    fontSize="xs"
                                    borderRadius="10px"
                                    _hover={{ bg: 'primary.600' }}
                                    onClick={() => navigate('/contributor/identity-verification')}
                                >
                                    {status === 'Rejected' ? 'Resubmit document' : 'Verify identity'}
                                </Button>
                            )}
                        </VStack>
                    )}
                </Box>
            </SimpleGrid>
        </ContributorPageShell>
    );
};

export default ContributorProfilePage;
