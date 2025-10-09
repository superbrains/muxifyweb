import React from 'react';
import {
    Box,
    Button,
    Text,
    VStack,
    Icon,
} from '@chakra-ui/react';
import { MdEmail } from 'react-icons/md';

interface SentConfirmationProps {
    email: string;
    onTryAnother: () => void;
}

export const SentConfirmation: React.FC<SentConfirmationProps> = ({
    email,
    onTryAnother,
}) => {
    return (
        <VStack gap={6} align="center">
            <Box textAlign="center">
                <Icon as={MdEmail} boxSize={16} color="primary.500" mb={4} />
                <Text fontSize="lg" fontWeight="semibold" color="black" mb={2}>
                    Check your email
                </Text>
                <Text fontSize="sm" color="gray.600" mb={6}>
                    We've sent a verification code to <strong style={{ color: '#f94444' }}>{email}</strong>
                </Text>
            </Box>

            <Button
                onClick={onTryAnother}
                variant="outline"
                size="lg"
                fontSize="sm"
                width="full"
                fontWeight="medium"
                borderRadius="10px"
                borderColor="gray.300"
                color="gray.700"
                _hover={{
                    bg: 'gray.50',
                    borderColor: 'gray.400'
                }}
            >
                Try another email
            </Button>
        </VStack>
    );
};
