import React from 'react';
import { Box, HStack, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { IdentityCell, StatusBadge } from '../../ui';
import { StatusBadge as LegacyStatusBadge } from '../../StatusBadge';
import { DocumentViewer } from '../../verification/DocumentViewer';
import { medalStyle, verificationStatusStyle } from '../../../lib/statusColor';
import {
    adminDate,
    adminDateTime,
    formatCount,
    formatMinorAmount,
} from '../../../lib/format';
import { Field, Panel } from './Panel';
import type {
    AdminAddressDto,
    AdminUserProfileDto,
    VerificationBlockDto,
    VerificationStatus,
} from '../../../types';

const formatAddress = (a?: AdminAddressDto): string | undefined => {
    if (!a) return undefined;
    const parts = [a.street, a.city, a.state, a.country, a.postalCode].filter(Boolean);
    return parts.length ? parts.join(', ') : undefined;
};

const WebsiteLink: React.FC<{ url?: string }> = ({ url }) =>
    url ? (
        <HStack
            as="a"
            {...{ href: url, target: '_blank', rel: 'noreferrer' }}
            gap={1}
            justify="flex-end"
            color="primary.500"
            _hover={{ textDecoration: 'underline' }}
        >
            <Text fontSize="xs" lineClamp={1}>
                {url.replace(/^https?:\/\//, '')}
            </Text>
            <FiExternalLink size={11} />
        </HStack>
    ) : (
        <>—</>
    );

const SocialLinksRow: React.FC<{ links: Record<string, string | undefined> }> = ({ links }) => {
    const entries = Object.entries(links).filter(([, v]) => !!v);
    if (entries.length === 0) return <>—</>;
    return (
        <HStack gap={2} justify="flex-end" flexWrap="wrap">
            {entries.map(([key, url]) => (
                <Text
                    key={key}
                    as="a"
                    {...{ href: url, target: '_blank', rel: 'noreferrer' }}
                    fontSize="xs"
                    color="primary.500"
                    textTransform="capitalize"
                    _hover={{ textDecoration: 'underline' }}
                >
                    {key}
                </Text>
            ))}
        </HStack>
    );
};

const VerificationPanel: React.FC<{ verification: VerificationBlockDto }> = ({
    verification,
}) => (
    <Panel title="Verification & documents">
        <Stack gap={0} mb={3}>
            <Field
                label="Status"
                value={
                    <LegacyStatusBadge
                        style={verificationStatusStyle(verification.status as VerificationStatus)}
                    />
                }
            />
            <Field label="Submitted" value={adminDateTime(verification.submittedAt)} />
            <Field label="Reviewed" value={adminDateTime(verification.reviewedAt)} />
            {verification.rejectionReason && (
                <Field label="Rejection reason" value={verification.rejectionReason} />
            )}
        </Stack>
        <DocumentViewer documents={verification.documents} />
    </Panel>
);

/* ------------------------------- Fan ------------------------------------- */

const FanSection: React.FC<{ profile: NonNullable<AdminUserProfileDto['fan']> }> = ({
    profile: f,
}) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Panel title="Identity">
            <Stack gap={0}>
                <Field label="Username" value={f.username} />
                <Field label="Display name" value={f.displayName} />
                <Field label="Bio" value={f.bio} />
                <Field label="Gender" value={f.gender === 'NotSpecified' ? '—' : f.gender} />
                <Field label="Date of birth" value={f.dateOfBirth ? adminDate(f.dateOfBirth) : '—'} />
                <Field label="Location" value={[f.state, f.country].filter(Boolean).join(', ') || '—'} />
                <Field label="Preferred genres" value={f.preferredGenres} />
            </Stack>
        </Panel>
        <VStack align="stretch" gap={4}>
            <Panel title="Coin economy">
                <Stack gap={0}>
                    <Field label="Coin balance" value={formatCount(f.coinBalance)} />
                    <Field label="Coins purchased" value={formatCount(f.totalCoinsPurchased)} />
                    <Field label="Coins spent" value={formatCount(f.totalCoinsSpent)} />
                    <Field label="Gifts sent" value={formatCount(f.totalGiftsSentCount)} />
                    <Field label="Gift value (coins)" value={formatCount(f.totalGiftsSentValue)} />
                    <Field label="Content unlocks" value={formatCount(f.totalUnlocksCount)} />
                </Stack>
            </Panel>
            <Panel title="Social & gamification">
                <Stack gap={0}>
                    <Field label="Following" value={formatCount(f.followingCount)} />
                    <Field label="Followers" value={formatCount(f.followerCount)} />
                    <Field
                        label="Medal"
                        value={
                            f.currentMedal !== 'None' ? (
                                <StatusBadge style={medalStyle(f.currentMedal)} />
                            ) : (
                                '—'
                            )
                        }
                    />
                </Stack>
            </Panel>
        </VStack>
    </SimpleGrid>
);

/* ----------------------- Artist / DJ / Creator / Podcaster ---------------- */

const CreatorSection: React.FC<{
    profile: NonNullable<AdminUserProfileDto['creator']>;
}> = ({ profile: c }) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <VStack align="stretch" gap={4}>
            <Panel title="Profile">
                <Stack gap={0}>
                    <Field label="Performing name" value={c.performingName} />
                    <Field label="Bio" value={c.bio} />
                    <Field label="Location" value={[c.state, c.country].filter(Boolean).join(', ') || '—'} />
                    <Field label="Website" value={<WebsiteLink url={c.website} />} />
                    <Field label="Social links" value={<SocialLinksRow links={c.socialLinks} />} />
                </Stack>
            </Panel>
            <Panel title="Catalog & earnings">
                <Stack gap={0}>
                    <Field label="Followers" value={formatCount(c.followerCount)} />
                    <Field label="Tracks" value={formatCount(c.trackCount)} />
                    <Field label="Uploads" value={formatCount(c.uploads)} />
                    <Field label="Total earnings" value={formatMinorAmount(c.totalEarningsMinor, c.currency)} />
                </Stack>
                {c.recentUploads.length > 0 && (
                    <Box mt={3} borderTop="1px solid" borderColor="gray.100" pt={3}>
                        <Text
                            fontSize="10px"
                            color="gray.500"
                            textTransform="uppercase"
                            letterSpacing="0.4px"
                            fontWeight="semibold"
                            mb={2}
                        >
                            Recent uploads
                        </Text>
                        <VStack align="stretch" gap={2}>
                            {c.recentUploads.map((t) => (
                                <HStack key={t.id} justify="space-between" gap={3}>
                                    <Text fontSize="xs" color="gray.800" lineClamp={1}>
                                        {t.title}
                                    </Text>
                                    <HStack gap={2} flexShrink={0}>
                                        <StatusBadge status={t.status} />
                                        <Text fontSize="10px" color="gray.400">
                                            {adminDate(t.createdAt)}
                                        </Text>
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                )}
            </Panel>
        </VStack>
        <VerificationPanel verification={c.verification} />
    </SimpleGrid>
);

/* ------------------------------ Record label ------------------------------ */

const LabelSection: React.FC<{
    profile: NonNullable<AdminUserProfileDto['label']>;
}> = ({ profile: l }) => {
    const navigate = useNavigate();
    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <VStack align="stretch" gap={4}>
                <Panel title="Company">
                    <Stack gap={0}>
                        <Field label="Legal name" value={l.legalName} />
                        <Field label="Trading name" value={l.tradingName} />
                        <Field label="Nature of business" value={l.natureOfBusiness} />
                        <Field label="Registration no." value={l.registrationNumber} />
                        <Field label="Address" value={formatAddress(l.address)} />
                        <Field label="Website" value={<WebsiteLink url={l.website} />} />
                        <Field label="Social links" value={<SocialLinksRow links={l.socialLinks} />} />
                    </Stack>
                </Panel>
                <Panel title={`Directors (${l.directors.length})`}>
                    {l.directors.length === 0 ? (
                        <Text fontSize="xs" color="gray.500">
                            No directors recorded.
                        </Text>
                    ) : (
                        <VStack align="stretch" gap={3}>
                            {l.directors.map((d) => (
                                <Box
                                    key={`${d.email}-${d.position}`}
                                    border="1px solid"
                                    borderColor="gray.100"
                                    borderRadius="lg"
                                    p={3}
                                >
                                    <HStack justify="space-between" gap={2}>
                                        <VStack align="start" gap={0} minW={0}>
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                                {d.fullName}
                                            </Text>
                                            <Text fontSize="10px" color="gray.500">
                                                {d.position} · {d.email}
                                            </Text>
                                        </VStack>
                                        <HStack gap={2} flexShrink={0}>
                                            {d.isPrimaryContact && (
                                                <StatusBadge status="Active" label="Primary contact" />
                                            )}
                                            <StatusBadge
                                                status={d.hasIdentityDocument ? 'Verified' : 'NotSubmitted'}
                                                label={d.hasIdentityDocument ? 'ID on file' : 'No ID'}
                                            />
                                        </HStack>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </Panel>
                <Panel title={`Artist roster (${l.artistCount})`}>
                    {l.roster.length === 0 ? (
                        <Text fontSize="xs" color="gray.500">
                            No artists on the roster yet.
                        </Text>
                    ) : (
                        <VStack align="stretch" gap={1}>
                            {l.roster.map((m) => (
                                <HStack
                                    key={m.userId}
                                    justify="space-between"
                                    gap={3}
                                    p={2}
                                    borderRadius="lg"
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.50' }}
                                    onClick={() => navigate(`/admin/users/${m.userId}`)}
                                >
                                    <IdentityCell name={m.name} avatarUrl={m.avatarUrl} size="xs" />
                                    <StatusBadge status={m.status} />
                                </HStack>
                            ))}
                        </VStack>
                    )}
                </Panel>
            </VStack>
            <VerificationPanel verification={l.verification} />
        </SimpleGrid>
    );
};

/* ------------------------------- Ad manager ------------------------------- */

const AdManagerSection: React.FC<{
    profile: NonNullable<AdminUserProfileDto['adManager']>;
}> = ({ profile: a }) => {
    const navigate = useNavigate();
    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <VStack align="stretch" gap={4}>
                <Panel title="Business">
                    <Stack gap={0}>
                        <Field label="Company" value={a.companyName} />
                        <Field label="Industry" value={a.industry} />
                        <Field label="Business phone" value={a.businessPhone} />
                        <Field label="Address" value={formatAddress(a.businessAddress)} />
                        <Field label="Website" value={<WebsiteLink url={a.website} />} />
                    </Stack>
                </Panel>
                <Panel
                    title="Advertising"
                    actions={
                        <Text
                            as="button"
                            fontSize="11px"
                            color="primary.500"
                            fontWeight="medium"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => navigate('/admin/advertising/advertisers')}
                        >
                            Open in Advertising →
                        </Text>
                    }
                >
                    <Stack gap={0}>
                        <Field label="Active campaigns" value={formatCount(a.activeCampaignCount)} />
                        <Field label="Total campaigns" value={formatCount(a.totalCampaignCount)} />
                        <Field label="Total ad spend" value={formatMinorAmount(a.totalAdSpendMinor)} />
                    </Stack>
                </Panel>
            </VStack>
            <VerificationPanel verification={a.verification} />
        </SimpleGrid>
    );
};

/* ------------------------------ Contributor ------------------------------- */

const ContributorSection: React.FC<{
    profile: NonNullable<AdminUserProfileDto['contributor']>;
}> = ({ profile: c }) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <VStack align="stretch" gap={4}>
            <Panel title="Identity">
                <Stack gap={0}>
                    <Field label="Display name" value={c.displayName} />
                    <Field label="Legal name" value={c.legalName} />
                    <Field label="Country" value={c.country} />
                    <Field label="Active splits" value={formatCount(c.activeSplitCount)} />
                </Stack>
            </Panel>
            <Panel title={`Release splits (${c.splits.length})`}>
                {c.splits.length === 0 ? (
                    <Text fontSize="xs" color="gray.500">
                        No release splits yet.
                    </Text>
                ) : (
                    <VStack align="stretch" gap={2}>
                        {c.splits.map((s, i) => (
                            <HStack
                                key={`${s.trackId}-${i}`}
                                justify="space-between"
                                gap={3}
                                border="1px solid"
                                borderColor="gray.100"
                                borderRadius="lg"
                                p={3}
                            >
                                <VStack align="start" gap={0} minW={0}>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800" lineClamp={1}>
                                        {s.trackTitle}
                                    </Text>
                                    <Text fontSize="10px" color="gray.500" lineClamp={1}>
                                        {s.artistName}
                                    </Text>
                                </VStack>
                                <HStack gap={2} flexShrink={0}>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                                        {s.percent.toFixed(2).replace(/\.00$/, '')}%
                                    </Text>
                                    <StatusBadge status={s.isActive ? 'Active' : 'Inactive'} />
                                </HStack>
                            </HStack>
                        ))}
                    </VStack>
                )}
            </Panel>
        </VStack>
        <VerificationPanel verification={c.verification} />
    </SimpleGrid>
);

/* --------------------------------- Switch --------------------------------- */

/** Role-specific profile tab — renders the section matching the user's role. */
export const RoleProfileTab: React.FC<{ profile: AdminUserProfileDto }> = ({ profile }) => {
    if (profile.fan) return <FanSection profile={profile.fan} />;
    if (profile.creator) return <CreatorSection profile={profile.creator} />;
    if (profile.label) return <LabelSection profile={profile.label} />;
    if (profile.adManager) return <AdManagerSection profile={profile.adManager} />;
    if (profile.contributor) return <ContributorSection profile={profile.contributor} />;
    return (
        <Panel title="Profile">
            <Text fontSize="xs" color="gray.500">
                This account has no role-specific profile yet.
            </Text>
        </Panel>
    );
};
