"use client";

import type { ReactNode } from 'react';
import PermissionGate from '@/components/permissions/PermissionGate';
import LessonGate from '@/components/permissions/LessonGate';

export const metadata = {
  title: 'Settings | GAIA',
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  // Only users with "settings" permission can access the Settings pages.
  return (
    <PermissionGate permission="settings">
      <LessonGate featureLabel="Settings">{children}</LessonGate>
    </PermissionGate>
  );
}
