import type { FoodItem } from "../../lib/foodLibrary";
import type { DayPlan } from "../types";
import { formatCurrency } from "../planLadder";
import type { WorkoutExercise } from "../../lib/workoutLibrary";

type Props = {
  plan: DayPlan[];
  pepsiCounts: Record<string, number>;
  onPepsiChange: (iso: string, next: number) => void;
  selectedMeals?: Record<string, string>;
  onMealChange: (iso: string, mealId: string) => void;
  selectedExercises?: Record<string, string>;
  onExerciseChange: (iso: string, exerciseId: string) => void;
  trainingCounts: Record<string, number>;
  onTrainingCountChange: (iso: string, count: number) => void;
  foodOptions: FoodItem[];
  exerciseOptions: WorkoutExercise[];
};

const PEPSI_KCAL = 150;
const PEPSI_PRICE = 0.25;
const PEPSI_CURRENCY: "KWD" = "KWD";

export function CalendarGrid({
  plan,
  pepsiCounts,
  onPepsiChange,
  selectedMeals,
  onMealChange,
  selectedExercises,
  onExerciseChange,
  trainingCounts,
  onTrainingCountChange,
  foodOptions,
  exerciseOptions,
}: Props) {
  return (
    <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {plan.map((day, idx) => {
        const pepsiCount = pepsiCounts[day.iso] ?? 0;
        const pepsiKcal = pepsiCount * PEPSI_KCAL;
        const pepsiCost = pepsiCount * PEPSI_PRICE;

        const selectedMealId = selectedMeals?.[day.iso];
        const selectedExerciseId = selectedExercises?.[day.iso];
        const selectedMeal = foodOptions.find((f) => f.id === selectedMealId);
        const selectedExercise = exerciseOptions.find(
          (ex) => ex.id === selectedExerciseId
        );
        const trainingCount = trainingCounts[day.iso] ?? 0;
        const mealKcal = selectedMeal?.kcal ?? 0;

        const totalsWithExtras = { ...day.totalsByCurrency };
        if (selectedMeal) {
          totalsWithExtras[selectedMeal.currency] =
            (totalsWithExtras[selectedMeal.currency] ?? 0) +
            selectedMeal.price;
        }
        totalsWithExtras[PEPSI_CURRENCY] =
          (totalsWithExtras[PEPSI_CURRENCY] ?? 0) + pepsiCost;

        const costBadges = (Object.keys(totalsWithExtras) as Array<
          keyof DayPlan["totalsByCurrency"]
        >)
          .filter((cur) => totalsWithExtras[cur])
          .map((cur) => ({
            currency: cur,
            amount: totalsWithExtras[cur] ?? 0,
          }));

        return (
          <div
            key={day.iso}
            className="rounded-2xl border border-white/60 bg-white/70 p-4 space-y-3 shadow-[0_18px_50px_rgba(110,78,52,0.2)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c3b1d]">
                  {day.iso}
                </p>
                <h2 className="text-lg font-semibold text-[#24170d]">
                  {day.label}
                </h2>
                <p className="text-[11px] text-[#3a2b20]">
                  {(day.kcalTotal + mealKcal + pepsiKcal).toLocaleString()} kcal
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[11px] text-[#3a2b20]">Estimated</p>
                <div className="flex flex-wrap justify-end gap-1 text-[11px] text-[#3a2b20]">
                  {costBadges.map((cost) => (
                    <span
                      key={cost.currency}
                      className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/60 px-2 py-0.5 font-semibold shadow-[0_6px_16px_rgba(110,78,52,0.12)]"
                    >
                      {formatCurrency(cost.amount, cost.currency ?? "KWD")}
                    </span>
                  ))}
                </div>
              </div>
              </div>

            <div className="space-y-2">
              <div className="rounded-xl border border-white/60 bg-white/70 p-3 shadow-[0_8px_20px_rgba(110,78,52,0.12)] space-y-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c3b1d]">
                    Choose lunch
                  </p>
                  <select
                    className="w-full rounded-lg border border-white/60 bg-white/80 px-2 py-2 text-[12px] text-[#24170d] shadow-[0_6px_14px_rgba(110,78,52,0.12)]"
                    value={selectedMealId ?? ""}
                    onChange={(e) => onMealChange(day.iso, e.target.value)}
                  >
                    <option value="">Select a meal</option>
                    {foodOptions.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.label}
                      </option>
                    ))}
                  </select>
                  {selectedMeal && (
                    <p className="text-[11px] text-[#3a2b20]">
                      {formatCurrency(selectedMeal.price, selectedMeal.currency)} ·{" "}
                      {selectedMeal.kcal} kcal
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c3b1d]">
                    Choose exercise
                  </p>
                  <select
                    className="w-full rounded-lg border border-white/60 bg-white/80 px-2 py-2 text-[12px] text-[#24170d] shadow-[0_6px_14px_rgba(110,78,52,0.12)]"
                  value={selectedExerciseId ?? ""}
                  onChange={(e) => onExerciseChange(day.iso, e.target.value)}
                >
                  <option value="">Select exercise</option>
                  {exerciseOptions.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c3b1d]">
                    Training count
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border border-white/60 bg-white/80 font-semibold shadow-[0_4px_12px_rgba(110,78,52,0.12)]"
                      onClick={() => onTrainingCountChange(day.iso, trainingCount - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={trainingCount}
                      onChange={(e) =>
                        onTrainingCountChange(day.iso, Number(e.target.value || 0))
                      }
                      className="w-16 rounded-lg border border-white/60 bg-white/80 px-2 py-1 text-center text-[12px] text-[#24170d] shadow-[0_6px_14px_rgba(110,78,52,0.12)]"
                    />
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border border-white/60 bg-white/80 font-semibold shadow-[0_4px_12px_rgba(110,78,52,0.12)]"
                      onClick={() => onTrainingCountChange(day.iso, trainingCount + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#24170d]">Pepsi</p>
                  <span className="text-[11px] text-[#3a2b20]">
                    +{PEPSI_KCAL} kcal / {formatCurrency(PEPSI_PRICE, PEPSI_CURRENCY || "KWD")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#3a2b20]">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full border border-white/60 bg-white/80 font-semibold shadow-[0_4px_12px_rgba(110,78,52,0.12)]"
                    onClick={() => onPepsiChange(day.iso, pepsiCount - 1)}
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-semibold">{pepsiCount}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full border border-white/60 bg-white/80 font-semibold shadow-[0_4px_12px_rgba(110,78,52,0.12)]"
                    onClick={() => onPepsiChange(day.iso, pepsiCount + 1)}
                  >
                    +
                  </button>
                </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
