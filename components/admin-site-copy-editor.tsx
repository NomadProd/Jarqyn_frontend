"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDemoStore } from "@/components/demo-provider";
import { AdminAmbassadorsEditor } from "@/components/admin-ambassadors-editor";
import { defaultHeroContent } from "@/lib/demo-store";

const inputClass =
  "mt-2 w-full border border-white/[0.12] bg-ink px-4 py-2.5 text-sm text-fog outline-none transition-colors focus:border-brass";

function HeroFields() {
  const { heroContent, updateHeroContent } = useDemoStore();
  return (
    <div className="border border-white/[0.08] bg-ink/50 p-5 sm:p-6">
      <h3 className="font-display text-sm uppercase tracking-[0.2em] text-fog">Первый экран (герой)</h3>
      <p className="mt-2 text-xs leading-relaxed text-mist">
        Сохраняется в этом браузере. На главной обновляется сразу.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Надзаголовок</span>
          <textarea
            value={heroContent.eyebrow}
            onChange={(e) => updateHeroContent({ eyebrow: e.target.value })}
            rows={2}
            className={`${inputClass} min-h-[3.25rem] resize-y`}
          />
        </label>
        <label className="block">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Заголовок, строка 1</span>
          <textarea
            value={heroContent.titleLine1}
            onChange={(e) => updateHeroContent({ titleLine1: e.target.value })}
            rows={2}
            className={`${inputClass} min-h-[3.25rem] resize-y`}
          />
        </label>
        <label className="block">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Заголовок, строка 2</span>
          <textarea
            value={heroContent.titleLine2}
            onChange={(e) => updateHeroContent({ titleLine2: e.target.value })}
            rows={2}
            className={`${inputClass} min-h-[3.25rem] resize-y`}
          />
        </label>
        <label className="block">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Кнопка — коллекция</span>
          <input
            value={heroContent.ctaPrimary}
            onChange={(e) => updateHeroContent({ ctaPrimary: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Кнопка — присоединиться</span>
          <input
            value={heroContent.ctaSecondary}
            onChange={(e) => updateHeroContent({ ctaSecondary: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Ссылка «история»</span>
          <input
            value={heroContent.ctaStory}
            onChange={(e) => updateHeroContent({ ctaStory: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => updateHeroContent(defaultHeroContent)}
        className="focus-ring mt-5 border border-white/[0.18] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] text-mist transition-colors hover:border-fog hover:text-fog"
      >
        Сбросить герой
      </button>
    </div>
  );
}

function ManifestoFields() {
  const {
    manifestoContent,
    updateManifestoSectionLabel,
    updateManifestoBlock,
    addManifestoBlock,
    removeManifestoBlock,
    resetManifestoContent
  } = useDemoStore();
  return (
    <div className="border border-white/[0.08] bg-ink/50 p-5 sm:p-6">
      <h3 className="font-display text-sm uppercase tracking-[0.2em] text-fog">Манифест</h3>
      <p className="mt-2 text-xs leading-relaxed text-mist">
        Строки по скроллу: переносы строк в тексте или разбивка по предложениям.
      </p>
      <label className="mt-5 block">
        <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Подпись секции</span>
        <input
          value={manifestoContent.sectionLabel}
          onChange={(e) => updateManifestoSectionLabel(e.target.value)}
          className={inputClass}
        />
      </label>
      <div className="mt-8 space-y-8">
        {manifestoContent.blocks.map((block, blockIndex) => (
          <div key={block.id} className="border border-white/[0.08] bg-graphite/30 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[10px] uppercase tracking-[0.28em] text-brass">Блок {blockIndex + 1}</span>
              {manifestoContent.blocks.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeManifestoBlock(block.id)}
                  className="focus-ring text-[10px] uppercase tracking-[0.2em] text-red-300/90 hover:text-red-200"
                >
                  Удалить блок
                </button>
              ) : null}
            </div>
            <label className="mt-4 block">
              <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Кикер</span>
              <input
                value={block.kicker}
                onChange={(e) => updateManifestoBlock(block.id, { kicker: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="mt-4 block">
              <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Текст</span>
              <textarea
                value={block.text}
                onChange={(e) => updateManifestoBlock(block.id, { text: e.target.value })}
                rows={6}
                className={`${inputClass} min-h-[9rem] resize-y`}
              />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addManifestoBlock()}
          className="focus-ring border border-white/[0.18] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:border-fog"
        >
          Добавить блок
        </button>
        <button
          type="button"
          onClick={() => resetManifestoContent()}
          className="focus-ring border border-white/[0.18] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] text-mist transition-colors hover:border-fog hover:text-fog"
        >
          Сбросить манифест
        </button>
      </div>
    </div>
  );
}

type AdminSiteCopyEditorProps = {
  /** В кабинете — два блока подряд. На главной — выезжающая панель. */
  mode: "embedded" | "floating";
};

export function AdminSiteCopyEditor({ mode }: AdminSiteCopyEditorProps) {
  const { isAdmin } = useDemoStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"hero" | "manifesto" | "ambassadors">("hero");

  useEffect(() => {
    if (!open || mode !== "floating") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mode]);

  if (!isAdmin) return null;

  if (mode === "embedded") {
    return (
      <div className="space-y-10">
        <HeroFields />
        <ManifestoFields />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring fixed bottom-5 right-5 z-[60] border border-brass/50 bg-ink/90 px-4 py-3 font-display text-[10px] uppercase tracking-[0.28em] text-brass shadow-lg backdrop-blur-sm transition-colors hover:border-brass hover:bg-graphite/95 sm:bottom-8 sm:right-8"
        aria-expanded={open}
        aria-controls="admin-site-copy-panel"
      >
        {open ? "Закрыть" : "Править сайт"}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[65] bg-black/55 backdrop-blur-[2px]"
            aria-label="Закрыть панель"
            onClick={() => setOpen(false)}
          />
          <div
            id="admin-site-copy-panel"
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[min(88dvh,720px)] overflow-y-auto border-t border-white/[0.12] bg-graphite/98 px-4 pb-8 pt-4 shadow-2xl sm:inset-x-auto sm:bottom-8 sm:right-8 sm:left-auto sm:w-[min(100vw-2rem,28rem)] sm:rounded-sm sm:border sm:px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-site-copy-title"
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <p id="admin-site-copy-title" className="font-display text-[11px] uppercase tracking-[0.28em] text-fog">
                Редактор сайта
              </p>
              <Link
                href="/account"
                className="font-display text-[10px] uppercase tracking-[0.22em] text-mist underline-offset-2 hover:text-fog"
              >
                Кабинет
              </Link>
            </div>
            <div className="flex flex-wrap gap-1 border border-white/[0.08] p-1">
              <button
                type="button"
                onClick={() => setTab("hero")}
                className={`min-w-[5.5rem] flex-1 px-2 py-2 font-display text-[9px] uppercase tracking-[0.14em] transition-colors sm:text-[10px] sm:tracking-[0.18em] ${
                  tab === "hero" ? "bg-fog text-ink" : "text-mist hover:text-fog"
                }`}
              >
                Герой
              </button>
              <button
                type="button"
                onClick={() => setTab("manifesto")}
                className={`min-w-[5.5rem] flex-1 px-2 py-2 font-display text-[9px] uppercase tracking-[0.14em] transition-colors sm:text-[10px] sm:tracking-[0.18em] ${
                  tab === "manifesto" ? "bg-fog text-ink" : "text-mist hover:text-fog"
                }`}
              >
                Манифест
              </button>
              <button
                type="button"
                onClick={() => setTab("ambassadors")}
                className={`min-w-[5.5rem] flex-1 px-2 py-2 font-display text-[9px] uppercase tracking-[0.14em] transition-colors sm:text-[10px] sm:tracking-[0.18em] ${
                  tab === "ambassadors" ? "bg-fog text-ink" : "text-mist hover:text-fog"
                }`}
              >
                Амбассадоры
              </button>
            </div>
            <div className="mt-4">
              {tab === "hero" ? (
                <HeroFields />
              ) : tab === "manifesto" ? (
                <ManifestoFields />
              ) : (
                <AdminAmbassadorsEditor showSectionHeading={false} />
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
