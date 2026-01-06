export type AutoBoxReason =
  | "pinned"
  | "this_month"
  | "nostalgia_week"
  | "power_tag"
  | "favorite_tag"
  | "fallback";

export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  slug: string;
  type: MediaType;
  title: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  viewCount?: number;
  pinnedForFeature?: boolean;
  createdAt: string;
}
