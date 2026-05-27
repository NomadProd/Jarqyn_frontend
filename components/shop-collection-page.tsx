"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { useDemoStore } from "@/components/demo-provider";
import { ambPath, getAmbassadorBySlug } from "@/lib/demo-store";

function ShopCollectionInner() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const club = searchParams.get("club");
  const { products, ambassadors } = useDemoStore();
  const visibleProducts = products.slice(0, 8);

  useEffect(() => {
    if (!club) return;
    const match = getAmbassadorBySlug(ambassadors, club);
    if (match) {
      router.replace(ambPath(match.slug));
    }
  }, [club, ambassadors, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-ink to-graphite pb-16 pt-[5.5rem] text-fog">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <header className="border-b border-white/[0.06] pb-10 pt-4 text-center">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.42em] text-brass">Jarqyn</p>
            <h1 className="mt-4 font-display text-2xl uppercase tracking-tight sm:text-3xl">Коллекция</h1>
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-mist">
            Полный каталог позиций — отдельная карточка и страница для каждого изделия.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((item, i) => (
            <motion.article
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.2), ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-sm border border-white/[0.1] bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <Link
                href={`/shop/${item.id}`}
                className="group focus-ring block outline-offset-2"
                aria-label={`${item.title}: страница позиции`}
              >
                <div className="relative aspect-[3/4] w-full bg-graphite">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="sr-only">{item.title}</span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <Link
          href="/shop/ambassadors"
          className="focus-ring font-display text-[10px] uppercase tracking-[0.28em] text-mist underline-offset-4 hover:text-fog"
        >
          Амбассадоры
        </Link>
        <Link
          href="/"
          className="focus-ring font-display text-[10px] uppercase tracking-[0.28em] text-mist underline-offset-4 hover:text-fog"
        >
          ← На главную
        </Link>
      </div>
    </main>
  );
}

export function ShopCollectionPage() {
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
        <ShopCollectionInner />
      </Suspense>
    </>
  );
}
