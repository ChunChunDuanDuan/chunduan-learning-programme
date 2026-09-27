"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
type NavigationLink = { label: string; href: string };
export function LocalNavigation({ label, links, returnLink, className = "" }: { label: string; links: readonly NavigationLink[]; returnLink?: NavigationLink; className?: string }) {
  const pathname = usePathname();
  return <nav aria-label={label} className={`mb-8 flex min-w-0 flex-wrap gap-2 border-b border-neutral-200 pb-4 ${className}`}>
    {returnLink ? <div className="w-full border-b border-neutral-200 pb-2 sm:w-auto sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
      <Link href={returnLink.href} className="inline-flex min-h-11 items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">← {returnLink.label}</Link>
    </div> : null}
    {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm ${pathname === link.href ? "bg-neutral-900 !text-white" : "bg-neutral-100 hover:bg-neutral-200"}`}>{link.label}</Link>)}
  </nav>;
}
