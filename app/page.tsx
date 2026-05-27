"use client";

import type { Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { useDemoStore } from "@/components/demo-provider";
import { ambPath, mergeHeroContent, mergeManifestoContent, splitManifestoBodyLines } from "@/lib/demo-store";

const AdminSiteCopyEditor = dynamic(
  () => import("@/components/admin-site-copy-editor").then((mod) => mod.AdminSiteCopyEditor),
  { ssr: false }
);

const manifestoBlockReveal: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.05 }
  }
};

const manifestoLineReveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function HomePage() {
  const { heroContent, manifestoContent, ambassadors } = useDemoStore();
  const hero = useMemo(() => mergeHeroContent(heroContent), [heroContent]);
  const manifesto = useMemo(() => mergeManifestoContent(manifestoContent), [manifestoContent]);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <SiteHeader variant="overlay" />

      <main className="bg-ink text-fog">
        <section className="relative min-h-[100dvh] overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
            poster="/www/photos/solo/01.jpg"
            src="/www/videos/hero.mov"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/85" aria-hidden />

          <div className="relative flex min-h-[100dvh] flex-col justify-center px-5 pb-24 pt-28 sm:px-10 lg:px-16">
            <div className="mx-auto w-full max-w-[1100px] text-center">
              <motion.p
                key={hero.eyebrow}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-sans text-[10px] font-semibold uppercase tracking-[0.38em] text-fog/75 sm:text-[11px] sm:tracking-[0.42em]"
              >
                {hero.eyebrow}
              </motion.p>

              <motion.h1
                key={`${hero.titleLine1}-${hero.titleLine2}`}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.95, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 text-fog"
              >
                <span
                  lang="kk"
                  className="block font-sans text-[clamp(2rem,8vw,5.25rem)] font-extrabold uppercase leading-none tracking-[-0.02em]"
                >
                  {hero.titleLine1}
                </span>
                <span
                  lang="ru"
                  className="mt-3 block font-display text-[clamp(1.05rem,3.8vw,2.35rem)] font-normal normal-case leading-snug tracking-tight text-fog/90"
                >
                  {hero.titleLine2}
                </span>
              </motion.h1>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
              >
                <Link
                  href="/shop"
                  className="focus-ring inline-flex min-w-[220px] justify-center border border-fog bg-fog px-8 py-3.5 font-display text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-transparent hover:text-fog"
                >
                  {hero.ctaPrimary}
                </Link>
                <Link
                  href="#clubs"
                  className="focus-ring inline-flex min-w-[220px] justify-center border border-fog/35 bg-transparent px-8 py-3.5 font-display text-[11px] uppercase tracking-[0.26em] text-fog transition-colors hover:border-fog hover:bg-fog/10"
                >
                  {hero.ctaSecondary}
                </Link>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="mt-8"
              >
                <Link
                  href="#manifesto"
                  className="font-display text-[10px] uppercase tracking-[0.38em] text-fog/55 underline-offset-4 transition-colors hover:text-fog"
                >
                  {hero.ctaStory}
                </Link>
              </motion.div>
            </div>

            <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block" aria-hidden>
              <motion.div
                animate={reduceMotion ? {} : { y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                className="h-10 w-[1px] bg-gradient-to-b from-transparent via-fog/40 to-transparent"
              />
            </div>
          </div>
        </section>

        <section
          id="manifesto"
          className="relative border-t border-white/[0.06] bg-gradient-to-b from-emeraldnight to-emeraldvoid py-24 sm:py-32 lg:py-40"
        >
          <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
          <div className="relative mx-auto max-w-[820px] px-5 sm:px-8">
            <motion.p
              key={manifesto.sectionLabel}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[10px] uppercase tracking-[0.42em] text-brass"
            >
              {manifesto.sectionLabel}
            </motion.p>
            <div className="mt-14 space-y-16 sm:space-y-20">
              {manifesto.blocks.map((block) => (
                <motion.article
                  key={block.id}
                  variants={manifestoBlockReveal}
                  initial={reduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2, margin: "0px 0px -12% 0px" }}
                >
                  <motion.h2
                    variants={manifestoLineReveal}
                    className="font-display text-[10px] uppercase tracking-[0.36em] text-mist"
                  >
                    {block.kicker}
                  </motion.h2>
                  <div className="mt-5 space-y-4 sm:space-y-5">
                    {splitManifestoBodyLines(block.text).map((line, lineIndex) => (
                      <motion.p
                        key={`${block.id}-line-${lineIndex}`}
                        variants={manifestoLineReveal}
                        className="font-display text-xl font-normal leading-snug tracking-tight text-fog sm:text-2xl lg:text-[1.75rem]"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="clubs" className="border-t border-white/[0.06] bg-ink">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="max-w-2xl">
              <p className="font-display text-[10px] uppercase tracking-[0.42em] text-brass">Клубы · Поколение</p>
              <h2 className="mt-5 font-display text-3xl uppercase tracking-tight sm:text-4xl lg:text-[2.75rem]">
                Это не аудитория.
                <span className="mt-2 block text-fog/75 normal-case text-xl font-normal tracking-normal sm:text-2xl">
                  Это среды, где живёт Жаркын.
                </span>
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">
                Каждая карточка ведёт на отдельную страницу направления с полным текстом (не общая лента).
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="mt-16 columns-1 gap-4 sm:columns-2 xl:columns-3 xl:gap-5 [&>*]:mb-4 xl:[&>*]:mb-5">
              {ambassadors.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.65, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="break-inside-avoid"
                >
                  <Link
                    href={ambPath(club.slug)}
                    className="group focus-ring relative block overflow-hidden border border-white/[0.08] bg-slate outline-none"
                    aria-label={`${club.title}: отдельная страница направления`}
                  >
                    <div className="relative aspect-[4/5] w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={club.image}
                        alt={club.title}
                        className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <p className="font-display text-[10px] uppercase tracking-[0.32em] text-fog/55">{club.city}</p>
                        <h3 className="mt-2 font-display text-xl uppercase tracking-tight text-fog sm:text-2xl">
                          {club.title}
                        </h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-fog/65 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {club.role}
                        </p>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-brass/90">{club.slot}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] border-t border-white/[0.06] px-5 py-12 sm:px-8 lg:px-12">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-relaxed text-mist">
                Полный текст по каждому направлению — на своей странице, не в общем блоке.
              </p>
              <Link
                href="/shop/ambassadors"
                className="focus-ring inline-flex border border-fog/25 px-6 py-3 font-display text-[11px] uppercase tracking-[0.24em] text-fog transition-colors hover:border-fog hover:bg-fog hover:text-ink"
              >
                Амбассадоры
              </Link>
            </div>
          </div>
        </section>

      </main>

      <AdminSiteCopyEditor mode="floating" />
    </>
  );
}
