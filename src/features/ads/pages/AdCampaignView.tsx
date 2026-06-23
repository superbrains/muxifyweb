import { useCallback, useEffect, useState } from 'react';
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
    Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPause, FiEdit2, FiStopCircle, FiPlus, FiCalendar, FiMusic } from 'react-icons/fi';
import { useAdsStore } from '../store/useAdsStore';
import { PhotoAdsPhonePreview } from '../components/PhotoAdsPhonePreview';
import { VideoAdsPhonePreview } from '../components/VideoAdsPhonePreview';
import { MusicViewPhonePreview } from '../components/music-ads/MusicViewPhonePreview';
import { loadCampaignToStore } from '../utils/loadCampaignToStore';
import { AnimatedTabs } from '@shared/components';
import { HorizontalStats } from '../components/HorizontalStats';
import { PauseAdModal } from '../components/PauseAdModal';
import { StopAdModal } from '../components/StopAdModal';
import { ResumeAdModal } from '../components/ResumeAdModal';
import { SetSpendingLimitModal } from '../components/SetSpendingLimitModal';
import { adsService } from '../services/adsService';
import { useToast } from '@/shared/hooks/useToast';
import { useAuthedImageSrc } from '@/shared/hooks/useAuthedImageSrc';
import { normalizeCampaignStatus, type AdCampaignDto, type CampaignAnalyticsDto } from '../types';

