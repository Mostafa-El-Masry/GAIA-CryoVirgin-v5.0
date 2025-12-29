import Link from "next/link";

type Props = {
  backHref: string;
  focusTitle: string;
  focusSubtitle: string;
};

export function SidebarPanel({ backHref, focusTitle, focusSubtitle }: Props) {
  return (
    <div className="hidden sm:flex flex-col items-start sm:items-end gap-2 text-sm">
      <Link
        href={backHref}
        className="health-button inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold"
      >
        Back to Health Core
      </Link>
      <div className="health-surface-soft px-4 py-3 text-left sm:text-right">
        <p className="text-[11px] font-semibold text-[var(--gaia-text-muted)]">
          Weekly focus
        </p>
        <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
          {focusTitle}
        </p>
        <p className="text-[11px] gaia-muted">{focusSubtitle}</p>
      </div>
    </div>
  );
}
