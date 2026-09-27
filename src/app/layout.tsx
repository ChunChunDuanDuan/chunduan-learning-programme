import type { Viewport } from "next";
import "./globals.css";
import { AppShell } from "../components/layout/app-shell";
import { PwaRegistration } from "@/components/pwa-registration";
import { environmentMetadata } from "@/lib/pwa";

export const metadata = environmentMetadata("main");
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PwaRegistration />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
