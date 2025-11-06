import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon, Avatar } from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft, FiX, FiSearch } from 'react-icons/fi';
import { FileUploadArea } from '@upload/components';
import { UploadFileIcon, UploadImageIcon } from '@/shared/icons/CustomIcons';
import { CountryStateSelect, Select } from '@shared/components';
import { DateInput, TimeInput } from '@upload/components';
import { useAdsUploadStore } from '../../../store/useAdsUploadStore';
import { useChakraToast } from '@/shared/hooks/useChakraToast';
import { MusicPlayerAndCutPreviewPane } from '../MusicPlayerAndCutPreviewPane';
import { MusicViewPhonePreview } from '../MusicViewPhonePreview';
import { useArtistStore } from '@/features/artists/store/useArtistStore';

interface UploadFile {
    id: string;
    name: string;
    size: string;
    progress: number;
    status: 'uploading' | 'ready' | 'error';
    file?: File;
    url?: string;
}

export const MusicAdsFlow1: React.FC<{
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
    const [scheduleDate, setScheduleDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
    const [duration, setDuration] = useState(5); // Default duration in seconds

    const artistInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Use selectors to only subscribe to specific state slices
    const musicFile = useAdsUploadStore((state) => state.musicFile);
    const musicAdInfo = useAdsUploadStore((state) => state.musicAdInfo);
    const musicSetFile = useAdsUploadStore((state) => state.musicSetFile);
    const musicSetAdInfo = useAdsUploadStore((state) => state.musicSetAdInfo);
    const photoFile = useAdsUploadStore((state) => state.photoFile);
    const photoSetFile = useAdsUploadStore((state) => state.photoSetFile);
    const toast = useChakraToast();
    const artists = useArtistStore((state) => state.artists);

    // Populate form fields from store when editing (musicAdInfo exists)
    // Only populate if musicAdInfo exists (edit mode), not for new campaigns
    useEffect(() => {
        if (musicAdInfo) {
            setTitle(musicAdInfo.title || '');
            setCountry(musicAdInfo.location.country || '');
            setState(musicAdInfo.location.state || '');
            setTargetType(musicAdInfo.target.type || 'music');
            setGenre(musicAdInfo.target.genre || '');
            setSelectedArtists(musicAdInfo.target.artists || []);
            if (musicAdInfo.schedule.date) {
                const date = new Date(musicAdInfo.schedule.date);
                setScheduleDate(date.toISOString().split('T')[0]);
            }
            setStartTime(musicAdInfo.schedule.startTime || '');
            setEndTime(musicAdInfo.schedule.endTime || '');
            setAmpm(musicAdInfo.schedule.ampm || 'AM');
        } else {
            // Reset fields when creating new campaign (musicAdInfo is null)
            setTitle('');
            setCountry('');
            setState('');
            setTargetType('music');
            setGenre('');
            setSelectedArtists([]);
            setScheduleDate('');
            setStartTime('');
            setEndTime('');
            setAmpm('AM');
        }
    }, [musicAdInfo]);

    // Memoize filtered suggestions to avoid recalculating on every render
    const filteredSuggestions = useMemo(() => {
        return artists
        .filter((artist) => {
            const searchTerm = artistInput.toLowerCase();
            return (
                artist.name.toLowerCase().includes(searchTerm)
            ) && !selectedArtists.includes(artist.name);
        })
        .slice(0, 5);
    }, [artists, artistInput, selectedArtists]);

    // Handle artist input changes
    const handleArtistInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setArtistInput(e.target.value);
    }, []);

    // Update showSuggestions based on filtered suggestions
    useEffect(() => {
        setShowSuggestions(artistInput.length > 0 && filteredSuggestions.length > 0);
    }, [artistInput.length, filteredSuggestions.length]);

    const handleArtistInputFocus = useCallback(() => {
        if (artistInput.length > 0 && filteredSuggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [artistInput.length, filteredSuggestions.length]);

    const handleArtistInputBlur = () => {
        // Delay to allow suggestion click to fire
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
            }
        }, 200);
    };

    const handleSuggestionSelect = useCallback((artistName: string) => {
        if (!selectedArtists.includes(artistName)) {
            setSelectedArtists((prev) => [...prev, artistName]);
        }
        setArtistInput('');
        setShowSuggestions(false);
    }, [selectedArtists]);

    const handleRemoveArtist = useCallback((artist: string) => {
        setSelectedArtists((prev) => prev.filter((a) => a !== artist));
    }, []);

    const handleFileSelect = () => {
        // File selection handled by FileUploadArea
    };

    const handleFileReady = async (file: UploadFile) => {
        // Store file with both object URL for preview and prepare for base64 conversion
        // We'll convert to base64 in Flow3 when publishing to avoid performance issues
        let previewUrl: string | undefined;
        if (file.file) {
            // Create object URL for immediate preview (fast)
            previewUrl = URL.createObjectURL(file.file);
        }
        
        const audioWithUrl = {
            ...file,
            url: previewUrl || file.url,
            // Keep file object for base64 conversion in Flow3
        };
        musicSetFile(audioWithUrl);
    };

    const handleRemoveAudio = () => {
        musicSetFile(null);
    };

    const handlePhotoSelect = () => {
        // Photo selection handled by FileUploadArea
    };

    const handlePhotoReady = (file: UploadFile) => {
        // Create object URL for photo preview
        const photoWithUrl = {
            ...file,
            url: file.file ? URL.createObjectURL(file.file) : file.url,
        };
        photoSetFile(photoWithUrl);
    };

    const handleRemovePhoto = () => {
        photoSetFile(null);
    };

    const handleNext = () => {
        if (!musicFile) {
            toast.error('Music required', 'Please upload a music ad');
            return;
        }
        if (!title || !country || !state || !targetType || !genre) {
            toast.error('Fields required', 'Please fill in all required fields');
            return;
        }

        // Save Flow 1 data
        musicSetAdInfo({
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
                        Music Ads
                    </Text>
                </Flex>
            </Box>

            {/* Main Content */}
            <Flex gap={4} direction={{ base: 'column', lg: 'row' }} mt={4} px={4}>
                {/* Left Form Section */}
                <Box flex="1">
                    <VStack align="stretch" gap={3}>
                        {/* Upload Audio Ad */}
                        <Box>
                            <FileUploadArea
                                accept=".mp3,.wav,.aac,.mp4"
                                maxSize={50}
                                onFileSelect={handleFileSelect}
                                onFileReady={handleFileReady}
                                title="Upload Audio Ad"
                                supportedFormats="Support MP4, Mov"
                                Icon={UploadFileIcon}
                                fileType="audio"
                            />
                        </Box>

                        {/* Music Player and Cut Preview Pane */}
                        {musicFile && (
                            <MusicPlayerAndCutPreviewPane
                                audioFile={musicFile}
                                duration={duration}
                                onDurationChange={setDuration}
                                onRemove={handleRemoveAudio}
                            />
                        )}

                        {/* Upload Photo for Ad */}
                        <Box>
                            <FileUploadArea
                                accept=".jpg,.jpeg,.png,.gif"
                                maxSize={50}
                                onFileSelect={handlePhotoSelect}
                                onFileReady={handlePhotoReady}
                                title="Upload Photo for Ad"
                                supportedFormats="Support JPG, JPEG, PNG, GIF"
                                Icon={UploadImageIcon}
                                fileType="image"
                            />
                        </Box>

                        {/* Photo Preview */}
                        {photoFile && (
                            <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="md" p={3}>
                                <HStack justify="space-between" align="center">
                                    <VStack align="start" gap={0} flex="1" minW={0}>
                                        <Text fontSize="14px" color="gray.900" fontWeight="normal" lineClamp={1}>
                                            {photoFile.name}
                                        </Text>
                                        <Text fontSize="12px" color="gray.500" mt={1}>
                                            {photoFile.size}
                                        </Text>
                                    </VStack>
                                    <Icon
                                        as={FiX}
                                        boxSize={4}
                                        color="gray.600"
                                        cursor="pointer"
                                        onClick={handleRemovePhoto}
                                        _hover={{ color: 'gray.800' }}
                                    />
                                </HStack>
                            </Box>
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
                                                    {filteredSuggestions.map((artist) => {
                                                        const artistName = artist.name;
                                                        return (
                                                            <Box
                                                                key={artist.id}
                                                                p={3}
                                                                cursor="pointer"
                                                                w="full"
                                                                _hover={{ bg: 'gray.50' }}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => handleSuggestionSelect(artistName)}
                                                            >
                                                                <HStack gap={3}>
                                                                    <Avatar.Root size="sm" flexShrink={0}>
                                                                        <Avatar.Fallback fontSize="12px" bg="primary.100" color="primary.500">
                                                                            {artistName.charAt(0)}
                                                                        </Avatar.Fallback>
                                                                    </Avatar.Root>
                                                                    <VStack align="start" gap={0} minW={0} flex="1">
                                                                        <Text fontSize="12px" fontWeight="semibold" color="gray.900" lineClamp={1}>
                                                                            {artistName}
                                                                        </Text>
                                                                        <Text fontSize="11px" color="gray.500" lineClamp={1}>
                                                                            Artist
                                                                        </Text>
                                                                    </VStack>
                                                                </HStack>
                                                            </Box>
                                                        );
                                                    })}
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
                    <MusicViewPhonePreview />
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
                    <Text fontSize="12px">Next</Text>
                    <Icon as={FiArrowRight} ml={2} />
                </Button>
            </Flex>
        </VStack>
    );
};

