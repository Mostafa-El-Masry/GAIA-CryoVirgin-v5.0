import { BrainContext } from "../types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function decideHealthReport(context: BrainContext) {
  const health = context.health;

  if (!health) {
    return {
      ok: false,
      code: "HEALTH.NO_DATA",
    };
  }

  const reports: string[] = [];

  if (typeof health.insulin === "number") {
    reports.push(
      `I checked your insulin levels. The latest value is ${health.insulin}.`,
      `Your insulin reading is ${health.insulin}.`,
      `I looked at your recent insulin data. It shows ${health.insulin}.`
    );
  }

  if (typeof health.waterIntake === "number") {
    reports.push(
      `Your recorded water intake is ${health.waterIntake}.`,
      `I see that your water intake is logged at ${health.waterIntake}.`,
      `Your hydration data shows ${health.waterIntake}.`
    );
  }

  if (health.lastRitualDate) {
    reports.push(
      `Your last recorded ritual was on ${health.lastRitualDate}.`,
      `I see a ritual entry dated ${health.lastRitualDate}.`,
      `The most recent ritual I can find is from ${health.lastRitualDate}.`
    );
  }

  if (reports.length === 0) {
    return {
      ok: false,
      code: "HEALTH.EMPTY",
    };
  }

  return {
    ok: true,
    code: "HEALTH.REPORT",
    meta: {
      text: pick(reports),
    },
  };
}
