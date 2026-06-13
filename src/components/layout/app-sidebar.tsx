"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";

type AuthStatus = "loading" | "signed-in" | "signed-out";

type AppSidebarProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

function SidebarNavLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link href={href} onClick={onNavigate} className="hover:text-neutral-500">
      {children}
    </Link>
  );
}

export function AppSidebar({
  variant = "desktop",
  onNavigate,
}: AppSidebarProps) {
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

  async function handleSignOut() {
    await supabase.auth.signOut();

    setAuthStatus("signed-out");

    if (onNavigate) {
      onNavigate();
    }

    window.location.href = "/login";
  }

  const isSignedIn = authStatus === "signed-in";

  const asideClassName =
    variant === "desktop"
      ? "fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-y-auto border-r border-neutral-200 bg-white px-8 py-8 text-neutral-950 lg:flex lg:flex-col"
      : "h-full w-72 overflow-y-auto bg-white px-8 py-8 text-neutral-950";

  return (
    <aside className={asideClassName}>
      <Link
        href="/"
        onClick={onNavigate}
        className="text-xl font-semibold tracking-tight"
      >
        ChunDuan&apos;s
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-8">
        <section>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
            Public
          </p>

          <div className="flex flex-col gap-4 text-sm">
            <SidebarNavLink href="/" onNavigate={onNavigate}>
              Home
            </SidebarNavLink>
            <SidebarNavLink href="/blog" onNavigate={onNavigate}>
              Blog
            </SidebarNavLink>
          </div>
        </section>

        {isSignedIn ? (
          <>
            <section>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
                Main
              </p>

              <div className="flex flex-col gap-4 text-sm">
                <SidebarNavLink href="/dashboard" onNavigate={onNavigate}>
                  Dashboard
                </SidebarNavLink>
                <SidebarNavLink href="/schedule" onNavigate={onNavigate}>
                  Study Schedule
                </SidebarNavLink>
                <SidebarNavLink href="/philosophy" onNavigate={onNavigate}>
                  Philosophy
                </SidebarNavLink>
                <SidebarNavLink href="/progress" onNavigate={onNavigate}>
                  Learning Progress
                </SidebarNavLink>
                <SidebarNavLink href="/review" onNavigate={onNavigate}>
                  Review
                </SidebarNavLink>
              </div>
            </section>

            <section>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
                Journal
              </p>

              <div className="flex flex-col gap-4 text-sm">
                <SidebarNavLink href="/daily-log" onNavigate={onNavigate}>
                  Daily Log
                </SidebarNavLink>
              </div>
            </section>

            <section>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
                Language Learning
              </p>

              <div className="flex flex-col gap-4 text-sm">
                <SidebarNavLink href="/vocabulary" onNavigate={onNavigate}>
                  Vocabulary
                </SidebarNavLink>
                <SidebarNavLink href="/sentences" onNavigate={onNavigate}>
                  Sentence Practice
                </SidebarNavLink>
                <SidebarNavLink href="/articles" onNavigate={onNavigate}>
                  Articles
                </SidebarNavLink>
                <SidebarNavLink href="/languages/en" onNavigate={onNavigate}>
                  English
                </SidebarNavLink>
                <SidebarNavLink href="/languages/de" onNavigate={onNavigate}>
                  Deutsch
                </SidebarNavLink>
                <SidebarNavLink href="/languages/ru" onNavigate={onNavigate}>
                  Русский
                </SidebarNavLink>
              </div>
            </section>

            <section>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
                Blog Admin
              </p>

              <div className="flex flex-col gap-4 text-sm">
                <SidebarNavLink href="/admin/blog" onNavigate={onNavigate}>
                  Manage Blog
                </SidebarNavLink>
              </div>
            </section>
          </>
        ) : null}

        <section>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-400">
            System
          </p>

          <div className="flex flex-col gap-4 text-sm">
            {isSignedIn ? (
              <>
                <SidebarNavLink href="/settings" onNavigate={onNavigate}>
                  Settings
                </SidebarNavLink>
                <SidebarNavLink href="/login" onNavigate={onNavigate}>
                  Account
                </SidebarNavLink>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-left text-sm text-neutral-950 hover:text-neutral-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <SidebarNavLink href="/login" onNavigate={onNavigate}>
                Login
              </SidebarNavLink>
            )}
          </div>
        </section>
      </nav>

      <div className="mt-8 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-sm font-medium !text-white">
        N
      </div>
    </aside>
  );
}
