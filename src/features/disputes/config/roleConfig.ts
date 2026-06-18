import { uploadMusicService } from '@/features/upload-music/services/uploadMusicService';
import { videoService } from '@/features/upload-video/services/videoService';
import { recordLabelService } from '@/features/record-label/services/recordLabelService';
import { adsService } from '@/features/ads/services/adsService';
import type { DisputeFamily, DisputeSubjectType } from '../lib/disputeFamily';

/** A pickable item from a user's own catalog (track, video, release or campaign). */
export interface CatalogItem {
    id: string;
    title: string;
    /** Secondary line — artist name, type, etc. */
    subtitle?: string;
    /** Cover / thumbnail; may be a JWT-gated media-proxy path. */
    coverUrl?: string | null;
}

export interface DisputeSubjectOption {
    value: DisputeSubjectType;
    /** Label shown in the "what is this about?" selector. */
    label: string;
    family: DisputeFamily;
    /** Copyright subjects load a catalog the user picks the disputed item from. */
    loadCatalog?: () => Promise<CatalogItem[]>;
    /** Placeholder for the catalog search box. */
    catalogPlaceholder?: string;
}

export type DisputeRole = 'artist' | 'label' | 'adManager' | 'contributor';

export interface DisputeRoleConfig {
    role: DisputeRole;
    /** Endpoint root (no /api/v1 prefix). */
    endpointBase: string;
    title: string;
    subtitle: string;
    subjects: DisputeSubjectOption[];
    /** Whether this role's endpoint supports evidence attachments (only /me/disputes). */
    supportsAttachments: boolean;
}

/* ----------------------------- Catalog loaders ----------------------------- */

const loadArtistTracks = async (): Promise<CatalogItem[]> => {
    const res = await uploadMusicService.getTracks({ page: 1, pageSize: 100 });
    return res.items.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.artist,
        coverUrl: t.thumbnail ?? null,
    }));
};

const loadArtistVideos = async (): Promise<CatalogItem[]> => {
    const res = await videoService.getVideos({ page: 1, pageSize: 100 });
    return res.items.map((v) => ({
        id: v.id,
        title: v.title,
        subtitle: v.artist,
        coverUrl: v.thumbnail ?? null,
    }));
};

const loadLabelReleases = (kind: 'track' | 'video') => async (): Promise<CatalogItem[]> => {
    const res = await recordLabelService.getReleases({ kind }, 200);
    return res.items.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.artistName,
        coverUrl: r.coverArtUrl ?? null,
    }));
};

const loadAdCampaigns = async (): Promise<CatalogItem[]> => {
    const res = await adsService.getCampaigns(1, 100);
    return res.campaigns.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.type,
        coverUrl: c.creativeUrl ?? null,
    }));
};

/* ------------------------------ Role configs ------------------------------ */

const PAYMENT_SUBTITLE =
    'Raised an issue with your money or your content? Open a case and track it until our team resolves it.';

export const ARTIST_DISPUTE_CONFIG: DisputeRoleConfig = {
    role: 'artist',
    endpointBase: '/me/disputes',
    title: 'Disputes',
    subtitle: 'Flag a copyright issue on one of your tracks or videos, or raise a payment dispute — and follow it to resolution.',
    supportsAttachments: true,
    subjects: [
        { value: 'Track', label: 'Copyright — a track', family: 'copyright', loadCatalog: loadArtistTracks, catalogPlaceholder: 'Search your tracks…' },
        { value: 'Video', label: 'Copyright — a music video', family: 'copyright', loadCatalog: loadArtistVideos, catalogPlaceholder: 'Search your videos…' },
        { value: 'Withdrawal', label: 'A payout / withdrawal', family: 'payment' },
        { value: 'Earning', label: 'An earning', family: 'payment' },
        { value: 'Other', label: 'Something else', family: 'payment' },
    ],
};

export const LABEL_DISPUTE_CONFIG: DisputeRoleConfig = {
    role: 'label',
    endpointBase: '/me/disputes',
    title: 'Disputes',
    subtitle: 'Flag a copyright issue on a release in your catalogue, or raise a payment dispute — and follow it to resolution.',
    supportsAttachments: true,
    subjects: [
        { value: 'Track', label: 'Copyright — a track release', family: 'copyright', loadCatalog: loadLabelReleases('track'), catalogPlaceholder: 'Search your releases…' },
        { value: 'Video', label: 'Copyright — a video release', family: 'copyright', loadCatalog: loadLabelReleases('video'), catalogPlaceholder: 'Search your releases…' },
        { value: 'Withdrawal', label: 'A payout / withdrawal', family: 'payment' },
        { value: 'Earning', label: 'An earning', family: 'payment' },
        { value: 'Split', label: 'A royalty split', family: 'payment' },
        { value: 'Other', label: 'Something else', family: 'payment' },
    ],
};

export const AD_MANAGER_DISPUTE_CONFIG: DisputeRoleConfig = {
    role: 'adManager',
    endpointBase: '/me/disputes',
    title: 'Disputes',
    subtitle: 'Flag a copyright issue on an ad creative, or raise a billing / ad-wallet dispute — and follow it to resolution.',
    supportsAttachments: true,
    subjects: [
        { value: 'AdCampaign', label: 'Copyright — an ad creative', family: 'copyright', loadCatalog: loadAdCampaigns, catalogPlaceholder: 'Search your campaigns…' },
        { value: 'AdWallet', label: 'Ad wallet / billing', family: 'payment' },
        { value: 'Other', label: 'Something else', family: 'payment' },
    ],
};

export const CONTRIBUTOR_DISPUTE_CONFIG: DisputeRoleConfig = {
    role: 'contributor',
    endpointBase: '/contributor/disputes',
    title: 'Disputes',
    subtitle: PAYMENT_SUBTITLE,
    supportsAttachments: false,
    subjects: [
        { value: 'Withdrawal', label: 'A payout / withdrawal', family: 'payment' },
        { value: 'Earning', label: 'An earning', family: 'payment' },
        { value: 'Split', label: 'A royalty split', family: 'payment' },
        { value: 'Other', label: 'Something else', family: 'payment' },
    ],
};
