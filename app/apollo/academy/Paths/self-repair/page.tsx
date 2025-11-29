"use client";

import { PathCurriculum } from "../components/PathCurriculum";
import { selfRepairPath } from "./path.meta";

export default function SelfRepairPathPage() {
  return <PathCurriculum trackId="self-repair" path={selfRepairPath} />;
}
