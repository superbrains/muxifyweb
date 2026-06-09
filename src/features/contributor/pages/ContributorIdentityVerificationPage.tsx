import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Center, Text, VStack } from '@chakra-ui/react';
import MuxifyLogoIcon, { VerifyIcon } from '@/shared/icons/CustomIcons';
import { URLInput } from '@shared/components';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { useSubmitContributorVerification } from '../hooks/useContributor';

const isLikelyUrl = (v: string) => {
    try {
        const u = new URL(v.trim());
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Authed onboarding step where a contributor submits a link to their identity
 * document (government ID / registration doc). The contract takes a URL rather
 * than a file upload, so we collect and POST the URL, then drop the contributor
 * into their dashboard.
 */
const ContributorIdentityVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useChakraToast();
    const submitVerification = useSubmitContributorVerification();

    const [documentUrl, setDocumentUrl] = React.useState('');
    const canSubmit = isLikelyUrl(documentUrl) && !submitVerification.isPending;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        try {
            await submitVerification.mutateAsync({ identityDocumentUrl: documentUrl.trim() });
            toast.success(
                'Verification submitted',
                'We will review your document and notify you shortly.',
            );
            navigate('/', { replace: true });
        } catch (err) {
            toast.error('Verification failed', getApiErrorMessage(err, 'Please try again.'));
        }
    };

    const handleSkip = () => navigate('/', { replace: true });

    return (
        <Center minH="100vh" bg="primary.100" px={4} py={6}>
            <VStack gap={6} w="full" maxW="420px">
                <Box h="60px" w="150px" display="flex" justifyContent="center" alignItems="center">
                    <MuxifyLogoIcon color="primary.500" h="full" w="full" />
                </Box>

                <Box bg="white" borderRadius="20px" p={8} w="full">
                    <VStack gap={4} align="center">
                        <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={1}>
                                Identity verification
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Share a link to a government-issued ID or registration document so our
                                team can verify your contributor account.
                            </Text>
                        </Box>

                        <Box
                            w="120px"
                            h="120px"
                            borderRadius="full"
                            bg="primary.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Box h="48px" w="120px" display="flex" justifyContent="center" alignItems="center">
                                <VerifyIcon color="primary.500" h="full" w="full" />
                            </Box>
                        </Box>

                        <Box w="full">
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Document URL
                            </Text>
                            <URLInput
                                value={documentUrl}
                                onChange={setDocumentUrl}
                                placeholder="https://drive.google.com/..."
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
                            loading={submitVerification.isPending}
                            loadingText="Submitting..."
                            disabled={!canSubmit}
                            _hover={{ bg: 'primary.600' }}
                            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                            Submit for verification
                        </Button>

                        <Button
                            onClick={handleSkip}
                            variant="outline"
                            borderColor="primary.500"
                            color="primary.500"
                            size="md"
                            fontSize="xs"
                            width="full"
                            borderRadius="10px"
                            disabled={submitVerification.isPending}
                        >
                            Do this later
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Center>
    );
};

export default ContributorIdentityVerificationPage;
