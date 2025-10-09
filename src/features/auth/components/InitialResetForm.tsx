import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Input,
    Link,
    Stack,
    Text,
    Heading,
    Icon,
} from '@chakra-ui/react';
import { MdOutlineArrowBack } from 'react-icons/md';

interface InitialResetFormProps {
    email: string;
    error: string;
    loading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const InitialResetForm: React.FC<InitialResetFormProps> = ({
    email,
    error,
    loading,
    onChange,
    onSubmit,
}) => {
    const navigate = useNavigate();

    return (
        <>
            <Box textAlign="center">
                <Heading
                    size="lg"
                    color="black"
                    mb={1}
                >
                    Reset Password
                </Heading>
                <Text
                    fontSize="xs"
                    color="gray.600"
                >
                    Provide the email or phone number used for registration
                </Text>
            </Box>
            <Box as="form" onSubmit={onSubmit} w="full">
                <Stack gap={3}>
                    <Box>
                        <Text fontSize="xs" fontWeight="medium" color="grey.500" mb={1}>
                            Email Address or Phone Number
                        </Text>
                        <Input
                            name="email"
                            type="email"
                            variant="subtle"
                            value={email}
                            size="xs"
                            onChange={onChange}
                            placeholder="Enter your email address or phone number"
                            borderColor={error ? 'red.300' : 'gray.300'}
                            _focus={{
                                borderColor: 'primary.500',
                                boxShadow: '0 0 0 1px #f94444',
                            }}
                        />
                        {error && (
                            <Text color="red.500" fontSize="xs" mt={0.5}>
                                {error}
                            </Text>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        loading={loading}
                        bg="primary.500"
                        color="white"
                        size="md"
                        fontSize="xs"
                        width="full"
                        fontWeight="medium"
                        borderRadius="10px"
                        mt="20px"
                        _hover={{ bg: 'primary.600' }}
                    >
                        Reset Password
                    </Button>

                    <Box display="flex" alignItems="center" justifyContent="center">
                        <Link
                            onClick={() => navigate('/login')}
                            fontSize="xs"
                            fontWeight="medium"
                            color="primary.500"
                            cursor="pointer"
                            _hover={{ color: 'primary.600' }}
                            display="flex"
                            alignItems="center"
                            gap={1}
                        >
                            <Icon as={MdOutlineArrowBack} />
                            Back to sign in
                        </Link>
                    </Box>
                </Stack>
            </Box>
        </>
    );
};
