import { create } from "zustand";
import { payoutService } from "../services/payoutService";
import { getApiErrorMessage } from "@shared/lib/errorUtils";
import type {
  PayoutMethodDto,
  BankDto,
  AddPayoutMethodRequest,
  PayoutHistoryItem,
} from "../types";

export interface PayoutAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
  bankCode?: string;
  isDefault?: boolean;
  nickname?: string;
}

// Re-export PayoutHistoryItem for backward compatibility
export type { PayoutHistoryItem };

interface PayoutStore {
  // State
  payoutAccount: PayoutAccount | null;
  payoutMethods: PayoutMethodDto[];
  banks: BankDto[];
  payoutHistory: PayoutHistoryItem[];
  earningBalance: number;
  isLoading: boolean;
  isBanksLoading: boolean;
  isVerifying: boolean;
  error: string | null;

  // Actions - Payout Methods
  fetchPayoutMethods: () => Promise<void>;
  addPayoutMethod: (request: AddPayoutMethodRequest) => Promise<boolean>;
  updatePayoutMethod: (id: string, nickname?: string, setAsDefault?: boolean) => Promise<boolean>;
  deletePayoutMethod: (id: string) => Promise<boolean>;
  setDefaultPayoutMethod: (id: string) => Promise<boolean>;

  // Actions - Banks
  fetchBanks: () => Promise<void>;
  verifyAccount: (bankCode: string, accountNumber: string) => Promise<{ success: boolean; accountName?: string; message?: string }>;

  // Actions - Legacy (for backward compatibility)
  setPayoutAccount: (account: PayoutAccount) => Promise<void>;
  addPayoutHistory: (payout: PayoutHistoryItem) => void;
  setEarningBalance: (balance: number) => void;
  initiatePayout: (amount: number) => Promise<void>;
  clearError: () => void;
}

