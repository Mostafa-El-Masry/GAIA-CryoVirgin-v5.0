import { supabase } from "./videoStore";

export async function createPerson(name: string) {
  return supabase.from("gallery_people").insert({ name }).select().single();
}

export async function assignPerson(mediaId: string, personId: string) {
  return supabase.from("gallery_media_people").insert({
    media_id: mediaId,
    person_id: personId,
  });
}

export async function getPerson(personId: string) {
  return supabase
    .from("gallery_people")
    .select("*")
    .eq("id", personId)
    .single();
}

export async function getMediaByPerson(personId: string) {
  return supabase
    .from("gallery_media_people")
    .select("gallery_videos(*)")
    .eq("person_id", personId);
}

export async function getPeopleByMedia(mediaId: string) {
  return supabase
    .from("gallery_media_people")
    .select("gallery_people(*)")
    .eq("media_id", mediaId);
}
