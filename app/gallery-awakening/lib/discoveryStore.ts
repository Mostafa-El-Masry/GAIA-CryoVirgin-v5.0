import { supabase } from "./videoStore";

export async function getMostViewed(limit = 12) {
  return supabase
    .from("gallery_videos")
    .select("*")
    .order("views", { ascending: false })
    .limit(limit);
}
