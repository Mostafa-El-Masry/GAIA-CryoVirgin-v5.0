import { supabase } from "./videoStore";

export async function uploadImage(file: File) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

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
    owner_id: user.id,
  });

  return publicUrl.publicUrl;
}
