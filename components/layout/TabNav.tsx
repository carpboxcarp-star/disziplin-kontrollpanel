"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/today", label: "Heute" },
  { href: "/fitness", label: "Fitness" },
  { href: "/business", label: "Business" },
  { href: "/finance", label: "Finanzen" },
  { href: "/history", label: "Verlauf" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-border bg-bg">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex items-center justify-center min-h-[56px] text-sm font-medium tracking-wide border-b-2 transition ${
              active
                ? "border-amber text-amber"
                : "border-transparent text-ink-dim active:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
