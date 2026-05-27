"use client";

import { memo, useMemo } from "react";
import { CITY_PRINT_ASSETS, cityLabelFromId, cityPrintById } from "@/lib/city-catalog";

export type CitySelectorProps = {
  value: string;
  onChange: (cityId: string) => void;
  /** compact = chips only */
  variant?: "map" | "compact";
  className?: string;
};

export const CitySelector = memo(function CitySelector({
  value,
  onChange,
  variant = "map",
  className = ""
}: CitySelectorProps) {
  const label = useMemo(() => cityLabelFromId(value) || "Не выбран", [value]);

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {CITY_PRINT_ASSETS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`focus-ring border px-3 py-2 font-display text-[10px] uppercase tracking-[0.16em] transition-colors ${
                active ? "border-fog bg-fog text-ink" : "border-white/[0.14] text-fog hover:border-fog/40"
              }`}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {CITY_PRINT_ASSETS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={value === opt.id}
            className={`focus-ring group relative aspect-square w-full overflow-hidden rounded-sm border transition-colors ${
              value === opt.id ? "border-fog ring-1 ring-fog/40" : "border-white/[0.12] hover:border-fog/35"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={opt.imageSrc}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-8 text-left font-display text-[9px] uppercase tracking-[0.14em] text-fog">
              {opt.label}
            </span>
            <span className="sr-only">Город {opt.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mist">
        Выбран город принта: <span className="text-fog">{label}</span>
        {cityPrintById(value) ? " — превью на спине доступно во вкладке «Спина» на странице товара." : ""}
      </p>
    </div>
  );
});
