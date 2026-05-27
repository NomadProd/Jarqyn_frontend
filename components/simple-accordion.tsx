"use client";

import { memo, useCallback, useId, useState } from "react";
import type { InfoAccordionItem } from "@/lib/site-information";

export type SimpleAccordionProps = {
  items: InfoAccordionItem[];
  /** If false, opening one closes others */
  allowMultiple?: boolean;
  className?: string;
  /** Indices open by default when allowMultiple */
  defaultOpenIndices?: number[];
};

export const SimpleAccordion = memo(function SimpleAccordion({
  items,
  allowMultiple = false,
  className = "",
  defaultOpenIndices = []
}: SimpleAccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpenIndices));

  const toggle = useCallback(
    (index: number) => {
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else {
          if (!allowMultiple) next.clear();
          next.add(index);
        }
        return next;
      });
    },
    [allowMultiple]
  );

  return (
    <div className={`divide-y divide-white/[0.08] border border-white/[0.08] ${className}`}>
      {items.map((item, index) => {
        const expanded = open.has(index);
        const panelId = `${baseId}-panel-${item.id}`;
        const headerId = `${baseId}-header-${item.id}`;
        return (
          <div key={item.id} className="bg-ink/40">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="focus-ring flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-display text-[11px] uppercase tracking-[0.18em] text-fog transition-colors hover:bg-white/[0.03] sm:px-5 sm:text-xs"
              >
                <span>{item.title}</span>
                <span className="shrink-0 text-mist" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!expanded}
              className={expanded ? "border-t border-white/[0.06]" : ""}
            >
              {expanded ? (
                <div className="px-4 py-4 text-sm leading-relaxed text-mist sm:px-5">{item.body}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
});
