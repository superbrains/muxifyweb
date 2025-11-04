import React, { useState, useRef } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon, Avatar } from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft, FiX, FiSearch } from 'react-icons/fi';
import { useAdsUploadStore } from '../../../store/useAdsUploadStore';
import { PhotoAdsPhonePreview } from '../../PhotoAdsPhonePreview';
import { DateInput, TimeInput, FileUploadArea, UploadedFileCard } from '@upload/components';
import { CountryStateSelect, Select } from '@shared/components';
import { UploadImageIcon } from '@/shared/icons/CustomIcons';
import { compressImage } from '@/shared/lib/fileUtils';
import { useChakraToast } from '@/shared/hooks/useChakraToast';

export const PhotoAdsFlow1: React.FC<{
    onNext: () => void;
    onBack: () => void;
}> = ({ onNext, onBack }) => {
    const [title, setTitle] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [targetType, setTargetType] = useState('music');
    const [genre, setGenre] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [artistInput, setArtistInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const artistInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [scheduleDate, setScheduleDate] = useState('');

    // Mock artist suggestions - in real app, this would come from API
    const artistSuggestions = [
        'Wizkid',
        'Davido',
        'Burna Boy',
        'Tiwa Savage',
        'Asake',
        'Ayra Starr',
        'Omah Lay',
        'Rema',
        'Fireboy DML',
        'Joeboy',
        'Olamide',
        'Pheelz',
        'Spyro'
    ];

    const filteredSuggestions = artistSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(artistInput.toLowerCase()) &&
        !selectedArtists.includes(suggestion)
    );
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

    const { photoFile, photoSetFile, photoSetAdInfo } = useAdsUploadStore();
    const toast = useChakraToast();

    const handleFileSelect = (file: File) => {
        console.log('File selected:', file);
    };

    const handleFileReady = async (file: UploadFile) => {
        // Convert file to compressed base64 for storage
        try {
            const base64Url = await compressImage(file.file);
            photoSetFile({
                ...file,
                url: base64Url,
                file: undefined, // Don't store File object
            });
        } catch (error) {
            console.error('Failed to compress image:', error);
            // Fallback to original file without compression
            photoSetFile({
                ...file,
                file: undefined,
            });
        }
    };

    interface UploadFile {
        id: string;
        name: string;
        size: string;
        progress: number;
        status: 'uploading' | 'ready' | 'error';
        file: File;
        url?: string;
    }

    const handleArtistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setArtistInput(newValue);
        const filtered = artistSuggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(newValue.toLowerCase()) &&
            !selectedArtists.includes(suggestion)
        );
        setShowSuggestions(newValue.length > 0 && filtered.length > 0);
    };

    const handleSuggestionSelect = (suggestion: string) => {
        if (!selectedArtists.includes(suggestion)) {
            setSelectedArtists([...selectedArtists, suggestion]);
        }
        setArtistInput('');
        setShowSuggestions(false);
    };

    const handleArtistInputFocus = () => {
        if (artistInput.length > 0 && filteredSuggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleArtistInputBlur = () => {
        // Use a small delay to allow clicks on suggestions to work
        setTimeout(() => {
            setShowSuggestions(false);
        }, 150);
    };

    const handleRemoveArtist = (artist: string) => {
        setSelectedArtists(selectedArtists.filter(a => a !== artist));
    };

    const handleRemovePhoto = () => {
        photoSetFile(null);
    };

    const handleNext = () => {
        if (!photoFile) {
            toast.error('Photo required', 'Please upload a photo ad');
            return;
        }
        if (!title || !country || !state || !targetType || !genre) {
            toast.error('Fields required', 'Please fill in all required fields');
            return;
        }

        // Save Flow 1 data
        photoSetAdInfo({
            title,
            location: { country, state },
            target: { type: targetType as 'music' | 'video', genre, artists: selectedArtists },
            schedule: {
                date: scheduleDate ? new Date(scheduleDate) : null,
                startTime,
                endTime,
                ampm,
            },
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
                                <Text alignSelf="start" mr={2} fontSize="12px" >Next</Text>
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
                        {/* Upload Photo Ad */}
                        <Box>
                            <FileUploadArea
                                accept=".jpg,.jpeg,.png,.gif"
                                maxSize={50}
                                onFileSelect={handleFileSelect}
                                onFileReady={handleFileReady}
                                title="Upload Photo Ad"
                                supportedFormats="Support JPG, JPEG, PNG, GIF"
                                Icon={UploadImageIcon}
                                fileType="image"
                            />
                            {photoFile && (
                                <Box mt={3}>
                                    <UploadedFileCard
                                        fileName={photoFile.name}
                                        fileSize={photoFile.size}
                                        progress={photoFile.progress}
                                        status={photoFile.status}
                                        onRemove={handleRemovePhoto}
                                        type="image"
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Ad Title */}
                        <Box>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                                Ad Title
                            </Text>
                            <Input
                                placeholder="Ad Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                size="xs"
                                h="40px"
                                borderRadius="10px"
                            />
                        </Box>

                        {/* Location */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Location
                            </Text>
                            <CountryStateSelect
                                countryValue={country}
                                stateValue={state}
                                onCountryChange={setCountry}
                                onStateChange={setState}
                            />
                        </Box>

                        {/* Target */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Target
                            </Text>
                            <VStack align="stretch" gap={2}>
                                <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                                        Target Type
                                    </Text>
                                    <Select
                                        value={targetType}
                                        onChange={(value) => setTargetType(value)}
                                        options={[
                                            { value: 'music', label: 'Music' },
                                            { value: 'video', label: 'Video' },
                                        ]}
                                        width="100%"
                                        fontSize="14px"
                                        borderRadius="10px"
                                        borderColor="gray.300"
                                        size="sm"
                                    />
                                </Box>
                                <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                                        Genre
                                    </Text>
                                    <Select
                                        value={genre}
                                        onChange={(value) => setGenre(value)}
                                        options={[
                                            { value: '', label: 'Select Genre' },
                                            { value: 'afrobeats', label: 'Afrobeats' },
                                            { value: 'pop', label: 'Pop' },
                                            { value: 'hip-hop', label: 'Hip-Hop' },
                                            { value: 'rnb', label: 'R&B' },
                                        ]}
                                        width="100%"
                                        fontSize="14px"
                                        borderRadius="10px"
                                        borderColor="gray.300"
                                        size="sm"
                                    />
                                </Box>
                                <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                                        Artist/Musician
                                    </Text>
                                    <Box position="relative" w="full">
                                        <Box position="relative">
                                            <Input
                                                ref={artistInputRef}
                                                placeholder="Search"
                                                value={artistInput}
                                                onChange={handleArtistInputChange}
                                                onFocus={handleArtistInputFocus}
                                                onBlur={handleArtistInputBlur}
                                                size="xs"
                                                h="40px"
                                                borderRadius="10px"
                                                pl="40px"
                                            />
                                            <Icon
                                                as={FiSearch}
                                                position="absolute"
                                                left="12px"
                                                top="50%"
                                                transform="translateY(-50%)"
                                                color="gray.400"
                                                boxSize={4}
                                                pointerEvents="none"
                                            />
                                        </Box>

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
                                                maxH="200px"
                                                overflowY="auto"
                                            >
                                                <VStack align="stretch" gap={0}>
                                                    {filteredSuggestions.map((suggestion) => (
                                                        <Box
                                                            key={suggestion}
                                                            p={3}
                                                            cursor="pointer"
                                                            w="full"
                                                            _hover={{ bg: 'gray.50' }}
                                                            onMouseDown={(e) => e.preventDefault()}
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
                                                                        Artist
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Selected Artists Chips */}
                                    {selectedArtists.length > 0 && (
                                        <HStack flexWrap="wrap" gap={2} mt={3}>
                                            {selectedArtists.map((artist) => (
                                                <Box
                                                    key={artist}
                                                    bg="gray.100"
                                                    px={3}
                                                    py={2}
                                                    borderRadius="full"
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={2}
                                                >
                                                    <Avatar.Root size="xs" flexShrink={0}>
                                                        <Avatar.Fallback fontSize="10px" bg="primary.100" color="primary.500">
                                                            {artist.charAt(0)}
                                                        </Avatar.Fallback>
                                                    </Avatar.Root>
                                                    <Text fontSize="xs" color="gray.900">{artist}</Text>
                                                    <Icon
                                                        as={FiX}
                                                        cursor="pointer"
                                                        onClick={() => handleRemoveArtist(artist)}
                                                        color="rgba(249,68,68,1)"
                                                        boxSize={3.5}
                                                        _hover={{ color: 'rgba(249,68,68,0.8)' }}
                                                    />
                                                </Box>
                                            ))}
                                        </HStack>
                                    )}
                                </Box>
                            </VStack>
                        </Box>

                        {/* Ad Schedule */}
                        <Box>
                            <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={2}>
                                Ad Schedule
                            </Text>
                            <VStack align="stretch" gap={2}>
                                <Box>

                                    <DateInput
                                        value={scheduleDate}
                                        onChange={setScheduleDate}
                                    />
                                </Box>
                                <HStack gap={3}>
                                    <Box flex="1">

                                        <TimeInput
                                            label="Start Time"
                                            value={startTime}
                                            onChange={setStartTime}
                                            period={ampm}
                                            onPeriodChange={setAmpm}
                                        />
                                    </Box>
                                    <Box flex="1">

                                        <TimeInput
                                            label="End Time"
                                            value={endTime}
                                            onChange={setEndTime}
                                            period={ampm}
                                            onPeriodChange={setAmpm}
                                        />
                                    </Box>
                                </HStack>
                            </VStack>
                        </Box>
                    </VStack>
                </Box>

                {/* Right Preview Section */}
                <Box flex="1" display="flex" justifyContent="center">
                    <PhotoAdsPhonePreview />
                </Box>
            </Flex>
        </VStack>
    );
};

