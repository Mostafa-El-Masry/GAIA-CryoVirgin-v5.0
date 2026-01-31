"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import {
  useDesign,
  type ButtonStyle,
  type SearchStyle,
} from "@/app/DesignSystem/context/DesignProvider";
import { exportJSON, importJSON, loadData } from "@/app/apollo/lib/store";
import { THEMES, type Theme } from "@/app/DesignSystem/theme";
import SettingsPermissionsTab from "./SettingsPermissionsTab";
import {
  resetViews,
  getTagsMap,
  mergeItemTags,
  getAutoTagMeta,
  setAutoTagMeta,
} from "@/components/gallery/prefs";
import type { GalleryItem } from "@/components/gallery/types";
import { deriveAutoTags, AUTO_TAG_VERSION } from "@/components/gallery/tagging";
import PermissionGate from "@/components/permissions/PermissionGate";
import ProfilesCard from "./sections/ProfilesCard";
import FeatureUnlocksTab from "./sections/FeatureUnlocksTab";
import {
  onUserStorageReady,
  readJSON,
  setItem,
  subscribe as subscribeStorage,
} from "@/lib/user-storage";

const BUTTONS: ButtonStyle[] = ["solid", "outline", "ghost"];
const SEARCHES: SearchStyle[] = ["rounded", "pill", "underline"];

const THEME_OPTIONS = THEMES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

type GalleryStatus = {
  type: "loading" | "success" | "error" | "progress";
  message: string;
  progress?: number;
  detail?: string;
};

type ManifestResponse = {
  items?: GalleryItem[];
};

type TabId = "appearance" | "instagram" | "user" | "permissions" | "unlocks";

