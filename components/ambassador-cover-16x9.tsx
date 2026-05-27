"use client";

import Link from "next/link";
import { ambPath } from "@/lib/demo-store";

export type AmbassadorCoverFields = {
  slug: string;
  title: string;
  image: string;
  coverBlurb: string;
};

type AmbassadorCover16x9Props = {
  ambassador: AmbassadorCoverFields;
  /** Обёртка-ссылка на страницу направления */
  asLink?: boolean;
  /** На странице направления заголовок как h1 для доступности */
  titleTag?: "h1" | "p";
  className?: string;
};

/**
 * Фото 16:9 с заголовком и кратким текстом в правом нижнем углу (как референс editorial).
 */
export function AmbassadorCover16x9({
  ambassador,
  asLink = false,
  titleTag = "p",
  className = ""
}: AmbassadorCover16x9Props) {
  const { slug, title, image, coverBlurb } = ambassador;
  const blurb = coverBlurb.trim();
  const TitleTag = titleTag === "h1" ? "h1" : "p";

  const plate = (
    <div
      className={`relative isolate aspect-video w-full overflow-hidden bg-black ${asLink ? "transition-transform duration-[1.2s] ease-out group-hover:scale-[1.18]" : ""} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/85 via-black/40 to-transparent"
        aria-hidden
      />
      <div className="relative flex h-full w-full flex-col justify-end items-end p-4 pb-5 text-right sm:p-6 sm:pb-7 md:p-8 md:pb-9">
        <TitleTag className="max-w-[min(100%,22rem)] font-editorial text-[clamp(1.05rem,2.8vw,1.85rem)] font-medium leading-[1.12] tracking-tight text-fog sm:max-w-[min(100%,26rem)] sm:text-[clamp(1.15rem,2.4vw,2rem)]">
          {title}
        </TitleTag>
        {blurb ? (
          <p className="mt-2 max-w-[min(100%,20rem)] font-sans text-[0.8125rem] leading-snug text-fog/90 sm:max-w-md sm:text-sm">
            {blurb}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={ambPath(slug)}
        className="group focus-ring block outline-offset-2"
        aria-label={`${title}: страница направления`}
      >
        {plate}
      </Link>
    );
  }

  return plate;
}
