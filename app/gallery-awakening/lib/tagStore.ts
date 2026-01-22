import { supabase } from "./videoStore";

export async function createTag(name: string) {
  return supabase.from("gallery_tags").insert({ name });
}

export async function assignTag(mediaId: string, tagId: string) {
  return supabase.from("gallery_media_tags").insert({
    media_id: mediaId,
    tag_id: tagId,
  });
}

export async function getTags() {
  return supabase.from("gallery_tags").select("*");
}

export async function getRelatedMedia(tagIds: string[], excludeId: string) {
  return supabase
    .from("gallery_media_tags")
    .select("media_id, gallery_videos(*)")
    .in("tag_id", tagIds)
    .neq("media_id", excludeId);
}

export async function getAllTags() {
  return supabase.from("gallery_tags").select("*").order("name");
}
