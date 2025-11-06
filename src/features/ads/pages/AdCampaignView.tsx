import { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Flex,
    Icon,
    Grid,
    Image,
    Badge,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPause, FiEdit2, FiStopCircle, FiPlus, FiCalendar, FiMusic } from 'react-icons/fi';
import Chart from 'react-apexcharts';
import { useAdsStore } from '../store/useAdsStore';
import { PhotoAdsPhonePreview } from '../components/PhotoAdsPhonePreview';
import { VideoAdsPhonePreview } from '../components/VideoAdsPhonePreview';
import { MusicViewPhonePreview } from '../components/music-ads/MusicViewPhonePreview';
import { loadCampaignToStore } from '../utils/loadCampaignToStore';
import { AnimatedTabs } from '@shared/components';
import { HorizontalStats } from '../components/HorizontalStats';
import { TopUpModal } from '../components/TopUpModal';
import { PauseAdModal } from '../components/PauseAdModal';
import { StopAdModal } from '../components/StopAdModal';
import { ResumeAdModal } from '../components/ResumeAdModal';
import { SetSpendingLimitModal } from '../components/SetSpendingLimitModal';

export const AdCampaignView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getCampaignById, pauseCampaign, resumeCampaign, startCampaign, stopCampaign } = useAdsStore();
    const [activeChartTab, setActiveChartTab] = useState('people');
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isSpendingLimitModalOpen, setIsSpendingLimitModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

    // Get campaign data from store
    const campaign = id ? getCampaignById(id) : null;

    // Load campaign to upload store for phone previews
    useEffect(() => {
        if (campaign) {
            loadCampaignToStore(campaign);
        }
    }, [campaign]);

    if (!campaign) {
        return (
            <Box bg="#fafbfc" minH="100vh" p={6}>
                <VStack align="stretch" gap={0}>
                    <Box bg="white" display="flex" flexDirection="column" gap={8} px={6} py={6} borderRadius="11px">
                        <Text fontSize="15px" fontWeight="bold" color="black">Campaign not found</Text>
                    </Box>
                </VStack>
            </Box>
        );
    }

    // Calculate dates
    const scheduleDate = campaign.schedule.date ? new Date(campaign.schedule.date) : new Date(campaign.createdAt);
    const endDate = new Date(scheduleDate);
    // Calculate end date from schedule endTime or default to 4 days
    if (campaign.schedule.endTime) {
        const timeMatch = campaign.schedule.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
            endDate.setDate(endDate.getDate() + 1); // Add a day if endTime is specified
        }
    } else {
        endDate.setDate(endDate.getDate() + 4); // Default 4 days duration
    }
    const daysUntilEnd = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day}, ${month} ${year}`;
    };

    // Get type label
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'photo': return 'Photo Ad';
            case 'video': return 'Video Ad';
            case 'audio': return 'Audio Ad';
            default: return 'Ad';
        }
    };

    // Get audience label
    const getAudienceLabel = () => {
        if (campaign.target.genre) {
            const artists = campaign.target.artists && campaign.target.artists.length > 0
                ? `, ${campaign.target.artists.slice(0, 3).join(', ')}${campaign.target.artists.length > 3 ? '...' : ''}`
                : '';
            return `${campaign.target.genre}${artists}`;
        }
        return 'General';
    };

    // Get media preview URL
    const getMediaPreview = () => {
        if (!campaign.mediaData) return '';
        if (campaign.mediaData.startsWith('data:')) {
            return campaign.mediaData;
        }
        // Determine MIME type
        let mimeType = 'image/jpeg';
        if (campaign.mediaName) {
            const ext = campaign.mediaName.split('.').pop()?.toLowerCase();
            if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'mp4' || ext === 'webm') mimeType = 'video/mp4';
            else if (ext === 'mp3' || ext === 'wav') mimeType = 'audio/mpeg';
        } else if (campaign.type === 'video') mimeType = 'video/mp4';
        else if (campaign.type === 'audio') mimeType = 'audio/mpeg';
        return `data:${mimeType};base64,${campaign.mediaData}`;
    };

    // Mock stats (static data - these would come from analytics in a real app)
    const views = 10243532;
    const clicks = 500000;
    const impressions = 10743532;
    const spend = 15000;
    const budget = campaign.budget || 50000;
    const costPerClick = (spend / clicks).toFixed(2);
    const costPerView = (spend / views).toFixed(2);
    const vat = budget * 0.075;
    const totalWithVat = budget + vat;
    const spendPercentage = (spend / budget) * 100;

    const peopleChartOptions = {
        chart: {
            type: 'bar' as const,
            height: 239,
            toolbar: { show: false },
            fontFamily: 'Manrope, sans-serif',
            stacked: false,
        },
        colors: ['#f94444', '#ffa800'],
        dataLabels: { enabled: false },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '21px',
                endingShape: 'rounded',
                borderRadius: 1,
            },
        },
        xaxis: {
            categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            labels: {
                style: {
                    fontSize: '10px',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7b91b0'
                },
            },
        },
        yaxis: {
            min: 0,
            max: 90,
            tickAmount: 5,
            labels: {
                style: {
                    fontSize: '10px',
                    fontFamily: 'Manrope, sans-serif',
                    color: '#7b91b0'
                },
                formatter: (value: number) => `${value}%`,
            },
        },
        grid: {
            show: true,
            strokeDashArray: 3,
        },
        legend: { show: false },
    };

    const peopleChartSeries = [
        { name: 'Men', data: [75, 55, 25, 65, 25, 80, 68] },
        { name: 'Women', data: [40, 15, 38, 85, 23, 18, 32] }
    ];


    return (
        <>
            <Box bg="#fafbfc" minH="100vh" p={6}>
                <VStack align="stretch" gap={0}>
                    <Box bg="white" display="flex" flexDirection="column" gap={8} px={6} py={6} borderRadius="11px">
                        {/* Header with Title and Badge */}
                        <Flex justify="space-between" align="flex-start" mb={4}>
                            <VStack align="start" gap={2}>
                                <Text fontSize="23px" fontWeight="bold" color="black">
                                    {campaign.title}
                                </Text>

                            </VStack>
                            <Flex gap={2}>
                                {campaign.isPaused ? (
                                    <Button
                                        bg="#fff5f5"
                                        color="#f94444"
                                        fontSize="11px"
                                        fontWeight="bold"
                                        h="31px"
                                        px={3}
                                        borderRadius="5px"
                                        onClick={() => setIsResumeModalOpen(true)}
                                        _hover={{ bg: '#ffe5e5' }}
                                    >
                                        <FiPause size={13} /> Resume Ad
                                    </Button>
                                ) : (
                                    <Button
                                        bg="#fff5f5"
                                        color="#f94444"
                                        fontSize="11px"
                                        fontWeight="bold"
                                        h="31px"
                                        px={3}
                                        borderRadius="5px"
                                        onClick={() => setIsPauseModalOpen(true)}
                                        _hover={{ bg: '#ffe5e5' }}
                                    >
                                        <FiPause size={13} /> Pause Ad
                                    </Button>
                                )}
                                <Button
                                    bg="#fff5f5"
                                    color="#f94444"
                                    fontSize="11px"
                                    fontWeight="bold"
                                    h="31px"
                                    px={3}
                                    borderRadius="5px"
                                    onClick={() => navigate(`/ads/create-campaign?tab=${campaign.type}&id=${campaign.id}`)}
                                    _hover={{ bg: '#ffe5e5' }}
                                >
                                    <FiEdit2 size={13} /> Edit Ad
                                </Button>
                                {campaign.isStopped ? (
                                    <Button
                                        bg="#4ab58e"
                                        color="white"
                                        fontSize="11px"
                                        fontWeight="bold"
                                        h="31px"
                                        px={3}
                                        borderRadius="5px"
                                        onClick={() => id && startCampaign(id)}
                                        _hover={{ bg: '#3a9d7a' }}
                                    >
                                        <FiStopCircle size={13} /> Start Ad
                                    </Button>
                                ) : (
                                    <Button
                                        bg="#f94444"
                                        color="white"
                                        fontSize="11px"
                                        fontWeight="bold"
                                        h="31px"
                                        px={3}
                                        borderRadius="5px"
                                        onClick={() => setIsStopModalOpen(true)}
                                        _hover={{ bg: '#e53939' }}
                                    >
                                        <FiStopCircle size={13} /> Stop Ad
                                    </Button>
                                )}
                            </Flex>
                        </Flex>


                        <Box display="flex" flexDirection="column" gap={4}>
                            {/* Ad Info Card */}
                            <Flex gap={4} align="start" p={4} borderRadius="7px">
                                <Box w="149px" h="149px" bg="gray.300" borderRadius="7px" flexShrink={0} overflow="hidden" position="relative">
                                    {campaign.mediaData && (
                                        <>
                                            {campaign.type === 'photo' ? (
                                                <Image
                                                    src={getMediaPreview()}
                                                    alt={campaign.title}
                                                    w="full"
                                                    h="full"
                                                    objectFit="cover"
                                                />
                                            ) : campaign.type === 'video' ? (
                                                <Box w="full" h="full" overflow="hidden" position="relative">
                                                    <video
                                                        src={getMediaPreview()}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                        controls={false}
                                                        muted
                                                        playsInline
                                                    />
                                                </Box>
                                            ) : (
                                                <Box
                                                    w="full"
                                                    h="full"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    bg="gray.200"
                                                >
                                                    <Icon as={FiMusic} w={8} h={8} color="gray.500" />
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Box>

                                <Box display="flex" flexDirection="column" gap={4} flex="1">
                                    <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                                        <Text fontSize="12px" color="#f94444" fontWeight="semibold">
                                            Ad ends in {daysUntilEnd} days ({formatDate(endDate.toISOString())})
                                        </Text>
                                        {(campaign.isStopped || campaign.isPaused || campaign.status === 'active') && (
                                            <Badge
                                                bg={
                                                    campaign.isStopped
                                                        ? '#f94444'
                                                        : campaign.isPaused
                                                            ? '#ffa800'
                                                            : '#4ab58e'
                                                }
                                                color="white"
                                                fontSize="10px"
                                                fontWeight="bold"
                                                px={3}
                                                py={1}
                                                borderRadius="19px"
                                                ml={2}
                                            >
                                                {campaign.isStopped
                                                    ? 'Inactive'
                                                    : campaign.isPaused
                                                        ? 'Paused'
                                                        : 'Active'}
                                            </Badge>
                                        )}
                                    </Box>

                                    <Grid templateColumns="repeat(4, 1fr)" gap={3} flex="1">
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Ad Type</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{getTypeLabel(campaign.type)}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Plays/Views</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{views.toLocaleString()}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Spend</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">N{spend.toLocaleString()}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Budget</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">N{budget.toLocaleString()}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Publish Date</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{formatDate(campaign.schedule.date || campaign.createdAt)}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">End Date</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{formatDate(endDate.toISOString())}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Clicks</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{clicks.toLocaleString()}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Audience</Text>
                                            <Text fontSize="11px" fontWeight="bold" color="black">{getAudienceLabel()}</Text>
                                        </VStack>
                                    </Grid>
                                </Box>

                            </Flex>

                            <Box display="flex" flexDirection="column">
                                <Box w="full" display="flex" justifyContent="space-between" alignItems="center" gap={4} borderY="1px solid" borderColor="gray.200" py={6}>
                                    {/* Total Amount Spent */}
                                    <HStack align="center" gap="20px">
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Text fontSize="11px" color="#999" fontWeight="medium" whiteSpace="nowrap">Total amount spent</Text>
                                            <Text fontSize="11px" fontWeight="bold" color="black">NGN{spend.toLocaleString()}</Text>
                                        </Box>

                                        <Box display="flex" alignItems="center" gap="60px" border="1px solid" borderColor="gray.200" borderRadius="9px" p={2}>
                                            <Box display="flex" alignItems="center" gap="10px">
                                                <Box flex="1" h="5px" bg="primary.200" w="149px" borderRadius="2px" overflow="hidden">
                                                    <Box h="full" bg="#f94444" w={`${spendPercentage}%`} />
                                                </Box>

                                                <Box
                                                    w="14px"
                                                    h="14px"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    borderRadius="50%"
                                                    bg="primary.500"
                                                    color="white"
                                                    boxShadow="md"
                                                >
                                                    <svg width="8" height="8" viewBox="0 0 18 18" fill="none">
                                                        <rect x="4" y="4" width="3" height="10" rx="1.5" fill="white" />
                                                        <rect x="11" y="4" width="3" height="10" rx="1.5" fill="white" />
                                                    </svg>
                                                </Box>
                                            </Box>

                                            <Button
                                                bg="#f94444"
                                                color="white"
                                                fontSize="10px"
                                                fontWeight="bold"
                                                h="29px"
                                                px={2}
                                                borderRadius="3px"
                                                onClick={() => setIsSpendingLimitModalOpen(true)}
                                                _hover={{ bg: '#e53939' }}
                                            >
                                                Set Spending Limit
                                            </Button>
                                        </Box>

                                    </HStack>

                                    {/* Wallet Balance */}
                                    <Box>
                                        <Flex gap={4} align="center" mb={3}>
                                            <VStack align="start" gap={0}>
                                                <Text fontSize="11px" color="#999" fontWeight="medium">Wallet Balance</Text>
                                                <Text fontSize="11px" fontWeight="bold" color="black">NGN{budget.toLocaleString()}</Text>
                                            </VStack>
                                            <Button
                                                bg="#f94444"
                                                color="white"
                                                fontSize="11px"
                                                fontWeight="bold"
                                                h="28px"
                                                px={2}
                                                borderRadius="4px"
                                                onClick={() => setIsTopUpModalOpen(true)}
                                                _hover={{ bg: '#e53939' }}
                                            >
                                                <FiPlus size={11} /> Top Up
                                            </Button>
                                        </Flex>
                                    </Box>
                                </Box>



                                {/* Main Grid */}
                                <Box display="flex" w="full">
                                    {/* Left Column */}
                                    <VStack align="stretch" gap={8} flex="5" pt={6} pr={6}>

                                        {/* Audience Section */}
                                        <Box>
                                            <Flex justify="space-between" align="center" mb={4}>
                                                <Text fontSize="15px" fontWeight="bold" color="black">Audience</Text>
                                                <Flex align="center" gap={2} bg="#f9f9f9" px={3} py={1.5} borderRadius="5px">
                                                    <Icon as={FiCalendar} w={4} h={4} color="#666" />
                                                    <Text fontSize="11px" fontWeight="medium" color="#666">Today</Text>
                                                </Flex>
                                            </Flex>
                                            <Text fontSize="11px" color="#666" mb={4}>
                                                This ad reached {clicks.toLocaleString()} audience from your configuration
                                            </Text>

                                            <Box mb={4}>
                                                <AnimatedTabs
                                                    tabs={[
                                                        { id: 'people', label: 'People' },
                                                        { id: 'location', label: 'Location' },
                                                    ]}
                                                    activeTab={activeChartTab}
                                                    onTabChange={setActiveChartTab}
                                                    tabStyle={3}
                                                    size='sm'
                                                    selectedColor="primary.500"
                                                />
                                            </Box>



                                            <Box w="full" overflow="hidden">
                                                {activeChartTab === 'people' && (
                                                    <>
                                                        <HStack gap={4} mb={4}>
                                                            <Text fontSize="10px" color="#f94444" fontWeight="medium">15% Men</Text>
                                                            <Text fontSize="10px" color="#ffa800" fontWeight="medium">15% Women</Text>
                                                        </HStack>
                                                        <Chart
                                                            options={peopleChartOptions}
                                                            series={peopleChartSeries}
                                                            type="bar"
                                                            width="100%"
                                                            height={239}
                                                        />
                                                    </>

                                                )}
                                                {activeChartTab === 'location' && (
                                                    <HorizontalStats
                                                        data={[
                                                            { label: 'Lagos State', value: 10243532 },
                                                            { label: 'Abuja (Federal Capital Territory)', value: 8000000 },
                                                            { label: 'Ogun State', value: 6000000 },
                                                            { label: 'Rivers State', value: 5500000 },
                                                        ]}
                                                        barColor="#f94444"
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Performance Section */}
                                        <Box>
                                            <Text fontSize="15px" fontWeight="bold" color="black" mb={4}>Performance</Text>
                                            <Text fontSize="12px" color="#666" mb={4}>
                                                <Text as="span" fontWeight="bold" color="#f94444">N{spend.toLocaleString()}</Text> spents over 4 days
                                            </Text>
                                            <HorizontalStats
                                                data={[
                                                    { label: 'Views', value: views },
                                                    { label: 'Clicks on CTA', value: clicks },
                                                ]}
                                                barColor="#f94444"
                                            />
                                        </Box>

                                        {/* Activities Section */}
                                        <Box>
                                            <Text fontSize="15px" fontWeight="bold" color="black" mb={4}>Activities</Text>
                                            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} border="1px solid #ffcebf" borderRadius="5px" p={3} textAlign="center">
                                                    <Text fontSize="11px" color="#666" fontWeight="medium" mb={1}>Link Visit</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">{clicks.toLocaleString()}</Text>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} border="1px solid #ffcebf" borderRadius="5px" p={3} textAlign="center">
                                                    <Text fontSize="11px" color="#666" fontWeight="medium" mb={1}>Reach</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">{impressions.toLocaleString()}</Text>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} border="1px solid #ffcebf" borderRadius="5px" p={3} textAlign="center">
                                                    <Text fontSize="11px" color="#666" fontWeight="medium" mb={1}>Cost Per Click</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">N{costPerClick}</Text>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} border="1px solid #ffcebf" borderRadius="5px" p={3} textAlign="center">
                                                    <Text fontSize="11px" color="#666" fontWeight="medium" mb={1}>Cost Per View</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">N{costPerView}</Text>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </VStack>

                                    {/* Right Sidebar */}
                                    <VStack flex="3" align="stretch" gap={6} borderLeft="1px solid" borderLeftColor="gray.200">
                                        {/* Amount Spent Breakdown */}
                                        <Box borderRadius="7px" p={6}>
                                            <Text fontSize="15px" fontWeight="bold" color="black" mb={4}>Amount Spent</Text>
                                            <VStack align="stretch" gap={3}>
                                                <Flex direction="row" justify="space-between">
                                                    <Text fontSize="11px" color="#666">Ad Budget</Text>
                                                    <Text fontSize="11px" fontWeight="bold" color="#f94444">N{budget.toLocaleString()}.00</Text>
                                                </Flex>
                                                <Flex direction="row" justify="space-between">
                                                    <Text fontSize="11px" color="#666">Estimated VAT(7.5%)</Text>
                                                    <Text fontSize="11px" fontWeight="bold" color="#f94444">N{vat.toFixed(2)}</Text>
                                                </Flex>
                                                <Box h="1px" bg="gray.300" />
                                                <Flex direction="row" justify="space-between">
                                                    <Text fontSize="12px" fontWeight="bold" color="black">Total</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">N{totalWithVat.toFixed(2)}</Text>
                                                </Flex>
                                            </VStack>
                                        </Box>

                                        {/* Preview */}
                                        <Box p={6} borderRadius="7px" borderTop="1px solid" borderTopColor="gray.200">
                                            <Text fontSize="15px" fontWeight="bold" color="black" mb={3}>Preview</Text>
                                            <Box transform="scale(0.8)" mt="-70px">

                                                <VStack align="center" gap={2}>
                                                    <Flex justify="center" w="full">
                                                        {campaign.type === 'photo' && <PhotoAdsPhonePreview />}
                                                        {campaign.type === 'video' && <VideoAdsPhonePreview />}
                                                        {campaign.type === 'audio' && <MusicViewPhonePreview />}
                                                    </Flex>
                                                </VStack>
                                            </Box>
                                        </Box>

                                    </VStack>
                                </Box>
                            </Box>



                        </Box>




                    </Box>
                </VStack>
            </Box>

            {/* Modals */}
            <PauseAdModal
                isOpen={isPauseModalOpen}
                onClose={() => setIsPauseModalOpen(false)}
                onConfirm={() => id && pauseCampaign(id)}
            />
            <StopAdModal
                isOpen={isStopModalOpen}
                onClose={() => setIsStopModalOpen(false)}
                onConfirm={() => id && stopCampaign(id)}
            />
            <ResumeAdModal
                isOpen={isResumeModalOpen}
                onClose={() => setIsResumeModalOpen(false)}
                onConfirm={() => id && resumeCampaign(id)}
            />
            <SetSpendingLimitModal
                isOpen={isSpendingLimitModalOpen}
                onClose={() => setIsSpendingLimitModalOpen(false)}
                onConfirm={(limit) => {
                    // TODO: Implement spending limit update in store
                    console.log('Set spending limit:', limit);
                }}
                currentSpend={spend}
                maxBudget={budget}
            />
            <TopUpModal
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                onComplete={() => {
                    // TODO: Implement top up completion logic
                    console.log('Top up completed');
                }}
            />
        </>
    );
};

export default AdCampaignView;