async function fetchGalleryManifest(): Promise<GalleryItem[]> {
  // Prefer the live API scan so freshly added media shows up immediately.
  try {
    const live = await fetch(`/api/instagram/scan?ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (live.ok) {
      const json = (await live.json()) as ManifestResponse;
      if (Array.isArray(json.items)) return json.items;
    }
  } catch {
    /* ignore API failure and fall through to static manifest */
  }

  try {
    const res = await fetch("/jsons/instagram-manifest.json", {
      cache: "no-store",
    });
    if (res.ok) {
      const json = (await res.json()) as ManifestResponse;
      if (Array.isArray(json.items)) return json.items;
    }
  } catch {
    /* surface error below */
  }

  throw new Error("Unable to load instagram manifest.");
}

function SettingsContent() {
  const { theme, setTheme, button, setButton, search, setSearch } = useDesign();

  const [syncing, setSyncing] = useState(false);
  const [autoTagging, setAutoTagging] = useState(false);
  const [autoTagProgress, setAutoTagProgress] = useState(0);
  const [instagramStatus, setInstagramStatus] = useState<GalleryStatus | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabId>("appearance");
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [voiceChoice, setVoiceChoice] = useState("__auto__");

  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: TabId; label: string }> = [
      { id: "appearance", label: "Appearance" },
      { id: "user", label: "User" },
      { id: "unlocks", label: "GAIA unlocks" },
      { id: "permissions", label: "Permissions" },
      { id: "instagram", label: "Instagram" },
      // Users tab removed to avoid server-side admin calls when proxy is not configured
    ];
    return tabs;
  }, []);

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    const applyStoredVoice = () => {
      const stored = readJSON<string | null>(
        "gaia.academy.voicePreference",
        null,
      );
      if (stored) setVoiceChoice(stored);
    };
    applyStoredVoice();
    const offReady = onUserStorageReady(applyStoredVoice);
    const offStorage = subscribeStorage(({ key, value }) => {
      if (key === "gaia.academy.voicePreference" && typeof value === "string") {
        setVoiceChoice(value);
      }
    });
    return () => {
      offReady();
      offStorage();
    };
  }, []);

  useEffect(() => {
    if (!speechSupported) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices || []);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [speechSupported]);

  // Users/admin UI removed to avoid server-side admin calls when the project
  // is running without Supabase service-role credentials (local/dev).

  const handleSyncInstagram = useCallback(async () => {
    setSyncing(true);
    setInstagramStatus({
      type: "loading",
      message: "Syncing instagram... please wait.",
    });
    try {
      const res = await fetch("/api/instagram/scan", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Sync failed with status ${res.status}`);
      }
      window.dispatchEvent(new Event("instagram:refresh"));
      setInstagramStatus({
        type: "success",
        message: "Instagram sync requested. The instagram will reload shortly.",
      });
    } catch (error) {
      console.error(error);
      setInstagramStatus({
        type: "error",
        message: "Could not sync instagram. Please try again.",
      });
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleResetViews = useCallback(() => {
    resetViews();
    setInstagramStatus({
      type: "success",
      message: "Instagram watch stats reset.",
    });
  }, []);

  const handleAutoTagging = useCallback(async () => {
    if (autoTagging) return;
    setAutoTagging(true);
    setAutoTagProgress(0);
    setInstagramStatus({
      type: "progress",
      message: "Auto-tagging media... 0%",
      progress: 0,
    });
    try {
      const items = await fetchGalleryManifest();
      if (!items.length) {
        setInstagramStatus({
          type: "success",
          message: "No instagram items available to tag.",
        });
        return;
      }
      const tagMap = getTagsMap();
      const autoMeta = getAutoTagMeta();
      let updatedItems = 0;
      let totalNewTags = 0;
      let previouslyTagged = 0;

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const manualTags = tagMap[item.id] ?? [];
        const existingMeta = autoMeta[item.id];
        if (existingMeta?.version === AUTO_TAG_VERSION) {
          previouslyTagged += 1;
          continue;
        }

        const derived = deriveAutoTags(item);
        // deriveAutoTags returns an object { id, tags, matchedKeywords }
        // ensure there are discovered tags before continuing
        if (!derived || !derived.tags || derived.tags.length === 0) continue;

        // compute new tags that aren't already present (manual tags or item.tags)
        const existingTags = new Set<string>([
          ...(manualTags ?? []),
          ...(item.tags ?? []),
        ]);
        const newTags = derived.tags.filter((t) => !existingTags.has(t));

        if (newTags.length > 0) {
          // merge into storage and update local map
          mergeItemTags(item.id, newTags);
          tagMap[item.id] = Array.from(new Set([...existingTags, ...newTags]));
          updatedItems += 1;
          totalNewTags += newTags.length;
        } else if (autoMeta[item.id]) {
          previouslyTagged += 1;
        }

        // update auto-tag metadata entry
        autoMeta[item.id] = {
          version: AUTO_TAG_VERSION,
          tags: derived.tags,
          updatedAt: new Date().toISOString(),
        };

        const progress = (i + 1) / items.length;
        setAutoTagProgress(progress);
        setInstagramStatus({
          type: "progress",
          progress,
          message: `Auto-tagging media... ${Math.round(progress * 100)}%`,
          detail: `Processed ${i + 1} of ${items.length} items`,
        });
      }

      // Persist auto tag metadata per item
      for (const [id, meta] of Object.entries(autoMeta)) {
        // meta is AutoTagMeta
        setAutoTagMeta(id, meta as any);
      }
      window.dispatchEvent(
        new CustomEvent("instagram:tags-updated", { detail: { tagMap } }),
      );
      window.dispatchEvent(new Event("storage"));

      setInstagramStatus({
        type: "success",
        message: "Auto-tagging complete.",
        detail: `Updated ${updatedItems} items (${totalNewTags} new tags). ${previouslyTagged} items were already up to date.`,
      });
    } catch (error) {
      console.error(error);
      setInstagramStatus({
        type: "error",
        message: "Auto-tagging failed. Please try again later.",
      });
    } finally {
      setAutoTagging(false);
      setAutoTagProgress(0);
    }
  }, [autoTagging]);

  const handleExportApollo = useCallback(() => {
    const data = loadData();
    exportJSON(data);
  }, []);

  const handleImportApollo = useCallback(() => {
    importJSON((data) => {
      try {
        window.dispatchEvent(
          new CustomEvent("gaia:apollo:data", { detail: { data } }),
        );
      } catch {
        // no-op if window not available
      }
    });
  }, []);

  const voiceDisplayName = useMemo(() => {
    if (voiceChoice === "__auto__") return "Auto";
    return (
      availableVoices.find((v) => v.voiceURI === voiceChoice)?.name ?? "Unknown"
    );
  }, [voiceChoice, availableVoices]);

  const handleVoiceChange = useCallback((value: string) => {
    setVoiceChoice(value);
    setItem("gaia.academy.voicePreference", value);
  }, []);

  return (
    <PermissionGate permission="settings">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  isActive ? "gaia-contrast" : "gaia-border gaia-hover-soft"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "appearance" && (
          <>
            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Theme</h2>
              <select
                className="w-full rounded border gaia-border px-3 py-2 text-sm"
                value={theme}
                onChange={(event) => setTheme(event.target.value as Theme)}
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs gaia-muted">
                Applies everywhere. Stored in your browser.
              </p>
            </section>

            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Button</h2>
              <div className="flex flex-wrap items-center gap-2">
                {BUTTONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setButton(b)}
                    className={`rounded border px-3 py-1 text-sm capitalize ${
                      button === b
                        ? "gaia-contrast"
                        : "gaia-border gaia-hover-soft"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Search bar</h2>
              <div className="flex flex-wrap items-center gap-2">
                {SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearch(s)}
                    className={`rounded border px-3 py-1 text-sm capitalize ${
                      search === s
                        ? "gaia-contrast"
                        : "gaia-border gaia-hover-soft"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-lg border gaia-border p-4">
              <h2 className="font-medium">Apollo archives</h2>
              <p className="text-sm gaia-muted">
                Export a backup of your local Apollo notes or import a saved
                JSON file.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportApollo}
                  className="rounded border px-3 py-1 text-sm gaia-contrast"
                >
                  Export archive
                </button>
                <button
                  type="button"
                  onClick={handleImportApollo}
                  className="rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft"
                >
                  Import archive
                </button>
              </div>
              <p className="text-xs gaia-muted">
                Data stays on this device; imports overwrite your current local
                archive.
              </p>
            </section>
          </>
        )}

        {activeTab === "user" && (
          <section className="space-y-3 rounded-lg border gaia-border p-4">
            <h2 className="font-medium">User</h2>
            <p className="text-sm gaia-muted">
              No Supabase user is currently signed in.
            </p>
            <p className="text-xs gaia-muted">
              Sign in via GAIA to manage your user profile.
            </p>

            <div className="rounded border gaia-border p-3">
              <p className="text-sm font-semibold">Lesson narration voice</p>
              <p className="text-xs gaia-muted">
                Pick the voice used for lesson read-aloud. This preference
                follows your user storage.
              </p>
              {speechSupported && availableVoices.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    value={voiceChoice}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="rounded border gaia-border bg-[var(--gaia-surface)] px-3 py-1.5 text-sm gaia-contrast focus:border-info focus:ring-2 focus:ring-info/20"
                  >
                    <option value="__auto__">Auto (female preferred)</option>
                    {availableVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} {voice.lang ? `(${voice.lang})` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="text-[12px] gaia-muted">
                    Currently: {voiceDisplayName}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs gaia-muted">
                  Voice selection is unavailable in this browser.
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "unlocks" && <FeatureUnlocksTab />}

        {activeTab === "permissions" && <SettingsPermissionsTab />}

        {activeTab === "instagram" && (
          <section className="space-y-3 rounded-lg border gaia-border p-4">
            <h2 className="font-medium">Gallery maintenance</h2>
            <p className="text-sm gaia-muted">
              Trigger a new scan or clear saved watch/preview time tracked on
              this device.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncInstagram}
                className={`rounded border px-3 py-1 text-sm ${
                  syncing
                    ? "cursor-not-allowed opacity-70 gaia-contrast"
                    : "gaia-contrast"
                }`}
                disabled={syncing}
                aria-busy={syncing}
              >
                {syncing ? "Syncing..." : "Sync gallery"}
              </button>
              <button
                type="button"
                onClick={handleResetViews}
                className="rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft"
              >
                Reset watch data
              </button>
              <button
                type="button"
                onClick={handleAutoTagging}
                className={`rounded border px-3 py-1 text-sm gaia-border gaia-hover-soft ${
                  autoTagging ? "cursor-not-allowed opacity-70" : ""
                }`}
                disabled={autoTagging}
                aria-busy={autoTagging}
              >
                {autoTagging
                  ? `Auto-tagging ${Math.round(autoTagProgress * 100)}%`
                  : "Auto-tag media"}
              </button>
            </div>
            {instagramStatus && (
              <div
                className={`mt-2 space-y-2 rounded border px-3 py-2 text-xs ${
                  instagramStatus.type === "error"
                    ? "border-red-500 text-red-400"
                    : instagramStatus.type === "success"
                      ? "border-green-500 text-green-400"
                      : "border-blue-500 text-blue-300"
                }`}
                role="status"
                aria-live="polite"
              >
                {(instagramStatus.type === "loading" ||
                  instagramStatus.type === "progress") && (
                  <progress
                    className="h-2 w-full overflow-hidden rounded bg-transparent"
                    max={1}
                    value={instagramStatus.progress ?? undefined}
                  />
                )}
                <p className="font-medium">{instagramStatus.message}</p>
                {instagramStatus.detail && (
                  <p className="text-[11px] opacity-75">
                    {instagramStatus.detail}
                  </p>
                )}
                {instagramStatus.type === "success" &&
                  !instagramStatus.detail && (
                    <p className="text-[11px] opacity-75">
                      You can return to the instagram to view the latest items.
                    </p>
                  )}
                {instagramStatus.type === "error" && (
                  <p className="text-[11px] opacity-75">
                    Check your connection or try again later.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Users admin table removed to avoid server-side admin calls when proxy is not configured */}
      </main>
    </PermissionGate>
  );
}

function SettingsLocked() {
  return null;
}

export default function SettingsPage() {
  const { isFeatureUnlocked, totalLessonsCompleted } = useGaiaFeatureUnlocks();

  if (!isFeatureUnlocked("settings")) {
    return <SettingsLocked />;
  }

  return <SettingsContent />;
}
