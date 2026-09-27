"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function LocalNavigation({ label, links, className = "" }: { label: string; links: readonly { label: string; href: string }[]; className?: string }) {
  const pathname = usePathname();
  return <nav aria-label={label} className={`mb-8 flex min-w-0 flex-wrap gap-2 border-b border-neutral-200 pb-4 ${className}`}>
    {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm ${pathname === link.href ? "bg-neutral-900 !text-white" : "bg-neutral-100 hover:bg-neutral-200"}`}>{link.label}</Link>)}
  </nav>;
}
