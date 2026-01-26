"use client";

import { useCallback, useTransition } from "react";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  busyLabel?: string;
};

export default function LogoutButton({
  className,
  label = "Log out",
  busyLabel = "Logging out...",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = useCallback(() => {
    startTransition(async () => {
      try {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } catch {
        // ignore navigation failure
      }
    });
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "rounded-lg border gaia-border px-3 py-1.5 text-sm font-medium gaia-hover-soft transition"
      }
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? busyLabel : label}
    </button>
  );
}
