export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  type: "earnings" | "payout" | "refund";
  description: string;
  createdAt: string;
  processedAt?: string;
}

export interface Earnings {
  id: string;
  trackId: string;
  trackTitle: string;
  platform: string;
  amount: number;
  currency: string;
  period: string;
  createdAt: string;
}

export interface PayoutMethod {
  id: string;
  type: "bank_account" | "paypal" | "stripe";
  isDefault: boolean;
  details: {
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    email?: string;
  };
  createdAt: string;
}
