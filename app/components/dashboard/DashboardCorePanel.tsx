"use client";

import React from "react";
import TodayStrip from "@/app/components/dashboard/TodayStrip";
import HealthQuickCard from "@/app/components/dashboard/HealthQuickCard";
import HealthNudgeClient from "@/app/components/dashboard/HealthNudgeClient";
import DashboardFeatureCard from "@/app/instagram/components/DashboardFeatureCard";
import GuardianTodayCard from "@/app/components/dashboard/GuardianTodayCard";
import DashboardVersionBadge from "@/app/components/dashboard/DashboardVersionBadge";

interface DashboardCorePanelProps {
  className?: string;
}

// GAIA Level 3 – Dashboard Pulse
// Version 4.2 · Week 4–6 (Core Complete)
//
// DashboardCorePanel
// ------------------
// A composed Dashboard section that pulls together everything we've
// built so far for Level 3 on the UI side:
//
//   • TodayStrip            → top "today" summary (brain, body, gallery)
//   • DashboardVersionBadge → small pill with "GAIA Level 3 · 4.2"
//   • DashboardFeatureCard  → Gallery daily highlight
//   • HealthQuickCard       → water / walking / sleep quick buttons
//   • GuardianTodayCard     → Guardian "today" snapshot + examples
//   • HealthNudgeClient     → end-of-day floating nudge
//
// This component does NOT add new logic – it just arranges existing
// cards into a clean layout so you can drop a single component into
// your Dashboard page and actually *see* the changes.
//
// You can safely delete this file later if you prefer to wire
// everything manually on the Dashboard.

const DashboardCorePanel: React.FC<DashboardCorePanelProps> = ({
  className = "",
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {/* Top row: TodayStrip + Version badge */}
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-start md:justify-between">
        <TodayStrip className="flex-1" />
        <DashboardVersionBadge className="md:ml-4" />
      </div>

      {/* Main cards grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Gallery feature */}
        <DashboardFeatureCard className="md:col-span-1 xl:col-span-1" />

        {/* Health quick actions */}
        <HealthQuickCard className="md:col-span-1 xl:col-span-1" />

        {/* Guardian today snapshot */}
        <GuardianTodayCard className="md:col-span-2 xl:col-span-1" />
      </div>

      {/* Floating end-of-day nudge (water / walking) */}
      <HealthNudgeClient />
    </section>
  );
};

export default DashboardCorePanel;
