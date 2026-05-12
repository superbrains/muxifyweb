import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useUserStore } from '@app/store/useUserStore';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import { useChakraToast } from '@shared/hooks';
import { recordLabelService } from '../services/recordLabelService';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import type { InvitationLookupResponse } from '../types';

type Phase =
    | 'lookup'           // calling lookup endpoint
    | 'lookup-error'     // 404 / network / invalid token
    | 'status-blocked'   // status != Pending (revoked/declined/expired/accepted-by-other)
    | 'signin-required'  // existing user, not authed
    | 'wrong-user'       // authed but as a different account than the invitee
    | 'confirm-accept'   // existing user authed as invitee — show confirm
    | 'submitting'       // accept call in flight
    | 'success'
    | 'accept-error';

const InviteAcceptPage: React.FC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const toast = useChakraToast();
    const isAuthed = useUserStore((s) => s.isAuthenticated);
    const currentUser = useUserStore((s) => s.user);
    const logout = useUserStore((s) => s.logout);
    const { initializeUser, setInvitationContext } = useUserManagementStore();

    const token = params.get('token') || '';
    const [phase, setPhase] = useState<Phase>('lookup');
    const [lookup, setLookup] = useState<InvitationLookupResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [acceptedLabelName, setAcceptedLabelName] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Missing invitation token.');
            setPhase('lookup-error');
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const result = await recordLabelService.lookupInvitation(token);
                if (cancelled) return;
                setLookup(result);

                if (result.status !== 'Pending') {
                    setPhase('status-blocked');
                    return;
                }

                if (!result.userExists) {
                    // New artist — kick into the invited-onboarding flow with
                    // email pre-filled and locked, and the token persisted in
                    // the onboarding store for auto-accept on completion.
                    const userId = initializeUser(
                        'artist',
                        result.inviteeEmail,
                        '',
                        'artist',
                    );
                    setInvitationContext(userId, token, result.labelName);
                    navigate('/onboarding/artist/invited/register', {
                        state: { userId, fromInvitation: true },
                        replace: true,
                    });
                    return;
                }

                // User already has an account at this email.
                if (!isAuthed) {
                    setPhase('signin-required');
                    return;
                }

                // Authed: check that we're signed in as the invitee, not
                // some other account in this browser.
                const matchesInvitee =
                    !!currentUser?.email &&
                    currentUser.email.toLowerCase() === result.inviteeEmail.toLowerCase();

                setPhase(matchesInvitee ? 'confirm-accept' : 'wrong-user');
            } catch (err) {
                if (cancelled) return;
                setError(getApiErrorMessage(err, 'Could not look up this invitation.'));
                setPhase('lookup-error');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, isAuthed, currentUser, navigate, initializeUser, setInvitationContext]);

    const handleConfirmAccept = async () => {
        setPhase('submitting');
        try {
            const res = await recordLabelService.acceptInvitation({ token });
            setAcceptedLabelName(res.labelName);
            setPhase('success');
            toast.success('You joined the label!', `You're now in ${res.labelName}.`);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Could not accept this invitation.'));
            setPhase('accept-error');
        }
    };

    const goToLogin = () => {
        const next = `/label/invite/accept?token=${encodeURIComponent(token)}`;
        navigate(`/login?next=${encodeURIComponent(next)}`);
    };

    const handleSignOutAndRetry = () => {
        logout();
        // After clearing auth state, the lookup re-resolves to signin-required.
        setPhase('signin-required');
    };

    if (phase === 'lookup' || phase === 'submitting') {
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
                    {phase === 'success' && (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Welcome to {acceptedLabelName}
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
                    )}

                    {phase === 'signin-required' && lookup && (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Sign in to join {lookup.labelName}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                There's already a Muxify account for {lookup.inviteeEmail}. Sign in to
                                accept this invitation.
                            </Text>
                            <Button
                                onClick={goToLogin}
                                bg="primary.500"
                                color="white"
                                size="md"
                                fontSize="xs"
                                width="full"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                Sign in
                            </Button>
                        </>
                    )}

                    {phase === 'wrong-user' && lookup && (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Wrong account
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                You're signed in as {currentUser?.email}, but this invitation is for{' '}
                                {lookup.inviteeEmail}. Sign out to accept it as the invited account.
                            </Text>
                            <Button
                                onClick={handleSignOutAndRetry}
                                bg="primary.500"
                                color="white"
                                size="md"
                                fontSize="xs"
                                width="full"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                Sign out and continue
                            </Button>
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
                                Stay signed in
                            </Button>
                        </>
                    )}

                    {phase === 'confirm-accept' && lookup && (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Join {lookup.labelName}?
                            </Text>
                            {lookup.personalNote && (
                                <Text
                                    fontSize="xs"
                                    color="gray.700"
                                    bg="primary.50"
                                    p={3}
                                    borderRadius="8px"
                                >
                                    “{lookup.personalNote}”
                                </Text>
                            )}
                            <Text fontSize="xs" color="gray.600">
                                Accepting adds you to this label's roster.
                            </Text>
                            <Button
                                onClick={handleConfirmAccept}
                                bg="primary.500"
                                color="white"
                                size="md"
                                fontSize="xs"
                                width="full"
                                fontWeight="medium"
                                borderRadius="10px"
                                _hover={{ bg: 'primary.600' }}
                            >
                                Accept invitation
                            </Button>
                        </>
                    )}

                    {phase === 'status-blocked' && lookup && (
                        <>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Invitation unavailable
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                This invitation has been {lookup.status.toLowerCase()} and can no longer
                                be used. Ask the label to send a fresh invite.
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

                    {(phase === 'lookup-error' || phase === 'accept-error') && (
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
