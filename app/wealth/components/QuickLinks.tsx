import Link from "next/link";

const surface = "wealth-surface text-[var(--gaia-text-default)]";

const QuickLinks = () => {
  const links = [
    {
      href: "/wealth/accounts",
      title: "Accounts & balances",
      body: "See each account, its currency, and how it fits in your Wealth map.",
    },
    {
      href: "/wealth/instruments",
      title: "Certificates & investments",
      body: "Track your CDs and long-term deposits with their rules.",
    },
    {
      href: "/wealth/flows",
      title: "Monthly story & flows",
      body: "This month's deposits, income, interest, expenses, and withdrawals.",
    },
    {
      href: "/wealth/levels",
      title: "Plans",
      body: "Comfort tiers based on your savings and monthly revenue.",
    },
    {
      href: "/wealth/projections",
      title: "Future projections",
      body: 'Simple "if you keep going like this" views over months and years.',
    },
  ] as const;

  return (
    <section className={`${surface} flex flex-col gap-3 p-4 md:p-5`}>
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
          Wall Street Drive Lanes
        </h2>
        <p className="mt-1 text-xs gaia-muted">
          As v3.2 unfolds, these lanes become full views for your Wealth life.
        </p>
      </header>
      <ul className="mt-2 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group block rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-2 text-xs transition hover:border-[var(--gaia-contrast-bg)]/70 hover:bg-[var(--gaia-surface)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--gaia-text-strong)]">
                  {link.title}
                </span>
                <span className="text-[11px] text-[var(--gaia-contrast-bg)] group-hover:text-[var(--gaia-text-strong)]">
                  Open
                </span>
              </div>
              <p className="mt-0.5 text-[11px] gaia-muted">{link.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QuickLinks;
