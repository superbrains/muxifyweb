import React, { useEffect } from 'react';
import { Box, HStack, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAdsStore } from '../../store/useAdsStore';
import { formatCurrency } from '@/shared/lib';

/**
 * The wizard's "Ad Wallet" box — shows the advertiser's REAL balance and routes
 * Top Up to the Payments page (replacing the hardcoded "NGN50,000" + dead modal).
 */
export const WizardWalletBox: React.FC = () => {
    const navigate = useNavigate();
    const { wallet, fetchWallet } = useAdsStore();

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    return (
        <Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                Ad Wallet
            </Text>
            <Box bg="gray.100" borderRadius="10px" p={4} border="1px solid" borderColor="gray.200">
                <HStack justify="space-between" align="center">
                    <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="gray.600">
                            Wallet Balance
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.900">
                            {formatCurrency(wallet?.balanceDisplay ?? 0)}
                        </Text>
                    </VStack>
                    <Button
                        bg="primary.500"
                        color="white"
                        size="xs"
                        borderRadius="10px"
                        px={3}
                        onClick={() => navigate('/ads/payments')}
                        _hover={{ bg: 'primary.600' }}
                    >
                        <Icon as={FiPlus} mr={1} />
                        Top Up
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default WizardWalletBox;
