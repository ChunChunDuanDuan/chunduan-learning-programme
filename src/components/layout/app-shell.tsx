"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import { AppSidebar } from "./app-sidebar";

type AuthStatus = "loading" | "signed-in" | "signed-out";

const publicRoutes = ["/", "/login"];

const privateRoutePrefixes = [
  "/dashboard",
  "/philosophy",
  "/review",
  "/daily-log",
  "/night-sparks",
  "/vocabulary",
  "/sentences",
  "/articles",
  "/languages",
  "/settings",
  "/admin",
];

function isPublicRoute(pathname: string) {
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  if (pathname === "/blog") {
    return true;
  }

  if (pathname.startsWith("/blog/")) {
    return true;
  }

  return false;
}

function isPrivateRoute(pathname: string) {
  return privateRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setAuthStatus("signed-in");
      } else {
        setAuthStatus("signed-out");
      }
    }

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (session?.user) {
          setAuthStatus("signed-in");
        } else {
          setAuthStatus("signed-out");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authStatus === "loading") {
      return;
    }

    if (authStatus === "signed-out" && isPrivateRoute(pathname)) {
      router.push("/login");
    }
  }, [authStatus, pathname, router]);

  const isCheckingPrivateRoute =
    authStatus === "loading" && !isPublicRoute(pathname);

  if (isCheckingPrivateRoute) {
    return (
      <div className="min-h-screen bg-white text-neutral-950">
        <AppSidebar />

        <div className="lg:pl-72">
          <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-6xl">
              <p className="text-sm text-neutral-600">Checking access...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <AppSidebar />

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <div className="relative h-full w-72 border-r border-neutral-200 bg-white shadow-xl">
            <div className="absolute right-4 top-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700"
              >
                Close
              </button>
            </div>

            <AppSidebar
              variant="mobile"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
            >
              Menu
            </button>

            <Link href="/" className="text-base font-semibold tracking-tight">
              ChunDuan&apos;s
            </Link>

            <Link
              href="/blog"
              className="text-sm text-neutral-600 hover:text-neutral-950"
            >
              Blog
            </Link>
          </div>
        </header>

        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
