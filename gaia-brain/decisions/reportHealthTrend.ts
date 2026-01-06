import { BrainContext } from "../types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function decideHealthTrend(context: BrainContext) {
  const health = context.health;
  if (!health?.history) {
    return { ok: false, code: "HEALTH.NO_HISTORY" };
  }

  const insulinHistory = health.history.insulin;
  if (!Array.isArray(insulinHistory) || insulinHistory.length < 3) {
    return { ok: false, code: "HEALTH.INSUFFICIENT_DATA" };
  }

  const recent = insulinHistory.slice(-3);
  const first = recent[0].value;
  const last = recent[recent.length - 1].value;

  const delta = last - first;

  const phrases: string[] = [];

  phrases.push(
    `I reviewed your insulin readings over the last few entries.`,
    `I looked at how your insulin has been changing recently.`,
    `I checked a short window of your insulin history.`
  );

  if (delta !== 0) {
    phrases.push(
      `There has been a change of ${delta} across the last ${recent.length} records.`,
      `Across the last ${recent.length} readings, the values shifted by ${delta}.`,
      `Comparing recent entries, the difference comes out to ${delta}.`
    );
  } else {
    phrases.push(
      `The last few insulin readings are close to each other.`,
      `Recent insulin values appear consistent.`,
      `There isn’t much variation in the latest insulin entries.`
    );
  }

  return {
    ok: true,
    code: "HEALTH.TREND",
    meta: {
      text: pick([`${pick(phrases.slice(0, 3))} ${pick(phrases.slice(3))}`]),
    },
  };
}
