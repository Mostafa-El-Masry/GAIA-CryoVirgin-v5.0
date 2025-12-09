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
        className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#5c3b1d] shadow-[0_8px_22px_rgba(110,78,52,0.14)] hover:-translate-y-[1px] transition"
      >
        Back to Health Core
      </Link>
      <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-[0_12px_28px_rgba(110,78,52,0.16)] text-left sm:text-right backdrop-blur-xl">
        <p className="text-[11px] font-semibold text-[#5c3b1d]">
          Weekly focus
        </p>
        <p className="text-sm font-semibold text-[#24170d]">{focusTitle}</p>
        <p className="text-[11px] text-[#3a2b20]">{focusSubtitle}</p>
      </div>
    </div>
  );
}
