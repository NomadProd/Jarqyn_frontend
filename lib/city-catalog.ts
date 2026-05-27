export type CityPrintAsset = {
  /** Stable id used in cart/order state */
  id: string;
  /** Display label (matches customer-facing city name) */
  label: string;
  /** Two-digit SKU code used by backend variant SKUs */
  skuCode: string;
  /** Public URL */
  imageSrc: string;
};

export const CITY_PRINT_ASSETS: CityPrintAsset[] = [
  { id: "oral", label: "Oral", skuCode: "01", imageSrc: "" },
  { id: "atyrau", label: "Atyrau", skuCode: "02", imageSrc: "" },
  { id: "aktau", label: "Aktau", skuCode: "03", imageSrc: "" },
  { id: "aktobe", label: "Aktobe", skuCode: "04", imageSrc: "" },
  { id: "kostanay", label: "Kostanay", skuCode: "05", imageSrc: "" },
  { id: "petropavl", label: "Petropavl", skuCode: "06", imageSrc: "" },
  { id: "kokshetau", label: "Kokshetau", skuCode: "07", imageSrc: "" },
  { id: "pavlodar", label: "Pavlodar", skuCode: "08", imageSrc: "" },
  { id: "astana", label: "Astana", skuCode: "09", imageSrc: "" },
  { id: "karaganda", label: "Karaganda", skuCode: "12", imageSrc: "" },
  { id: "semey", label: "Semey", skuCode: "13", imageSrc: "" },
  { id: "oskemen", label: "Oskemen", skuCode: "14", imageSrc: "" },
  { id: "kyzylorda", label: "Kyzylorda", skuCode: "15", imageSrc: "" },
  { id: "turkistan", label: "Turkistan", skuCode: "16", imageSrc: "" },
  { id: "shymkent", label: "Shymkent", skuCode: "17", imageSrc: "" },
  { id: "taraz", label: "Taraz", skuCode: "19", imageSrc: "" },
  { id: "almaty", label: "Almaty", skuCode: "20", imageSrc: "" },
  { id: "taldykorgan", label: "Taldykorgan", skuCode: "22", imageSrc: "" }
];

export function cityPrintById(id: string | null | undefined): CityPrintAsset | undefined {
  if (!id) return undefined;
  return CITY_PRINT_ASSETS.find((c) => c.id === id);
}

export function cityLabelFromId(id: string | null | undefined): string {
  return cityPrintById(id)?.label ?? "";
}

/** Product.cityPrints shape — derived from catalog */
export function cityPrintsForProducts() {
  return CITY_PRINT_ASSETS.map((c) => ({ city: c.id, image: c.imageSrc }));
}
