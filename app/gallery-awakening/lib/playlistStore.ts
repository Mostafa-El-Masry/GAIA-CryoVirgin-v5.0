import { supabase } from "./videoStore";

export async function reorderPlaylist(
  playlistId: string,
  orderedVideoIds: string[],
) {
  const updates = orderedVideoIds.map((id, index) => ({
    playlist_id: playlistId,
    video_id: id,
    position: index,
  }));

  await supabase
    .from("gallery_playlist_items")
    .delete()
    .eq("playlist_id", playlistId);

  return supabase.from("gallery_playlist_items").insert(updates);
}
