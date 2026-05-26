import type {
    ReleaseSplitDto,
    SplitRecipientRole,
} from '@/features/record-label/types';

export type MixSplitRow = ReleaseSplitDto;

export type MixSplitRole = SplitRecipientRole;

export interface MixRights {
    isrc: string;
    isrcIsProvisional: boolean;
    upc: string;
    iswc: string;
}

export const EMPTY_MIX_RIGHTS: MixRights = {
    isrc: '',
    isrcIsProvisional: false,
    upc: '',
    iswc: '',
};

const ISRC_PATTERN = /^[A-Z]{2}-?[A-Z0-9]{3}-?\d{2}-?\d{5}$/i;
const UPC_PATTERN = /^\d{12,13}$/;
const ISWC_PATTERN = /^T-?\d{9}-?\d$/i;

export const normalizeIsrc = (value: string): string =>
    value.replace(/[\s-]/g, '').toUpperCase();

export const isValidIsrc = (value: string): boolean =>
    !!value && ISRC_PATTERN.test(value.trim());

export const isValidUpc = (value: string): boolean =>
    !!value && UPC_PATTERN.test(value.trim());

export const isValidIswc = (value: string): boolean =>
    !!value && ISWC_PATTERN.test(value.trim());
