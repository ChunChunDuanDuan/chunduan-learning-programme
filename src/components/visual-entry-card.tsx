"use client";
import Link from "next/link";
import { useState } from "react";
export type VisualSlotProps = { title: string; image?: string | null; alt?: string; aspectRatio?: string };
export function VisualSlot({ title, image, alt = "", aspectRatio = "16 / 10" }: VisualSlotProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return <div className="relative grid w-full place-items-center overflow-hidden rounded-lg bg-neutral-100 text-sm text-neutral-500" style={{ aspectRatio }}>
    <span>{title} visual</span>
    {image && image !== failedImage ? (
      // Native image reserves space and falls back when Phase 2 assets are absent.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={alt} onError={() => setFailedImage(image)} className="absolute inset-0 h-full w-full object-cover" />
    ) : null}
  </div>;
}
export function VisualEntryCard({ title, subtitle, href, image, alt, variant = "language", aspectRatio }: VisualSlotProps & { subtitle?: string; href: string; variant?: "primary" | "language" }) {
  return <Link href={href} className={`block min-w-0 rounded-xl border border-neutral-200 transition hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-4 ${variant === "primary" ? "p-5" : "p-3"}`}>
    <VisualSlot title={title} image={image} alt={alt} aspectRatio={aspectRatio} />
    <h2 className={`mt-4 font-semibold ${variant === "primary" ? "text-2xl" : "text-lg"}`}>{title}</h2>
    {subtitle ? <p className="mt-2 text-sm text-neutral-600">{subtitle}</p> : null}
  </Link>;
}
