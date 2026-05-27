"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDemoStore } from "@/components/demo-provider";
import { SiteHeader } from "@/components/site-header";
import { getAmbassadorBySlug } from "@/lib/demo-store";

export default function AmbassadorDirectionPage() {
  const params = useParams();
  const slugRaw = params?.slug;
  const slug = typeof slugRaw === "string" ? slugRaw : Array.isArray(slugRaw) ? slugRaw[0] ?? null : null;
  const { ambassadors } = useDemoStore();
  const row = getAmbassadorBySlug(ambassadors, slug);
  const reduceMotion = useReducedMotion();

  if (!row) {
    return (
      <>
        <SiteHeader variant="solid" />
        <main className="min-h-screen bg-gradient-to-b from-ink to-graphite pb-16 pt-[5.5rem] text-fog">
          <div className="mx-auto max-w-lg px-5 py-20 text-center">
            <p className="font-display text-[10px] uppercase tracking-[0.32em] text-brass">Амбассадоры</p>
            <h1 className="mt-4 font-display text-2xl uppercase tracking-tight">Направление не найдено</h1>
            <p className="mt-4 text-sm text-mist">Проверьте ссылку или вернитесь к списку направлений.</p>
            <Link
              href="/shop/ambassadors"
              className="focus-ring mt-8 inline-block border border-white/[0.18] px-6 py-3 font-display text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:border-fog"
            >
              Все направления
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="min-h-screen bg-gradient-to-b from-ink to-graphite pb-16 pt-[5.5rem] text-fog">
        <div className="mx-auto max-w-3xl px-4 pb-6 pt-2 sm:px-6">
          <Link
            href="/shop/ambassadors"
            className="focus-ring inline-block font-display text-[10px] uppercase tracking-[0.28em] text-mist underline-offset-4 hover:text-fog"
          >
            ← Все направления
          </Link>
        </div>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl border-y border-white/[0.08] px-4 py-8 sm:px-6"
        >
          <h1 className="font-editorial text-[clamp(1.5rem,4.5vw,2.5rem)] leading-[1.08] tracking-tight text-fog">
            {row.title}
          </h1>
          {row.coverBlurb.trim() ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist sm:text-base">{row.coverBlurb.trim()}</p>
          ) : null}
        </motion.section>

        <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
          <p className="font-display text-[10px] uppercase tracking-[0.38em] text-brass">{row.city}</p>
          <p className="mt-3 font-display text-[10px] uppercase tracking-[0.22em] text-mist">{row.role}</p>
          <p className="mt-6 text-base leading-relaxed text-fog/90 sm:text-lg">{row.subtitle}</p>
          <p className="mt-6 font-display text-[10px] uppercase tracking-[0.28em] text-fog/50">{row.slot}</p>
        </div>

        {(row.profiles ?? []).length > 0 ? (
          <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-[10px] uppercase tracking-[0.32em] text-brass">Амбассадоры</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-8">
              {(row.profiles ?? []).map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.24) }}
                  className="w-[min(72vw,52rem)] min-w-[20rem] max-w-[56rem] overflow-hidden rounded-sm border border-white/[0.1] bg-ink"
                >
                  <div className="relative aspect-video w-full bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full scale-[1.28] object-cover object-center sm:scale-[1.32]"
                    />
                    {p.caption.trim() ? (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                        <p className="absolute bottom-0 left-0 px-4 py-3 font-display text-[10px] uppercase tracking-[0.22em] text-fog sm:px-5">
                          {p.caption.trim()}
                        </p>
                      </>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mx-auto mt-12 max-w-3xl px-4 text-center sm:px-6">
          <Link
            href="/shop/ambassadors"
            className="focus-ring font-display text-[10px] uppercase tracking-[0.28em] text-mist underline-offset-4 hover:text-fog"
          >
            ← Назад к списку
          </Link>
        </div>
      </main>
    </>
  );
}
