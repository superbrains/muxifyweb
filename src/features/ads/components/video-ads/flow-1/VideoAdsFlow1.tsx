import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon, Avatar } from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft, FiX, FiSearch } from 'react-icons/fi';
import { useAdsUploadStore } from '../../../store/useAdsUploadStore';
import { VideoAdsPhonePreview } from '../../VideoAdsPhonePreview';
import { DateInput, TimeInput, FileUploadArea } from '@upload/components';
import { CountryStateSelect, Select } from '@shared/components';
import { UploadFileIcon } from '@/shared/icons/CustomIcons';
import { useChakraToast } from '@/shared/hooks/useChakraToast';
import { VideoPlayerAndCutPreviewPane } from '../VideoPlayerAndCutPreviewPane';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file: File;
    url?: string;
}

export const VideoAdsFlow1: React.FC<{
    onNext: () => void;
    onBack: () => void;
}> = ({ onNext, onBack }) => {
    const [title, setTitle] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [targetType, setTargetType] = useState('video');
    const [genre, setGenre] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [artistInput, setArtistInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const artistInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
    const [duration, setDuration] = useState<number>(5); // Duration in seconds

    // Mock artist suggestions - in real app, this would come from API
    const artistSuggestions = useMemo(() => [
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
    ], []);

    // Memoize filtered suggestions to avoid recalculating on every render
    const filteredSuggestions = useMemo(() => {
        return artistSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(artistInput.toLowerCase()) &&
        !selectedArtists.includes(suggestion)
    );
    }, [artistInput, selectedArtists, artistSuggestions]);

    // Use selectors to only subscribe to specific state slices
    const videoFile = useAdsUploadStore((state) => state.videoFile);
    const videoAdInfo = useAdsUploadStore((state) => state.videoAdInfo);
    const videoSetFile = useAdsUploadStore((state) => state.videoSetFile);
    const videoSetAdInfo = useAdsUploadStore((state) => state.videoSetAdInfo);
    const toast = useChakraToast();

    // Populate form fields from store when editing (videoAdInfo exists)
    // Only populate if videoAdInfo exists (edit mode), not for new campaigns
    useEffect(() => {
        if (videoAdInfo) {
            setTitle(videoAdInfo.title || '');
            setCountry(videoAdInfo.location.country || '');
            setState(videoAdInfo.location.state || '');
            setTargetType(videoAdInfo.target.type || 'video');
            setGenre(videoAdInfo.target.genre || '');
            setSelectedArtists(videoAdInfo.target.artists || []);
            if (videoAdInfo.schedule.date) {
                const date = new Date(videoAdInfo.schedule.date);
                setScheduleDate(date.toISOString().split('T')[0]);
            }
            setStartTime(videoAdInfo.schedule.startTime || '');
            setEndTime(videoAdInfo.schedule.endTime || '');
            setAmpm(videoAdInfo.schedule.ampm || 'AM');
        } else {
            // Reset fields when creating new campaign (videoAdInfo is null)
            setTitle('');
            setCountry('');
            setState('');
            setTargetType('video');
            setGenre('');
            setSelectedArtists([]);
            setScheduleDate('');
            setStartTime('');
            setEndTime('');
            setAmpm('AM');
        }
    }, [videoAdInfo]);

    const handleFileSelect = (file: File) => {
        console.log('File selected:', file);
    };

    const handleFileReady = async (file: UploadFile) => {
        // Store file with both object URL for preview and prepare for base64 conversion
        // We'll convert to base64 in Flow3 when publishing to avoid performance issues
        let previewUrl: string | undefined;
        if (file.file) {
            // Create object URL for immediate preview (fast)
            previewUrl = URL.createObjectURL(file.file);
        }
        
        const videoWithUrl = {
            ...file,
            url: previewUrl || file.url,
            // Keep file object for base64 conversion in Flow3
        };
        videoSetFile(videoWithUrl);
    };

    // Memoize handler to prevent unnecessary re-renders
    const handleArtistInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setArtistInput(e.target.value);
    }, []);

    // Update showSuggestions based on filtered suggestions
    useEffect(() => {
        setShowSuggestions(artistInput.length > 0 && filteredSuggestions.length > 0);
    }, [artistInput.length, filteredSuggestions.length]);

    const handleSuggestionSelect = useCallback((suggestion: string) => {
        if (!selectedArtists.includes(suggestion)) {
            setSelectedArtists((prev) => [...prev, suggestion]);
        }
        setArtistInput('');
        setShowSuggestions(false);
    }, [selectedArtists]);

    const handleArtistInputFocus = useCallback(() => {
        if (artistInput.length > 0 && filteredSuggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [artistInput.length, filteredSuggestions.length]);

    const handleArtistInputBlur = () => {
        // Use a small delay to allow clicks on suggestions to work
        setTimeout(() => {
            setShowSuggestions(false);
        }, 150);
    };

    const handleRemoveArtist = (artist: string) => {
        setSelectedArtists(selectedArtists.filter(a => a !== artist));
    };

    const handleRemoveVideo = () => {
        if (videoFile?.url) {
            URL.revokeObjectURL(videoFile.url);
        }
        videoSetFile(null);
    };

    const handleNext = () => {
        if (!videoFile) {
            toast.error('Video required', 'Please upload a video ad');
            return;
        }
        if (!title || !country || !state || !targetType || !genre) {
            toast.error('Fields required', 'Please fill in all required fields');
            return;
        }

        // Save Flow 1 data
        videoSetAdInfo({
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
            {/* Top Bar with Title */}
            <Box
                w="full"
                py={3}
                borderBottom="1px solid"
                borderColor="gray.200"
                mb={0}
            >
                <Flex justify="space-between" align="center" px={4}>
                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                        Video Ads
                    </Text>
                </Flex>
            </Box>

            {/* Main Content */}
            <Flex gap={4} direction={{ base: 'column', lg: 'row' }} mt={4} px={4}>
                {/* Left Form Section */}
                <Box flex="1">
                    <VStack align="stretch" gap={3}>
                        {/* Upload Video Ad */}
                        <Box>
                            <FileUploadArea
                                accept=".mp4,.mov"
                                maxSize={50}
                                onFileSelect={handleFileSelect}
                                onFileReady={handleFileReady}
                                title="Upload Video Ad"
                                supportedFormats="Support MP4, Mov"
                                Icon={UploadFileIcon}
                                fileType="video"
                            />
                        </Box>

                        {/* Video Player and Cut Preview Pane */}
                        {videoFile && (
                            <VideoPlayerAndCutPreviewPane
                                videoFile={videoFile}
                                duration={duration}
                                onDurationChange={setDuration}
                                onRemove={handleRemoveVideo}
                            />
                        )}

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
                                        fontSize="12px"
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
                                        fontSize="12px"
                                        borderRadius="10px"
                                        borderColor="gray.300"
                                        size="sm"
                                    />
                                </Box>
                                <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.900" mb={1}>
                                        Creator/Music Videos
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
                    <VideoAdsPhonePreview />
                </Box>
            </Flex>

            {/* Bottom Navigation Buttons */}
            <Flex justify="space-between" align="center" px={4} py={4} borderTop="1px solid" borderColor="gray.200" mt={4}>
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
            </Flex>
        </VStack>
    );
};

