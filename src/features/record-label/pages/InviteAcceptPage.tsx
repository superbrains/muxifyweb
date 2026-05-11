import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useUserStore } from '@app/store/useUserStore';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';

type State = 'idle' | 'submitting' | 'success' | 'error' | 'redirect-login';

const InviteAcceptPage: React.FC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const toast = useChakraToast();
    const isAuthed = useUserStore((s) => s.isAuthenticated);
    const [state, setState] = useState<State>('idle');
    const [error, setError] = useState<string | null>(null);
    const [labelName, setLabelName] = useState<string | null>(null);

    const token = params.get('token') || '';

    useEffect(() => {
        if (!token) {
            setError('Missing invitation token.');
            setState('error');
            return;
        }
        if (!isAuthed) {
            navigate(`/login?next=${encodeURIComponent(`/label/invite/accept?token=${token}`)}`);
            setState('redirect-login');
            return;
        }

        const accept = async () => {
            setState('submitting');
            try {
                const res = await recordLabelService.acceptInvitation({ token });
                setLabelName(res.labelName);
                setState('success');
                toast.success('You joined the label!', `You're now in ${res.labelName}.`);
            } catch (err: unknown) {
                const message = getApiErrorMessage(err, 'Could not accept this invitation.');
                setError(message);
                setState('error');
            }
        };
        accept();
    }, [token, isAuthed, navigate, toast]);

    if (state === 'submitting' || state === 'idle' || state === 'redirect-login') {
        return (
            <Center minH="100vh" bg="primary.100">
                <Spinner size="lg" color="primary.500" />
            </Center>
        );
    }

    return (
        <Center minH="100vh" bg="primary.100" px={4}>
            <Box bg="white" borderRadius="20px" p={8} maxW="380px" w="full">
                <VStack gap={4} textAlign="center">
                    {state === 'success' ? (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Welcome to {labelName}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                You can now access this label's releases and royalty splits.
                            </Text>
                            <Button
                                onClick={() => navigate('/')}
                                bg="primary.500"
                                color="white"
                                size="md"
                                fontSize="xs"
                                width="full"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                Go to dashboard
                            </Button>
                        </>
                    ) : (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Invitation issue
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                {error}
                            </Text>
                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                borderColor="primary.500"
                                color="primary.500"
                                size="md"
                                fontSize="xs"
                                width="full"
                                fontWeight="medium"
                                borderRadius="10px"
                            >
                                Back to dashboard
                            </Button>
                        </>
                    )}
                </VStack>
            </Box>
        </Center>
    );
};

export default InviteAcceptPage;
