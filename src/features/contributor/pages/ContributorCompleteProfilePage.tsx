import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Center, Input, Text, VStack } from '@chakra-ui/react';
import MuxifyLogoIcon from '@/shared/icons/CustomIcons';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { useUserStore } from '@app/store/useUserStore';
import { useSaveContributorProfile } from '../hooks/useContributor';

/**
 * Authed onboarding step where a freshly-claimed contributor sets their public
 * display name, legal name (for payouts) and country. On success we move to the
 * identity-verification step.
 */
const ContributorCompleteProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useChakraToast();
    const user = useUserStore((s) => s.user);
    const saveProfile = useSaveContributorProfile();

    const [displayName, setDisplayName] = React.useState(user?.name ?? '');
    const [legalName, setLegalName] = React.useState('');
    const [country, setCountry] = React.useState('');

    const canSubmit =
        displayName.trim().length >= 2 &&
        legalName.trim().length >= 2 &&
        country.trim().length >= 2 &&
        !saveProfile.isPending;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        try {
            await saveProfile.mutateAsync({
                displayName: displayName.trim(),
                legalName: legalName.trim(),
                country: country.trim(),
            });
            navigate('/contributor/identity-verification', { replace: true });
        } catch (err) {
            toast.error('Could not save your profile', getApiErrorMessage(err, 'Please try again.'));
        }
    };

    return (
        <Center minH="100vh" bg="primary.100" px={4} py={6}>
            <VStack gap={6} w="full" maxW="420px">
                <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                    <MuxifyLogoIcon color="primary.500" h="full" w="full" />
                </Box>

                <Box bg="white" borderRadius="20px" p={8} w="full">
                    <VStack gap={4} align="stretch">
                        <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Complete your profile
                            </Text>
                            <Text fontSize="xs" color="gray.600" mt={1}>
                                Tell us who you are so we can credit and pay you correctly.
                            </Text>
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Display name
                            </Text>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="The name fans will see"
                                fontSize="xs"
                                maxLength={100}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Legal name
                            </Text>
                            <Input
                                value={legalName}
                                onChange={(e) => setLegalName(e.target.value)}
                                placeholder="Your full legal name"
                                fontSize="xs"
                                maxLength={150}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Country
                            </Text>
                            <Input
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="e.g. Nigeria"
                                fontSize="xs"
                                maxLength={80}
                            />
                        </Box>

                        <Button
                            onClick={handleSubmit}
                            bg="primary.500"
                            color="white"
                            size="md"
                            fontSize="xs"
                            width="full"
                            borderRadius="10px"
                            loading={saveProfile.isPending}
                            loadingText="Saving..."
                            disabled={!canSubmit}
                            _hover={{ bg: 'primary.600' }}
                            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                            Continue
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Center>
    );
};

export default ContributorCompleteProfilePage;
