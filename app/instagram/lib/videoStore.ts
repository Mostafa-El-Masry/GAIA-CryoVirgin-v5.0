import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function createExternalVideo(data: {
  title: string;
  embed_url: string;
}) {
  const res = await fetch("/api/oembed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: data.embed_url }),
  });

  const oembed = await res.json();

  return supabase.from("gallery_videos").insert({
    title: data.title,
    embed_url: data.embed_url,
    embed_html: oembed.html,
  });
}

export async function saveProgress(videoId: string, seconds: number) {
  return supabase
    .from("gallery_watch_history")
    .upsert({ video_id: videoId, progress_seconds: Math.floor(seconds) });
}

export async function loadProgress(videoId: string) {
  return supabase
    .from("gallery_watch_history")
    .select("progress_seconds")
    .eq("video_id", videoId)
    .single();
}

export async function loadRelated(videoId: string) {
  return supabase
    .from("gallery_videos")
    .select("*")
    .neq("id", videoId)
    .order("created_at", { ascending: false })
    .limit(8);
}

export async function updateMediaTitle(mediaId: string, title: string) {
  return supabase.from("gallery_videos").update({ title }).eq("id", mediaId);
}

export async function deleteMedia(mediaId: string) {
  return supabase.from("gallery_videos").delete().eq("id", mediaId);
}

export async function getCurrentUser() {
  // Auth check removed
  return { data: { user: null } };
}
