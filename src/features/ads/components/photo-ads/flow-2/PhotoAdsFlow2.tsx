import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon } from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft, FiPlus } from 'react-icons/fi';
import { useAdsUploadStore } from '../../../store/useAdsUploadStore';
import { PhotoAdsPhonePreview } from '../../PhotoAdsPhonePreview';
import { Select } from '@shared/components';
import { TopUpModal } from '../../TopUpModal';
import { useToast } from '@/shared/hooks/useToast';

export const PhotoAdsFlow2: React.FC<{
    onNext: () => void;
    onBack: () => void;
}> = ({ onNext, onBack }) => {
    const [ctaAction, setCtaAction] = useState('signup');
    const [link, setLink] = useState('');
    const [budget, setBudget] = useState('0.00');
    const [reach, setReach] = useState('0');
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    const { photoSetCallToAction, photoSetBudgetReach } = useAdsUploadStore();
    const { toast } = useToast();

    const handleTopUpComplete = () => {
        // Handle top up completion - could show success message
        console.log('Top up completed');
    };

    const handleNext = () => {
        if (!link || !budget || !reach) {
            toast.error('Fields required', 'Please fill in all required fields');
            return;
        }

        // Save Flow 2 data
        photoSetCallToAction({
            action: ctaAction as 'signup' | 'download' | 'view' | 'click',
            link,
        });
        photoSetBudgetReach({
            amount: parseFloat(budget),
            impressions: parseInt(reach),
        });

        onNext();
    };

    return (
        <VStack align="stretch" gap={0}>
            {/* Top Bar with Title and Navigation */}
            <Box
                w="full"
                py={3}
                borderBottom="1px solid"
                borderColor="gray.200"
                mb={0}
            >
                <Flex justify="space-between" align="center" px={4}>
                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                        Photo Ads
                    </Text>
                    <HStack gap={2}>
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            bg="rgba(249,68,68,0.05)"
                            border="1px solid"
                            borderColor="rgba(249,68,68,0.3)"
                            borderRadius="10px"
                            size="xs"
                            px={3}
                            fontSize="12px"
                            color="rgba(249,68,68,1)"
                            _hover={{ bg: 'rgba(249,68,68,0.1)', borderColor: 'rgba(249,68,68,0.5)' }}
                        >
                            <Icon as={FiArrowLeft} mr={1} />
                            Back
                        </Button>
                        <Button
                            bg="primary.500"
                            color="white"
                            onClick={handleNext}
                            borderRadius="10px"
                            size="xs"
                            w="200px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            px={3}
                            _hover={{ bg: 'primary.600' }}
                        >
                            <Flex align="center" w="full" justify="space-between">
                                <Text alignSelf="start" mr={2} fontSize="12px">Next</Text>
                                <Icon alignSelf="end" as={FiArrowRight} />
                            </Flex>
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Main Content */}
            <Flex gap={4} direction={{ base: 'column', lg: 'row' }} mt={4} px={4}>
                {/* Left Form Section */}
                <Box flex="1">
                    <VStack align="stretch" gap={3}>
                        {/* Call To Action */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Call To Action
                            </Text>
                            <Text fontSize="xs" color="gray.600" mb={2}>
                                What should your add do?
                            </Text>
                            <Select
                                value={ctaAction}
                                onChange={(value) => setCtaAction(value)}
                                options={[
                                    { value: 'signup', label: 'Signup' },
                                    { value: 'download', label: 'Download' },
                                    { value: 'view', label: 'View' },
                                    { value: 'click', label: 'Click' },
                                ]}
                                width="100%"
                                fontSize="14px"
                                borderRadius="10px"
                                borderColor="gray.300"
                                size="sm"
                            />
                        </Box>

                        {/* Link */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Link
                            </Text>
                            <Input
                                placeholder="https://"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                            />
                            <Text fontSize="xs" color="rgba(249,68,68,1)" mt={1}>
                                1 click = 50kobo
                            </Text>
                        </Box>

                        {/* Budget */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Budget
                            </Text>
                            <Text fontSize="xs" color="gray.600" mb={1}>
                                Amount
                            </Text>
                            <Input
                                placeholder="NGN0.00"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                            />
                        </Box>

                        {/* Reach */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Reach
                            </Text>
                            <Text fontSize="xs" color="gray.600" mb={2}>
                                How many impression do you want to reach?
                            </Text>
                            <Input
                                placeholder="0"
                                value={reach}
                                onChange={(e) => setReach(e.target.value)}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                            />
                            <Text fontSize="xs" color="rgba(249,68,68,1)" mt={1}>
                                1 reach = 50kobo
                            </Text>
                        </Box>

                        {/* Ad Wallet */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Ad Wallet
                            </Text>
                            <Box
                                bg="gray.100"
                                borderRadius="10px"
                                p={4}
                                border="1px solid"
                                borderColor="gray.200"
                            >
                                <HStack justify="space-between" align="center">
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.600">
                                            Wallet Balance
                                        </Text>
                                        <Text fontSize="sm" fontWeight="bold" color="gray.900">
                                            NGN50,000
                                        </Text>
                                    </VStack>
                                    <Button
                                        bg="rgba(249,68,68,1)"
                                        color="white"
                                        size="xs"
                                        borderRadius="10px"
                                        px={3}
                                        onClick={() => setIsTopUpOpen(true)}
                                        _hover={{ bg: 'rgba(249,68,68,0.9)' }}
                                    >
                                        <Icon as={FiPlus} mr={1} />
                                        Top Up
                                    </Button>
                                </HStack>
                            </Box>
                        </Box>
                    </VStack>
                </Box>

                {/* Right Preview Section */}
                <Box flex="1" display="flex" justifyContent="center">
                    <PhotoAdsPhonePreview />
                </Box>
            </Flex>

            {/* Top Up Modal */}
            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
                onComplete={handleTopUpComplete}
            />
        </VStack>
    );
};

