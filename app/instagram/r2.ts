/**
 * Small helper for building public URLs for Cloudflare R2.
 *
 * In your environment, set:
 *   NEXT_PUBLIC_R2_PUBLIC_BASE_URL=https://<your-domain-or-r2-endpoint>
 *
 * Example:
 *   https://media.example.com
 *   https://<account-id>.r2.cloudflarestorage.com/<bucket-name>
 *
 * We keep this helper very small so the Gallery remains portable.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_IMG_CDN_BASE ||
  process.env.NEXT_PUBLIC_GAIA_GALLERY_URL ||
  process.env.NEXT_PUBLIC_GAIA_GALLERY_FALLBACK;

const PREVIEW_BASE_URL =
  process.env.NEXT_PUBLIC_GAIA_PREVIEWS_URL ||
  process.env.NEXT_PUBLIC_R2_PREVIEWS_BASE_URL ||
  BASE_URL;

const PLACEHOLDER = "/placeholder-gallery-image.png";

/**
 * Check if R2 base URL is configured.
 */
export function hasR2PublicBase(): boolean {
  return Boolean(BASE_URL && typeof BASE_URL === "string");
}

/**
 * Check if R2 preview base URL is configured.
 */
export function hasR2PreviewBase(): boolean {
  return Boolean(PREVIEW_BASE_URL && typeof PREVIEW_BASE_URL === "string");
}

/**
 * Build a full R2 URL from an object key.
 * @param key - R2 object key or full URL
 * @param customBase - Optional custom base URL to override defaults
 * @returns Full URL or placeholder if no base is configured
 */
function buildR2Url(key: string, customBase?: string): string {
  if (!key) return PLACEHOLDER;

  // Already a full URL
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }

  const effectiveBase = customBase || BASE_URL;
  if (effectiveBase && typeof effectiveBase === "string") {
    const trimmedBase = effectiveBase.replace(/\/$/, "");
    const normalizedKey = key.replace(/^\/+/, "");
    return `${trimmedBase}/${normalizedKey}`;
  }

  return PLACEHOLDER;
}

/**
 * Turn an R2 object key into a public URL.
 */
export function getR2Url(key: string): string {
  return buildR2Url(key, BASE_URL);
}

/**
 * Build URL for preview/thumbnail images (may use separate CDN).
 * Falls back to main R2 base when preview CDN isn't configured.
 */
export function getR2PreviewUrl(key: string): string {
  return buildR2Url(key, PREVIEW_BASE_URL);
}
