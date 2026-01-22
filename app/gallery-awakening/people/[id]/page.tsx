import { supabase } from "../../lib/videoStore";
import { PageTransition } from "../../components/PageTransition";

export default async function PersonPage({ params, searchParams }: any) {
  const sort = searchParams.sort || "latest";

  let orderBy = "created_at";
  let ascending = false;

  if (sort === "oldest") ascending = true;
  if (sort === "views") {
    orderBy = "views";
    ascending = false;
  }

  const person = await supabase
    .from("gallery_people")
    .select("*")
    .eq("id", params.id)
    .single();

  const media = await supabase
    .from("gallery_media_people")
    .select("gallery_videos(*)")
    .eq("person_id", params.id)
    .order(`gallery_videos.${orderBy}`, { ascending });

  return (
    <PageTransition>
      <div className="p-6 space-y-4">
        <h1 className="text-white text-xl">{person.data.name}</h1>

        {/* FILTERS */}
        <div className="flex gap-4 text-sm text-white/80">
          <a href="?sort=latest">Latest</a>
          <a href="?sort=oldest">Oldest</a>
          <a href="?sort=views">Most Viewed</a>
        </div>

        {/* MEDIA GRID */}
        <div className="grid grid-cols-4 gap-4">
          {media.data?.map((m: any) => (
            <img
              key={m.gallery_videos.id}
              src={m.gallery_videos.src}
              className="rounded"
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
