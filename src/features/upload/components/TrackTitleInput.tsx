import React from 'react';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';

interface TrackTitleInputProps {
    value: string;
    onChange: (value: string) => void;
    onAddFeature?: () => void;
    showAddFeature?: boolean;
}

export const TrackTitleInput: React.FC<TrackTitleInputProps> = ({
    value,
    onChange,
    onAddFeature,
    showAddFeature = false,
}) => {
    return (
        <Box>
            <Flex justify="space-between" align="center" mb={2} gap={2}>
                <Text fontSize="12px" fontWeight="semibold" color="gray.900">
                    Track Title
                </Text>
                {showAddFeature && (
                    <Button
                        size="xs"
                        variant="outline"
                        fontSize="10px"
                        color="gray.700"
                        borderColor="gray.300"
                        rounded="full"
                        h="auto"
                        py={1.5}
                        px={3}
                        flexShrink={0}
                        fontWeight="medium"
                        onClick={onAddFeature}
                        _hover={{ bg: 'gray.50' }}
                    >
                        <Box as="span" fontSize="13px" mr={1}>+</Box>
                        New Feature
                    </Button>
                )}
            </Flex>
            <Input
                placeholder="Track title"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                size="sm"
                fontSize="11px"
                h="40px"
                borderColor="gray.200"
                _placeholder={{ fontSize: '11px', color: 'gray.400' }}
            />
        </Box>
    );
};

