import { notFound } from "next/navigation";
import LessonPageClient from "../LessonPageClient";
import { lessonsByTrack, type TrackId } from "../../../lessonsMap";
import { arcsByTrack } from "../../arcs";
import { allPaths } from "../../index";

type PageProps = {
  params: { lessonId: string };
};

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = params;

  if (!lessonId) {
    notFound();
  }

  const trackId: TrackId | null = lessonId.startsWith("prog")
    ? "programming"
    : lessonId.startsWith("acc")
    ? "accounting"
    : lessonId.startsWith("self")
    ? "self-repair"
    : null;

  if (!trackId) {
    notFound();
  }

  const lessonExists = lessonsByTrack[trackId]?.some(
    (lesson) => lesson.id === lessonId
  );

  if (!lessonExists) {
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
