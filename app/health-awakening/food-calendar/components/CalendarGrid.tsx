import type { DayPlan } from "../types";
import { formatCurrency } from "../planLadder";

type Props = {
  plan: DayPlan[];
};

export function CalendarGrid({ plan }: Props) {
  return (
    <div className="grid gap-4 md:gap-5 md:grid-cols-2">
      {plan.map((day) => {
        const costBadges = (Object.keys(day.totalsByCurrency) as Array<
          keyof DayPlan["totalsByCurrency"]
        >)
          .filter((cur) => day.totalsByCurrency[cur])
          .map((cur) => ({
            currency: cur,
            amount: day.totalsByCurrency[cur] ?? 0,
          }));

        return (
          <div
            key={day.iso}
            className="rounded-2xl border border-base-300 bg-base-100/90 shadow-lg shadow-primary/5 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                  {day.iso}
                </p>
                <h2 className="text-lg font-semibold text-base-content">
                  {day.label}
                </h2>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[11px] text-base-content/70">Estimated</p>
                <p className="text-xl font-semibold text-base-content">
                  {day.kcalTotal.toLocaleString()} kcal
                </p>
                <div className="flex flex-wrap justify-end gap-1 text-[11px]">
                  {costBadges.map((cost) => (
                    <span
                      key={cost.currency}
                      className="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200/80 px-2 py-0.5 font-semibold"
                    >
                      {formatCurrency(cost.amount, cost.currency ?? "KWD")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {day.meals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-base-200 bg-base-50/80 p-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-base-content">
                        {item.label}
                      </p>
                      <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-semibold text-base-content/80">
                        {item.sourceType === "home"
                          ? "Cooked at home"
                          : item.sourceType === "outside"
                          ? "Outside meal"
                          : "Home or outside"}
                      </span>
                    </div>
                    <p className="text-[12px] text-base-content/80">
                      {item.defaultServingDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-base-content/80">
                      <span className="inline-flex items-center gap-1 rounded-full border border-base-200 bg-base-100 px-2 py-0.5 font-semibold">
                        {item.kcal} kcal
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-base-200 bg-base-100 px-2 py-0.5 font-semibold">
                        {formatCurrency(item.price, item.currency)}
                      </span>
                      {item.nameAr && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-base-200 bg-base-100 px-2 py-0.5 text-[10px]">
                          {item.nameAr}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
