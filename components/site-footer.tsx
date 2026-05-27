"use client";

import Link from "next/link";
import { memo } from "react";
import { buildWhatsAppHref } from "@/lib/site-support-config";

const footerLinks = [
  { href: "/shop", label: "Магазин" },
  { href: "/info#faq", label: "FAQ" },
  { href: "/info#about", label: "О нас" },
  { href: "/info#contacts", label: "Контакты" },
  { href: "/info#careers", label: "Карьера" },
  { href: "/info#privacy", label: "Конфиденциальность" },
  { href: "/info#offer", label: "Публичная оферта" },
  { href: "/info#delivery", label: "Доставка" },
  { href: "/info#returns", label: "Возврат" },
  { href: "/info#corporate", label: "Корпоративные заказы" },
  { href: "/shop/ambassadors", label: "Амбассадоры" },
  { href: "/account", label: "Аккаунт" },
  { href: "/", label: "Главная" }
] as const;

export const SiteFooter = memo(function SiteFooter() {
  const wa = buildWhatsAppHref();

  return (
    <footer className="border-t border-white/[0.06] bg-graphite px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.4em] text-mist">Jarqyn</p>
            <p className="mt-3 max-w-sm text-sm text-mist">Жаркын — яркое поколение Казахстана.</p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-brass">Информация</p>
            <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Информация и сервис">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] uppercase tracking-[0.22em] text-fog/70 transition-colors hover:text-fog"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mist">© {new Date().getFullYear()} Jarqyn. Все права защищены.</p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex w-fit items-center border border-fog/25 px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.24em] text-fog transition-colors hover:border-brass hover:text-brass"
          >
            Задать вопрос в WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
});
