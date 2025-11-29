"use client";

import { PathCurriculum } from "../components/PathCurriculum";
import { accountingPath } from "./path.meta";

export default function AccountingPathPage() {
  return <PathCurriculum trackId="accounting" path={accountingPath} />;
}
