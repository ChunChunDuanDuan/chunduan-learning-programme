export const MEAL_PERIODS = [
  "BREAKFAST",
  "BREAKFAST_TO_LUNCH",
  "LUNCH",
  "LUNCH_TO_DINNER",
  "DINNER",
  "AFTER_DINNER",
] as const;

export type MealPeriod = (typeof MEAL_PERIODS)[number];

export const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  BREAKFAST: "Breakfast",
  BREAKFAST_TO_LUNCH: "Breakfast to Lunch",
  LUNCH: "Lunch",
  LUNCH_TO_DINNER: "Lunch to Dinner",
  DINNER: "Dinner",
  AFTER_DINNER: "After Dinner",
};

export type FoodEntry = {
  id: string;
  user_id: string;
  date: string;
  meal_period: MealPeriod;
  food_name: string;
  amount: string | null;
  note: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WeightEntry = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  created_at: string;
  updated_at: string;
};

export const WEIGHT_RANGES = [
  "7d",
  "14d",
  "4w",
  "8w",
  "3m",
  "6m",
  "1y",
  "all",
] as const;

export type WeightRange = (typeof WEIGHT_RANGES)[number];

export const WEIGHT_RANGE_LABELS: Record<WeightRange, string> = {
  "7d": "Last 7 Days",
  "14d": "Last 14 Days",
  "4w": "Last 4 Weeks",
  "8w": "Last 8 Weeks",
  "3m": "Last 3 Months",
  "6m": "Last 6 Months",
  "1y": "Last Year",
  all: "All Records",
};
