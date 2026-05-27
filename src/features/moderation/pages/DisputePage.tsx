import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Icon,
    Spinner,
    Tag,
    Text,
    VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
    FiAlertTriangle,
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiFlag,
    FiHelpCircle,
    FiInfo,
    FiMail,
    FiXCircle,
} from 'react-icons/fi';
import { DisputeForm } from '@shared/components';
import { AuthedImage } from '@shared/components/AuthedImage';
import { toaster } from '@/components/ui/toaster-instance';
import {
    useOwnerTrack,
    useOwnerVideo,
} from '../hooks/useOwnerContent';
import { useDisputeTrack, useDisputeVideo } from '../hooks/useDispute';
import type {
    DuplicateMatchStatus,
    DuplicateMatchSummary,
    DuplicateMatchTier,
} from '@shared/types/duplicateMatch';
import type { TrackDto } from '@uploadMusic/types';
import type { VideoDto } from '@uploadVideo/types';
import type { AxiosError } from 'axios';

// ---------------------------------------------------------------------------
// Visual helpers — kept colocated so future copy edits stay in one place.
// ---------------------------------------------------------------------------

const TIER_PALETTE: Record<DuplicateMatchTier, { bg: string; fg: string; label: string }> = {
    Exact: { bg: 'red.50', fg: 'red.700', label: 'Exact match' },
    High: { bg: 'orange.50', fg: 'orange.700', label: 'High confidence' },
    Medium: { bg: 'yellow.50', fg: 'yellow.800', label: 'Medium confidence' },
    Low: { bg: 'gray.100', fg: 'gray.700', label: 'Low confidence' },
};

const MATCH_METHOD_COPY: Record<string, string> = {
    sha256: 'Exact file hash',
    chromaprint: 'Audio fingerprint',
    'video-phash': 'Visual fingerprint',
    'video-audio': 'Audio track inside the video',
};

function humanizeMethod(method: string): string {
    return MATCH_METHOD_COPY[method] ?? method;
}

