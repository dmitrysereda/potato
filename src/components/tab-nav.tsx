"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNav({ tabs }: { tabs: { label: string; href: string }[] }) {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "row", gap: "24px" }} className="border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-2.5 text-sm border-b-2 -mb-px transition-all duration-200 ${
              isActive
                ? "text-foreground border-warm-amber font-medium"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
