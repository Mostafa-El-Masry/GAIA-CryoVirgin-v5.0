"use client";

import React, { useEffect, useState } from "react";
import type { AutoBoxResult } from "@/app/instagram/featureLogic";
import type { MediaItem } from "@/app/instagram/mediaTypes";
import { getAutoBoxResult } from "@/app/instagram/featureLogic";
import { MediaCard } from "@/app/instagram/components/MediaCard";

interface GalleryApiResponse {
  items: MediaItem[];
}

interface GalleryFeatureGetResponse {
  ok: boolean;
  date: string | null;
  feature: MediaItem | null;
  source?: "auto" | "manual";
  error?: string;
}

interface DashboardFeatureCardProps {
  className?: string;
}

/**
 * GAIA · Gallery 4.1 – Week 4
 *
 * Dashboard-ready card that surfaces one "auto-box" feature item from
 * the Gallery (image or video), with Supabase-backed feature history.
 *
 * Behaviour:
 *   - On mount, it first calls GET /api/gallery/feature.
 *       - If a feature is stored for today, it uses that.
 *       - If none exists yet, it falls back to:
 *           - GET /api/gallery
 *           - getAutoBoxResult(items)
 *         and still shows a valid highlight.
 *
 *   - NEW (Week 4):
 *       When it has to fall back to the live Gallery path AND finds
 *       a valid item, it will best-effort POST that item to
 *       /api/gallery/feature with source = 'auto', so the same
 *       feature is remembered for that date across devices.
 *
 *   - Any failures (missing table, API errors) are swallowed and
 *     logged to console only; the UI still shows a valid highlight.
 */
const DashboardFeatureCard: React.FC<DashboardFeatureCardProps> = ({
  className = "",
}) => {
  const [autoBox, setAutoBox] = useState<AutoBoxResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Try Supabase-backed daily feature first
        let usedStoredFeature = false;
        try {
          const featureRes = await fetch("/api/gallery/feature");
          if (featureRes.ok) {
            const featureData =
              (await featureRes.json()) as GalleryFeatureGetResponse;
            if (featureData.ok && featureData.feature) {
              if (!cancelled) {
                usedStoredFeature = true;
                setAutoBox({
                  item: featureData.feature,
                  // Map persisted feature source to AutoBoxReason values
                  reason:
                    featureData.source === "manual" ? "pinned" : "fallback",
                  label:
                    featureData.source === "manual"
                      ? "Pinned feature"
                      : "Saved feature",
                  description:
                    featureData.source === "manual"
                      ? "Manually pinned feature from your Gallery."
                      : "Automatically saved daily feature from your Gallery.",
                });
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          // If the feature endpoint fails (e.g. table not created yet),
          // we silently fall back to live auto-box behaviour below.
          console.warn(
            "[Gallery] /api/gallery/feature not available, falling back.",
            err,
          );
        }

        // 2) Fallback – compute from live Gallery items
        const res = await fetch("/api/gallery");
        if (!res.ok) {
          throw new Error(`Gallery API error: ${res.status}`);
        }
        const data = (await res.json()) as GalleryApiResponse;
        const items = (data.items ?? []) as MediaItem[];

        if (!items.length) {
          if (!cancelled) {
            setAutoBox({
              item: null,
              reason: "fallback",
              label: "No media yet",
              description:
                "Add some photos or videos to the Gallery to see a daily feature here.",
            });
          }
          return;
        }

        const result = getAutoBoxResult(items);
        if (!cancelled) {
          setAutoBox(result);
        }

        // 3) Week 4: auto-save this feature for today if we didn't
        //    already have a stored one. This is best-effort only;
        //    errors are logged but never shown in the UI.
        if (!usedStoredFeature && result.item) {
          try {
            await fetch("/api/gallery/feature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                feature: result.item,
                source: "auto",
              }),
            });
          } catch (postErr) {
            console.warn(
              "[Gallery] Failed to auto-save daily feature",
              postErr,
            );
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Gallery feature.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const rootClasses =
    "rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm flex flex-col gap-3";

  const badgeLabel = (() => {
    if (!autoBox?.item) return null;
    if (autoBox.reason === "pinned") return "Pinned";
    // Treat computed contextual reasons as "Saved" and fallbacks as "Auto"
    if (
      autoBox.reason === "this_month" ||
      autoBox.reason === "nostalgia_week" ||
      autoBox.reason === "power_tag" ||
      autoBox.reason === "favorite_tag"
    )
      return "Saved";
    if (autoBox.reason === "fallback") return "Auto";
    return null;
  })();

  return (
    <section className={`${rootClasses} ${className}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary">
              Gallery · Auto Feature
            </p>
            {badgeLabel && (
              <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-2 py-[1px] text-[10px] uppercase tracking-wide text-primary">
                {badgeLabel}
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-base-content">
            Today&apos;s highlight
          </h2>
          {autoBox?.description && (
            <p className="text-[11px] text-base-content/70 max-w-xs">
              {autoBox.description}
            </p>
          )}
        </div>
        <a
          href="/instagram"
          className="inline-flex items-center justify-center rounded-md border border-primary/60 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
        >
          Open Gallery
        </a>
      </header>

      {loading && (
        <p className="text-[11px] text-base-content/70">
          Loading today&apos;s feature…
        </p>
      )}

      {error && !loading && <p className="text-[11px] text-red-500">{error}</p>}

      {!loading && !error && autoBox && !autoBox.item && (
        <div className="rounded-lg border border-dashed border-base-300 bg-base-100 p-3 text-[11px] text-base-content/70">
          <p className="font-medium text-base-content">No feature yet</p>
          <p className="mt-1">
            Once you have media items in your Gallery (R2 images or local
            videos), GAIA will surface one here as a small daily highlight.
          </p>
        </div>
      )}

      {!loading && !error && autoBox?.item && (
        <div className="mt-1">
          <MediaCard item={autoBox.item} onClick={() => {}} isCurrent={false} />
        </div>
      )}
    </section>
  );
};

export default DashboardFeatureCard;
