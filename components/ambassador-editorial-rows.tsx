"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AmbassadorCover16x9 } from "@/components/ambassador-cover-16x9";
import { useDemoStore } from "@/components/demo-provider";

type AmbassadorEditorialRowsProps = {
  /** When set (e.g. legacy `?club=` slug), scroll that card into view once. */
  activeSlug?: string | null;
};

export function AmbassadorEditorialRows({ activeSlug }: AmbassadorEditorialRowsProps) {
  const reduceMotion = useReducedMotion();
  const didScroll = useRef(false);
  const { ambassadors } = useDemoStore();

  useEffect(() => {
    if (!activeSlug || didScroll.current) return;
    const el = document.getElementById(`ambassador-row-${activeSlug}`);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      didScroll.current = true;
    }
  }, [activeSlug, reduceMotion]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-4 sm:px-6 lg:px-8">
      {ambassadors.map((cat, index) => (
        <motion.article
          key={cat.id}
          id={`ambassador-row-${cat.slug}`}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
          className={`overflow-hidden rounded-sm border border-white/[0.12] bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
            activeSlug === cat.slug ? "ring-2 ring-inset ring-brass/45" : ""
          }`}
        >
          <AmbassadorCover16x9
            ambassador={{
              slug: cat.slug,
              title: cat.title,
              image: cat.image,
              coverBlurb: cat.coverBlurb
            }}
            asLink
          />
        </motion.article>
      ))}
    </div>
  );
}
