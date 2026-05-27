import { CITY_PRINT_ASSETS } from "@/lib/city-catalog";
import type { InventoryRow, OrderLineItem, Product } from "@/lib/demo-store";
import { computeLineSku } from "@/lib/order-utils";

/** Manual admin create/edit — must match cart/order line dimensions + catalog rules */
export type StockPositionInput = {
  /** Product ID from catalog — admin enters numeric id */
  product_id: number | string;
  /** Как показывать товар на складе — вводит админ */
  productName: string;
  /** SKU вводит админ; для списания с заказом должен совпадать с computeLineSku(...) */
  sku: string;
  color: string;
  size: string;
  selectedCityId: string;
  quantity: number;
  /** Price for this variant */
  price: number | null;
  /** Keep productRef for backward compatibility */
  productRef: string;
};

/** Resolve catalog product from admin-typed id, slug, or exact title (case-insensitive). */
export function resolveProductFromRef(products: Product[], ref: string): Product | undefined {
  const t = ref.trim();
  if (!t) return undefined;
  const byId = products.find((p) => p.id === t);
  if (byId) return byId;
  const needle = t.toLowerCase();
  const bySlug = products.find((p) => (p.slug?.trim().toLowerCase() ?? "") === needle);
  if (bySlug) return bySlug;
  return products.find((p) => p.title.trim().toLowerCase() === needle);
}

function isoNow() {
  return new Date().toISOString();
}

/**
 * Builds a warehouse row consistent with storefront SKU rules.
 * Stock is keyed by SKU = f(productId, color, size, selectedCityId), not a separate variant table.
 */
export function buildStockPositionRow(
  products: Product[],
  input: StockPositionInput,
  options?: { preserveCreatedAt?: string }
): { ok: true; row: InventoryRow } | { ok: false; message: string } {
  const product = resolveProductFromRef(products, input.productRef);
  if (!product) {
    return {
      ok: false,
      message: "Товар не найден. Введите точное название из каталога, slug или id позиции."
    };
  }
  if (!product.colors.includes(input.color)) {
    return { ok: false, message: "Этот цвет не входит в карточку товара." };
  }
  if (!product.sizes.includes(input.size)) {
    return { ok: false, message: "Этот размер не входит в карточку товара." };
  }
  if (product.unavailableSizes?.includes(input.size)) {
    return { ok: false, message: "Размер помечен как недоступный у товара — сначала снимите блокировку в каталоге." };
  }
  if (!CITY_PRINT_ASSETS.some((c) => c.id === input.selectedCityId)) {
    return { ok: false, message: "Неизвестный id города принта." };
  }
  const name = input.productName.trim();
  if (!name) {
    return { ok: false, message: "Введите название товара (как на складе)." };
  }
  const skuRaw = input.sku.trim().toUpperCase();
  if (!skuRaw) {
    return { ok: false, message: "Введите SKU." };
  }
  const canonical = computeLineSku(product, input.color, input.size, input.selectedCityId);
  if (skuRaw !== canonical) {
    return {
      ok: false,
      message: `SKU должен совпадать с правилом магазина для этой комбинации: ${canonical}`
    };
  }
  const quantity = Math.max(0, Math.floor(Number(input.quantity) || 0));
  const now = isoNow();
  const row: InventoryRow = {
    id: `inv-${skuRaw}`,
    sku: skuRaw,
    productId: product.id,
    inventoryProductName: name,
    color: input.color,
    size: input.size,
    selectedCityId: input.selectedCityId,
    quantity,
    createdAt: options?.preserveCreatedAt ?? now,
    updatedAt: now
  };
  return { ok: true, row };
}

const DEFAULT_QTY = 50;

export function inventoryRowsForProduct(product: Product, defaultQty = DEFAULT_QTY): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const cities = CITY_PRINT_ASSETS.map((c) => c.id);
  for (const color of product.colors) {
    for (const size of product.sizes) {
      if (product.unavailableSizes?.includes(size)) continue;
      for (const selectedCityId of cities) {
        const sku = computeLineSku(product, color, size, selectedCityId);
        rows.push({
          id: `inv-${sku}`,
          sku,
          productId: product.id,
          inventoryProductName: product.title,
          color,
          size,
          selectedCityId,
          quantity: defaultQty
        });
      }
    }
  }
  return rows;
}

export function inventoryFromProducts(products: Product[]): InventoryRow[] {
  return products.flatMap((p) => inventoryRowsForProduct(p));
}

