// ============================================================================
// Payout Method DTOs
// ============================================================================

/**
 * Status of a payout method
 */
export type PayoutMethodStatus = 'pending' | 'verified' | 'failed' | 'deactivated';

/**
 * DTO for a saved payout method (bank account)
 */
export interface PayoutMethodDto {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  maskedAccountNumber: string;
  accountName: string;
  currency: string;
  isDefault: boolean;
  status: PayoutMethodStatus;
  nickname?: string;
  verifiedAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

/**
 * Response for list of payout methods
 */
export interface PayoutMethodListDto {
  payoutMethods: PayoutMethodDto[];
  totalCount: number;
}

/**
 * Request to add a new payout method
 */
export interface AddPayoutMethodRequest {
  bankCode: string;
  accountNumber: string;
  nickname?: string;
  setAsDefault?: boolean;
}

/**
 * Response after adding a payout method
 */
export interface AddPayoutMethodResponse {
  success: boolean;
  payoutMethodId: string;
  status: string;
  message?: string;
  payoutMethod?: PayoutMethodDto;
}

/**
 * Request to update a payout method
 */
export interface UpdatePayoutMethodRequest {
  nickname?: string;
  setAsDefault?: boolean;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  success: boolean;
}

// ============================================================================
// Bank DTOs
// ============================================================================

/**
 * DTO for bank information (for dropdown selection)
 */
export interface BankDto {
  code: string;
  name: string;
  longCode?: string;
  country: string;
  currency: string;
  isActive: boolean;
}

/**
 * Response for bank list
 */
export interface BankListDto {
  banks: BankDto[];
}

// ============================================================================
// Account Verification DTOs
// ============================================================================

/**
 * Request to verify an account number
 */
export interface VerifyAccountRequest {
  bankCode: string;
  accountNumber: string;
}

/**
 * Response from account verification
 */
export interface VerifyAccountResponse {
  success: boolean;
  accountName?: string;
  bankName?: string;
  message?: string;
}

// ============================================================================
// Legacy Store Types (for backward compatibility)
// ============================================================================

/**
 * Legacy PayoutAccount type used by the store
 * @deprecated Use PayoutMethodDto instead
 */
export interface PayoutAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
  bankCode?: string;
  isDefault?: boolean;
  status?: PayoutMethodStatus;
  nickname?: string;
}

/**
 * Legacy PayoutHistoryItem type used by the store
 */
export interface PayoutHistoryItem {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  date: string;
}

// ============================================================================
// Mappers
// ============================================================================

/**
 * Map PayoutMethodDto to legacy PayoutAccount format
 */
export function mapPayoutMethodToAccount(dto: PayoutMethodDto): PayoutAccount {
  return {
    id: dto.id,
    accountNumber: dto.maskedAccountNumber,
    bankName: dto.bankName,
    accountName: dto.accountName,
    bankCode: dto.bankCode,
    isDefault: dto.isDefault,
    status: dto.status,
    nickname: dto.nickname,
  };
}

/**
 * Map array of PayoutMethodDto to legacy PayoutAccount array
 */
export function mapPayoutMethodsToAccounts(dtos: PayoutMethodDto[]): PayoutAccount[] {
  return dtos.map(mapPayoutMethodToAccount);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the status display text for a payout method
 */
export function getPayoutMethodStatusText(status: PayoutMethodStatus): string {
  const statusMap: Record<PayoutMethodStatus, string> = {
    pending: 'Pending Verification',
    verified: 'Verified',
    failed: 'Verification Failed',
    deactivated: 'Deactivated',
  };
  return statusMap[status] || status;
}

/**
 * Get the status color for UI display
 */
export function getPayoutMethodStatusColor(status: PayoutMethodStatus): string {
  const colorMap: Record<PayoutMethodStatus, string> = {
    pending: 'yellow',
    verified: 'green',
    failed: 'red',
    deactivated: 'gray',
  };
  return colorMap[status] || 'gray';
}

/**
 * Format bank account display name
 */
export function formatBankAccountDisplay(method: PayoutMethodDto): string {
  const name = method.nickname || method.bankName;
  return `${name} - ${method.maskedAccountNumber}`;
}

/**
 * Check if a payout method can be used for withdrawals
 */
export function canUseForWithdrawal(method: PayoutMethodDto): boolean {
  return method.status === 'verified';
}
