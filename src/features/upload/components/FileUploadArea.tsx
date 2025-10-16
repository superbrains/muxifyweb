import React, { useCallback, useState } from 'react';
import { Box, Text, VStack, type IconProps } from '@chakra-ui/react';

interface FileUploadAreaProps {
    accept: string;
    maxSize?: number; // in MB
    onFileSelect: (file: File) => void;
    title: string;
    supportedFormats: string;
    Icon: React.FC<IconProps>;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    accept,
    maxSize = 50,
    onFileSelect,
    title,
    supportedFormats,
    Icon,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    }, [onFileSelect]);

    return (
        <Box>
            <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                {title}
            </Text>
            <VStack align="center" w="full" gap={2}>
                <Text fontSize="10px" color="gray.500">
                    {supportedFormats}
                </Text>
                <Box
                    as="label"
                    w="full"
                    bg={isDragging ? 'red.200' : 'red.400'}
                    border="2px dashed"
                    borderColor={isDragging ? 'red.400' : 'red.200'}
                    borderRadius="lg"
                    p={{ base: 7, md: 10 }}
                    textAlign="center"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ bg: 'red.200', borderColor: 'red.300' }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                    />

                    <Icon boxSize={14} mb={3} />

                    <Text fontSize="14px" color="gray.700" mb={1} fontWeight="medium">
                        Click to upload or drag and drop
                    </Text>
                    <Text fontSize="13px" color="gray.500">
                        Maximum file size {maxSize}MB
                    </Text>
                </Box>
            </VStack>

        </Box>
    );
};

