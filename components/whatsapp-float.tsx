"use client";

import { memo } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/site-support-config";

export const WhatsAppFloat = memo(function WhatsAppFloat() {
  const href = buildWhatsAppHref();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring fixed bottom-5 left-5 z-[55] flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-950/90 text-emerald-100 shadow-lg backdrop-blur-sm transition-colors hover:border-emerald-400 hover:bg-emerald-900 sm:bottom-8 sm:left-8"
      aria-label="Задать вопрос в WhatsApp"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
    </a>
  );
});
