const EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|bmp|tiff|heic|heif|mp4|mov|mkv|avi|webm|m4v|flv|wmv)$/i;

/**
 * Remove common image/video extensions for display-only labels.
 * Gracefully handles missing or non-string titles.
 */
export function formatMediaTitle(title?: string | null): string {
  if (typeof title !== 'string') return 'Untitled';

  const trimmed = title.trim();
  if (!trimmed) return 'Untitled';

  return trimmed.replace(EXTENSION_PATTERN, '');
}
