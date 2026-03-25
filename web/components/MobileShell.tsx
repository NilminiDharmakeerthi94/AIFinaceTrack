"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/transactions/", label: "Transactions", icon: "≡" },
  { href: "/dashboard/", label: "Insights", icon: "◧" },
  { href: "/settings/", label: "Settings", icon: "⚙" },
] as const;

export function MobileShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();

  const desktopLinkClass = (href: string, root = false) => {
    const active = root
      ? pathname === "/" || pathname === ""
      : pathname.startsWith(href.replace(/\/$/, ""));
    return `rounded-lg px-3 py-2.5 text-sm font-medium ${
      active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;
  };

  return (
    <div className="flex min-h-dvh">
      <aside
        className="hidden w-52 shrink-0 flex-col border-r border-slate-800 bg-slate-950 sm:flex sm:fixed sm:inset-y-0 sm:left-0"
        aria-label="Sidebar"
      >
        <div className="px-4 py-4 text-sm font-semibold text-slate-300">LedgerLite</div>
        <nav className="flex flex-col gap-1 px-2 pb-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={desktopLinkClass(l.href, l.href === "/")}>
              {l.label}
            </Link>
          ))}
          <Link href="/categories/" className={desktopLinkClass("/categories/")}>
            Categories
          </Link>
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col sm:pl-52">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-24 sm:pb-6">{children}</main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur sm:hidden"
          aria-label="Primary"
        >
          <ul className="mx-auto flex max-w-lg justify-between px-2 py-2">
            {links.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/" || pathname === ""
                  : pathname.startsWith(l.href.replace(/\/$/, ""));
              return (
                <li key={l.href} className="flex-1">
                  <Link
                    href={l.href}
                    className={`tap-target flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      active ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {l.icon}
                    </span>
                    <span className="mt-1">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
