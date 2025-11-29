import { notFound } from "next/navigation";
import LessonPageClient from "../LessonPageClient";
import { lessonsByTrack, type TrackId } from "../../../lessonsMap";
import { arcsByTrack } from "../../arcs";
import { allPaths } from "../../index";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;

  if (!lessonId) {
    notFound();
  }

  let trackId: TrackId | null = null;
  for (const [id, lessons] of Object.entries(lessonsByTrack)) {
    if (lessons.some((lesson) => lesson.id === lessonId)) {
      trackId = id as TrackId;
      break;
    }
  }

  if (!trackId) {
    notFound();
  }

  const path = allPaths.find((p) => p.id === trackId);
  const arcs = arcsByTrack[trackId];

  if (!path || !arcs) {
    notFound();
  }

  return (
    <LessonPageClient
      trackId={trackId}
      path={path}
      arcs={arcs}
      lessonId={lessonId}
    />
  );
}
