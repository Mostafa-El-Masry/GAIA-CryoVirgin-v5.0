import { supabase } from "./videoStore";

export async function getMediaTags(mediaId: string) {
  return supabase
    .from("gallery_media_tags")
    .select("gallery_tags(id, name)")
    .eq("media_id", mediaId);
}

export async function getMediaPeople(mediaId: string) {
  return supabase
    .from("gallery_media_people")
    .select("gallery_people(id, name)")
    .eq("media_id", mediaId);
}
