"use client";

import type { ReactNode } from 'react';
import PermissionGate from '@/components/permissions/PermissionGate';
import LessonGate from '@/components/permissions/LessonGate';

export const metadata = {
  title: 'Guardian | GAIA',
};

export default function GuardianLayout({ children }: { children: ReactNode }) {
  // Protect all Guardian / Brain pages behind the existing permission system.
  return (
    <PermissionGate permission="guardian">
      <LessonGate featureLabel="Guardian">{children}</LessonGate>
    </PermissionGate>
  );
}
