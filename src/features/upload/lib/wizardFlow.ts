export interface UserTypeFlags {
    isArtist: boolean;
    isRecordLabel: boolean;
}

export type ActiveTab = 'music' | 'video';
export type AlbumTab = 'mix' | 'album';

/**
 * Gate for the extended audio upload wizard (Splits + Rights & Metadata).
 * Fires when: role is Artist OR Record Label, outer tab is Music,
 * and sub-tab is Mix/Track (internal id `'mix'`).
 */
export const shouldUseExtendedAudioWizard = (
    { isArtist, isRecordLabel }: UserTypeFlags,
    albumTab: AlbumTab,
    activeTab: ActiveTab,
): boolean =>
    (isArtist || isRecordLabel) &&
    activeTab === 'music' &&
    albumTab === 'mix';
