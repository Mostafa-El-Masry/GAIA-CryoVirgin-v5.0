import Link from "next/link";

type Props = {
  backHref: string;
  focusTitle: string;
  focusSubtitle: string;
};

export function SidebarPanel({
  backHref,
  focusTitle,
  focusSubtitle,
}: Props) {
  return (
    <div className="flex flex-col items-start sm:items-end gap-2 text-sm">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/80 px-3 py-1 text-[11px] font-semibold text-base-content hover:bg-base-200"
      >
        Back to Health Core
      </Link>
      <div className="rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3 shadow-inner text-left sm:text-right">
        <p className="text-[11px] font-semibold text-base-content/80">
          Weekly focus
        </p>
        <p className="text-sm font-semibold">{focusTitle}</p>
        <p className="text-[11px] text-base-content/70">{focusSubtitle}</p>
      </div>
    </div>
  );
}
