import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    HStack,
    Icon,
    IconButton,
    Input,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiArrowLeft, FiArrowRight, FiInfo, FiZap } from 'react-icons/fi';
import { useChakraToast } from '@shared/hooks';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import { useUserType } from '@/features/auth/hooks/useUserType';
import { useUploadMusicStore } from '@/features/upload-music/store/useUploadMusicStore';
import { shouldUseExtendedAudioWizard } from '../lib/wizardFlow';
import {
    isValidIsrc,
    isValidIswc,
    isValidUpc,
} from '../types/wizard';
import { rightsService } from '../services/rightsService';

const UploadRightsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isArtist, isRecordLabel } = useUserType();
    const toast = useChakraToast();

    const {
        mix,
        mixSetIsrc,
        mixSetIsrcProvisional,
        mixSetUpc,
        mixSetIswc,
    } = useUploadMusicStore();

    const mixId = searchParams.get('mixId');
    const querySuffix = mixId ? `?mixId=${mixId}` : '';

    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!shouldUseExtendedAudioWizard({ isArtist, isRecordLabel }, 'mix', 'music')) {
            navigate(`/upload/review${querySuffix}`, { replace: true });
            return;
        }
        if (mix.tracks.length === 0) {
            navigate(`/upload${querySuffix}`, { replace: true });
        }
    }, [isArtist, isRecordLabel, mix.tracks.length, navigate, querySuffix]);

    const { isrc, isrcIsProvisional, upc, iswc } = mix.rights;

    const isrcValid = isValidIsrc(isrc);
    const upcValid = isValidUpc(upc);
    const iswcValid = isValidIswc(iswc);
    const allValid = isrcValid && upcValid && iswcValid;

    const handleIsrcChange = (value: string) => {
        mixSetIsrc(value);
        // Manual edits clear the provisional flag.
        if (isrcIsProvisional) {
            mixSetIsrcProvisional(false);
        }
    };

    const handleGenerateProvisional = async () => {
        setGenerating(true);
        try {
            const result = await rightsService.generateProvisionalIsrc();
            mixSetIsrc(result.isrc);
            mixSetIsrcProvisional(true);
            toast.success(
                'Provisional ID generated',
                'Replace with the official ISRC when available.',
            );
        } catch (error: unknown) {
            toast.error(
                'Could not generate provisional ID',
                getApiErrorMessage(error, 'Please try again.'),
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleContinue = () => {
        if (!allValid) return;
        navigate(`/upload/review${querySuffix}`);
    };

    return (
        <>
            <VStack
                gap={4}
                bg="gray.50"
                minH="100vh"
                align="stretch"
                px={{ base: 3, md: 6 }}
                py={{ base: 4, md: 6 }}
                pb={{ base: '120px', md: '110px' }}
            >
                <HStack gap={2} align="center">
                    <IconButton
                        aria-label="Back to splits"
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/upload/splits${querySuffix}`)}
                    >
                        <FiArrowLeft />
                    </IconButton>
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                            Rights & Metadata
                        </Text>
                        <Text fontSize="11px" color="gray.600">
                            Provide the official codes for this release.
                        </Text>
                    </Box>
                </HStack>

                <Box bg="white" borderRadius="20px" p={{ base: 4, md: 5 }}>
                    <Stack gap={5}>
                        <Field
                            label="ISRC (track)"
                            description="12-character code, e.g. NG-ABC-23-00123."
                            value={isrc}
                            onChange={handleIsrcChange}
                            placeholder="NG-ABC-23-00123"
                            isInvalid={isrc.length > 0 && !isrcValid}
                            errorMessage="ISRC must be 12 characters in the format CC-XXX-YY-NNNNN."
                            trailing={
                                <Button
                                    onClick={handleGenerateProvisional}
                                    loading={generating}
                                    variant="outline"
                                    size="sm"
                                    fontSize="11px"
                                    borderRadius="10px"
                                    borderColor="primary.200"
                                    color="primary.600"
                                    _hover={{ bg: 'primary.50', borderColor: 'primary.500' }}
                                    whiteSpace="nowrap"
                                >
                                    <FiZap /> Generate Provisional ID
                                </Button>
                            }
                        />

                        {isrcIsProvisional && (
                            <HStack
                                gap={2}
                                bg="primary.70"
                                color="primary.600"
                                p={3}
                                borderRadius="12px"
                                align="flex-start"
                            >
                                <Box pt="2px">
                                    <FiInfo size={14} />
                                </Box>
                                <Text fontSize="11px">
                                    This is a provisional code. Replace with the official ISRC when available.
                                </Text>
                            </HStack>
                        )}

                        <Field
                            label="UPC (album)"
                            description="12 or 13 digit UPC/EAN barcode."
                            value={upc}
                            onChange={mixSetUpc}
                            placeholder="0123456789012"
                            isInvalid={upc.length > 0 && !upcValid}
                            errorMessage="UPC must be 12 or 13 digits."
                        />

                        <Field
                            label="ISWC (composition)"
                            description="Songwriting work code, e.g. T-345246800-1."
                            value={iswc}
                            onChange={mixSetIswc}
                            placeholder="T-345246800-1"
                            isInvalid={iswc.length > 0 && !iswcValid}
                            errorMessage="ISWC must follow the format T-DDDDDDDDD-C."
                        />
                    </Stack>
                </Box>

                <HStack
                    gap={2}
                    fontSize="11px"
                    color="gray.500"
                    px={1}
                    align="flex-start"
                >
                    <Box pt="2px" color="gray.400">
                        <FiInfo size={12} />
                    </Box>
                    <Text>
                        These codes uniquely identify the track, album, and composition for
                        royalty collection. All three are required to publish.
                    </Text>
                </HStack>
            </VStack>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.100"
                px={{ base: 3, md: 6 }}
                py={3}
                zIndex={10}
            >
                <HStack justify="space-between" gap={3}>
                    <Text
                        fontSize="xs"
                        color={allValid ? 'green.600' : 'gray.500'}
                    >
                        {allValid
                            ? 'All fields valid — ready to review.'
                            : 'Fill in all three codes to continue.'}
                    </Text>
                    <HStack gap={2}>
                        <Button
                            onClick={() => navigate(`/upload/splits${querySuffix}`)}
                            variant="ghost"
                            size="sm"
                            fontSize="xs"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={!allValid}
                            bg="primary.500"
                            color="white"
                            size="sm"
                            fontSize="xs"
                            fontWeight="medium"
                            borderRadius="10px"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Continue
                            <Icon as={FiArrowRight} boxSize={4} ml={2} />
                        </Button>
                    </HStack>
                </HStack>
            </Box>
        </>
    );
};

interface FieldProps {
    label: string;
    description: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    isInvalid: boolean;
    errorMessage: string;
    trailing?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
    label,
    description,
    value,
    onChange,
    placeholder,
    isInvalid,
    errorMessage,
    trailing,
}) => (
    <Box>
        <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
            {label}
        </Text>
        <Text fontSize="11px" color="gray.500" mb={2}>
            {description}
        </Text>
        <HStack gap={2} align="stretch" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                size="md"
                fontSize="sm"
                borderColor={isInvalid ? 'red.400' : 'gray.200'}
                _focus={{
                    borderColor: isInvalid ? 'red.500' : 'primary.500',
                    boxShadow: isInvalid
                        ? '0 0 0 1px #f56565'
                        : '0 0 0 1px #f94444',
                }}
            />
            {trailing}
        </HStack>
        {isInvalid && (
            <Text fontSize="11px" color="red.500" mt={1}>
                {errorMessage}
            </Text>
        )}
    </Box>
);

export default UploadRightsPage;
