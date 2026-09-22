"use client";

import { Globe, Link2, Mail, MessageCircle, Phone, Send } from "lucide-react";
import type { SocialLink } from "@/lib/cms";

function BrandSvg({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d={d} />
    </svg>
  );
}

const BRAND_PATHS: Record<string, string> = {
  // Modern minimal glyphs (single-path, currentColor).
  facebook:
    "M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5z",
  instagram:
    "M12 8.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8zm0-2.1a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm6.8-.3a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0zM12 4.2c-2.5 0-2.9 0-3.9.1-1 .1-1.7.2-2.3.5-.6.2-1 .5-1.4.9-.4.4-.7.8-.9 1.4-.3.6-.4 1.3-.5 2.3-.1 1-.1 1.4-.1 3.9s0 2.9.1 3.9c.1 1 .2 1.7.5 2.3.2.6.5 1 .9 1.4.4.4.8.7 1.4.9.6.3 1.3.4 2.3.5 1 .1 1.4.1 3.9.1s2.9 0 3.9-.1c1-.1 1.7-.2 2.3-.5.6-.2 1-.5 1.4-.9.4-.4.7-.8.9-1.4.3-.6.4-1.3.5-2.3.1-1 .1-1.4.1-3.9s0-2.9-.1-3.9c-.1-1-.2-1.7-.5-2.3-.2-.6-.5-1-.9-1.4-.4-.4-.8-.7-1.4-.9-.6-.3-1.3-.4-2.3-.5-1-.1-1.4-.1-3.9-.1z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z",
  x: "M17.7 3H21l-7.3 8.3L22 21h-6.6l-5.2-6.2L4.3 21H1l7.8-8.9L2 3h6.8l4.7 5.7L17.7 3zm-1.2 16h1.8L7.4 4.9H5.5L16.5 19z",
  tiktok:
    "M16.6 3c.4 2 1.8 3.6 4.4 3.8v3c-1.7 0-3.2-.5-4.4-1.4v6.3a6.1 6.1 0 1 1-6.1-6.1c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2.1 2.9V3h3z",
  messenger:
    "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 13.9-2.7-2.9c-.3-.3-.8-.4-1.1-.1l-2.1 1.6-3.2-2.5c-.4-.3-.4-.9 0-1.2l6-4.6c.4-.3 1-.2 1.2.3l3.1 6.9c.2.5-.1 1-.7 1.2l-.5.3z",
};

export function platformLabel(platform: string) {
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function PlatformGlyph({ platform, className }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();
  if (BRAND_PATHS[p]) return <BrandSvg d={BRAND_PATHS[p]} className={className} />;
  if (p === "email") return <Mail className={className} aria-hidden="true" />;
  if (p === "phone" || p === "viber") return <Phone className={className} aria-hidden="true" />;
  if (p === "whatsapp" || p === "telegram") return <Send className={className} aria-hidden="true" />;
  if (p === "website") return <Globe className={className} aria-hidden="true" />;
  if (p === "messenger" || p === "chat") return <MessageCircle className={className} aria-hidden="true" />;
  return <Link2 className={className} aria-hidden="true" />;
}

export function SocialIcons({
  socials,
  tone = "dark",
  size = "md",
}: {
  socials: SocialLink[];
  tone?: "dark" | "light";
  size?: "sm" | "md";
}) {
  if (socials.length === 0) return null;
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Social media links">
      {socials.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            target={s.url.startsWith("http") ? "_blank" : undefined}
            rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={`${s.label || platformLabel(s.platform)} — ${s.url}`}
            title={s.label || platformLabel(s.platform)}
            className={`flex ${box} items-center justify-center border transition-all duration-150 hover:-translate-y-0.5 ${
              tone === "dark"
                ? "border-hair bg-white text-navy hover:border-cyan hover:text-cyan-deep"
                : "border-white/25 bg-white/5 text-white hover:border-cyan hover:text-cyan"
            }`}
          >
            <PlatformGlyph platform={s.platform} className={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
