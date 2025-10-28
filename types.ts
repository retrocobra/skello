
export interface DailyData {
  date: string;
  revenue: number;
  costs: number;
}

export interface WeeklyTotal {
  revenue: number;
  costs: number;
}

export interface ExtractedStoreData {
  storeName: string;
  weekStartDate: string;
  dailyData: DailyData[];
  weeklyTotal: WeeklyTotal;
}
