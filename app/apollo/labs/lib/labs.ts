"use client";

import { readJSON } from "@/lib/user-storage";

export type BuildEntry = {
  conceptId: string;
  nodeId: string;
  trackId: string;
  trackTitle: string;
  title: string;
  note: string;
  embedUrl?: string;
  score?: number;
  total?: number;
  completedAt?: number;
};

type StoredResult = {
  conceptId?: string;
  nodeId?: string;
  trackId?: string;
  trackTitle?: string;
  title?: string;
  score?: number;
  total?: number;
  completedAt?: number;
  notes?: string;
  topic?: string;
  quizId?: string;
  createdAt?: number;
};

type StoredBuild = {
  conceptId?: string;
  note?: string;
  embedUrl?: string;
  title?: string;
  trackId?: string;
  trackTitle?: string;
  nodeId?: string;
};

const RESULT_KEYS = ["gaia.apollo.academy.results", "gaia.academy.results"];
const BUILD_KEYS = ["gaia.apollo.academy.builds", "gaia.academy.builds"];

function readFirstAvailable<T>(keys: string[]): T | null {
  for (const key of keys) {
    const value = readJSON<T | null>(key, null);
    if (value !== null) return value;
  }
  return null;
}

function normalizeResults(raw: unknown): Record<string, StoredResult> {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    return raw.reduce((acc, item, idx) => {
      if (!item || typeof item !== "object") return acc;
      const obj = item as StoredResult;
      const conceptId = obj.conceptId ?? obj.quizId ?? obj.topic ?? String(idx);
      acc[conceptId] = { ...obj, conceptId };
      return acc;
    }, {} as Record<string, StoredResult>);
  }

  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        if (!value || typeof value !== "object") return acc;
        const obj = value as StoredResult;
        const conceptId = obj.conceptId ?? obj.quizId ?? obj.topic ?? key;
        acc[conceptId] = { ...obj, conceptId };
        return acc;
      },
      {} as Record<string, StoredResult>
    );
  }

  return {};
}

function normalizeBuilds(raw: unknown): Record<string, StoredBuild> {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    return raw.reduce((acc, item, idx) => {
      if (!item || typeof item !== "object") return acc;
      const obj = item as StoredBuild;
      const conceptId = obj.conceptId ?? String(idx);
      acc[conceptId] = { ...obj, conceptId };
      return acc;
    }, {} as Record<string, StoredBuild>);
  }

  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        if (!value || typeof value !== "object") return acc;
        const obj = value as StoredBuild;
        const conceptId = obj.conceptId ?? key;
        acc[conceptId] = { ...obj, conceptId };
        return acc;
      },
      {} as Record<string, StoredBuild>
    );
  }

  return {};
}

function firstUrlFromText(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/https?:\/\/\S+/);
  return match?.[0];
}

/**
  Read stored academy build results and merge them with any saved build metadata.
  This no longer depends on a separate concepts dataset, so Labs works even when
  that file is missing in local clones.
*/
function listAcademyBuilds(): BuildEntry[] {
  const results = normalizeResults(readFirstAvailable<unknown>(RESULT_KEYS));
  const builds = normalizeBuilds(readFirstAvailable<unknown>(BUILD_KEYS));

  const ids = Array.from(
    new Set([...Object.keys(results), ...Object.keys(builds)])
  );

  return ids
    .map((id) => {
      const r = results[id] ?? {};
      const b = builds[id] ?? {};

      const conceptId = r.conceptId ?? b.conceptId ?? id;
      const note =
        typeof b.note === "string"
          ? b.note
          : typeof r.notes === "string"
          ? r.notes
          : "";
      const embedUrl = b.embedUrl ?? firstUrlFromText(note);

      const score = typeof r.score === "number" ? r.score : undefined;
      const total = typeof r.total === "number" ? r.total : undefined;
      const completedAt =
        typeof r.completedAt === "number"
          ? r.completedAt
          : typeof r.createdAt === "number"
          ? r.createdAt
          : undefined;

      const hasScore = typeof score === "number" && typeof total === "number";
      const hasContent = hasScore || Boolean(note) || Boolean(embedUrl);
      if (!hasContent) return null;

      return {
        conceptId,
        nodeId: r.nodeId ?? b.nodeId ?? r.quizId ?? conceptId,
        trackId: r.trackId ?? b.trackId ?? r.topic ?? "academy",
        trackTitle: r.trackTitle ?? b.trackTitle ?? r.topic ?? "Academy",
        title: r.title ?? b.title ?? `Concept ${conceptId}`,
        note,
        embedUrl,
        score: hasScore ? score : undefined,
        total: hasScore ? total : undefined,
        completedAt,
      } as BuildEntry;
    })
    .filter((b): b is BuildEntry => Boolean(b));
}

/**
 * Static demo builds that show up only when you have not completed any Academy builds yet.
 * They give Labs a useful baseline without polluting your real data.
 */
const demoBuilds: BuildEntry[] = [];

export function listBuilds(): BuildEntry[] {
  const academyBuilds = listAcademyBuilds();

  if (academyBuilds.length === 0) {
    // No completed concepts yet - show static demos so the UI has something to work with.
    return demoBuilds;
  }

  return academyBuilds;
}
