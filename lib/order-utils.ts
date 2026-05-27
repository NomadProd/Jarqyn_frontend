import { CITY_PRINT_ASSETS } from "@/lib/city-catalog";
import type { Product } from "@/lib/demo-store";

function slugPart(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-а-яёії]/gi, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

function normalizeSkuPart(input: string): string {
  return input.trim().toUpperCase();
}

function getProductSkuBase(product: Product, color: string): string {
  const normalizedColor = color.trim();
  if (product.colorSkus?.[normalizedColor]) {
    return product.colorSkus[normalizedColor];
  }
  if (product.skuCode) {
    return product.skuCode;
  }
  return slugPart(product.id);
}

function getCitySkuCode(cityId: string): string | undefined {
  return CITY_PRINT_ASSETS.find((item) => item.id === cityId)?.skuCode;
}

export function computeLineSku(productOrId: Product | string, color: string, size: string, cityId: string): string {
  if (typeof productOrId === "string") {
    const parts = [productOrId, slugPart(color), slugPart(size), slugPart(cityId)].filter(Boolean);
    return parts.join("-").toUpperCase();
  }

  const base = getProductSkuBase(productOrId, color);
  const sizePart = normalizeSkuPart(size);
  const parts = [base, sizePart];
  const cityCode = getCitySkuCode(cityId);

  const isSchoolUnity = productOrId.id === "school-unity" || productOrId.title === "School Unity";
  if (isSchoolUnity && cityCode) {
    parts.push(cityCode);
  }

  return parts.filter(Boolean).join("").toUpperCase();
}
