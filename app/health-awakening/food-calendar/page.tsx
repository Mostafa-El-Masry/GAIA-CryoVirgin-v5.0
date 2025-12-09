import { SEED_FOOD_ITEMS } from "../lib/foodLibrary";
import { CalendarGrid } from "./components/CalendarGrid";
import { SidebarPanel } from "./components/SidebarPanel";
import { buildWeekPlan, formatCurrency } from "./planLadder";

export const revalidate = 0;

export default function FoodCalendarPage() {
  const plan = buildWeekPlan();

  return (
    <main className="min-h-screen bg-gradient-to-b from-base-200 via-base-200/70 to-base-300 text-base-content">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 md:px-6 space-y-8">
        <header className="rounded-3xl border border-base-300 bg-base-100/90 shadow-2xl shadow-primary/10 p-5 md:p-7 relative overflow-hidden">
          <div className="absolute right-8 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
                Health Awakening
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-base-content">
                Food Calendar (beta)
              </h1>
              <p className="text-sm text-base-content/80 max-w-2xl">
                Seven-day rotation seeded with real meals you already reach for. Calories and cost stay visible so you can keep the Health core in sync with what you actually eat.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-primary-content">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Local-first draft
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-secondary-content">
                  Food library: {SEED_FOOD_ITEMS.length} items
                </span>
              </div>
            </div>
            <SidebarPanel
              backHref="/health-awakening"
              focusTitle="Hydration + stable calories"
              focusSubtitle="Use this as a starter; swap meals as you log real intake."
            />
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/70">
                Next 7 days
              </p>
              <p className="text-sm text-base-content/80">
                Auto-rotated from your saved meals. Cost shown by currency.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-base-content/70">
              <span className="inline-flex h-3 w-3 rounded-full bg-primary/60" />
              Planned meal slot
            </div>
          </div>

          <CalendarGrid plan={plan} />
        </section>

        <section className="rounded-3xl border border-base-300 bg-base-100/90 shadow-xl shadow-primary/10 p-5 md:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/70">
                Food library
              </p>
              <h2 className="text-xl font-semibold text-base-content">
                Your current meals
              </h2>
              <p className="text-sm text-base-content/80">
                These seed meals feed the calendar. Add more later and the rotation adapts.
              </p>
            </div>
            <div className="rounded-full bg-base-200/80 px-3 py-1 text-[11px] font-semibold text-base-content/80 border border-base-300">
              {SEED_FOOD_ITEMS.length} items saved
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {SEED_FOOD_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-base-200 bg-base-50/80 p-4 shadow-inner"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      {item.label}
                    </p>
                    {item.nameAr && (
                      <p className="text-[11px] text-base-content/70">
                        {item.nameAr}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-semibold text-base-content/80">
                    {item.sourceType === "outside"
                      ? "Outside"
                      : item.sourceType === "home"
                      ? "Home"
                      : "Flexible"}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-base-content/80">
                  {item.defaultServingDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-base-content/80">
                  <span className="inline-flex items-center gap-1 rounded-full border border-base-200 bg-base-100 px-2 py-0.5 font-semibold">
                    {item.kcal} kcal
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-base-200 bg-base-100 px-2 py-0.5 font-semibold">
                    {formatCurrency(item.price, item.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