function formatDate(value?: string | null): string {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

// ---------------------------------------------------------------------------
// Type guard — narrows the route param.
// ---------------------------------------------------------------------------

type ContentType = 'track' | 'video';

function isContentType(value: string | undefined): value is ContentType {
    return value === 'track' || value === 'video';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const DisputePage: React.FC = () => {
    const { contentType, contentId = '' } = useParams<{
        contentType: string;
        contentId: string;
    }>();

    if (!isContentType(contentType)) {
        return (
            <DisputeChrome>
                <UnknownContentState
                    title="Unknown content type"
                    description="That dispute link is malformed. Head back to your dashboard to find the affected upload."
                />
            </DisputeChrome>
        );
    }

    return contentType === 'track' ? (
        <TrackDispute contentId={contentId} />
    ) : (
        <VideoDispute contentId={contentId} />
    );
};

export default DisputePage;

// ---------------------------------------------------------------------------
// Track variant
// ---------------------------------------------------------------------------

const TrackDispute: React.FC<{ contentId: string }> = ({ contentId }) => {
    const { data, isLoading, error } = useOwnerTrack(contentId);
    const dispute = useDisputeTrack(contentId);

    return (
        <DisputeChrome>
            <DisputeBody
                contentType="track"
                contentId={contentId}
                isLoading={isLoading}
                error={error as AxiosError | null}
                title={data?.title}
                artist={data?.artist}
                thumbnail={data?.thumbnail}
                heldForDuplicateReview={data?.heldForDuplicateReview ?? false}
                duplicateMatch={data?.duplicateMatch ?? null}
                onDispute={async (reason) => dispute.mutateAsync(reason)}
                isSubmitting={dispute.isPending}
                detailHref={data ? `/music-videos/single/${data.id}` : null}
                resolveMatchedHref={(match) => matchedHref(match, 'track')}
            />
        </DisputeChrome>
    );
};

// ---------------------------------------------------------------------------
// Video variant
// ---------------------------------------------------------------------------

const VideoDispute: React.FC<{ contentId: string }> = ({ contentId }) => {
    const { data, isLoading, error } = useOwnerVideo(contentId);
    const dispute = useDisputeVideo(contentId);

    return (
        <DisputeChrome>
            <DisputeBody
                contentType="video"
                contentId={contentId}
                isLoading={isLoading}
                error={error as AxiosError | null}
                title={data?.title}
                artist={data?.artist}
                thumbnail={data?.thumbnail}
                heldForDuplicateReview={data?.heldForDuplicateReview ?? false}
                duplicateMatch={data?.duplicateMatch ?? null}
                onDispute={async (reason) => dispute.mutateAsync(reason)}
                isSubmitting={dispute.isPending}
                detailHref={data ? `/music-videos/video/${data.id}` : null}
                resolveMatchedHref={(match) => matchedHref(match, 'video')}
            />
        </DisputeChrome>
    );
};

function matchedHref(
    match: DuplicateMatchSummary,
    suspectType: ContentType,
): string | null {
    // Match-type generally mirrors suspect type, but be defensive: fall back to
    // whichever side carries an id.
    if (suspectType === 'track' && match.matchedTrackId) {
        return `/music-videos/single/${match.matchedTrackId}`;
    }
    if (suspectType === 'video' && match.matchedVideoId) {
        return `/music-videos/video/${match.matchedVideoId}`;
    }
    if (match.matchedTrackId) return `/music-videos/single/${match.matchedTrackId}`;
    if (match.matchedVideoId) return `/music-videos/video/${match.matchedVideoId}`;
    return null;
}

// ---------------------------------------------------------------------------
// Shared chrome — the surrounding container and back nav.
// ---------------------------------------------------------------------------

const DisputeChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    return (
        <Box p={{ base: 4, md: 8, lg: 10 }} maxW="1100px" mx="auto">
            <HStack mb={6} gap={3}>
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    size="sm"
                    color="gray.blue.700"
                    px={2}
                    _hover={{ bg: 'gray.100' }}
                >
                    <Icon as={FiArrowLeft} mr={1} /> Back
                </Button>
                <Text fontSize="xs" color="gray.500">
                    Music &amp; Videos · Disputes
                </Text>
            </HStack>
            {children}
        </Box>
    );
};

// ---------------------------------------------------------------------------
// Shared body — branches between loading, error, not-held, and the live UI.
// ---------------------------------------------------------------------------

interface DisputeBodyProps {
    contentType: ContentType;
    contentId: string;
    isLoading: boolean;
    error: AxiosError | null;
    title?: string;
    artist?: string;
    thumbnail?: string | null;
    heldForDuplicateReview: boolean;
    duplicateMatch: DuplicateMatchSummary | null;
    onDispute: (reason: string) => Promise<TrackDto | VideoDto>;
    isSubmitting: boolean;
    detailHref: string | null;
    resolveMatchedHref: (match: DuplicateMatchSummary) => string | null;
}

const DisputeBody: React.FC<DisputeBodyProps> = ({
    contentType,
    contentId,
    isLoading,
    error,
    title,
    artist,
    thumbnail,
    heldForDuplicateReview,
    duplicateMatch,
    onDispute,
    isSubmitting,
    detailHref,
    resolveMatchedHref,
}) => {
    if (isLoading) {
        return (
            <Flex justify="center" py={20}>
                <Spinner size="lg" color="primary.500" />
            </Flex>
        );
    }

    if (error) {
        const status = error.response?.status;
        if (status === 404) {
            return (
                <UnknownContentState
                    title="Content not found"
                    description="We couldn't find that upload. It may have been removed."
                />
            );
        }
        if (status === 403) {
            return (
                <UnknownContentState
                    title="Not authorized"
                    description="You don't have permission to view this dispute. Make sure you're signed in as the account that uploaded the content."
                />
            );
        }
        return (
            <UnknownContentState
                title="Something went wrong"
                description="We couldn't load this dispute right now. Please try again in a moment."
            />
        );
    }

    if (!duplicateMatch || !heldForDuplicateReview) {
        // The hold may have already been resolved upstream — surface the latest
        // status if we still have a match record, else send the artist back.
        if (duplicateMatch) {
            return (
                <ResolvedOutcome
                    contentType={contentType}
                    title={title ?? 'Your upload'}
                    artist={artist}
                    thumbnail={thumbnail}
                    duplicateMatch={duplicateMatch}
                    detailHref={detailHref}
                    resolveMatchedHref={resolveMatchedHref}
                />
            );
        }
        return (
            <UnknownContentState
                title="This upload is no longer under review"
                description="Either the duplicate-detection screen cleared it or it has already been resolved. You can return to your library to see its current state."
                actionHref={detailHref ?? '/music-videos'}
                actionLabel="Back to my library"
            />
        );
    }

    return (
        <ActiveDispute
            contentType={contentType}
            contentId={contentId}
            title={title ?? 'Your upload'}
            artist={artist}
            thumbnail={thumbnail}
            duplicateMatch={duplicateMatch}
            onDispute={onDispute}
            isSubmitting={isSubmitting}
            detailHref={detailHref}
            resolveMatchedHref={resolveMatchedHref}
        />
    );
};

// ---------------------------------------------------------------------------
// The "you have an active hold" UI — dispute form, submitted state, etc.
// ---------------------------------------------------------------------------

interface ActiveDisputeProps {
    contentType: ContentType;
    contentId: string;
    title: string;
    artist?: string;
    thumbnail?: string | null;
    duplicateMatch: DuplicateMatchSummary;
    onDispute: (reason: string) => Promise<TrackDto | VideoDto>;
    isSubmitting: boolean;
    detailHref: string | null;
    resolveMatchedHref: (match: DuplicateMatchSummary) => string | null;
}

const ActiveDispute: React.FC<ActiveDisputeProps> = ({
    contentType,
    title,
    artist,
    thumbnail,
    duplicateMatch,
    onDispute,
    isSubmitting,
    detailHref,
    resolveMatchedHref,
}) => {
    const [editing, setEditing] = useState(false);
    const noun = contentType;
    const hasDispute = !!duplicateMatch.disputedAtUtc;
    const status = duplicateMatch.status;

    // If the moderator has already settled the case, render the resolved UI.
    if (status === 'Confirmed' || status === 'Dismissed') {
        return (
            <ResolvedOutcome
                contentType={contentType}
                title={title}
                artist={artist}
                thumbnail={thumbnail}
                duplicateMatch={duplicateMatch}
                detailHref={detailHref}
                resolveMatchedHref={resolveMatchedHref}
            />
        );
    }

    const handleSubmit = async (reason: string) => {
        try {
            await onDispute(reason);
            setEditing(false);
            toaster.create({
                title: hasDispute ? 'Dispute updated' : 'Dispute submitted',
                description: `Our moderation team will review your ${noun} shortly.`,
                type: 'success',
            });
        } catch {
            toaster.create({
                title: 'Could not submit dispute',
                description: 'Something went wrong. Please try again in a moment.',
                type: 'error',
            });
        }
    };

    return (
        <VStack align="stretch" gap={6}>
            <HeroCard
                title={title}
                artist={artist}
                thumbnail={thumbnail}
                noun={noun}
                statusBadge={
                    <Tag.Root size="md" bg="yellow.100" color="yellow.800" borderRadius="full" px={3} py={1}>
                        <Icon as={FiClock} mr={1.5} /> <Tag.Label fontSize="11px" fontWeight="600">Under review</Tag.Label>
                    </Tag.Root>
                }
            />

            <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align="stretch">
                <VStack flex="1" align="stretch" gap={6} minW={0}>
                    <MatchDetailsCard
                        duplicateMatch={duplicateMatch}
                        resolveMatchedHref={resolveMatchedHref}
                    />

                    {!hasDispute || editing ? (
                        <Card>
                            <CardHeader
                                icon={FiFlag}
                                iconBg="orange.50"
                                iconColor="orange.500"
                                title={hasDispute ? 'Update your dispute' : 'Submit a dispute'}
                                subtitle={
                                    hasDispute
                                        ? 'Refine your explanation — we will replace your previous note. The case stays in the same place in the moderator queue.'
                                        : `Tell our team why you hold the rights to this ${noun}. The more specific you are, the faster they can resolve it.`
                                }
                            />
                            <DisputeForm
                                onSubmit={handleSubmit}
                                onCancel={hasDispute ? () => setEditing(false) : undefined}
                                defaultReason={hasDispute ? duplicateMatch.artistDisputeNote ?? '' : ''}
                                submitLabel={hasDispute ? 'Update dispute' : 'Submit dispute'}
                                isLoading={isSubmitting}
                                layout="inline"
                            />
                        </Card>
                    ) : (
                        <SubmittedCard
                            duplicateMatch={duplicateMatch}
                            onEdit={() => setEditing(true)}
                        />
                    )}
                </VStack>

                <VStack
                    align="stretch"
                    gap={4}
                    w={{ base: 'full', lg: '320px' }}
                    flexShrink={0}
                >
                    <NextStepsCard />
                    <SupportCard />
                    {detailHref && (
                        <Box
                            bg="white"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="lg"
                            p={4}
                        >
                            <Text fontSize="13px" color="gray.blue.800" fontWeight="600" mb={2}>
                                Your upload
                            </Text>
                            <RouterLink to={detailHref}>
                                <Text fontSize="13px" color="primary.500" fontWeight="500">
                                    View {noun} page →
                                </Text>
                            </RouterLink>
                        </Box>
                    )}
                </VStack>
            </Flex>
        </VStack>
    );
};

// ---------------------------------------------------------------------------
// Resolved outcome (Confirmed / Dismissed)
// ---------------------------------------------------------------------------

interface ResolvedOutcomeProps {
    contentType: ContentType;
    title: string;
    artist?: string;
    thumbnail?: string | null;
    duplicateMatch: DuplicateMatchSummary;
    detailHref: string | null;
    resolveMatchedHref: (match: DuplicateMatchSummary) => string | null;
}

const ResolvedOutcome: React.FC<ResolvedOutcomeProps> = ({
    contentType,
    title,
    artist,
    thumbnail,
    duplicateMatch,
    detailHref,
    resolveMatchedHref,
}) => {
    const noun = contentType;
    const isDismissed = duplicateMatch.status === 'Dismissed';

    return (
        <VStack align="stretch" gap={6}>
            <HeroCard
                title={title}
                artist={artist}
                thumbnail={thumbnail}
                noun={noun}
                statusBadge={
                    isDismissed ? (
                        <Tag.Root size="md" bg="green.50" color="green.700" borderRadius="full" px={3} py={1}>
                            <Icon as={FiCheckCircle} mr={1.5} />
                            <Tag.Label fontSize="11px" fontWeight="600">Released</Tag.Label>
                        </Tag.Root>
                    ) : (
                        <Tag.Root size="md" bg="red.50" color="red.700" borderRadius="full" px={3} py={1}>
                            <Icon as={FiXCircle} mr={1.5} />
                            <Tag.Label fontSize="11px" fontWeight="600">Content removed</Tag.Label>
                        </Tag.Root>
                    )
                }
            />

            <Card>
                <CardHeader
                    icon={isDismissed ? FiCheckCircle : FiXCircle}
                    iconBg={isDismissed ? 'green.50' : 'red.50'}
                    iconColor={isDismissed ? 'green.500' : 'red.500'}
                    title={
                        isDismissed
                            ? `Your ${noun} has been released`
                            : 'The duplicate flag was upheld'
                    }
                    subtitle={
                        isDismissed
                            ? `Our moderation team reviewed the case and released your ${noun}. It is now published on Muxify.`
                            : `Our moderation team confirmed the match. Your ${noun} has been removed from Muxify. If you believe this is incorrect, please contact support.`
                    }
                />
                {duplicateMatch.artistDisputeNote && (
                    <Box
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        px={4}
                        py={3}
                        mt={2}
                    >
                        <Text fontSize="11px" color="gray.500" fontWeight="600" letterSpacing="0.04em" textTransform="uppercase" mb={1}>
                            Your dispute note
                        </Text>
                        <Text fontSize="13px" color="gray.800" whiteSpace="pre-wrap">
                            {duplicateMatch.artistDisputeNote}
                        </Text>
                    </Box>
                )}
                <HStack mt={4} gap={3}>
                    {detailHref && isDismissed && (
                        <RouterLink to={detailHref}>
                            <Button bg="#f94444" color="white" size="sm" _hover={{ bg: '#e53939' }}>
                                View {noun}
                            </Button>
                        </RouterLink>
                    )}
                    <RouterLink to="/music-videos">
                        <Button variant="outline" size="sm" borderColor="gray.300" color="gray.700">
                            Back to library
                        </Button>
                    </RouterLink>
                </HStack>
            </Card>

            <MatchDetailsCard
                duplicateMatch={duplicateMatch}
                resolveMatchedHref={resolveMatchedHref}
            />
        </VStack>
    );
};

// ---------------------------------------------------------------------------
// Layout primitives & cards
// ---------------------------------------------------------------------------

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        p={{ base: 4, md: 6 }}
        shadow="sm"
    >
        {children}
    </Box>
);

