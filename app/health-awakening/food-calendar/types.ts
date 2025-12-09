import type { FoodItem } from "../lib/foodLibrary";

export type DayPlan = {
  iso: string;
  label: string;
  meals: FoodItem[];
  kcalTotal: number;
  totalsByCurrency: Partial<Record<FoodItem["currency"], number>>;
};