export const AdCampaignView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        getCampaignById,
        pauseCampaign,
        resumeCampaign,
        startCampaign,
        stopCampaign,
        fetchCampaignById,
        wallet,
        fetchWallet,
        isLoadingCampaign,
    } = useAdsStore();
    const [activeChartTab, setActiveChartTab] = useState('people');
    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const [isSpendingLimitModalOpen, setIsSpendingLimitModalOpen] = useState(false);
    const [campaignDto, setCampaignDto] = useState<AdCampaignDto | null>(null);
    const [analytics, setAnalytics] = useState<CampaignAnalyticsDto | null>(null);
    const { toast } = useToast();

    // Get campaign data from store (local first, then try API)
    const localCampaign = id ? getCampaignById(id) : null;

    // Fetch campaign from API if not in local store
    useEffect(() => {
        if (id && !localCampaign) {
            fetchCampaignById(id).then((dto) => {
                if (dto) setCampaignDto(dto);
            });
        }
        fetchWallet();
    }, [id, localCampaign, fetchCampaignById, fetchWallet]);

    // Fetch real per-campaign analytics (people / location / performance / duration).
    const loadAnalytics = useCallback(() => {
        if (id) adsService.getCampaignAnalytics(id).then(setAnalytics).catch(() => setAnalytics(null));
    }, [id]);
    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // Use local campaign or convert DTO to local format
    const campaign = localCampaign || (campaignDto ? {
        id: campaignDto.id,
        title: campaignDto.name,
        type: (campaignDto.format || 'photo') as 'photo' | 'video' | 'audio',
        location: { country: 'Nigeria', state: '' },
        target: { type: (campaignDto.format === 'audio' ? 'music' : campaignDto.format || 'photo') as 'music' | 'video' | 'audio' | 'photo' },
        schedule: {
            date: campaignDto.startDate,
            startTime: '',
            endTime: campaignDto.endDate || '',
        },
        budget: campaignDto.budgetDisplay,
        status: normalizeCampaignStatus(campaignDto.status),
        isPaused: normalizeCampaignStatus(campaignDto.status) === 'paused',
        isStopped: ['stopped', 'completed'].includes(normalizeCampaignStatus(campaignDto.status)),
        createdAt: campaignDto.createdAt,
        updatedAt: campaignDto.createdAt,
        mediaData: campaignDto.creativeUrl,
        coverImageUrl: campaignDto.coverImageUrl,
        impressions: campaignDto.impressions,
        clicks: campaignDto.clicks,
        amountSpent: campaignDto.amountSpentDisplay,
    } : null);

    // The visual to show: cover image when present (audio ads carry the audio in
    // mediaData), else the creative. Resolve the JWT-gated proxy path to a blob URL.
    const resolvedVisual = useAuthedImageSrc(campaign?.coverImageUrl ?? campaign?.mediaData);
    const hasVideoCreative = campaign?.type === 'video' && !campaign?.coverImageUrl;

    // Load campaign to upload store for phone previews
    useEffect(() => {
        if (campaign) {
            loadCampaignToStore(campaign);
        }
    }, [campaign]);

    if (isLoadingCampaign) {
        return (
            <Box bg="#fafbfc" minH="100vh" p={6}>
                <VStack align="stretch" gap={0}>
                    <Box bg="white" display="flex" flexDirection="column" gap={8} px={6} py={6} borderRadius="11px" alignItems="center">
                        <Spinner size="lg" color="primary.500" />
                        <Text fontSize="15px" fontWeight="bold" color="black">Loading campaign...</Text>
                    </Box>
                </VStack>
            </Box>
        );
    }

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

    // Real campaign dates: start/end come from the campaign + analytics, never a hardcoded duration.
    const startDate = analytics?.startDate
        ? new Date(analytics.startDate)
        : campaign.schedule.date
            ? new Date(campaign.schedule.date)
            : new Date(campaign.createdAt);
    const realEndIso = analytics?.endDate ?? campaignDto?.endDate ?? (campaign.schedule.endTime || null);
    const endDate = realEndIso ? new Date(realEndIso) : null;
    const durationDays = analytics?.durationDays
        ?? (endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)) : null);
    const daysUntilEnd = endDate
        ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000))
        : null;

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

    // Real campaign stats (prefer analytics; fall back to the campaign DTO).
    const views = analytics?.impressions ?? campaign.impressions ?? 0;
    const clicks = analytics?.clicks ?? campaign.clicks ?? 0;
    const impressions = views;
    const spend = analytics?.amountSpentDisplay ?? campaign.amountSpent ?? 0;
    const budget = analytics?.budgetDisplay ?? campaign.budget ?? 0;
    const walletBalance = wallet?.balanceDisplay ?? 0;
    const costPerClick = (analytics?.costPerClick ?? (clicks > 0 ? spend / clicks : 0)).toFixed(2);
    const costPerView = (analytics?.costPerImpression ?? (views > 0 ? spend / views : 0)).toFixed(2);
    const vat = budget * 0.075;
    const totalWithVat = budget + vat;
    const spendPercentage = budget > 0 ? Math.min(100, (spend / budget) * 100) : 0;

    // Real People (gender × age band) and Location breakdowns.
    const peopleStats = (analytics?.people ?? [])
        .filter((p) => p.impressions > 0)
        .slice(0, 6)
        .map((p) => ({ label: `${p.gender} · ${p.ageBand}`, value: p.impressions }));
    const locationStats = (analytics?.location ?? [])
        .filter((l) => l.impressions > 0)
        .slice(0, 6)
        .map((l) => ({ label: l.state && l.state !== 'Unknown' ? `${l.state}, ${l.country}` : l.country, value: l.impressions }));

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
                                    {hasVideoCreative ? (
                                        resolvedVisual ? (
                                            <video
                                                src={resolvedVisual}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                controls={false}
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center" bg="gray.200">
                                                <Icon as={FiMusic} w={8} h={8} color="gray.500" />
                                            </Box>
                                        )
                                    ) : resolvedVisual ? (
                                        // Photo and audio ads both show an image (audio uses its cover art).
                                        <Image
                                            src={resolvedVisual}
                                            alt={campaign.title}
                                            w="full"
                                            h="full"
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center" bg="gray.200">
                                            <Icon as={FiMusic} w={8} h={8} color="gray.500" />
                                        </Box>
                                    )}
                                </Box>

                                <Box display="flex" flexDirection="column" gap={4} flex="1">
                                    <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                                        <Text fontSize="12px" color="#f94444" fontWeight="semibold">
                                            {endDate
                                                ? `Ad ends in ${daysUntilEnd} day${daysUntilEnd === 1 ? '' : 's'} (${formatDate(endDate.toISOString())})`
                                                : 'Ongoing campaign'}
                                        </Text>
                                        {(() => {
                                            const label = campaign.status === 'completed'
                                                ? 'Completed'
                                                : campaign.isStopped
                                                    ? 'Inactive'
                                                    : campaign.isPaused
                                                        ? 'Paused'
                                                        : campaign.status === 'active'
                                                            ? 'Active'
                                                            : campaign.status === 'pending'
                                                                ? 'In Review'
                                                                : campaign.status === 'rejected'
                                                                    ? 'Rejected'
                                                                    : 'Draft';
                                            const color = campaign.status === 'completed'
                                                ? '#666'
                                                : campaign.isStopped
                                                    ? '#f94444'
                                                    : campaign.isPaused
                                                        ? '#ffa800'
                                                        : campaign.status === 'active'
                                                            ? '#4ab58e'
                                                            : campaign.status === 'pending'
                                                                ? '#ffa800'
                                                                : campaign.status === 'rejected'
                                                                    ? '#f94444'
                                                                    : '#666';
                                            return (
                                                <Badge
                                                    bg={color}
                                                    color="white"
                                                    fontSize="10px"
                                                    fontWeight="bold"
                                                    px={3}
                                                    py={1}
                                                    borderRadius="19px"
                                                    ml={2}
                                                >
                                                    {label}
                                                </Badge>
                                            );
                                        })()}
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
                                            <Text fontSize="12px" fontWeight="bold" color="black">₦{spend.toLocaleString()}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Budget</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">₦{budget.toLocaleString()}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">Publish Date</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{formatDate(campaign.schedule.date || campaign.createdAt)}</Text>
                                        </VStack>
                                        <VStack align="start" gap={2}>
                                            <Text fontSize="10px" color="#999" fontWeight="medium">End Date</Text>
                                            <Text fontSize="12px" fontWeight="bold" color="black">{endDate ? formatDate(endDate.toISOString()) : '—'}</Text>
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
                                            <Text fontSize="11px" fontWeight="bold" color="black">₦{spend.toLocaleString()}</Text>
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
                                                <Text fontSize="11px" fontWeight="bold" color="black">₦{walletBalance.toLocaleString()}</Text>
                                            </VStack>
                                            <Button
                                                bg="#f94444"
                                                color="white"
                                                fontSize="11px"
                                                fontWeight="bold"
                                                h="28px"
                                                px={2}
                                                borderRadius="4px"
                                                onClick={() => navigate('/ads/payments')}
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
                                                This ad reached {views.toLocaleString()} {views === 1 ? 'person' : 'people'} from your configuration
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
                                                    peopleStats.length > 0 ? (
                                                        <HorizontalStats data={peopleStats} barColor="#f94444" />
                                                    ) : (
                                                        <Text fontSize="xs" color="#666" py={6} textAlign="center">
                                                            No audience data yet — demographics appear once your ad starts serving.
                                                        </Text>
                                                    )
                                                )}
                                                {activeChartTab === 'location' && (
                                                    locationStats.length > 0 ? (
                                                        <HorizontalStats data={locationStats} barColor="#f94444" />
                                                    ) : (
                                                        <Text fontSize="xs" color="#666" py={6} textAlign="center">
                                                            No location data yet — your reach map fills in as impressions come in.
                                                        </Text>
                                                    )
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Performance Section */}
                                        <Box>
                                            <Text fontSize="15px" fontWeight="bold" color="black" mb={4}>Performance</Text>
                                            <Text fontSize="12px" color="#666" mb={4}>
                                                <Text as="span" fontWeight="bold" color="#f94444">₦{spend.toLocaleString()}</Text>
                                                {durationDays ? ` spent over ${durationDays} day${durationDays === 1 ? '' : 's'}` : ' spent so far'}
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
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">₦{costPerClick}</Text>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} border="1px solid #ffcebf" borderRadius="5px" p={3} textAlign="center">
                                                    <Text fontSize="11px" color="#666" fontWeight="medium" mb={1}>Cost Per View</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">₦{costPerView}</Text>
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
                                                    <Text fontSize="11px" fontWeight="bold" color="#f94444">₦{budget.toLocaleString()}.00</Text>
                                                </Flex>
                                                <Flex direction="row" justify="space-between">
                                                    <Text fontSize="11px" color="#666">Estimated VAT(7.5%)</Text>
                                                    <Text fontSize="11px" fontWeight="bold" color="#f94444">₦{vat.toFixed(2)}</Text>
                                                </Flex>
                                                <Box h="1px" bg="gray.300" />
                                                <Flex direction="row" justify="space-between">
                                                    <Text fontSize="12px" fontWeight="bold" color="black">Total</Text>
                                                    <Text fontSize="12px" fontWeight="bold" color="#f94444">₦{totalWithVat.toFixed(2)}</Text>
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
                onConfirm={async (limit) => {
                    if (!id) return;
                    try {
                        // Persist the daily spending limit (minor units) on the campaign.
                        await adsService.updateCampaign(id, { dailyLimit: Math.round(limit * 100) });
                        toast.success('Spending limit set', `Daily limit updated to ₦${limit.toLocaleString()}`);
                        loadAnalytics();
                    } catch (e) {
                        toast.error('Could not set limit', e instanceof Error ? e.message : 'Please try again.');
                    }
                }}
                currentSpend={spend}
                maxBudget={budget}
            />
        </>
    );
};

export default AdCampaignView;