interface CardHeaderProps {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ icon, iconBg, iconColor, title, subtitle }) => (
    <HStack align="flex-start" gap={3} mb={4}>
        <Box bg={iconBg} borderRadius="full" p={2.5} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
            <Icon as={icon} boxSize={5} color={iconColor} />
        </Box>
        <VStack align="stretch" gap={1} flex="1">
            <Heading as="h2" fontSize={{ base: '16px', md: '18px' }} fontWeight="600" color="gray.blue.800">
                {title}
            </Heading>
            {subtitle && (
                <Text fontSize="13px" color="gray.blue.700" lineHeight="1.6">
                    {subtitle}
                </Text>
            )}
        </VStack>
    </HStack>
);

interface HeroCardProps {
    title: string;
    artist?: string;
    thumbnail?: string | null;
    noun: string;
    statusBadge: React.ReactNode;
}

const HeroCard: React.FC<HeroCardProps> = ({ title, artist, thumbnail, noun, statusBadge }) => (
    <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        p={{ base: 4, md: 6 }}
        shadow="sm"
    >
        <HStack gap={5} align="center">
            <Box
                w={{ base: '80px', md: '110px' }}
                h={{ base: '80px', md: '110px' }}
                borderRadius="lg"
                overflow="hidden"
                bg="gray.100"
                flexShrink={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {thumbnail ? (
                    <AuthedImage
                        src={thumbnail}
                        w="full"
                        h="full"
                        objectFit="cover"
                        fallback={<Icon as={FiFlag} boxSize={6} color="gray.400" />}
                    />
                ) : (
                    <Icon as={FiFlag} boxSize={7} color="gray.400" />
                )}
            </Box>
            <VStack align="stretch" gap={1.5} flex="1" minW={0}>
                <HStack gap={2} flexWrap="wrap">
                    <Tag.Root size="sm" bg="gray.100" color="gray.700" borderRadius="full" px={2}>
                        <Tag.Label fontSize="10px" fontWeight="600" textTransform="uppercase">
                            {noun}
                        </Tag.Label>
                    </Tag.Root>
                    {statusBadge}
                </HStack>
                <Heading
                    as="h1"
                    fontSize={{ base: '20px', md: '26px' }}
                    fontWeight="700"
                    color="gray.blue.800"
                    lineHeight="1.2"
                >
                    {title}
                </Heading>
                {artist && (
                    <Text fontSize="14px" color="gray.blue.700" fontWeight="500">
                        {artist}
                    </Text>
                )}
            </VStack>
        </HStack>
    </Box>
);

interface MatchDetailsCardProps {
    duplicateMatch: DuplicateMatchSummary;
    resolveMatchedHref: (match: DuplicateMatchSummary) => string | null;
}

const MatchDetailsCard: React.FC<MatchDetailsCardProps> = ({ duplicateMatch, resolveMatchedHref }) => {
    const palette = TIER_PALETTE[duplicateMatch.tier] ?? TIER_PALETTE.Low;
    const confidence = Math.round(duplicateMatch.score * 100);
    const matchedHrefValue = resolveMatchedHref(duplicateMatch);

    return (
        <Card>
            <CardHeader
                icon={FiInfo}
                iconBg="primary.50"
                iconColor="#f94444"
                title="Why is this on hold?"
                subtitle="Our automated content-protection check detected similarity with existing material on Muxify. Here is what it found:"
            />
            <VStack align="stretch" gap={3}>
                <DetailRow
                    label="Confidence"
                    value={
                        <HStack gap={2}>
                            <Tag.Root size="sm" bg={palette.bg} color={palette.fg} borderRadius="full" px={2.5}>
                                <Tag.Label fontSize="11px" fontWeight="600">{palette.label}</Tag.Label>
                            </Tag.Root>
                            <Text fontSize="13px" color="gray.700" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {confidence}%
                            </Text>
                        </HStack>
                    }
                />
                <DetailRow
                    label="Detection method"
                    value={
                        <Text fontSize="13px" color="gray.800">
                            {humanizeMethod(duplicateMatch.matchMethod)}
                        </Text>
                    }
                />
                {(duplicateMatch.matchedTitle || duplicateMatch.matchedArtistName) && (
                    <DetailRow
                        label="Matched against"
                        value={
                            matchedHrefValue ? (
                                <RouterLink to={matchedHrefValue}>
                                    <Text fontSize="13px" color="primary.500" fontWeight="500">
                                        {duplicateMatch.matchedTitle ?? 'Unknown title'}
                                        {duplicateMatch.matchedArtistName ? ` · ${duplicateMatch.matchedArtistName}` : ''}
                                    </Text>
                                </RouterLink>
                            ) : (
                                <Text fontSize="13px" color="gray.800">
                                    {duplicateMatch.matchedTitle ?? 'Unknown title'}
                                    {duplicateMatch.matchedArtistName ? ` · ${duplicateMatch.matchedArtistName}` : ''}
                                </Text>
                            )
                        }
                    />
                )}
                <DetailRow
                    label="Detected"
                    value={
                        <Text fontSize="13px" color="gray.800">
                            {formatDate(duplicateMatch.detectedAtUtc)}
                        </Text>
                    }
                />
                <DetailRow
                    label="Case status"
                    value={
                        <Text fontSize="13px" color="gray.800">
                            {statusLabel(duplicateMatch.status)}
                        </Text>
                    }
                />
            </VStack>
        </Card>
    );
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <HStack align="flex-start" gap={4} py={1}>
        <Text
            fontSize="11px"
            color="gray.500"
            fontWeight="600"
            letterSpacing="0.04em"
            textTransform="uppercase"
            w="120px"
            flexShrink={0}
            pt={1}
        >
            {label}
        </Text>
        <Box flex="1">{value}</Box>
    </HStack>
);

function statusLabel(status: DuplicateMatchStatus): string {
    switch (status) {
        case 'PendingReview':
            return 'Awaiting moderator review';
        case 'Confirmed':
            return 'Upheld — content removed';
        case 'Dismissed':
            return 'Cleared — content released';
        case 'AutoCleared':
            return 'Cleared automatically';
        default:
            return status;
    }
}

interface SubmittedCardProps {
    duplicateMatch: DuplicateMatchSummary;
    onEdit: () => void;
}

const SubmittedCard: React.FC<SubmittedCardProps> = ({ duplicateMatch, onEdit }) => (
    <Card>
        <CardHeader
            icon={FiCheckCircle}
            iconBg="green.50"
            iconColor="green.500"
            title="Dispute submitted"
            subtitle={`Submitted on ${formatDate(duplicateMatch.disputedAtUtc)}. Our moderation team typically resolves cases within a few business days.`}
        />
        {duplicateMatch.artistDisputeNote && (
            <Box
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                px={4}
                py={3}
                mb={4}
            >
                <Text fontSize="11px" color="gray.500" fontWeight="600" letterSpacing="0.04em" textTransform="uppercase" mb={1}>
                    Your note to moderators
                </Text>
                <Text fontSize="13px" color="gray.800" whiteSpace="pre-wrap">
                    {duplicateMatch.artistDisputeNote}
                </Text>
            </Box>
        )}
        <HStack gap={3}>
            <Button variant="outline" size="sm" borderColor="gray.300" color="gray.700" onClick={onEdit}>
                Update your dispute
            </Button>
        </HStack>
    </Card>
);

const NextStepsCard: React.FC = () => (
    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
        <HStack gap={2} mb={2.5}>
            <Icon as={FiHelpCircle} color="primary.500" />
            <Text fontSize="13px" fontWeight="600" color="gray.blue.800">
                What happens next?
            </Text>
        </HStack>
        <VStack align="stretch" gap={2.5}>
            <NextStep number={1}>
                Our moderation team gets your dispute and the original match.
            </NextStep>
            <NextStep number={2}>
                A human reviewer compares both items and decides — usually within a few business days.
            </NextStep>
            <NextStep number={3}>
                You receive an email and an in-app notification with the outcome. If your case is dismissed, your upload is published immediately.
            </NextStep>
        </VStack>
    </Box>
);

const NextStep: React.FC<{ number: number; children: React.ReactNode }> = ({ number, children }) => (
    <HStack align="flex-start" gap={2}>
        <Box
            w="22px"
            h="22px"
            borderRadius="full"
            bg="primary.50"
            color="primary.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="11px"
            fontWeight="700"
            flexShrink={0}
        >
            {number}
        </Box>
        <Text fontSize="12px" color="gray.blue.700" lineHeight="1.5">
            {children}
        </Text>
    </HStack>
);

const SupportCard: React.FC = () => (
    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
        <HStack gap={2} mb={2}>
            <Icon as={FiMail} color="primary.500" />
            <Text fontSize="13px" fontWeight="600" color="gray.blue.800">
                Need to escalate?
            </Text>
        </HStack>
        <Text fontSize="12px" color="gray.blue.700" lineHeight="1.5" mb={2}>
            If you hold documentation that backs up your claim — a licence, ISRC paperwork, or a master recording you own — reach out and we will route your case to the rights team.
        </Text>
        <a href="mailto:support@muxify.com">
            <Text fontSize="12px" color="primary.500" fontWeight="500">
                support@muxify.com →
            </Text>
        </a>
    </Box>
);

// ---------------------------------------------------------------------------
// Empty / error state — shown for malformed links, 404s, 403s, etc.
// ---------------------------------------------------------------------------

interface UnknownContentStateProps {
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
}

const UnknownContentState: React.FC<UnknownContentStateProps> = ({
    title,
    description,
    actionHref = '/music-videos',
    actionLabel = 'Back to my library',
}) => (
    <VStack
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        p={10}
        gap={4}
        align="center"
        textAlign="center"
    >
        <Box bg="gray.50" borderRadius="full" p={4}>
            <Icon as={FiAlertTriangle} boxSize={7} color="gray.500" />
        </Box>
        <Heading as="h2" fontSize="18px" fontWeight="600" color="gray.blue.800">
            {title}
        </Heading>
        <Text fontSize="13px" color="gray.blue.700" maxW="420px">
            {description}
        </Text>
        <RouterLink to={actionHref}>
            <Button bg="#f94444" color="white" size="sm" _hover={{ bg: '#e53939' }}>
                {actionLabel}
            </Button>
        </RouterLink>
    </VStack>
);
