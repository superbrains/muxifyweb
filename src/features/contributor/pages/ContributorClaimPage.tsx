import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Center,
    HStack,
    Icon,
    Input,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { contributorService } from '../services/contributorService';
import type { ContributorClaimLookupDto } from '../services/contributorService';

type Phase = 'lookup' | 'invalid' | 'form' | 'submitting' | 'done';

interface PasswordRule {
    label: string;
    test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
    { label: 'At least 8 characters', test: (v) => v.length >= 8 },
    { label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
    { label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
    { label: 'A number', test: (v) => /\d/.test(v) },
];

/**
 * Public page where an invited contributor sets a password to claim their
 * Muxify contributor account. Mirrors {@link AdminInviteAcceptPage}: the token
 * comes from the query string, we look it up to show who's being invited, then
 * POST the new password. On success the contributor signs in to finish their
 * profile + identity verification.
 */
const ContributorClaimPage: React.FC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const toast = useChakraToast();
    const token = params.get('token') ?? '';

    const [phase, setPhase] = React.useState<Phase>('lookup');
    const [lookup, setLookup] = React.useState<ContributorClaimLookupDto | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const [password, setPassword] = React.useState('');
    const [confirm, setConfirm] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    React.useEffect(() => {
        if (!token) {
            setError('This invitation link is missing its token.');
            setPhase('invalid');
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const result = await contributorService.lookupClaim(token);
                if (cancelled) return;
                setLookup(result);
                setPhase(result.isValid ? 'form' : 'invalid');
                if (!result.isValid)
                    setError('This invitation has expired or already been claimed.');
            } catch (err) {
                if (cancelled) return;
                setError(getApiErrorMessage(err, 'This invitation link is invalid.'));
                setPhase('invalid');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
    const confirmValid = confirm.length > 0 && confirm === password;
    const canSubmit = passwordValid && confirmValid && phase === 'form';

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setPhase('submitting');
        try {
            await contributorService.claim({ token, password });
            setPhase('done');
            toast.success('Account claimed', 'Sign in to finish setting up your profile.');
        } catch (err) {
            toast.error('Could not claim your account', getApiErrorMessage(err, 'Please try again.'));
            setPhase('form');
        }
    };

    const goToLogin = () => {
        // Land contributors on profile completion right after they sign in.
        const next = '/contributor/complete-profile';
        navigate(`/login?next=${encodeURIComponent(next)}`);
    };

    if (phase === 'lookup') {
        return (
            <Center minH="100vh" bg="primary.100">
                <Spinner size="lg" color="primary.500" />
            </Center>
        );
    }

    return (
        <Center minH="100vh" bg="primary.100" px={4}>
            <Box bg="white" borderRadius="20px" p={8} maxW="420px" w="full">
                {phase === 'invalid' && (
                    <VStack gap={3} textAlign="center">
                        <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                            Invitation unavailable
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                            {error}
                        </Text>
                        <Button
                            onClick={() => navigate('/login')}
                            variant="outline"
                            borderColor="primary.500"
                            color="primary.500"
                            size="md"
                            fontSize="xs"
                            width="full"
                            borderRadius="10px"
                        >
                            Go to sign in
                        </Button>
                    </VStack>
                )}

                {phase === 'done' && (
                    <VStack gap={3} textAlign="center">
                        <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                            Your account is ready
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                            Sign in to complete your contributor profile.
                        </Text>
                        <Button
                            onClick={goToLogin}
                            bg="primary.500"
                            color="white"
                            size="md"
                            fontSize="xs"
                            width="full"
                            borderRadius="10px"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Sign in
                        </Button>
                    </VStack>
                )}

                {(phase === 'form' || phase === 'submitting') && lookup && (
                    <VStack gap={4} align="stretch">
                        <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                                Claim your contributor account
                            </Text>
                            <Text fontSize="xs" color="gray.600" mt={1}>
                                You've been invited as{' '}
                                <Text as="span" fontWeight="semibold" color="primary.600">
                                    {lookup.displayName}
                                </Text>{' '}
                                ({lookup.email}).
                            </Text>
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Password
                            </Text>
                            <Box position="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    fontSize="xs"
                                    pr={9}
                                />
                                <Icon
                                    as={showPassword ? FiEyeOff : FiEye}
                                    position="absolute"
                                    right={3}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    boxSize={4}
                                    color="gray.400"
                                    cursor="pointer"
                                    onClick={() => setShowPassword((s) => !s)}
                                />
                            </Box>
                            <VStack align="stretch" gap={0.5} mt={2}>
                                {PASSWORD_RULES.map((rule) => {
                                    const ok = rule.test(password);
                                    return (
                                        <HStack key={rule.label} gap={1.5}>
                                            <Icon
                                                as={FiCheck}
                                                boxSize={3}
                                                color={ok ? 'green.500' : 'gray.300'}
                                            />
                                            <Text
                                                fontSize="10px"
                                                color={ok ? 'green.600' : 'gray.400'}
                                            >
                                                {rule.label}
                                            </Text>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        </Box>

                        <Box>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.700" mb={1.5}>
                                Confirm password
                            </Text>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Re-enter your password"
                                fontSize="xs"
                            />
                            {confirm.length > 0 && !confirmValid && (
                                <Text fontSize="10px" color="primary.500" mt={1}>
                                    Passwords don't match.
                                </Text>
                            )}
                        </Box>

                        <Button
                            onClick={handleSubmit}
                            bg="primary.500"
                            color="white"
                            size="md"
                            fontSize="xs"
                            width="full"
                            borderRadius="10px"
                            disabled={!canSubmit}
                            _hover={{ bg: 'primary.600' }}
                            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                            {phase === 'submitting' ? (
                                <Spinner size="xs" color="white" />
                            ) : (
                                'Claim my account'
                            )}
                        </Button>
                    </VStack>
                )}
            </Box>
        </Center>
    );
};

export default ContributorClaimPage;
