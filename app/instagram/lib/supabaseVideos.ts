import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function saveYoutubeVideo(data: {
  title: string;
  youtubeId: string;
}) {
  return supabase.from("gallery_videos").insert(data);
}

export async function loadYoutubeVideos() {
  return supabase
    .from("gallery_videos")
    .select("*")
    .order("created_at", { ascending: true });
}
