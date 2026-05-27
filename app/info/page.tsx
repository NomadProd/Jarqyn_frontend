"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SimpleAccordion } from "@/components/simple-accordion";
import { useDemoStore } from "@/components/demo-provider";
import type { InfoAccordionSection, SiteInformationContent } from "@/lib/site-information";

function InfoBlock({
  id,
  section,
  className = ""
}: {
  id: string;
  section: InfoAccordionSection;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-28 ${className}`}>
      <h2 className="font-display text-xl uppercase tracking-tight text-fog sm:text-2xl">{section.heading}</h2>
      <div className="mt-6">
        <SimpleAccordion items={section.items} />
      </div>
    </section>
  );
}

export default function InfoPage() {
  const { siteInformation } = useDemoStore();
  const c = siteInformation;

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="min-h-screen bg-ink px-5 pb-20 pt-[6.5rem] text-fog sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-[10px] uppercase tracking-[0.38em] text-brass">Справка</p>
          <h1 className="mt-4 font-display text-3xl uppercase tracking-tight">Информация</h1>
          <p className="mt-4 text-sm leading-relaxed text-mist">{c.pageIntro}</p>
          <nav
            className="mt-10 flex flex-wrap gap-2 border border-white/[0.08] bg-graphite/20 p-4"
            aria-label="Быстрые разделы"
          >
            <Quick href="#faq" label="FAQ" />
            <Quick href="#contacts" label="Контакты" />
            <Quick href="#delivery" label="Доставка" />
            <Quick href="#returns" label="Возврат" />
            <Quick href="#about" label="О нас" />
            <Quick href="#stores" label="Магазины" />
            <Quick href="#purchase" label="Покупка" />
            <Quick href="#accountHelp" label="Кабинет" />
            <Quick href="#productQuestions" label="О товаре" />
            <Quick href="#corporate" label="B2B" />
            <Quick href="#privacy" label="Privacy" />
            <Quick href="#offer" label="Оферта" />
            <Quick href="#careers" label="Вакансии" />
          </nav>

          <div className="mt-16 space-y-16">
            <InfoBlock id="faq" section={c.faq} />
            <ContactsSection contacts={c.contacts} />
            <InfoBlock id="delivery" section={c.delivery} />
            <InfoBlock id="returns" section={c.returns} />
            <InfoBlock id="about" section={c.about} />
            <InfoBlock id="stores" section={c.stores} />
            <InfoBlock id="purchase" section={c.purchase} />
            <InfoBlock id="accountHelp" section={c.accountHelp} />
            <InfoBlock id="productQuestions" section={c.productQuestions} />
            <InfoBlock id="corporate" section={c.corporate} />
            <InfoBlock id="privacy" section={c.privacy} />
            <InfoBlock id="offer" section={c.offer} />
            <InfoBlock id="careers" section={c.careers} />
          </div>

          <Link
            href="/shop"
            className="focus-ring mt-16 inline-block font-display text-[10px] uppercase tracking-[0.24em] text-mist hover:text-fog"
          >
            ← В коллекцию
          </Link>
        </div>
      </main>
    </>
  );
}

function Quick({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="focus-ring border border-white/[0.12] px-3 py-1.5 font-display text-[9px] uppercase tracking-[0.16em] text-mist transition-colors hover:border-fog hover:text-fog"
    >
      {label}
    </Link>
  );
}

function ContactsSection({ contacts }: { contacts: SiteInformationContent["contacts"] }) {
  return (
    <section id="contacts" className="scroll-mt-28 border border-white/[0.08] bg-graphite/15 p-6 sm:p-8">
      <h2 className="font-display text-xl uppercase tracking-tight text-fog sm:text-2xl">Контакты</h2>
      <dl className="mt-6 space-y-4 text-sm text-mist">
        <div>
          <dt className="font-display text-[10px] uppercase tracking-[0.22em] text-brass">Телефон</dt>
          <dd className="mt-1">{contacts.phone}</dd>
        </div>
        <div>
          <dt className="font-display text-[10px] uppercase tracking-[0.22em] text-brass">Email</dt>
          <dd className="mt-1">
            <a href={`mailto:${contacts.email}`} className="text-fog underline-offset-2 hover:underline">
              {contacts.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-display text-[10px] uppercase tracking-[0.22em] text-brass">Адрес</dt>
          <dd className="mt-1">{contacts.address}</dd>
        </div>
        <div>
          <dt className="font-display text-[10px] uppercase tracking-[0.22em] text-brass">Режим работы</dt>
          <dd className="mt-1">{contacts.workingHours}</dd>
        </div>
        <div>
          <dt className="font-display text-[10px] uppercase tracking-[0.22em] text-brass">Соцсети</dt>
          <dd className="mt-1">{contacts.socialNote}</dd>
        </div>
      </dl>
    </section>
  );
}
