"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { loginUrl } from "@/lib/auth-destination";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");
  const isPublic = pathname === "/" || pathname === "/login" || pathname === "/blog" || pathname.startsWith("/blog/");
  useEffect(() => {
    let active = true;
    let eventReceived = false;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      eventReceived = true;
      if (active) setStatus(session?.user ? "in" : "out");
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (active && !eventReceived) setStatus(data.user ? "in" : "out");
    }).catch(() => { if (active && !eventReceived) setStatus("out"); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!isPublic && status === "out") router.replace(loginUrl(window.location.pathname + window.location.search + window.location.hash));
  }, [isPublic, status, pathname, router]);
  return <main className="mx-auto min-h-screen w-full min-w-0 max-w-6xl px-4 py-6 text-neutral-950 sm:px-6 lg:px-8 lg:py-8">
    {!isPublic && status !== "in" ? <p role="status" className="text-sm text-neutral-600">Checking access…</p> : children}
  </main>;
}
