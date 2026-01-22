import { supabase } from "./supabaseVideos";

export async function loadPlaylist(playlistId: string) {
  return supabase
    .from("gallery_playlist_items")
    .select(
      `
      position,
      gallery_videos (
        id,
        title,
        youtubeId,
        created_at
      )
    `,
    )
    .eq("playlist_id", playlistId)
    .order("position");
}

export async function loadRelatedVideos(videoId: string) {
  return supabase
    .from("gallery_videos")
    .select("*")
    .neq("id", videoId)
    .order("created_at", { ascending: false })
    .limit(10);
}
