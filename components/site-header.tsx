"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import { ShoppingBag } from "lucide-react";
import { useDemoStore } from "@/components/demo-provider";

type SiteHeaderProps = {
  variant?: "overlay" | "solid";
};

const links = [
  {
    href: "/shop",
    label: "Коллекция",
    active: (pathname: string | null) => {
      if (!pathname) return false;
      if (pathname === "/shop") return true;
      if (!pathname.startsWith("/shop/")) return false;
      if (pathname.startsWith("/shop/cart") || pathname.startsWith("/shop/order")) return false;
      return !pathname.startsWith("/shop/ambassadors") && !pathname.startsWith("/shop/ambassador/");
    }
  },
  {
    href: "/shop/ambassadors",
    label: "Амбассадоры",
    active: (pathname: string | null) =>
      pathname === "/shop/ambassadors" || Boolean(pathname?.startsWith("/shop/ambassador/"))
  },
  {
    href: "/account",
    label: "Аккаунт",
    active: (pathname: string | null) => pathname === "/account" || (pathname?.startsWith("/account/") ?? false)
  },
  {
    href: "/info",
    label: "Инфо",
    active: (pathname: string | null) => pathname === "/info" || (pathname?.startsWith("/info/") ?? false)
  }
] as const;

export const SiteHeader = memo(function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const pathname = usePathname();
  const overlay = variant === "overlay";
  const { cart } = useDemoStore();
  const cartCount = useMemo(() => cart.reduce((n, line) => n + line.quantity, 0), [cart]);
  const cartActive = Boolean(pathname?.startsWith("/shop/cart") || pathname?.startsWith("/shop/order"));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overlay ? "border-b border-transparent bg-gradient-to-b from-black/50 to-transparent" : "border-b border-white/[0.08] bg-ink/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3 focus-ring rounded-sm">
          <span className="relative block h-9 w-9 overflow-hidden rounded-sm border border-white/15 bg-graphite">
            <Image src="/jarqyn-logo.png" alt="Jarqyn" fill className="object-cover p-1" sizes="36px" />
          </span>
          <span
            className={`font-display text-[11px] uppercase tracking-[0.35em] ${
              overlay ? "text-fog/90" : "text-fog/80"
            }`}
          >
            Jarqyn
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Основная навигация">
          {links.map((link) => {
            const active = link.active(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-ring rounded-sm px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  overlay
                    ? active
                      ? "text-fog"
                      : "text-fog/55 hover:text-fog"
                    : active
                      ? "text-fog"
                      : "text-mist hover:text-fog"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/shop/cart"
            className={`focus-ring relative rounded-sm px-3 py-2 transition-colors ${
              overlay
                ? cartActive
                  ? "text-fog"
                  : "text-fog/55 hover:text-fog"
                : cartActive
                  ? "text-fog"
                  : "text-mist hover:text-fog"
            }`}
            aria-label={`Корзина${cartCount ? `, ${cartCount} поз.` : ""}`}
          >
            <ShoppingBag className="mx-auto h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
            {cartCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brass px-1 font-display text-[9px] uppercase tracking-tight text-ink">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
});
