export interface DashboardStats {
  totalEarnings: number;
  totalPlays: number;
  totalFollowers: number;
  totalUploads: number;
  earningsChange: number;
  playsChange: number;
  followersChange: number;
  uploadsChange: number;
}

export interface RecentSale {
  id: string;
  track: string;
  platform: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface PerformanceData {
  date: string;
  streams: number;
  followers: number;
  revenue: number;
}
