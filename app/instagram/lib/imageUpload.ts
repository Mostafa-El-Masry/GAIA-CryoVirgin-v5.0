import { supabase } from "./videoStore";

export async function uploadImage(file: File) {
  // Auth check removed - proceeding with upload

  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;

  // 1️⃣ Upload original
  const { error: uploadError } = await supabase.storage
    .from("gallery-originals")
    .upload(`images/${fileName}`, file);

  if (uploadError) throw uploadError;

  // 2️⃣ Get public URL
  const { data: publicUrl } = supabase.storage
    .from("gallery-originals")
    .getPublicUrl(`images/${fileName}`);

  // 3️⃣ Save to DB
  await supabase.from("gallery_videos").insert({
    src: publicUrl.publicUrl,
    type: "image",
    owner_id: null, // No user available
  });

  return publicUrl.publicUrl;
}
