import { supabase } from "./videoStore";

export async function getFilteredMedia({
  tag,
  actorId,
  sort = "latest",
}: {
  tag?: string;
  actorId?: string;
  sort?: "latest" | "oldest" | "views";
}) {
  let q = supabase.from("gallery_videos").select("*");

  if (sort === "views") q = q.order("views", { ascending: false });
  if (sort === "latest") q = q.order("created_at", { ascending: false });
  if (sort === "oldest") q = q.order("created_at", { ascending: true });

  if (tag) {
    q = supabase
      .from("gallery_media_tags")
      .select("gallery_videos(*)")
      .eq("gallery_tags.name", tag);
  }

  if (actorId) {
    q = supabase
      .from("gallery_media_people")
      .select("gallery_videos(*)")
      .eq("person_id", actorId);
  }

  return q;
}
