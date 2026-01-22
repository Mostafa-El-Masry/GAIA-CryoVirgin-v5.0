import { supabase } from "./videoStore";

export async function incrementView(mediaId: string) {
  await supabase.rpc("increment_view", { media_id: mediaId });
}
