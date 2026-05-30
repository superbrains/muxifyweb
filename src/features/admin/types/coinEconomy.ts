/* Coin economy admin types — mirror the backend AdminCoinEconomy DTOs. */

export interface CoinEconomySettings {
    coinsPerNairaMajor: number;
    currency: string;
    platformFeePercent: number;
    updatedAt?: string | null;
}

export interface UpdateCoinEconomySettingsRequest {
    coinsPerNairaMajor: number;
    currency: string;
    platformFeePercent: number;
}

export interface AdminCoinPackage {
    id: string;
    name: string;
    description?: string | null;
    coinAmount: number;
    bonusCoins: number;
    priceInSmallestUnit: number;
    currency: string;
    displayOrder: number;
    isFeatured: boolean;
    isActive: boolean;
    badgeIcon?: string | null;
    promoTag?: string | null;
}

export interface UpsertCoinPackageRequest {
    name: string;
    description?: string | null;
    coinAmount: number;
    bonusCoins: number;
    priceInSmallestUnit: number;
    displayOrder: number;
    isFeatured: boolean;
    badgeIcon?: string | null;
    promoTag?: string | null;
}

export interface AdminGiftType {
    id: string;
    giftType: string;
    name: string;
    description?: string | null;
    coinCost: number;
    icon: string;
    animation?: string | null;
    displayOrder: number;
    isActive: boolean;
    isPremium: boolean;
    minLevelRequired?: number | null;
}

export interface AvailableGiftType {
    giftType: string;
}

export interface UpsertGiftTypeRequest {
    giftType: string;
    name: string;
    description?: string | null;
    coinCost: number;
    icon: string;
    animation?: string | null;
    displayOrder: number;
    isPremium: boolean;
    minLevelRequired?: number | null;
}
