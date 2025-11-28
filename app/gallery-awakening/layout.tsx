"use client";

import type { ReactNode } from 'react';
import PermissionGate from '@/components/permissions/PermissionGate';
import LessonGate from '@/components/permissions/LessonGate';

export const metadata = {
  title: 'Gallery Awakening | GAIA',
};

export default function GalleryAwakeningLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Gate the full Gallery Awakening section.
  // Inside the section, you can still decide which parts are public/private.
  return (
    <PermissionGate permission="gallery">
      <LessonGate featureLabel="Gallery">
        {children}
      </LessonGate>
    </PermissionGate>
  );
}
