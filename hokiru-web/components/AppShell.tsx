"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "ホーム" },
  { href: "/practice", label: "演習" },
  { href: "/review", label: "復習" },
  { href: "/analysis", label: "分析" },
  { href: "/settings", label: "設定" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="border-b border-gray-200 px-4 py-3">
        <span className="text-base font-semibold text-ink">HOKIRU Web</span>
      </header>

      <main className="flex-1 px-4 py-4">{children}</main>

      <nav className="sticky bottom-0 border-t border-gray-200 bg-white">
        <ul className="flex justify-between">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  className={`flex min-h-[44px] items-center justify-center px-2 text-center text-xs ${
                    active ? "font-semibold text-accent" : "text-muted"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
