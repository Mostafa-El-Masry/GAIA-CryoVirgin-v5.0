import { SEED_FOOD_ITEMS, type FoodItem } from "../lib/foodLibrary";
import type { DayPlan } from "./types";

export function isoFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildWeekPlan(startDate?: Date): DayPlan[] {
  const base = startDate ? new Date(startDate) : new Date();
  base.setHours(0, 0, 0, 0);
  const meals = SEED_FOOD_ITEMS;
  const length = meals.length || 1;

  return Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(base);
    d.setDate(base.getDate() + idx);

    const rotation: FoodItem[] = [];

    const totalsByCurrency: Partial<Record<FoodItem["currency"], number>> = {};
    let kcalTotal = 0;

    rotation.forEach((item) => {
      kcalTotal += item.kcal;
      totalsByCurrency[item.currency] =
        (totalsByCurrency[item.currency] ?? 0) + item.price;
    });

    const label = d.toLocaleDateString("en-US", {
      weekday: "long",
    });

    return {
      iso: isoFromDate(d),
      label,
      meals: rotation,
      kcalTotal,
      totalsByCurrency,
    };
  });
}

export function formatCurrency(
  amount: number,
  currency: FoodItem["currency"]
): string {
  const symbol = currency === "KWD" ? "KD" : "EGP";
  return `${symbol} ${amount.toFixed(2)}`;
}
