"use client";

import type { DragEvent } from "react";
import Link from "next/link";
import { useDemoStore } from "@/components/demo-provider";
import { ambPath } from "@/lib/demo-store";
import { compressImageToDataUrl16x9 } from "@/lib/client-image";

const inputClass =
  "mt-2 w-full border border-white/[0.12] bg-ink px-4 py-2.5 text-sm text-fog outline-none transition-colors focus:border-brass";

type AdminAmbassadorsEditorProps = {
  /** Заголовок секции (в кабинете — свой, во всплывающей панели можно скрыть) */
  showSectionHeading?: boolean;
};

export function AdminAmbassadorsEditor({ showSectionHeading = true }: AdminAmbassadorsEditorProps) {
  const {
    ambassadors,
    addAmbassador,
    updateAmbassador,
    deleteAmbassador,
    resetAmbassadors,
    addAmbassadorProfile,
    updateAmbassadorProfile,
    deleteAmbassadorProfile
  } = useDemoStore();

  const onDropCoverImage = async (ambassadorId: string, event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await compressImageToDataUrl16x9(file);
    updateAmbassador(ambassadorId, { image: dataUrl });
  };

  const onDropProfileImage = async (
    ambassadorId: string,
    profileId: string,
    event: DragEvent<HTMLElement>
  ) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await compressImageToDataUrl16x9(file);
    updateAmbassadorProfile(ambassadorId, profileId, { image: dataUrl });
  };

  return (
    <div className="border border-white/[0.08] bg-ink/50 p-5 sm:p-6">
      {showSectionHeading ? (
        <>
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-fog">Амбассадоры</h3>
          <p className="mt-2 text-xs leading-relaxed text-mist">
            Фото при загрузке с диска <strong className="text-fog/90">обрезается по центру до 16:9</strong>. На карточке
            заголовок и краткий текст — <strong className="text-fog/90">в правом нижнем углу</strong> (редактируется
            ниже). Данные в этом браузере; витрина —{" "}
            <Link href="/shop/ambassadors" className="text-brass underline-offset-2 hover:underline">
              /shop/ambassadors
            </Link>
            .
          </p>
        </>
      ) : (
        <p className="text-xs leading-relaxed text-mist">
          Загрузка фото — обрезка 16:9; текст на фото — поле «Кратко на фото». Хранение в этом браузере.
        </p>
      )}
      <div className="mt-8 space-y-8">
        {ambassadors.map((a, idx) => (
          <div key={a.id} className="border border-white/[0.1] bg-graphite/25 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[10px] uppercase tracking-[0.28em] text-brass">
                Направление {idx + 1}
              </span>
              {ambassadors.length > 1 ? (
                <button
                  type="button"
                  onClick={() => deleteAmbassador(a.id)}
                  className="focus-ring text-[10px] uppercase tracking-[0.2em] text-red-300/90 hover:text-red-200"
                >
                  Удалить
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Slug (URL)</span>
                <input
                  value={a.slug}
                  onChange={(e) => updateAmbassador(a.id, { slug: e.target.value })}
                  className={inputClass}
                />
                <p className="mt-1.5 text-[10px] text-mist/90">
                  Ссылка:{" "}
                  <Link href={ambPath(a.slug)} className="text-brass underline-offset-2 hover:underline">
                    {ambPath(a.slug)}
                  </Link>
                </p>
              </label>
              <label className="block sm:col-span-2">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Заголовок на фото (16:9)
                </span>
                <input
                  value={a.title}
                  onChange={(e) => updateAmbassador(a.id, { title: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Кратко на фото — правый нижний угол
                </span>
                <textarea
                  value={a.coverBlurb}
                  onChange={(e) => updateAmbassador(a.id, { coverBlurb: e.target.value })}
                  rows={3}
                  placeholder="2–4 коротких предложения поверх фото"
                  className={`${inputClass} min-h-[4.5rem] resize-y`}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Полный текст на странице</span>
                <textarea
                  value={a.subtitle}
                  onChange={(e) => updateAmbassador(a.id, { subtitle: e.target.value })}
                  rows={4}
                  className={`${inputClass} min-h-[5rem] resize-y`}
                />
              </label>
              <label className="block">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Роль (коротко)</span>
                <input
                  value={a.role}
                  onChange={(e) => updateAmbassador(a.id, { role: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Город</span>
                <input
                  value={a.city}
                  onChange={(e) => updateAmbassador(a.id, { city: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Слот / медиа</span>
                <input
                  value={a.slot}
                  onChange={(e) => updateAmbassador(a.id, { slot: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Фото 16:9 (URL или файл — файл обрежется по центру)
                </span>
                <input
                  value={a.image}
                  onChange={(e) => updateAmbassador(a.id, { image: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await compressImageToDataUrl16x9(file);
                    updateAmbassador(a.id, { image: dataUrl });
                    e.target.value = "";
                  }}
                  className={`${inputClass} file:mr-3 file:border-0 file:bg-fog file:px-3 file:py-1.5 file:font-display file:text-[10px] file:uppercase file:tracking-wider file:text-ink`}
                />
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropCoverImage(a.id, e)}
                  className="mt-2 flex items-center justify-center border border-dashed border-white/25 bg-ink/40 px-4 py-5 text-center text-xs text-mist"
                >
                  Перетащите сюда фото — сохранится как 16:9
                </div>
              </label>
            </div>

            <div className="mt-8 border-t border-white/[0.1] bg-black/25 px-4 py-6 sm:px-5">
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-brass">Амбассадоры направления</p>
              <p className="mt-2 text-[11px] leading-relaxed text-mist">
                Несколько карточек: фото 16:9 и краткое описание — на странице этого направления под главным баннером.
              </p>
              <div className="mt-5 space-y-6">
                {(a.profiles ?? []).map((p, pi) => (
                  <div key={p.id} className="border border-white/[0.08] bg-graphite/35 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-[10px] uppercase tracking-[0.22em] text-mist">
                        Амбассадор {pi + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteAmbassadorProfile(a.id, p.id)}
                        className="focus-ring text-[10px] uppercase tracking-[0.2em] text-red-300/90 hover:text-red-200"
                      >
                        Удалить
                      </button>
                    </div>
                    <label className="mt-4 block sm:col-span-2">
                      <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                        Краткое описание
                      </span>
                      <textarea
                        value={p.caption}
                        onChange={(e) => updateAmbassadorProfile(a.id, p.id, { caption: e.target.value })}
                        rows={3}
                        className={`${inputClass} min-h-[4.5rem] resize-y`}
                      />
                    </label>
                    <label className="mt-4 block">
                      <span className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                        Фото 16:9 (URL или файл)
                      </span>
                      <input
                        value={p.image}
                        onChange={(e) => updateAmbassadorProfile(a.id, p.id, { image: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const dataUrl = await compressImageToDataUrl16x9(file);
                          updateAmbassadorProfile(a.id, p.id, { image: dataUrl });
                          e.target.value = "";
                        }}
                        className={`${inputClass} file:mr-3 file:border-0 file:bg-fog file:px-3 file:py-1.5 file:font-display file:text-[10px] file:uppercase file:tracking-wider file:text-ink`}
                      />
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDropProfileImage(a.id, p.id, e)}
                        className="mt-2 flex items-center justify-center border border-dashed border-white/25 bg-ink/40 px-4 py-4 text-center text-[11px] text-mist"
                      >
                        Перетащите фото — 16:9
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  addAmbassadorProfile(a.id, {
                    image: "/www/photos/solo/01.jpg",
                    caption: ""
                  })
                }
                className="focus-ring mt-5 border border-white/[0.18] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:border-fog"
              >
                Добавить амбассадора
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            addAmbassador({
              slug: "",
              title: "Новое направление",
              coverBlurb: "Краткое описание на фото — правый нижний угол.",
              subtitle: "Текст направления.",
              role: "Короткая строка",
              slot: "Медиа-слот",
              image: "/www/photos/solo/01.jpg",
              city: "Город",
              profiles: []
            })
          }
          className="focus-ring border border-white/[0.18] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] text-fog transition-colors hover:border-fog"
        >
          Добавить направление
        </button>
        <button
          type="button"
          onClick={() => resetAmbassadors()}
          className="focus-ring border border-white/[0.18] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] text-mist transition-colors hover:border-fog hover:text-fog"
        >
          Сбросить к демо
        </button>
      </div>
    </div>
  );
}
