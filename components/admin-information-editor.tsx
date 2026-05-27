"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDemoStore } from "@/components/demo-provider";
import {
  mergeSiteInformation,
  type InfoAccordionItem,
  type InfoAccordionSection,
  type SiteInformationContent
} from "@/lib/site-information";

const inputClass =
  "mt-1 w-full border border-white/[0.12] bg-ink px-3 py-2 text-xs text-fog outline-none focus:border-brass";

type SectionKey = keyof Omit<SiteInformationContent, "contacts" | "pageIntro">;

const SECTION_KEYS: SectionKey[] = [
  "faq",
  "delivery",
  "returns",
  "about",
  "stores",
  "purchase",
  "accountHelp",
  "productQuestions",
  "corporate",
  "privacy",
  "offer",
  "careers"
];

const SECTION_LABELS: Record<SectionKey, string> = {
  faq: "FAQ",
  delivery: "Доставка",
  returns: "Возврат",
  about: "О нас",
  stores: "Магазины",
  purchase: "Покупка",
  accountHelp: "Личный кабинет",
  productQuestions: "Вопросы о продукте",
  corporate: "Корпоративные заказы",
  privacy: "Конфиденциальность",
  offer: "Оферта",
  careers: "Вакансии"
};

export function AdminInformationEditor() {
  const { isAdmin, siteInformation, setSiteInformation } = useDemoStore();
  const [draft, setDraft] = useState(siteInformation);
  const [msg, setMsg] = useState("");

  useEffect(() => setDraft(siteInformation), [siteInformation]);

  if (!isAdmin) return null;

  const save = (e: FormEvent) => {
    e.preventDefault();
    setSiteInformation(draft);
    setMsg("Сохранено. Обновления видны на странице /info.");
  };

  const resetDefaults = () => {
    const next = mergeSiteInformation(null);
    setDraft(next);
    setSiteInformation(next);
    setMsg("Сброшено к шаблону по умолчанию.");
  };

  const patchSection = (key: SectionKey, section: InfoAccordionSection) => {
    setDraft((d) => ({ ...d, [key]: section }));
  };

  return (
    <section className="mt-12 border border-white/[0.08] bg-ink/50 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.32em] text-brass">Контент сайта</p>
          <h3 className="mt-2 font-display text-lg uppercase tracking-tight">Информация (/info)</h3>
          <p className="mt-2 text-xs text-mist">FAQ, доставка, контакты, оферта и др. Сохраняется локально в этом браузере.</p>
        </div>
        <button
          type="button"
          onClick={resetDefaults}
          className="focus-ring border border-white/[0.18] px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-mist hover:border-fog"
        >
          Сбросить тексты
        </button>
      </div>

      <form onSubmit={save} className="mt-8 space-y-10">
        <label className="block font-display text-[10px] uppercase tracking-[0.26em] text-mist">
          Вступление на странице информации
          <textarea
            value={draft.pageIntro}
            onChange={(e) => setDraft((d) => ({ ...d, pageIntro: e.target.value }))}
            rows={3}
            className={`${inputClass} mt-2`}
          />
        </label>

        <fieldset className="border border-white/[0.08] p-5">
          <legend className="px-2 font-display text-[10px] uppercase tracking-[0.26em] text-brass">Контакты</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["phone", "Телефон"],
                ["email", "Email"],
                ["address", "Адрес"],
                ["workingHours", "Режим"],
                ["socialNote", "Соцсети / примечание"]
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="block font-display text-[10px] uppercase tracking-[0.22em] text-mist sm:col-span-2">
                {label}
                <input
                  value={draft.contacts[field]}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      contacts: { ...d.contacts, [field]: e.target.value }
                    }))
                  }
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </fieldset>

        {SECTION_KEYS.map((key) => (
          <AccordionSectionEditor
            key={key}
            label={SECTION_LABELS[key]}
            section={draft[key]}
            onChange={(next) => patchSection(key, next)}
          />
        ))}

        {msg ? <p className="text-xs text-mist">{msg}</p> : null}

        <button
          type="submit"
          className="focus-ring border border-fog bg-fog px-8 py-3 font-display text-[10px] uppercase tracking-[0.22em] text-ink hover:bg-transparent hover:text-fog"
        >
          Сохранить информационный контент
        </button>
      </form>
    </section>
  );
}

function AccordionSectionEditor({
  label,
  section,
  onChange
}: {
  label: string;
  section: InfoAccordionSection;
  onChange: (next: InfoAccordionSection) => void;
}) {
  const updateItem = (index: number, patch: Partial<InfoAccordionItem>) => {
    const items = section.items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    onChange({ ...section, items });
  };

  const removeItem = (index: number) => {
    onChange({ ...section, items: section.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    const id = `item-${Date.now().toString(36)}`;
    onChange({
      ...section,
      items: [...section.items, { id, title: "Новый пункт", body: "Текст ответа." }]
    });
  };

  return (
    <fieldset className="border border-white/[0.08] p-5">
      <legend className="px-2 font-display text-[10px] uppercase tracking-[0.26em] text-brass">{label}</legend>
      <label className="mt-4 block font-display text-[10px] uppercase tracking-[0.22em] text-mist">
        Заголовок секции
        <input
          value={section.heading}
          onChange={(e) => onChange({ ...section, heading: e.target.value })}
          className={inputClass}
        />
      </label>
      <div className="mt-6 space-y-6">
        {section.items.map((item, index) => (
          <div key={item.id} className="border border-white/[0.06] bg-black/25 p-4">
            <label className="block font-display text-[10px] uppercase tracking-[0.22em] text-mist">
              Заголовок пункта
              <input value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} className={inputClass} />
            </label>
            <label className="mt-3 block font-display text-[10px] uppercase tracking-[0.22em] text-mist">
              Текст
              <textarea
                value={item.body}
                onChange={(e) => updateItem(index, { body: e.target.value })}
                rows={4}
                className={`${inputClass} mt-1 resize-y`}
              />
            </label>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="focus-ring mt-3 text-[10px] uppercase tracking-[0.18em] text-red-300 hover:text-red-200"
            >
              Удалить пункт
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="focus-ring mt-4 border border-white/[0.16] px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-mist hover:border-fog"
      >
        + Пункт
      </button>
    </fieldset>
  );
}
