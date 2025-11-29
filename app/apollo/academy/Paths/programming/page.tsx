"use client";

import { PathCurriculum } from "../components/PathCurriculum";
import { programmingPath } from "./path.meta";

export default function ProgrammingPathPage() {
  return <PathCurriculum trackId="programming" path={programmingPath} />;
}
