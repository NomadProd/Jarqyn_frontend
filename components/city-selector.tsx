"use client";

import { memo, useMemo } from "react";
import { CITY_PRINT_ASSETS, cityLabelFromId } from "@/lib/city-catalog";

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
              className={`focus-ring border px-2.5 py-1.5 font-display text-[9px] uppercase tracking-[0.14em] transition-colors ${
                active ? "border-fog bg-fog text-ink" : "border-white/[0.14] bg-ink text-fog hover:border-fog/40"
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {CITY_PRINT_ASSETS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={`focus-ring flex min-h-10 w-full items-center justify-center border px-3 py-2 text-center transition-colors ${
                active ? "border-fog bg-fog text-ink" : "border-white/[0.12] bg-ink text-fog hover:border-fog/35"
              }`}
            >
              <span className="break-words font-display text-[9px] uppercase tracking-[0.1em]">{opt.label}</span>
              <span className="sr-only">Город {opt.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mist">
        Выбран город принта: <span className="text-fog">{label}</span>
      </p>
    </div>
  );
});
