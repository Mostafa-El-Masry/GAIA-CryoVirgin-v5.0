import { supabase } from "./videoStore";

export async function uploadActorAvatar(file: File, actorId: string) {
  const ext = file.name.split(".").pop();
  const path = `${actorId}.${ext}`;

  await supabase.storage
    .from("actor-avatars")
    .upload(path, file, { upsert: true });

  const { data } = supabase.storage.from("actor-avatars").getPublicUrl(path);

  await supabase
    .from("gallery_people")
    .update({ avatar_url: data.publicUrl })
    .eq("id", actorId);
}
