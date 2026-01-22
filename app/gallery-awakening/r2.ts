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
const base =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_IMG_CDN_BASE ||
  process.env.NEXT_PUBLIC_GAIA_GALLERY_URL ||
  process.env.NEXT_PUBLIC_GAIA_GALLERY_FALLBACK;

const previewBase =
  process.env.NEXT_PUBLIC_GAIA_PREVIEWS_URL ||
  process.env.NEXT_PUBLIC_R2_PREVIEWS_BASE_URL ||
  base;

export function hasR2PublicBase(): boolean {
  return Boolean(base && typeof base === 'string');
}

export function hasR2PreviewBase(): boolean {
  return Boolean(previewBase && typeof previewBase === 'string');
}

function buildR2Url(key: string, customBase?: string): string {
  if (!key) return '/placeholder-gallery-image.png';
  if (key.startsWith('http://') || key.startsWith('https://')) return key;

  const effectiveBase = customBase || base;
  if (effectiveBase && typeof effectiveBase === 'string') {
    const trimmedBase = effectiveBase.replace(/\/$/, '');
    const normalizedKey = key.replace(/^\/+/, '');
    return `${trimmedBase}/${normalizedKey}`;
  }

  // Fallback: if no base is configured, return a placeholder.
  return `/placeholder-gallery-image.png`;
}

/**
 * Turn an R2 object key into a URL, or fall back to an API proxy path.
 */
export function getR2Url(key: string): string {
  return buildR2Url(key, base);
}

/**
 * Dedicated helper for preview frames (separate bucket/CDN).
 * Falls back to the main R2 base when a preview CDN isn't set.
 */
export function getR2PreviewUrl(key: string): string {
  return buildR2Url(key, previewBase);
}
