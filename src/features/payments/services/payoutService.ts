import { api } from "@shared/services/api";
import { getApiErrorMessage } from "@shared/lib/errorUtils";
import type {
  PayoutMethodDto,
  PayoutMethodListDto,
  AddPayoutMethodRequest,
  AddPayoutMethodResponse,
  UpdatePayoutMethodRequest,
  SuccessResponse,
  BankListDto,
  VerifyAccountRequest,
  VerifyAccountResponse,
  PayoutAccount,
} from "../types";
import { mapPayoutMethodToAccount, mapPayoutMethodsToAccounts } from "../types";

// ============================================================================
// API Base Path
// ============================================================================

const PAYOUT_METHODS_BASE_PATH = "/payments/methods";

// ============================================================================
// Payout Methods Service
// ============================================================================

export const payoutService = {
  /**
   * Get all payout methods (bank accounts) for the current artist
   */
  getPayoutMethods: () =>
    api.get<PayoutMethodListDto>(PAYOUT_METHODS_BASE_PATH),

  /**
   * Get all payout methods and return as legacy PayoutAccount format
   */
  getPayoutAccounts: async (): Promise<PayoutAccount[]> => {
    try {
      const response = await api.get<PayoutMethodListDto>(PAYOUT_METHODS_BASE_PATH);
      return mapPayoutMethodsToAccounts(response.data.payoutMethods);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch payout accounts"));
    }
  },

  /**
   * Get the default payout method
   */
  getDefaultPayoutMethod: async (): Promise<PayoutMethodDto | null> => {
    try {
      const response = await api.get<PayoutMethodListDto>(PAYOUT_METHODS_BASE_PATH);
      return response.data.payoutMethods.find((m) => m.isDefault) || null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch default payout method"));
    }
  },

  /**
   * Get the default payout method as legacy PayoutAccount format
   */
  getDefaultPayoutAccount: async (): Promise<PayoutAccount | null> => {
    try {
      const method = await payoutService.getDefaultPayoutMethod();
      return method ? mapPayoutMethodToAccount(method) : null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch default payout account"));
    }
  },

  /**
   * Add a new payout method (bank account)
   * @param request - Payout method details including bank code and account number
   */
  addPayoutMethod: (request: AddPayoutMethodRequest) =>
    api.post<AddPayoutMethodResponse>(PAYOUT_METHODS_BASE_PATH, request),

  /**
   * Update an existing payout method
   * @param id - Payout method ID
   * @param request - Update details (nickname, setAsDefault)
   */
  updatePayoutMethod: (id: string, request: UpdatePayoutMethodRequest) =>
    api.put<SuccessResponse>(`${PAYOUT_METHODS_BASE_PATH}/${id}`, request),

  /**
   * Delete a payout method (soft delete)
   * @param id - Payout method ID
   */
  deletePayoutMethod: (id: string) =>
    api.delete<SuccessResponse>(`${PAYOUT_METHODS_BASE_PATH}/${id}`),

  /**
   * Set a payout method as the default for withdrawals
   * @param id - Payout method ID
   */
  setDefaultPayoutMethod: (id: string) =>
    api.post<SuccessResponse>(`${PAYOUT_METHODS_BASE_PATH}/${id}/default`),

  /**
   * Get list of supported banks for adding payout methods
   */
  getBanks: () => api.get<BankListDto>(`${PAYOUT_METHODS_BASE_PATH}/banks`),

  /**
   * Verify a bank account number and get the account name
   * @param request - Bank code and account number to verify
   */
  verifyAccount: (request: VerifyAccountRequest) =>
    api.post<VerifyAccountResponse>(`${PAYOUT_METHODS_BASE_PATH}/verify`, request),
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Mask bank account number for display (show last 4 digits)
 * @param accountNumber - Full account number
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length <= 4) {
    return accountNumber || "";
  }
  const masked = "*".repeat(accountNumber.length - 4);
  return masked + accountNumber.slice(-4);
}

/**
 * Format currency amount for display
 * @param amount - Amount in base currency unit
 * @param currency - Currency code (default: NGN)
 */
export function formatCurrency(amount: number, currency: string = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Validate Nigerian bank account number format
 * @param accountNumber - Account number to validate
 */
export function isValidNigerianAccountNumber(accountNumber: string): boolean {
  // Nigerian bank account numbers are typically 10 digits
  const cleaned = accountNumber.replace(/\s/g, "");
  return /^\d{10}$/.test(cleaned);
}

/**
 * Format account number with spaces for readability
 * @param accountNumber - Account number to format
 */
export function formatAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\s/g, "");
  // Format as: XXXX XXXX XX for 10-digit numbers
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  return cleaned;
}

/**
 * Get display text for payout method
 * @param method - Payout method DTO
 */
export function getPayoutMethodDisplayText(method: PayoutMethodDto): string {
  const name = method.nickname || method.bankName;
  return `${name} - ****${method.accountNumber.slice(-4)}`;
}

/**
 * Sort banks alphabetically by name
 * @param banks - Array of bank DTOs
 */
export function sortBanksByName(banks: { name: string }[]): typeof banks {
  return [...banks].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filter active banks only
 * @param banks - Array of bank DTOs
 */
export function filterActiveBanks<T extends { isActive: boolean }>(banks: T[]): T[] {
  return banks.filter((bank) => bank.isActive);
}

export default payoutService;
