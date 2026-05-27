/**
 * City print assets under /public/www/hudi-with-cities (synced from For WWW/HUDI with Cities).
 * Add entries here when new PNGs are added to the folder.
 */
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
  { id: "uralsk", label: "Уральск", skuCode: "01", imageSrc: "/www/hudi-with-cities/01%20URA-GUW.png" },
  { id: "astana", label: "Астана", skuCode: "09", imageSrc: "/www/hudi-with-cities/02%20SCO-AKX.png" },
  { id: "kokshetau", label: "Кокшетау", skuCode: "07", imageSrc: "/www/hudi-with-cities/03%20KSN-PPK.png" },
  { id: "kostanay", label: "Костанай", skuCode: "05", imageSrc: "/www/hudi-with-cities/04%20KOV-PWQ.png" },
  { id: "kyzylorda", label: "Кызылорда", skuCode: "15", imageSrc: "/www/hudi-with-cities/05%20NQZ-KGF.png" },
  { id: "pavlodar", label: "Павлодар", skuCode: "06", imageSrc: "/www/hudi-with-cities/06%20PLX-UKK.png" },
  { id: "kyzylzhar", label: "Қызылжар", skuCode: "13", imageSrc: "/www/hudi-with-cities/07%20KZO-HSA.png" },
  { id: "shymkent", label: "Шымкент", skuCode: "17", imageSrc: "/www/hudi-with-cities/08%20CIT-DMB.png" },
  { id: "almaty", label: "Алматы", skuCode: "20", imageSrc: "/www/hudi-with-cities/09%20ALA-TDK.png" }
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