/** Overlay saved quantities onto full SKU template for current catalog */
export function mergePersistedInventory(products: Product[], savedRaw: unknown): InventoryRow[] {
  const template = inventoryFromProducts(products);
  const saved = normalizeInventoryRows(savedRaw);
  const savedBySku = new Map(saved.map((r) => [r.sku, r]));
  return template.map((t) => {
    const s = savedBySku.get(t.sku);
    const nameFromSaved = s?.inventoryProductName?.trim();
    return {
      ...t,
      quantity: s ? Math.max(0, s.quantity) : t.quantity,
      inventoryProductName: nameFromSaved || t.inventoryProductName
    };
  });
}

export function stripInventoryForProduct(inventory: InventoryRow[], productId: string): InventoryRow[] {
  return inventory.filter((r) => r.productId !== productId);
}

/** Replace all variant rows for one product (after edit). */
export function replaceInventoryForProduct(inventory: InventoryRow[], product: Product): InventoryRow[] {
  const stripped = stripInventoryForProduct(inventory, product.id);
  const preservedQty = new Map<string, number>();
  for (const row of inventory) {
    if (row.productId === product.id) preservedQty.set(row.sku, row.quantity);
  }
  const fresh = inventoryRowsForProduct(product).map((row) => ({
    ...row,
    quantity: preservedQty.has(row.sku) ? preservedQty.get(row.sku)! : row.quantity
  }));
  return [...stripped, ...fresh];
}

export function normalizeInventoryRows(raw: unknown): InventoryRow[] {
  if (!Array.isArray(raw)) return [];
  const out: InventoryRow[] = [];
  for (const row of raw) {
    const x = row as Partial<InventoryRow>;
    if (
      typeof x.sku === "string" &&
      typeof x.productId === "string" &&
      typeof x.quantity === "number" &&
      typeof x.color === "string" &&
      typeof x.size === "string" &&
      typeof x.selectedCityId === "string"
    ) {
      const createdAt = typeof x.createdAt === "string" && x.createdAt ? x.createdAt : undefined;
      const updatedAt = typeof x.updatedAt === "string" && x.updatedAt ? x.updatedAt : undefined;
      const inventoryProductName =
        typeof x.inventoryProductName === "string" && x.inventoryProductName.trim()
          ? x.inventoryProductName.trim()
          : "";
      out.push({
        id: typeof x.id === "string" && x.id ? x.id : `inv-${x.sku}`,
        sku: x.sku,
        productId: x.productId,
        inventoryProductName,
        color: x.color,
        size: x.size,
        selectedCityId: x.selectedCityId,
        quantity: Math.max(0, Math.floor(x.quantity)),
        ...(createdAt ? { createdAt } : {}),
        ...(updatedAt ? { updatedAt } : {})
      });
    }
  }
  return out;
}

export function deductInventoryForLines(
  inventory: InventoryRow[],
  lines: OrderLineItem[]
): { ok: true; next: InventoryRow[] } | { ok: false; message: string } {
  const bySku = new Map(inventory.map((r) => [r.sku, { ...r }]));
  for (const line of lines) {
    const row = bySku.get(line.sku);
    if (!row) {
      return { ok: false, message: `Нет складской позиции для SKU ${line.sku}.` };
    }
    if (row.quantity < line.quantity) {
      return {
        ok: false,
        message: `Недостаточно на складе (${line.productName}, SKU ${line.sku}). Доступно: ${row.quantity}.`
      };
    }
    row.quantity -= line.quantity;
    bySku.set(line.sku, row);
  }
  return { ok: true, next: Array.from(bySku.values()) };
}

/** Restore quantities when cancelling/removing an order that already decremented stock. */
export function restoreInventoryForLines(inventory: InventoryRow[], lines: OrderLineItem[]): InventoryRow[] {
  const bySku = new Map(inventory.map((r) => [r.sku, { ...r }]));
  for (const line of lines) {
    let row = bySku.get(line.sku);
    if (!row) {
      row = {
        id: `inv-${line.sku}`,
        sku: line.sku,
        productId: line.productId,
        inventoryProductName: line.productName,
        color: line.color,
        size: line.size,
        selectedCityId: line.selectedCityId,
        quantity: 0
      };
    }
    row.quantity += line.quantity;
    bySku.set(line.sku, row);
  }
  return Array.from(bySku.values());
}
