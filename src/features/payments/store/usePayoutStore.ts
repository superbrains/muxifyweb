import { create } from "zustand";

export interface PayoutAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export interface PayoutHistoryItem {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  amount: number;
  status: "success" | "failed" | "pending";
  date: string;
}

interface PayoutStore {
  // State
  payoutAccount: PayoutAccount | null;
  payoutHistory: PayoutHistoryItem[];
  earningBalance: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPayoutAccount: (account: PayoutAccount) => Promise<void>;
  addPayoutHistory: (payout: PayoutHistoryItem) => void;
  setEarningBalance: (balance: number) => void;
  initiatePayout: (amount: number) => Promise<void>;
  clearError: () => void;
}

export const usePayoutStore = create<PayoutStore>((set, get) => ({
  // Initial state
  payoutAccount: null,
  payoutHistory: [],
  earningBalance: 75550000,
  isLoading: false,
  error: null,

  // Set payout account
  setPayoutAccount: async (account: PayoutAccount) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ payoutAccount: account, isLoading: false });
    } catch {
      set({
        error: "Failed to save payout account. Please try again.",
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

  // Initiate payout
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add to history
      const newPayout: PayoutHistoryItem = {
        id: Date.now().toString(),
        accountName: payoutAccount.accountName,
        accountNumber: payoutAccount.accountNumber,
        bankName: payoutAccount.bankName,
        amount,
        status: "success",
        date: new Date().toISOString(),
      };

      get().addPayoutHistory(newPayout);
      set({ isLoading: false });
    } catch {
      set({
        error: "Payout failed. Please try again.",
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
