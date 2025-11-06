import React, { useState, useEffect, useRef } from 'react';
import { Input, Text, Box } from '@chakra-ui/react';
import type { InputProps } from '@chakra-ui/react';

export interface URLInputProps extends Omit<InputProps, 'onChange' | 'value'> {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    showErrorMessage?: boolean;
    errorMessage?: string;
}

// URL validation function
const validateURL = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid (no error shown)

    // Trim the URL to remove trailing spaces
    const trimmedUrl = url.trim();

    try {
        const urlObj = new URL(trimmedUrl);

        // Check if it's a valid HTTP/HTTPS URL
        const isValidProtocol = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';

        // Get hostname and ensure it's not empty
        const hostname = urlObj.hostname.trim();
        if (!hostname) return false;

        // Split hostname into parts
        let parts = hostname.split('.').filter(part => part.length > 0);

        // Remove "www" from the beginning if it exists
        if (parts[0]?.toLowerCase() === 'www') {
            parts = parts.slice(1);
        }

        // After removing www, must have at least 2 parts (domain + TLD)
        // e.g., "example.com" or "glimere.com"
        if (parts.length < 2) return false;

        // Get the last part (should be the TLD like "com", "net", "app")
        const tld = parts[parts.length - 1];

        // TLD must be 2+ letters and contain only letters
        const isValidTLD = tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);

        // The part before TLD (domain) must exist and not be empty
        const domain = parts[parts.length - 2];
        const hasValidDomain = !!(domain && domain.length > 0);

        return isValidProtocol && isValidTLD && hasValidDomain;
    } catch (error) {
        return false;
    }
};

export const URLInput: React.FC<URLInputProps> = ({
    value,
    onChange,
    placeholder = 'https://muxify.app/....',
    debounceMs = 1000,
    showErrorMessage = true,
    errorMessage = 'Please enter a valid URL (e.g., https://muxify.app/...)',
    size = 'sm',
    fontSize = '11px',
    h = '40px',
    borderRadius = 'md',
    ...props
}) => {
    const [validationState, setValidationState] = useState<boolean | null>(null);
    const validationTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        // Clear existing timeout
        if (validationTimeout.current) {
            clearTimeout(validationTimeout.current);
        }

        // Only validate if user has typed something
        if (value.trim() !== '') {
            // Set validation to null (validating state)
            setValidationState(null);

            // Set new timeout for validation
            validationTimeout.current = setTimeout(() => {
                const isValid = validateURL(value);
                setValidationState(isValid);
            }, debounceMs);
        } else {
            // Clear validation if input is empty
            setValidationState(null);
        }

        // Cleanup timeout on unmount
        return () => {
            if (validationTimeout.current) {
                clearTimeout(validationTimeout.current);
            }
        };
    }, [value, debounceMs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const borderColor = validationState === false 
        ? 'red.500' 
        : validationState === true 
            ? 'green.500' 
            : 'gray.200';

    const focusBorderColor = validationState === false 
        ? 'red.500' 
        : validationState === true 
            ? 'green.500' 
            : 'primary.500';

    const focusBoxShadow = validationState === false 
        ? '0 0 0 1px var(--chakra-colors-red-500)' 
        : validationState === true 
            ? '0 0 0 1px var(--chakra-colors-green-500)' 
            : '0 0 0 1px var(--chakra-colors-primary-500)';

    return (
        <Box>
            <Input
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                size={size}
                fontSize={fontSize}
                h={h}
                borderColor={borderColor}
                borderRadius={borderRadius}
                _placeholder={{ fontSize, color: 'gray.400' }}
                _focus={{
                    borderColor: focusBorderColor,
                    boxShadow: focusBoxShadow,
                }}
                {...props}
            />
            {showErrorMessage && validationState === false && value.trim() !== '' && (
                <Text fontSize="10px" color="red.500" mt={1}>
                    {errorMessage}
                </Text>
            )}
        </Box>
    );
};

