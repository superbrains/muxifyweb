import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Input, Flex, Icon } from '@chakra-ui/react';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FileUploadArea, UploadSuccessPage, DateInput, TimeInput } from '@upload/components';
import { UploadFileIcon } from '@/shared/icons/CustomIcons';
import { CountryStateSelect } from '@shared/components';
import { useAdsUploadStore } from '../store/useAdsUploadStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/useToast';
import { useAdsStore } from '../store/useAdsStore';

export const VideoAdsTab: React.FC = () => {
    const [flow, setFlow] = useState(1);
    const [title, setTitle] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [targetType, setTargetType] = useState('music');
    const [genre, setGenre] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [artistInput, setArtistInput] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
    
    // Flow 2 fields
    const [callToAction, setCallToAction] = useState('signup');
    const [actionLink, setActionLink] = useState('');
    const [budget, setBudget] = useState('');
    const [impressions, setImpressions] = useState('');
    
    const { videoFile, videoSetFile, videoSetAdInfo, videoSetCallToAction, videoSetBudgetReach, resetVideoAds } = useAdsUploadStore();
    const { addCampaign } = useAdsStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const handleFileReady = (file: any) => {
        videoSetFile(file);
    };
    
    const handleFileSelect = (file: File) => {
        console.log('File selected:', file);
    };
    
    const handleAddArtist = () => {
        if (artistInput.trim() && !selectedArtists.includes(artistInput.trim())) {
            setSelectedArtists([...selectedArtists, artistInput.trim()]);
            setArtistInput('');
        }
    };
    
    const handleRemoveArtist = (artist: string) => {
        setSelectedArtists(selectedArtists.filter(a => a !== artist));
    };
    
    const handleNext = () => {
        if (flow === 1) {
            // Validate Flow 1
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
                target: { type: targetType as any, genre, artists: selectedArtists },
                schedule: {
                    date: scheduleDate ? new Date(scheduleDate) : null,
                    startTime,
                    endTime,
                    ampm,
                },
            });
            setFlow(2);
        } else if (flow === 2) {
            // Validate Flow 2
            if (!callToAction || !actionLink || !budget || !impressions) {
                toast.error('Fields required', 'Please fill in all required fields');
                return;
            }
            
            // Save Flow 2 data
            videoSetCallToAction({ action: callToAction as any, link: actionLink });
            videoSetBudgetReach({
                amount: parseFloat(budget) || 0,
                impressions: parseInt(impressions) || 0,
            });
            setFlow(3); // Go to review
        }
    };
    
    const handleBack = () => {
        if (flow > 1) {
            setFlow(flow - 1);
        } else {
            navigate(-1);
        }
    };
    
    const handlePublish = async () => {
        try {
            // Create campaign
            const campaign = {
                title: videoFile?.name || 'Video Ad',
                type: 'video' as const,
                location: {
                    country: country || '',
                    state: state || '',
                },
                target: {
                    type: targetType as any,
                    genre: genre || undefined,
                    artists: selectedArtists.length > 0 ? selectedArtists : undefined,
                },
                schedule: {
                    date: scheduleDate || '',
                    startTime,
                    endTime,
                },
                budget: parseFloat(budget) || 0,
                status: 'draft' as const,
                mediaData: '', // Will be populated with actual base64
                mediaName: videoFile?.name,
                mediaSize: videoFile?.size,
            };
            
            addCampaign(campaign);
            resetVideoAds();
            setFlow(4);
            
            toast.success('Campaign created', 'Your video ad campaign has been submitted for review');
        } catch (error) {
            console.error('Publish error:', error);
            toast.error('Error', 'Failed to create campaign');
        }
    };
    
    if (flow === 4) {
        return (
            <UploadSuccessPage
                onUnderstand={() => navigate('/ads/dashboard')}
                onUploadMore={() => {
                    setFlow(1);
                    resetVideoAds();
                }}
            />
        );
    }
    
    if (flow === 3) {
        // Review Flow
        return (
            <Box>
                <HStack mb={6}>
                    <Button variant="ghost" onClick={handleBack}>
                        <Icon as={FiArrowLeft} mr={2} />
                        Back
                    </Button>
                    <Text fontSize="lg" fontWeight="bold">Review</Text>
                </HStack>
                
                <Flex gap={5} direction={{ base: 'column', lg: 'row' }}>
                    <Box flex="1">
                        <VStack align="stretch" gap={5}>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Ad Title</Text>
                                <Text fontSize="md">{title}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Location</Text>
                                <Text fontSize="md">{country}, {state}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Target</Text>
                                <Text fontSize="md">{targetType} - {genre}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Schedule</Text>
                                <Text fontSize="md">{scheduleDate} {startTime} {ampm} - {endTime} {ampm}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Call to Action</Text>
                                <Text fontSize="md">{callToAction}</Text>
                                <Text fontSize="sm" color="gray.600">{actionLink}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Budget</Text>
                                <Text fontSize="md">NGN{budget}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Reach</Text>
                                <Text fontSize="md">{impressions} impressions</Text>
                            </Box>
                        </VStack>
                    </Box>
                    
                    <Box w={{ base: 'full', lg: '400px' }} bg="gray.100" borderRadius="lg" p={4}>
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>
                            Preview
                        </Text>
                        {videoFile && (
                            <Box>
                                <video
                                    src={videoFile.url || (videoFile.file ? URL.createObjectURL(videoFile.file) : '')}
                                    controls
                                    style={{ width: '100%', borderRadius: '8px' }}
                                />
                            </Box>
                        )}
                    </Box>
                </Flex>
                
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                        bg="primary.500"
                        color="white"
                        onClick={handlePublish}
                    >
                        Publish
                        <Icon as={FiArrowRight} ml={2} />
                    </Button>
                </Flex>
            </Box>
        );
    }
    
    if (flow === 2) {
        // Flow 2: Call to Action, Budget, Reach
        return (
            <Box>
                <HStack mb={6}>
                    <Button variant="ghost" onClick={handleBack}>
                        <Icon as={FiArrowLeft} mr={2} />
                        Back
                    </Button>
                    <Text fontSize="lg" fontWeight="bold">Budget & Targeting</Text>
                </HStack>
                
                <Flex gap={5} direction={{ base: 'column', lg: 'row' }}>
                    <Box flex="1">
                        <VStack align="stretch" gap={5}>
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>Call To Action</Text>
                                <VStack align="stretch" gap={3}>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold" mb={2}>What should your ad do?</Text>
                                        <Input
                                            placeholder="Signup"
                                            value={callToAction}
                                            onChange={(e) => setCallToAction(e.target.value)}
                                            size="sm"
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Link</Text>
                                        <Input
                                            placeholder="https://"
                                            value={actionLink}
                                            onChange={(e) => setActionLink(e.target.value)}
                                            size="sm"
                                        />
                                        <Box bg="red.50" p={2} borderRadius="sm" mt={2}>
                                            <Text fontSize="xs" color="red.500">1 click = 50kobo</Text>
                                        </Box>
                                    </Box>
                                </VStack>
                            </Box>
                            
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>Budget</Text>
                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Amount (NGN)</Text>
                                    <Input
                                        placeholder="0.00"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        size="sm"
                                    />
                                </Box>
                            </Box>
                            
                            <Box>
                                <Text fontSize="lg" fontWeight="bold" mb={4}>Reach</Text>
                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>How many impressions?</Text>
                                    <Input
                                        placeholder="0"
                                        value={impressions}
                                        onChange={(e) => setImpressions(e.target.value)}
                                        size="sm"
                                    />
                                    <Box bg="red.50" p={2} borderRadius="sm" mt={2}>
                                        <Text fontSize="xs" color="red.500">1 reach = 50kobo</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </VStack>
                    </Box>
                    
                    <Box w={{ base: 'full', lg: '400px' }} bg="gray.100" borderRadius="lg" p={4}>
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>
                            Preview
                        </Text>
                        {videoFile && (
                            <Box>
                                <video
                                    src={videoFile.url || (videoFile.file ? URL.createObjectURL(videoFile.file) : '')}
                                    controls
                                    style={{ width: '100%', borderRadius: '8px' }}
                                />
                            </Box>
                        )}
                    </Box>
                </Flex>
                
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                        bg="primary.500"
                        color="white"
                        onClick={handleNext}
                    >
                        Next
                        <Icon as={FiArrowRight} ml={2} />
                    </Button>
                </Flex>
            </Box>
        );
    }
    
    // Flow 1: Upload Photo & Basic Info
    return (
        <Flex gap={5} direction={{ base: 'column', lg: 'row' }}>
            <Box flex="1">
                <VStack align="stretch" gap={5}>
                    <Box>
                        <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                            Ad Title
                        </Text>
                        <Input
                            placeholder="Ad Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            size="sm"
                            h="40px"
                        />
                    </Box>
                    
                    <Box>
                        <Text fontSize="16px" fontWeight="bold" color="gray.900" mb={3}>
                            Location
                        </Text>
                        <CountryStateSelect
                            countryValue={country}
                            stateValue={state}
                            onCountryChange={setCountry}
                            onStateChange={setState}
                        />
                    </Box>
                    
                    <Box>
                        <Text fontSize="16px" fontWeight="bold" color="gray.900" mb={3}>
                            Target
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Target Type
                                </Text>
                                <Input
                                    placeholder="Music"
                                    value={targetType}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    size="sm"
                                    h="40px"
                                />
                            </Box>
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Genre
                                </Text>
                                <Input
                                    placeholder="Genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    size="sm"
                                    h="40px"
                                />
                            </Box>
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Artist/Musician
                                </Text>
                                <Input
                                    placeholder="Search artists"
                                    value={artistInput}
                                    onChange={(e) => setArtistInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddArtist()}
                                    size="sm"
                                    h="40px"
                                />
                            </Box>
                            {selectedArtists.length > 0 && (
                                <HStack flexWrap="wrap" gap={2}>
                                    {selectedArtists.map((artist) => (
                                        <Box key={artist} bg="gray.100" px={3} py={2} borderRadius="full" display="flex" alignItems="center" gap={2}>
                                            <Text fontSize="sm">{artist}</Text>
                                            <Button size="xs" variant="ghost" onClick={() => handleRemoveArtist(artist)}>×</Button>
                                        </Box>
                                    ))}
                                </HStack>
                            )}
                        </VStack>
                    </Box>
                    
                    <Box>
                        <Text fontSize="16px" fontWeight="bold" color="gray.900" mb={3}>
                            Ad Schedule
                        </Text>
                        <VStack align="stretch" gap={3}>
                            <Box>
                                <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                    Schedule Date
                                </Text>
                                <DateInput
                                    value={scheduleDate}
                                    onChange={setScheduleDate}
                                />
                            </Box>
                            <HStack gap={3}>
                                <Box flex="1">
                                    <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                        Start Time
                                    </Text>
                                    <TimeInput
                                        value={startTime}
                                        onChange={setStartTime}
                                        period={ampm}
                                        onPeriodChange={setAmpm}
                                    />
                                </Box>
                                <Box flex="1">
                                    <Text fontSize="12px" fontWeight="semibold" color="gray.900" mb={2}>
                                        End Time
                                    </Text>
                                    <TimeInput
                                        value={endTime}
                                        onChange={setEndTime}
                                        period={ampm}
                                        onPeriodChange={setAmpm}
                                    />
                                </Box>
                            </HStack>
                        </VStack>
                    </Box>
                    
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
                    
                    <Flex justify="space-between" gap={3}>
                        <Button variant="ghost" onClick={handleBack}>
                            Back
                        </Button>
                        <Button
                            bg="primary.500"
                            color="white"
                            onClick={handleNext}
                            size="md"
                            _hover={{ bg: 'primary.600' }}
                        >
                            Next <FiArrowRight style={{ marginLeft: '8px' }} />
                        </Button>
                    </Flex>
                </VStack>
            </Box>
            
            <Box w={{ base: 'full', lg: '400px' }} bg="gray.100" borderRadius="lg" p={4}>
                <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>
                    Ads Preview
                </Text>
                {videoFile && (
                    <Box>
                        <video
                            src={videoFile.url || (videoFile.file ? URL.createObjectURL(videoFile.file) : '')}
                            controls
                            style={{ width: '100%', borderRadius: '8px' }}
                        />
                    </Box>
                )}
            </Box>
        </Flex>
    );
};
