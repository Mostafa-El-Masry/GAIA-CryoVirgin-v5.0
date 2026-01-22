import { supabase } from "./videoStore";

export async function toggleLike(mediaId: string) {
  const { data } = await supabase
    .from("gallery_likes")
    .select("id")
    .eq("media_id", mediaId)
    .single();

  if (data) {
    return supabase.from("gallery_likes").delete().eq("media_id", mediaId);
  }

  return supabase.from("gallery_likes").insert({ media_id: mediaId });
}

export async function getLikeCount(mediaId: string) {
  return supabase
    .from("gallery_likes")
    .select("id", { count: "exact" })
    .eq("media_id", mediaId);
}

export async function addViewSeconds(mediaId: string, sec: number) {
  return supabase.from("gallery_views").upsert({
    media_id: mediaId,
    seconds: sec,
    updated_at: new Date().toISOString(),
  });
}

export async function getViewSeconds(mediaId: string) {
  return supabase
    .from("gallery_views")
    .select("seconds")
    .eq("media_id", mediaId)
    .single();
}
