import React, { useCallback, useState, useRef } from 'react';
import { Box, Text, VStack, type IconProps } from '@chakra-ui/react';
import { UploadedFileCard } from './UploadedFileCard';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file: File;
}

interface FileUploadAreaProps {
    accept: string;
    maxSize?: number; // in MB
    onFileSelect: (file: File) => void;
    onFileReady?: (file: UploadFile) => void;
    title: string;
    supportedFormats: string;
    Icon: React.FC<IconProps>;
    fileType?: 'audio' | 'video' | 'image';
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    accept,
    maxSize = 50,
    onFileSelect,
    onFileReady,
    title,
    supportedFormats,
    Icon,
    fileType = 'audio',
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
    const completedFilesRef = useRef<Set<string>>(new Set());

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const simulateUpload = useCallback((fileId: string) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += fileType === 'video' ? 5 : 10; // Slower for video files
            setUploadingFiles(prev =>
                prev.map(file =>
                    file.id === fileId
                        ? { ...file, progress, status: 'uploading' }
                        : file
                )
            );

            if (progress >= 100) {
                clearInterval(interval);
                console.log('[FileUploadArea] Upload complete for file:', fileId);
                // Move to ready state and notify parent
                setUploadingFiles(prev => {
                    const readyFile = prev.find(f => f.id === fileId);
                    if (readyFile) {
                        // Check if we've already processed this file
                        if (completedFilesRef.current.has(fileId)) {
                            console.log('[FileUploadArea] File already completed, skipping onFileReady:', fileId);
                        } else {
                            console.log('[FileUploadArea] Calling onFileReady for:', fileId, readyFile.name);
                            completedFilesRef.current.add(fileId);
                            // Use setTimeout to avoid calling setState during render
                            setTimeout(() => {
                                onFileReady?.({ ...readyFile, status: 'ready' });
                            }, 0);
                        }
                    }
                    console.log('[FileUploadArea] Removing file from uploadingFiles:', fileId);
                    return prev.filter(f => f.id !== fileId);
                });
                return; // Exit the interval callback
            }
        }, fileType === 'video' ? 500 : 300);
    }, [fileType, onFileReady]);

    const handleFileUpload = useCallback((file: File) => {
        // Check if file is already being uploaded to prevent duplicates
        setUploadingFiles(prev => {
            const isAlreadyUploading = prev.some(f => f.file === file);
            if (isAlreadyUploading) {
                console.log('[FileUploadArea] File already uploading, skipping:', file.name);
                return prev;
            }

            const newFile: UploadFile = {
                id: Date.now().toString(),
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                progress: 0,
                status: 'uploading',
                file,
            };

            console.log('[FileUploadArea] handleFileUpload:', newFile.id, newFile.name);
            console.log('[FileUploadArea] Adding file to uploadingFiles:', newFile.id);

            onFileSelect(file);
            // Simulate upload progress
            simulateUpload(newFile.id);

            return [...prev, newFile];
        });
    }, [onFileSelect, simulateUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);


    const handleRemoveFile = (fileId: string) => {
        console.log('[FileUploadArea] handleRemoveFile called for:', fileId);
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
    };

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

            {/* Uploading Progress */}
            {uploadingFiles.length > 0 && (() => {
                console.log('[FileUploadArea] Rendering uploadingFiles:', uploadingFiles.map(f => ({ id: f.id, name: f.name, status: f.status })));
                return (
                    <VStack align="stretch" gap={3} mt={4}>
                        {uploadingFiles.map((file) => (
                            <UploadedFileCard
                                key={file.id}
                                fileName={file.name}
                                fileSize={file.size}
                                progress={file.progress}
                                status={file.status}
                                onRemove={() => handleRemoveFile(file.id)}
                                type={fileType}
                                file={file.file}
                            />
                        ))}
                    </VStack>
                );
            })()}
        </Box>
    );
};

