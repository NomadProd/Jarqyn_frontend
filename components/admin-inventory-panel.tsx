"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDemoStore } from "@/components/demo-provider";
import { productVariantsApi, apiGet } from "@/lib/api-client";
import { CITY_PRINT_ASSETS, cityLabelFromId } from "@/lib/city-catalog";
import { resolveProductFromRef, type StockPositionInput } from "@/lib/inventory-sync";
import type { Product } from "@/lib/demo-store";
import { computeLineSku } from "@/lib/order-utils";

const FIXED_SIZES = ["S", "M", "L", "XL"];

// SKU two-digit code -> Russian city label (fallback to "Астана")
const SKU_CITY_LABEL: Record<string, string> = {
  "01": "Орал",
  "02": "Атырау",
  "03": "Актау",
  "04": "Актобе",
  "05": "Костанай",
  "06": "Петропавл",
  "07": "Кокшетау",
  "08": "Павлодар",
  "09": "Астана",
  "12": "Караганда",
  "13": "Семей",
  "14": "Усть-Каменогорск",
  "15": "Кызылорда",
  "16": "Туркестан",
  "17": "Шымкент",
  "19": "Тараз",
  "20": "Алматы",
  "22": "Талдыкорган"
};

function cityLabelFromSku(sku: string): string {
  if (!sku || sku.length < 2) return "Астана";
  const last2 = sku.slice(-2);
  return SKU_CITY_LABEL[last2] || "Астана";
}

const emptyDraft = (): StockPositionInput => ({
  product_id: "",
  productName: "",
  sku: "",
  color: "Black",
  size: "M",
  selectedCityId: CITY_PRINT_ASSETS[0]?.id ?? "astana",
  quantity: 0,
  price: null,
  productRef: ""
});

function draftFromProduct(product: Product | undefined, base: StockPositionInput): StockPositionInput {
  if (!product) return base;
  const color = product.colors.includes(base.color) ? base.color : product.colors[0] ?? "";
  return {
    product_id: base.product_id,
    productName: base.productName,
    sku: base.sku,
    color,
    size: FIXED_SIZES.includes(base.size) ? base.size : "M",
    selectedCityId: CITY_PRINT_ASSETS.some((c) => c.id === base.selectedCityId)
      ? base.selectedCityId
      : CITY_PRINT_ASSETS[0]?.id ?? "astana",
    quantity: base.quantity,
    price: base.price,
    productRef: base.productRef
  };
}

