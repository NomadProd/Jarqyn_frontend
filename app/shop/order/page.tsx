"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { useDemoStore } from "@/components/demo-provider";
import { cityLabelFromId } from "@/lib/city-catalog";
import { CUSTOMER_SOURCE_OPTIONS, NIS_SCHOOL_GROUPS } from "@/lib/nis-schools";
import type { CustomerSourceOption } from "@/lib/nis-schools";
import { emptyShippingAddress, formatCurrency } from "@/lib/demo-store";

export default function OrderPage() {
  const { user, cart, submitOrder } = useDemoStore();
  const [customerFullName, setCustomerFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState(emptyShippingAddress());
  const [nisSchool, setNisSchool] = useState("");
  const [customerSource, setCustomerSource] = useState<CustomerSourceOption | "">("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const total = useMemo(() => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), [cart]);

  useEffect(() => {
    if (user?.name) setCustomerFullName((prev) => prev || user.name);
    if (user?.phone) setPhone((prev) => prev || user.phone || "");
  }, [user]);

  const inputClass =
    "mt-2 w-full border border-white/[0.12] bg-ink px-4 py-2.5 text-sm text-fog outline-none transition-colors focus:border-brass";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setCreatedOrderId(null);
    if (!cart.length) {
      setFeedback({ tone: "err", text: "Добавьте позиции в корзину." });
      return;
    }
    if (!customerFullName.trim()) {
      setFeedback({ tone: "err", text: "Укажите полное имя." });
      return;
    }
    if (!phone.trim()) {
      setFeedback({ tone: "err", text: "Укажите телефон." });
      return;
    }
    const sa = shipping;
    if (!sa.region.trim() || !sa.city.trim() || !sa.street.trim() || !sa.house.trim() || !sa.postalCode.trim()) {
      setFeedback({ tone: "err", text: "Заполните обязательные поля адреса (область, город, улица, дом, индекс)." });
      return;
    }
    setBusy(true);
    const result = await submitOrder({
      customerFullName: customerFullName.trim(),
      phone: phone.trim(),
      shippingAddress: {
        region: sa.region.trim(),
        city: sa.city.trim(),
        street: sa.street.trim(),
        house: sa.house.trim(),
        apartment: sa.apartment.trim(),
        postalCode: sa.postalCode.trim()
      },
      nisSchool: nisSchool.trim() || undefined,
      customerSource: customerSource || undefined
    });
    setBusy(false);
    if (result.ok && result.orderId) {
      setCreatedOrderId(result.orderId);
      setFeedback({ tone: "ok", text: result.message });
    } else {
      setFeedback({ tone: "err", text: result.message });
    }
  };

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="min-h-screen bg-ink px-6 pb-24 pt-[6.5rem] text-fog sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.38em] text-brass">Оформление</p>
            <h1 className="mt-4 font-display text-3xl uppercase tracking-tight">Заказ</h1>
            <p className="mt-3 text-sm text-mist">
              Конфигурация позиций переносится из корзины — здесь только проверка и контактные данные.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <section className="border border-white/[0.08] bg-graphite/20 p-6">
                <h2 className="font-display text-[10px] uppercase tracking-[0.32em] text-mist">Контакты</h2>
                <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Полное имя
                  <input
                    value={customerFullName}
                    onChange={(e) => setCustomerFullName(e.target.value)}
                    className={inputClass}
                    autoComplete="name"
                  />
                </label>
                <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Телефон <span className="text-brass">*</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+7 …"
                    autoComplete="tel"
                  />
                </label>
                {!user?.phone ? (
                  <p className="mt-2 text-xs text-mist">Телефон сохранится в вашем профиле после отправки заказа.</p>
                ) : null}
              </section>

              <section className="border border-white/[0.08] bg-graphite/20 p-6">
                <h2 className="font-display text-[10px] uppercase tracking-[0.32em] text-mist">Адрес доставки</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                    Область / регион
                    <input
                      value={shipping.region}
                      onChange={(e) => setShipping((s) => ({ ...s, region: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                    Город
                    <input
                      value={shipping.city}
                      onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist sm:col-span-2">
                    Улица
                    <input
                      value={shipping.street}
                      onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                    Дом
                    <input
                      value={shipping.house}
                      onChange={(e) => setShipping((s) => ({ ...s, house: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                    Квартира
                    <input
                      value={shipping.apartment}
                      onChange={(e) => setShipping((s) => ({ ...s, apartment: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist sm:col-span-2">
                    Почтовый индекс
                    <input
                      value={shipping.postalCode}
                      onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                      className={inputClass}
                    />
                  </label>
                </div>
              </section>

              <section className="border border-white/[0.08] bg-graphite/20 p-6">
                <h2 className="font-display text-[10px] uppercase tracking-[0.32em] text-mist">Дополнительно</h2>
                <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Школа НИШ (необязательно)
                  <select
                    value={nisSchool}
                    onChange={(e) => setNisSchool(e.target.value)}
                    className={`${inputClass} bg-graphite`}
                  >
                    <option value="">—</option>
                    {NIS_SCHOOL_GROUPS.map((g) => (
                      <optgroup key={g.regionLabel} label={g.regionLabel}>
                        {g.schools.map((school) => (
                          <option key={`${g.regionLabel}-${school}`} value={school}>
                            {school}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Откуда узнали о нас (необязательно)
                  <select
                    value={customerSource}
                    onChange={(e) => setCustomerSource(e.target.value as CustomerSourceOption | "")}
                    className={`${inputClass} bg-graphite`}
                  >
                    <option value="">—</option>
                    {CUSTOMER_SOURCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              {feedback ? (
                <div
                  className={`border px-5 py-4 text-sm ${
                    feedback.tone === "ok"
                      ? "border-emerald-400/35 bg-emerald-950/30 text-emerald-100"
                      : "border-red-400/35 bg-red-950/25 text-red-100"
                  }`}
                >
                  {feedback.text}
                  {createdOrderId ? (
                    <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-fog">Номер заказа: {createdOrderId}</p>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy || !cart.length}
                className="focus-ring w-full border border-fog bg-fog py-4 font-display text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-transparent hover:text-fog disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-mist"
              >
                {busy ? "Отправка…" : "Создать заказ"}
              </button>
            </form>

            <div className="mt-10 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.22em] text-mist">
              <Link href="/shop/cart" className="focus-ring hover:text-fog">
                ← Корзина
              </Link>
              <Link href="/shop" className="focus-ring hover:text-fog">
                Коллекция
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-white/[0.08] bg-graphite/25 p-6">
              <p className="font-display text-[10px] uppercase tracking-[0.32em] text-brass">Сводка</p>
              {!cart.length ? (
                <p className="mt-6 text-sm text-mist">Нет позиций — добавьте товар из карточки или корзины.</p>
              ) : (
                <ul className="mt-6 space-y-5">
                  {cart.map((line) => (
                    <li key={line.lineId} className="border-b border-white/[0.06] pb-5 last:border-b-0 last:pb-0">
                      <div className="flex gap-4">
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-white/[0.08]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={line.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-[11px] uppercase tracking-[0.14em]">{line.productName}</p>
                          <p className="mt-1 text-xs text-mist">
                            Цвет: {line.color} · Размер: {line.size}
                          </p>
                          <p className="mt-1 text-xs text-mist">Город принта: {cityLabelFromId(line.selectedCityId)}</p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-mist">SKU {line.sku}</p>
                          <p className="mt-2 font-display text-[10px] uppercase tracking-[0.14em] text-brass">
                            {formatCurrency(line.unitPrice)} × {line.quantity}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <p className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">К оплате</p>
                <p className="mt-2 font-display text-xl uppercase tracking-tight">{formatCurrency(total)}</p>
              </div>
              <p className="mt-6 text-[10px] leading-relaxed text-mist/80">
                Номер заказа и дата создаются при отправке. Статус и поля отмены управляются администратором.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
