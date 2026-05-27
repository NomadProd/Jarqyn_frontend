import { productVariantsApi } from "@/lib/api-client";

export type VariantStockResult = {
  ok: boolean;
  stockQuantity: number;
  message?: string;
};

export async function getVariantStockQuantity(variantId: number): Promise<VariantStockResult> {
  const response = await productVariantsApi.getById(variantId);
  if (!response.ok || !response.data) {
    return {
      ok: false,
      stockQuantity: 0,
      message: response.error || response.message || "Failed to load variant stock."
    };
  }

  const raw = response.data.stock_quantity;
  const stockQuantity = Math.max(0, Number.isFinite(Number(raw)) ? Math.floor(Number(raw)) : 0);
  return { ok: true, stockQuantity };
}

export function clampToStock(requestedQuantity: number, stockQuantity: number): number {
  const safeRequested = Math.max(1, Math.floor(Number(requestedQuantity) || 1));
  const safeStock = Math.max(0, Math.floor(Number(stockQuantity) || 0));
  return Math.min(safeRequested, safeStock);
}
