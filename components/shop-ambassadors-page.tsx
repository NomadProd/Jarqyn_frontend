"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AmbassadorEditorialRows } from "@/components/ambassador-editorial-rows";
import { SiteHeader } from "@/components/site-header";
import { useDemoStore } from "@/components/demo-provider";
import { ambPath, getAmbassadorBySlug } from "@/lib/demo-store";

function ShopAmbassadorsInner() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const club = searchParams.get("club");
  const { ambassadors } = useDemoStore();

  useEffect(() => {
    if (!club) return;
    const match = getAmbassadorBySlug(ambassadors, club);
    if (match) {
      router.replace(ambPath(match.slug));
    }
  }, [club, ambassadors, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-ink to-graphite pb-16 pt-[5.5rem] text-fog">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col items-center gap-3 border-b border-white/[0.06] pb-10 pt-4 text-center">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.42em] text-brass">Jarqyn</p>
            <h1 className="mt-4 font-display text-2xl uppercase tracking-tight sm:text-3xl">Амбассадоры</h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-mist">
            Каждое направление — отдельная страница с полным текстом и визуалом. Ниже карточки не склеены: у каждой
            своя рамка и ссылка.
          </p>
        </header>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="mt-10 w-full"
      >
        <AmbassadorEditorialRows activeSlug={club} />
      </motion.div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <Link
          href="/shop"
          className="focus-ring inline-block font-display text-[10px] uppercase tracking-[0.28em] text-mist underline-offset-4 hover:text-fog"
        >
          Коллекция
        </Link>
        <Link
          href="/"
          className="focus-ring inline-block font-display text-[10px] uppercase tracking-[0.28em] text-mist underline-offset-4 hover:text-fog"
        >
          ← На главную
        </Link>
      </div>
    </main>
  );
}

export function ShopAmbassadorsPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <Suspense
        fallback={
          <main className="min-h-screen bg-gradient-to-b from-ink to-graphite pt-[5.5rem] text-fog">
            <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-mist">Загрузка…</div>
          </main>
        }
      >
        <ShopAmbassadorsInner />
      </Suspense>
    </>
  );
}
