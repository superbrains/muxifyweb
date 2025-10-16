import React, { useState, useRef } from 'react';
import { HStack, Input, Avatar, VStack, Text, Box } from '@chakra-ui/react';
import { TrashIcon } from '@/shared/icons/CustomIcons';

interface ArtistInputProps {
    value: string;
    onChange: (value: string) => void;
    onRemove: () => void;
    placeholder?: string;
}

export const ArtistInput: React.FC<ArtistInputProps> = ({
    value,
    onChange,
    onRemove,
    placeholder = "Name of Musician: Olamide",
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Mock suggestions - in real app, this would come from API
    const suggestions = [
        'Wizkid',
        'Davido',
        'Burna Boy',
        'Tiwa Savage',
        'Asake',
        'Ayra Starr',
        'Omah Lay',
        'Rema',
        'Fireboy DML',
        'Joeboy'
    ];

    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        suggestion.toLowerCase() !== value.toLowerCase()
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        console.log('newValue', newValue);
        onChange(newValue);
        setShowSuggestions(newValue.length > 0);
    };

    const handleSuggestionSelect = (suggestion: string) => {
        console.log('suggestion', suggestion);
        onChange(suggestion);
        setShowSuggestions(false);
    };

    const handleInputBlur = () => {
        // Use a small delay to allow clicks on suggestions to work
        setTimeout(() => {
            setShowSuggestions(false);
        }, 150);
    };

    const handleInputFocus = () => {
        setShowSuggestions(value.length > 0);
    };

    return (
        <Box position="relative" w="full">
            <HStack gap={3} w="full">
                <Box flex="1" position="relative" w="full">
                    <Input
                        ref={inputRef}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        size="sm"
                        fontSize="11px"
                        h="40px"
                        w="full"
                        borderColor="gray.200"
                        flex="8"
                        _placeholder={{ fontSize: '11px', color: 'gray.400' }}
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <Box
                            ref={suggestionsRef}
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            bg="white"
                            w="full"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            boxShadow="lg"
                            zIndex={10}
                            mt={1}
                        >
                            <VStack align="stretch" gap={0}>
                                {filteredSuggestions.map((suggestion) => (
                                    <Box
                                        key={suggestion}
                                        p={3}
                                        cursor="pointer"
                                        w="full"
                                        _hover={{ bg: 'gray.50' }}
                                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                    >
                                        <HStack gap={3}>
                                            <Avatar.Root size="sm" flexShrink={0}>
                                                <Avatar.Fallback fontSize="12px" bg="primary.100" color="primary.500">
                                                    {suggestion.charAt(0)}
                                                </Avatar.Fallback>
                                            </Avatar.Root>
                                            <VStack align="start" gap={0} minW={0} flex="1">
                                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" lineClamp={1}>
                                                    {suggestion}
                                                </Text>
                                                <Text fontSize="11px" color="gray.500" lineClamp={1}>
                                                    Artist/Musician
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        </Box>
                    )}
                </Box>

                <TrashIcon
                    boxSize={4.5}
                    w={4.5}
                    h={4.5}
                    color="primary.500"
                    cursor="pointer"
                    onClick={onRemove}
                    _hover={{ color: 'primary.600' }}
                />
            </HStack>
        </Box>
    );
};