export const AdminInventoryPanel = memo(function AdminInventoryPanel() {
  const { products } = useDemoStore();
  const [backendProducts, setBackendProducts] = useState<Array<any>>([]);
  const [variants, setVariants] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [formMessage, setFormMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [addDraft, setAddDraft] = useState<StockPositionInput>(() => {
    const p = products[0];
    return draftFromProduct(p, {
      ...emptyDraft(),
      product_id: p?.id ?? "",
      quantity: 50,
      productName: "",
      sku: ""
    });
  });
  const [editSku, setEditSku] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<StockPositionInput>(emptyDraft());
  const [editingQuantitySku, setEditingQuantitySku] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState<number>(0);

  const titleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) m.set(p.id, p.title);
    return m;
  }, [products]);

  const backendTitleById = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of backendProducts) m.set(Number(p.id), p.title ?? String(p.id));
    return m;
  }, [backendProducts]);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(addDraft.product_id)),
    [products, addDraft.product_id]
  );

  const addCanonicalSku = useMemo(() => {
    if (!selectedProduct || !addDraft.color || !addDraft.size) return "";
    // For fixed sizes, just use a simple pattern: PRODUCT_ID-SIZE-COLOR
    return `${addDraft.product_id}-${addDraft.size}-${addDraft.color}`.toUpperCase();
  }, [selectedProduct, addDraft.color, addDraft.size, addDraft.product_id]);

  const editProduct = useMemo(
    () => products.find((p) => String(p.id) === String(editDraft.product_id)),
    [products, editDraft.product_id]
  );

  const editCanonicalSku = useMemo(() => {
    if (!editProduct || !editDraft.color || !editDraft.size) return "";
    return `${editDraft.product_id}-${editDraft.size}-${editDraft.color}`.toUpperCase();
  }, [editProduct, editDraft.color, editDraft.size, editDraft.product_id]);

  useEffect(() => {
    // fetch backend product catalog for authoritative ids and titles
    (async () => {
      try {
        const res = await apiGet("/products");
        if (res.ok && Array.isArray(res.data)) {
          setBackendProducts(res.data);
        }
      } catch (e) {
        // ignore
      }
    })();

    if (!products.length) return;
    setAddDraft((d) => {
      if (products.find((p) => String(p.id) === String(d.product_id))) return d;
      return draftFromProduct(products[0], { ...d, product_id: products[0]!.id });
    });
  }, [products]);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return variants;
    return variants.filter((r) => {
      const title = (backendTitleById.get(Number(r.product_id)) ?? titleById.get(String(r.product_id)) ?? "").toLowerCase();
      const cityLabel = cityLabelFromId(r.selectedCityId || "")?.toLowerCase() || "";
      return (
        (r.sku || "").toLowerCase().includes(q) ||
        String(r.product_id).toLowerCase().includes(q) ||
        (r.color || "").toLowerCase().includes(q) ||
        (r.size || "").toLowerCase().includes(q) ||
        (r.selectedCityId || "").toLowerCase().includes(q) ||
        title.includes(q) ||
        cityLabel.includes(q)
      );
    });
  }, [variants, filter, titleById, backendTitleById]);

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    const res = await productVariantsApi.list();
    if (res.ok && Array.isArray(res.data)) {
      // normalize to expected fields
      setVariants(
        res.data.map((v: any) => ({
          id: v.id,
          product_id: v.product_id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          price: v.price ?? null,
          stock_quantity: v.stock_quantity,
          updatedAt: v.updated_at ?? null,
          selectedCityId: v.selected_city_id ?? "astana",
          inventoryProductName: (backendTitleById.get(Number(v.product_id)) ?? titleById.get(String(v.product_id))) || ""
        }))
      );
    }
    setLoading(false);
  }, [titleById, backendTitleById]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const cancelEdit = useCallback(() => {
    setEditSku(null);
    setFormMessage(null);
  }, []);

  const beginEdit = useCallback(
    (sku: string) => {
      const row = variants.find((r) => r.sku === sku);
      if (!row) return;
      setEditSku(sku);
      setEditDraft({
        product_id: row.product_id,
          productName: row.inventoryProductName || backendTitleById.get(Number(row.product_id)) || titleById.get(String(row.product_id)) || "",
        sku: row.sku,
        color: row.color,
        size: row.size,
        selectedCityId: row.selectedCityId || "astana",
        quantity: row.stock_quantity || 0,
        price: row.price ?? null,
        productRef: ""
      });
      setFormMessage(null);
    },
    [variants, titleById, backendTitleById]
  );

  const onAddSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormMessage(null);
      (async () => {
        const productId = Number(addDraft.product_id);
        const exists = backendTitleById.has(productId);
        if (!exists) {
          setFormMessage({ tone: "err", text: `Товар с ID ${addDraft.product_id} не найден в каталоге` });
          return;
        }
        const prod = products.find((p) => Number(p.id) === productId);
        try {
          const payload = {
            product_id: productId,
            size: addDraft.size,
            color: addDraft.color,
            sku: addDraft.sku.trim().toUpperCase(),
            price: addDraft.price !== null ? Number(addDraft.price) : null,
            stock_quantity: Number(addDraft.quantity || 0)
          };
          const res = await productVariantsApi.create(payload);
          if (res.ok && res.data) {
            setFormMessage({ tone: "ok", text: "Добавлено" });
            await fetchVariants();
            setAddDraft(
              draftFromProduct(prod, {
                ...emptyDraft(),
                product_id: prod.id,
                quantity: 50
              })
            );
          } else {
            setFormMessage({ tone: "err", text: res.message || res.error || "Ошибка" });
          }
        } catch (err: any) {
          setFormMessage({ tone: "err", text: err?.message || "Ошибка" });
        }
      })();
    },
    [addDraft, products, fetchVariants, backendTitleById]
  );

  const setStockQuantity = useCallback(
    async (sku: string, qty: number) => {
      const found = variants.find((v) => v.sku === sku);
      if (!found) return;
      setEditingQuantitySku(null);
      // optimistic update
      setVariants((prev) => prev.map((v) => (v.id === found.id ? { ...v, stock_quantity: qty } : v)));
      const res = await productVariantsApi.update(found.id, { stock_quantity: qty });
      if (!res.ok) {
        // revert on error
        await fetchVariants();
        alert(res.message || res.error || "Ошибка обновления");
      }
    },
    [variants, fetchVariants]
  );

  const onEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editSku) return;
      setFormMessage(null);
      (async () => {
        // find variant id by sku
        const found = variants.find((v) => v.sku === editSku);
        if (!found) {
          setFormMessage({ tone: "err", text: "Variant not found" });
          return;
        }
        const res = await productVariantsApi.update(found.id, { stock_quantity: editDraft.quantity });
        if (res.ok && res.data) {
          setFormMessage({ tone: "ok", text: "Сохранено" });
          await fetchVariants();
          cancelEdit();
        } else {
          setFormMessage({ tone: "err", text: res.message || res.error || "Ошибка" });
        }
      })();
    },
    [editSku, editDraft, variants, cancelEdit, fetchVariants]
  );

  const sizeOptionsFor = (p: Product | undefined) => {
    if (!p) return [];
    return p.sizes.filter((s) => !p.unavailableSizes?.includes(s));
  };

  return (
    <div className="mb-10 border-t border-white/[0.08] pt-10">
      <h3 className="font-display text-lg uppercase tracking-tight text-fog">Склад (остатки по SKU)</h3>
      <p className="mt-2 text-sm text-mist">
        Название на складе и SKU вводит админ. Поле «Товар (каталог)» — текст: название как в каталоге, slug или id
        позиции (нужно для цвета, размера и подсказки SKU). SKU для заказа должен совпадать с подсказкой. Остаток
        уменьшается при успешном заказе; удаление заказа в админке возвращает списанное, если заказ уже проведён по
        складу.
      </p>

      {formMessage ? (
        <p
          className={`mt-4 text-xs ${formMessage.tone === "ok" ? "text-brass" : "text-red-300"}`}
          role="status"
        >
          {formMessage.text}
        </p>
      ) : null}

      <form
        onSubmit={onAddSubmit}
        className="mt-6 grid gap-3 border border-white/[0.1] bg-ink/40 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mist sm:col-span-2 lg:col-span-3 xl:col-span-6">
          Новая позиция
        </p>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist sm:col-span-2">
          Название товара (на складе)
          <input
            value={addDraft.productName}
            onChange={(e) => setAddDraft((d) => ({ ...d, productName: e.target.value }))}
            placeholder="Как отображать в таблице склада"
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
            autoComplete="off"
          />
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist sm:col-span-2">
          SKU
          <input
            value={addDraft.sku}
            onChange={(e) => setAddDraft((d) => ({ ...d, sku: e.target.value }))}
            placeholder="Введите SKU вручную"
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 font-mono text-[11px] text-fog uppercase"
            autoComplete="off"
          />
          {addCanonicalSku ? (
            <span className="mt-1 block text-[9px] leading-snug text-mist">
              Для заказов нужен ровно: <span className="font-mono text-fog/90">{addCanonicalSku}</span>
            </span>
          ) : null}
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist sm:col-span-2">
          ID товара (каталог)
          <input
            type="number"
            value={addDraft.product_id}
            onChange={(e) => setAddDraft((d) => ({ ...d, product_id: e.target.value }))}
            placeholder="Введите ID товара"
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
            autoComplete="off"
          />
          {!selectedProduct && addDraft.product_id && !backendTitleById.has(Number(addDraft.product_id)) ? (
            <span className="mt-1 block text-[9px] text-red-300/90">ID не найден в каталоге.</span>
          ) : (
            <span className="mt-1 block text-[9px] text-mist">
              {backendTitleById.get(Number(addDraft.product_id)) ?? (selectedProduct ? selectedProduct.title : "ID товара для связи с каталогом")}
            </span>
          )}
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
          Цвет
          <input
            list="product-colors-add"
            value={addDraft.color}
            onChange={(e) => setAddDraft((d) => ({ ...d, color: e.target.value }))}
            placeholder="Введите цвет или выберите"
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
          />
          <datalist id="product-colors-add">
            {(selectedProduct?.colors ?? []).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
          Размер
          <select
            value={addDraft.size}
            onChange={(e) => setAddDraft((d) => ({ ...d, size: e.target.value }))}
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
          >
            {FIXED_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
          Цена
          <input
            type="number"
            step="0.01"
            min={0}
            value={addDraft.price ?? ""}
            onChange={(e) => setAddDraft((d) => ({ ...d, price: e.target.value ? Number(e.target.value) : null }))}
            placeholder="Опционально"
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
          />
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
          Город принта
          <select
            value={addDraft.selectedCityId}
            onChange={(e) => setAddDraft((d) => ({ ...d, selectedCityId: e.target.value }))}
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
          >
            {CITY_PRINT_ASSETS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
          Количество
          <input
            type="number"
            min={0}
            value={addDraft.quantity}
            onChange={(e) => setAddDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
            className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full border border-brass/50 bg-brass/10 px-3 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-brass hover:bg-brass/20"
          >
            Добавить
          </button>
        </div>
      </form>

      {editSku ? (
        <form
          onSubmit={onEditSubmit}
          className="mt-4 grid gap-3 border border-brass/25 bg-mossdeep/20 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7"
        >
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-brass sm:col-span-2 lg:col-span-3 xl:col-span-7">
            Редактирование · было SKU: <span className="font-mono">{editSku}</span>
          </p>
          <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist sm:col-span-2">
            Название товара (на складе)
            <input
              value={editDraft.productName}
              onChange={(e) => setEditDraft((d) => ({ ...d, productName: e.target.value }))}
              className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
              autoComplete="off"
            />
          </label>
          <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist sm:col-span-2">
            SKU
            <input
              value={editDraft.sku}
              onChange={(e) => setEditDraft((d) => ({ ...d, sku: e.target.value }))}
              className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 font-mono text-[11px] text-fog uppercase"
              autoComplete="off"
            />
            {editCanonicalSku ? (
              <span className="mt-1 block text-[9px] leading-snug text-mist">
                Для заказов: <span className="font-mono text-fog/90">{editCanonicalSku}</span>
              </span>
            ) : null}
          </label>
          <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
            Размер
            <select
              value={editDraft.size}
              onChange={(e) => setEditDraft((d) => ({ ...d, size: e.target.value }))}
              className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
            >
              {FIXED_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
            <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
              Цвет
              <input
                list="product-colors-edit"
                value={editDraft.color}
                onChange={(e) => setEditDraft((d) => ({ ...d, color: e.target.value }))}
                placeholder="Введите цвет или выберите"
                className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
              />
              <datalist id="product-colors-edit">
                {(editProduct?.colors ?? []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
          <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
            Цена
            <input
              type="number"
              step="0.01"
              min={0}
              value={editDraft.price ?? ""}
              onChange={(e) => setEditDraft((d) => ({ ...d, price: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Опционально"
              className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
            />
          </label>
          <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
            Город принта
            <select
              value={editDraft.selectedCityId}
              onChange={(e) => setEditDraft((d) => ({ ...d, selectedCityId: e.target.value }))}
              className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
            >
              {CITY_PRINT_ASSETS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block font-display text-[10px] uppercase tracking-[0.18em] text-mist">
            Количество
            <input
              type="number"
              min={0}
              value={editDraft.quantity}
              onChange={(e) => setEditDraft((d) => ({ ...d, quantity: Number(e.target.value) }))}
              className="mt-2 w-full border border-white/[0.14] bg-ink px-2 py-2 text-xs text-fog"
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="submit"
              className="border border-brass/50 bg-brass/10 px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-brass hover:bg-brass/20"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="border border-white/[0.14] px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-mist hover:text-fog"
            >
              Отмена
            </button>
          </div>
          <p className="text-[10px] leading-relaxed text-mist sm:col-span-2 lg:col-span-3 xl:col-span-7">
            После смены комбинации введите SKU заново по подсказке (как в корзине). Уже оформленные заказы не
            меняются; активные корзины с другим SKU не попадут на эту строку.
          </p>
        </form>
      ) : null}

      <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.22em] text-mist">
        Фильтр (SKU, товар, цвет, размер, город)
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-2 w-full max-w-md border border-white/[0.14] bg-ink px-3 py-2 text-xs text-fog"
        />
      </label>
      <div className="mt-6 max-h-[min(28rem,55vh)] overflow-auto border border-white/[0.08]">
        <table className="min-w-full border-collapse text-left text-[11px] text-mist">
          <thead className="sticky top-0 bg-graphite font-display text-[10px] uppercase tracking-[0.18em] text-fog">
            <tr>
              <th className="border-b border-white/[0.08] px-3 py-2">Товар</th>
              <th className="border-b border-white/[0.08] px-3 py-2">SKU</th>
              <th className="border-b border-white/[0.08] px-3 py-2">Цвет / размер</th>
              <th className="border-b border-white/[0.08] px-3 py-2">Город принта</th>
              <th className="border-b border-white/[0.08] px-3 py-2">Остаток</th>
              <th className="border-b border-white/[0.08] px-3 py-2">Обновлено</th>
              <th className="border-b border-white/[0.08] px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 400).map((row) => (
              <tr key={row.sku} className="border-b border-white/[0.05] bg-ink/40">
                <td className="px-3 py-2 text-fog">
                  {(backendTitleById.get(Number(row.product_id)) ?? titleById.get(String(row.product_id))) || row.inventoryProductName || row.product_id}
                </td>
                <td className="px-3 py-2 font-mono text-[10px]">{row.sku}</td>
                <td className="px-3 py-2">
                  {row.color} · {row.size}
                </td>
                <td className="px-3 py-2">
                  {cityLabelFromSku(row.sku)}
                  <span className="ml-1 font-mono text-[9px] text-mist/80">({String(row.sku).slice(-2)})</span>
                </td>
                <td className="px-3 py-2">
                  {editingQuantitySku === row.sku ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={editingQuantityValue}
                        onChange={(e) => setEditingQuantityValue(Math.max(0, Number(e.target.value) || 0))}
                        className="w-16 border border-white/[0.14] bg-ink px-2 py-1 text-xs text-fog"
                        autoFocus
                      />
                      <button
                        onClick={async () => {
                          await setStockQuantity(row.sku, editingQuantityValue);
                        }}
                        className="text-[9px] uppercase tracking-[0.14em] text-brass hover:text-brass/80 whitespace-nowrap"
                      >
                        Сохр.
                      </button>
                      <button
                        onClick={() => setEditingQuantitySku(null)}
                        className="text-[9px] uppercase tracking-[0.14em] text-mist hover:text-fog whitespace-nowrap"
                      >
                        Отм.
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingQuantitySku(row.sku);
                        setEditingQuantityValue(row.stock_quantity ?? row.quantity);
                      }}
                      className="w-16 border border-white/[0.14] bg-ink px-2 py-1 text-xs text-fog hover:bg-ink/80"
                    >
                      {row.stock_quantity ?? row.quantity}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-[9px] text-mist">
                  {row.updatedAt ? new Date(row.updatedAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }) : "—"}
                </td>
                <td className="space-x-2 px-3 py-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => beginEdit(row.sku)}
                    className="text-[10px] uppercase tracking-[0.14em] text-brass hover:text-brass/80 mr-2"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof window !== "undefined" && window.confirm(`Удалить вариант ${row.sku}?`)) {
                        // find variant id
                        const found = variants.find((v) => v.sku === row.sku);
                        if (!found) return;
                        const res = await productVariantsApi.delete(found.id);
                        if (res.ok) {
                          setVariants((prev) => prev.filter((p) => p.id !== found.id));
                        } else {
                          alert(res.message || res.error || "Ошибка удаления");
                        }
                      }
                    }}
                    className="text-[10px] uppercase tracking-[0.14em] text-red-300 hover:text-red-200"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 400 ? (
          <p className="border-t border-white/[0.06] px-3 py-2 text-[10px] text-mist">
            Показаны первые 400 строк — уточните фильтр.
          </p>
        ) : null}
      </div>
    </div>
  );
});