export const usePayoutStore = create<PayoutStore>((set, get) => ({
  // Initial state
  payoutAccount: null,
  payoutMethods: [],
  banks: [],
  payoutHistory: [],
  earningBalance: 0,
  isLoading: false,
  isBanksLoading: false,
  isVerifying: false,
  error: null,

  // Fetch all payout methods
  fetchPayoutMethods: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await payoutService.getPayoutMethods();
      const methods = response.data.payoutMethods;

      // Set the default method as the current payout account
      const defaultMethod = methods.find((m) => m.isDefault) || methods[0];
      const payoutAccount: PayoutAccount | null = defaultMethod
        ? {
            id: defaultMethod.id,
            accountNumber: defaultMethod.maskedAccountNumber,
            bankName: defaultMethod.bankName,
            accountName: defaultMethod.accountName,
            bankCode: defaultMethod.bankCode,
            isDefault: defaultMethod.isDefault,
            nickname: defaultMethod.nickname,
          }
        : null;

      set({
        payoutMethods: methods,
        payoutAccount,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to fetch payout methods"),
        isLoading: false,
      });
    }
  },

  // Add new payout method
  addPayoutMethod: async (request: AddPayoutMethodRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await payoutService.addPayoutMethod(request);

      if (response.data.success && response.data.payoutMethod) {
        const newMethod = response.data.payoutMethod;
        const { payoutMethods } = get();

        // If setAsDefault, update other methods
        const updatedMethods = request.setAsDefault
          ? payoutMethods.map((m) => ({ ...m, isDefault: false }))
          : payoutMethods;

        set({
          payoutMethods: [...updatedMethods, newMethod],
          isLoading: false,
        });

        // If it's the default or only method, set it as current account
        if (newMethod.isDefault || updatedMethods.length === 0) {
          set({
            payoutAccount: {
              id: newMethod.id,
              accountNumber: newMethod.maskedAccountNumber,
              bankName: newMethod.bankName,
              accountName: newMethod.accountName,
              bankCode: newMethod.bankCode,
              isDefault: newMethod.isDefault,
              nickname: newMethod.nickname,
            },
          });
        }

        return true;
      }

      set({
        error: response.data.message || "Failed to add payout method",
        isLoading: false,
      });
      return false;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to add payout method"),
        isLoading: false,
      });
      return false;
    }
  },

  // Update payout method
  updatePayoutMethod: async (id: string, nickname?: string, setAsDefault?: boolean) => {
    set({ isLoading: true, error: null });
    try {
      await payoutService.updatePayoutMethod(id, { nickname, setAsDefault });

      const { payoutMethods } = get();
      const updatedMethods = payoutMethods.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            nickname: nickname ?? m.nickname,
            isDefault: setAsDefault ?? m.isDefault,
          };
        }
        // If setting a new default, unset others
        if (setAsDefault) {
          return { ...m, isDefault: false };
        }
        return m;
      });

      set({ payoutMethods: updatedMethods, isLoading: false });

      // Update current payout account if it's the one being modified
      const { payoutAccount } = get();
      if (payoutAccount?.id === id) {
        set({
          payoutAccount: {
            ...payoutAccount,
            nickname: nickname ?? payoutAccount.nickname,
            isDefault: setAsDefault ?? payoutAccount.isDefault,
          },
        });
      }

      return true;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to update payout method"),
        isLoading: false,
      });
      return false;
    }
  },

  // Delete payout method
  deletePayoutMethod: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await payoutService.deletePayoutMethod(id);

      const { payoutMethods, payoutAccount } = get();
      const updatedMethods = payoutMethods.filter((m) => m.id !== id);

      set({ payoutMethods: updatedMethods, isLoading: false });

      // If the deleted method was the current account, select another
      if (payoutAccount?.id === id) {
        const newDefault = updatedMethods.find((m) => m.isDefault) || updatedMethods[0];
        set({
          payoutAccount: newDefault
            ? {
                id: newDefault.id,
                accountNumber: newDefault.maskedAccountNumber,
                bankName: newDefault.bankName,
                accountName: newDefault.accountName,
                bankCode: newDefault.bankCode,
                isDefault: newDefault.isDefault,
                nickname: newDefault.nickname,
              }
            : null,
        });
      }

      return true;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to delete payout method"),
        isLoading: false,
      });
      return false;
    }
  },

  // Set default payout method
  setDefaultPayoutMethod: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await payoutService.setDefaultPayoutMethod(id);

      const { payoutMethods } = get();
      const updatedMethods = payoutMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }));

      const newDefault = updatedMethods.find((m) => m.id === id);

      set({
        payoutMethods: updatedMethods,
        payoutAccount: newDefault
          ? {
              id: newDefault.id,
              accountNumber: newDefault.maskedAccountNumber,
              bankName: newDefault.bankName,
              accountName: newDefault.accountName,
              bankCode: newDefault.bankCode,
              isDefault: true,
              nickname: newDefault.nickname,
            }
          : get().payoutAccount,
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to set default payout method"),
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch supported banks
  fetchBanks: async () => {
    set({ isBanksLoading: true });
    try {
      const response = await payoutService.getBanks();
      set({
        banks: response.data.banks,
        isBanksLoading: false,
      });
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to fetch banks"),
        isBanksLoading: false,
      });
    }
  },

  // Verify bank account
  verifyAccount: async (bankCode: string, accountNumber: string) => {
    set({ isVerifying: true, error: null });
    try {
      const response = await payoutService.verifyAccount({ bankCode, accountNumber });
      set({ isVerifying: false });
      return {
        success: response.data.success,
        accountName: response.data.accountName,
        message: response.data.message,
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to verify account");
      set({ isVerifying: false, error: message });
      return { success: false, message };
    }
  },

  // Legacy: Set payout account (for backward compatibility)
  setPayoutAccount: async (account: PayoutAccount) => {
    set({ isLoading: true, error: null });
    try {
      // If this is a new account with bankCode, add it via API
      if (account.bankCode) {
        const success = await get().addPayoutMethod({
          bankCode: account.bankCode,
          accountNumber: account.accountNumber,
          setAsDefault: true,
        });
        if (!success) {
          return;
        }
      }
      set({ payoutAccount: account, isLoading: false });
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Failed to save payout account"),
        isLoading: false,
      });
    }
  },

  // Add payout history
  addPayoutHistory: (payout: PayoutHistoryItem) => {
    const { payoutHistory, earningBalance } = get();
    const newBalance = Math.max(0, earningBalance - payout.amount);
    set({
      payoutHistory: [payout, ...payoutHistory],
      earningBalance: newBalance,
    });
  },

  // Set earning balance
  setEarningBalance: (balance: number) => {
    set({ earningBalance: balance });
  },

  // Initiate payout (uses earningsService.requestWithdrawal)
  initiatePayout: async (amount: number) => {
    const { payoutAccount, earningBalance } = get();
    if (!payoutAccount) {
      set({ error: "No payout account configured" });
      return;
    }
    if (amount > earningBalance) {
      set({ error: "Insufficient balance" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Note: The actual withdrawal uses earningsService.requestWithdrawal
      // This store method is for UI state management
      // In a real integration, you'd call earningsService here

      // Add to history
      const newPayout: PayoutHistoryItem = {
        id: Date.now().toString(),
        accountName: payoutAccount.accountName,
        accountNumber: payoutAccount.accountNumber,
        bankName: payoutAccount.bankName,
        amount,
        status: "pending",
        date: new Date().toISOString(),
      };

      get().addPayoutHistory(newPayout);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: getApiErrorMessage(error, "Payout failed"),
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
