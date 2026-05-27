import { cityPrintsForProducts } from "@/lib/city-catalog";
import type { CustomerSourceOption } from "@/lib/nis-schools";
import { computeLineSku } from "@/lib/order-utils";

export type Product = {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  price: number;
  colors: string[];
  sizes: string[];
  unavailableSizes?: string[];
  position: string;
  skuCode?: string;
  colorSkus?: Record<string, string>;
  image: string;
  imagesByColor?: Record<string, string[]>;
  backImageByColor?: Record<string, string>;
  customizable?: boolean;
  /** City print options: `city` stores stable id (see lib/city-catalog.ts) */
  cityPrints?: Array<{
    city: string;
    image: string;
  }>;
  description?: string;
  specifications?: string;
  sizeChart?: {
    headers: string[];
    rows: string[][];
  };
  /** Fabric / care line for PDP */
  composition?: string;
  /** Product hero video — slot: add file at this path when ready */
  videoSrc?: string;
};

export type DemoUser = {
  /** Stable account id (local demo store) */
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
};

export type TrackingStep = {
  label: string;
  done: boolean;
  date: string;
};

export type ShippingAddress = {
  region: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postalCode: string;
};

export type OrderLineItem = {
  productId: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  /** City print id (lib/city-catalog) */
  selectedCityId: string;
  quantity: number;
  image: string;
  unitPrice: number;
  variantId?: number;
};

export type CartLineItem = OrderLineItem & {
  lineId: string;
  backendItemId?: number;
};

export type InventoryRow = {
  id: string;
  sku: string;
  productId: string;
  /** Название строки на складе — вводит админ (для таблицы и учёта) */
  inventoryProductName: string;
  color: string;
  size: string;
  selectedCityId: string;
  quantity: number;
  /** Set when row is created/updated via admin or sync helpers */
  createdAt?: string;
  updatedAt?: string;
};

export type OrderFulfillmentStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type DemoOrder = {
  id: string;
  accountId: string;
  customerFullName: string;
  phone: string;
  shippingAddress: ShippingAddress;
  nisSchool?: string;
  customerSource?: CustomerSourceOption;
  items: OrderLineItem[];
  total: number;
  /** ISO timestamp from server at creation */
  createdAt: string;
  status: OrderFulfillmentStatus;
  paymentStatus: "pending" | "paid";
  tracking: TrackingStep[];
  cancelReason?: string;
  closedDate?: string;
  /** Inventory lines deducted exactly once for this order */
  stockProcessed?: boolean;
};

/** Legacy persisted shape before order flow v2 */
export type LegacyDemoOrder = Omit<
  DemoOrder,
  | "accountId"
  | "customerFullName"
  | "phone"
  | "shippingAddress"
  | "items"
  | "cancelReason"
  | "closedDate"
  | "stockProcessed"
> & {
  items: Product[] | OrderLineItem[];
  accountId?: string;
  customerFullName?: string;
  phone?: string;
  shippingAddress?: ShippingAddress;
  cancelReason?: string;
  closedDate?: string;
  stockProcessed?: boolean;
};

/** Editable hero copy (first screen on `/`). */
export type HeroContent = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaStory: string;
};

export const defaultHeroContent: HeroContent = {
  eyebrow: "Jarqyn · Қазақстанның ең жарқыны ұрпағы",
  titleLine1: "ЖАРҚЫН.",
  titleLine2: "Яркое поколение Казахстана.",
  ctaPrimary: "Shop the Collection",
  ctaSecondary: "Присоединяйся",
  ctaStory: "Наша история"
};

export function mergeHeroContent(partial?: Partial<HeroContent> | null): HeroContent {
  return { ...defaultHeroContent, ...partial };
}

export type ManifestoBlock = {
  id: string;
  kicker: string;
  text: string;
};

export type ManifestoContent = {
  /** Малая подпись над блоками (напр. «Манифест») */
  sectionLabel: string;
  blocks: ManifestoBlock[];
};

export const defaultManifestoContent: ManifestoContent = {
  sectionLabel: "Манифест",
  blocks: [
    {
      id: "m-context",
      kicker: "Контекст",
      text:
        "В 2022 году НИШ потеряла форму — не как школу, а как символ. То, что держало поколение вместе, исчезло из повседневности. И это было не про «старые времена». Это был разрыв между памятью и тем, кем мы становимся."
    },
    {
      id: "m-answer",
      kicker: "Ответ",
      text:
        "Жаркын появился не из ностальгии. Это новая форма принадлежности: честная к материалу, строгая к детали, свободная от шумного мерча. Униформа нового поколения — для тех, кто считает статус не декорацией, а языком."
    },
    {
      id: "m-culture",
      kicker: "Культурный код",
      text:
        "Мы из поколения олимпиад и проектов, спортивных прорывов и первых стартапов, дорог в США и Китай — и из городов, где каждый день доказываешь право быть ярким. Это не лозунг на стене: это привычка держать планку."
    },
    {
      id: "m-invite",
      kicker: "Приглашение",
      text:
        "Жаркын — для тех, кто уже живёт на уровне выше ожиданий. Меньше слов — больше присутствия. Надень форму движения."
    }
  ]
};

/** Разбивает абзац на «ступени» анимации: сначала по строкам (\n), иначе по предложениям. */
export function splitManifestoBodyLines(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [""];
  const byBreak = trimmed
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (byBreak.length > 1) return byBreak;
  const sentences = trimmed
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length ? sentences : [trimmed];
}

export function mergeManifestoContent(partial?: Partial<ManifestoContent> | null): ManifestoContent {
  const base = defaultManifestoContent;
  if (!partial?.blocks || !Array.isArray(partial.blocks) || partial.blocks.length === 0) {
    return {
      sectionLabel: base.sectionLabel,
      blocks: base.blocks.map((b) => ({ ...b }))
    };
  }
  const blocks: ManifestoBlock[] = partial.blocks.map((b, i) => ({
    id:
      typeof b?.id === "string" && b.id.length > 0
        ? b.id
        : (base.blocks[i]?.id ?? `manifesto-${i}`),
    kicker: typeof b?.kicker === "string" ? b.kicker : base.blocks[i]?.kicker ?? "",
    text: typeof b?.text === "string" ? b.text : base.blocks[i]?.text ?? ""
  }));
  return {
    sectionLabel: typeof partial.sectionLabel === "string" ? partial.sectionLabel : base.sectionLabel,
    blocks
  };
}

/** Человек / карточка внутри направления: фото 16:9 и краткое описание (страница `/shop/ambassador/[slug]`). */
export type AmbassadorProfile = {
  id: string;
  image: string;
  caption: string;
};

export function normalizeAmbassadorProfiles(raw: unknown): AmbassadorProfile[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const p = item as Partial<AmbassadorProfile>;
    return {
      id: typeof p.id === "string" && p.id ? p.id : `face-${i}-${Math.random().toString(36).slice(2, 7)}`,
      image: typeof p.image === "string" && p.image ? p.image : "/www/photos/solo/01.jpg",
      caption: typeof p.caption === "string" ? p.caption : ""
    };
  });
}

/** Категория / направление амбассадоров — отдельная страница `/shop/ambassador/[slug]`. */
export type Ambassador = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  role: string;
  slot: string;
  image: string;
  city: string;
  /** Краткий текст на фото (правый нижний угол, блок 16:9). */
  coverBlurb: string;
  /** Несколько амбассадоров направления: фото + краткий текст. */
  profiles: AmbassadorProfile[];
};

export function ambPath(slug: string) {
  return `/shop/ambassador/${encodeURIComponent(slug)}`;
}

export function normalizeAmbassadorSlug(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-а-яёії]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "club";
}

export const defaultAmbassadors: Ambassador[] = [
  {
    id: "amb-projects",
    slug: "projects",
    title: "Проектники",
    subtitle:
      "Инженерия, кейсы и команды — амбассадоры проектного трека в Jarqyn. Направление для тех, кто собирает продукт и доводит идею до результата.",
    role: "Инженерия · кейсы · команды",
    slot: "Медиа-слот: амбассадор в Jarqyn",
    city: "Астана",
    image: "/www/photos/solo/01.jpg",
    coverBlurb: "Инженерия, кейсы и команды — форма для тех, кто доводит идею до результата.",
    profiles: []
  },
  {
    id: "amb-olympiad",
    slug: "olympiad",
    title: "Олимпиадники",
    subtitle:
      "Точность, дисциплина и масштаб — форма для тех, кто выбирает соревнование с задачей и держит планку годами.",
    role: "Точность · дисциплина · масштаб",
    slot: "Медиа-слот",
    city: "Алматы",
    image: "/www/photos/solo/03.jpg",
    coverBlurb: "Точность и дисциплина — униформа соревнования с задачей, а не с трибунами.",
    profiles: []
  },
  {
    id: "amb-sport",
    slug: "sport",
    title: "Спортсмены",
    subtitle:
      "Характер, ритм и победа — единый визуальный код поколения, которое тренирует каждый день и выходит на арену без компромиссов.",
    role: "Характер · ритм · победа",
    slot: "Медиа-слот",
    city: "Шымкент",
    image: "/www/photos/team/01.jpg",
    coverBlurb: "Ритм тренировок и характер арены — без компромиссов и лишнего шума.",
    profiles: []
  },
  {
    id: "amb-startup",
    slug: "startup",
    title: "Стартаперы",
    subtitle:
      "Сборка, запуск и ответственность — униформа тех, кто строит продукты и будущее городов, а не только слайды.",
    role: "Сборка · запуск · ответственность",
    slot: "Медиа-слот",
    city: "Караганды",
    image: "/www/photos/team/12.jpg",
    coverBlurb: "Старт, ответственность и сборка — не слайды, а продукт и город.",
    profiles: []
  },
  {
    id: "amb-abroad",
    slug: "abroad",
    title: "USA / China",
    subtitle:
      "Граница как школа и новый горизонт — для тех, кто учится дальше от привычной карты и возвращается с опытом, который меняет среду.",
    role: "Граница как школа · новый горизонт",
    slot: "Медиа-слот",
    city: "Астана · межгород",
    image: "/www/photos/team/22.jpg",
    coverBlurb: "Опыт за границей — как школа, с которой возвращаешься другим по масштабу.",
    profiles: []
  }
];

export function mergeAmbassadors(parsed: unknown): Ambassador[] {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return defaultAmbassadors.map((a) => ({ ...a }));
  }
  const rows = parsed
    .map((raw, i) => {
      const x = raw as Partial<Ambassador>;
      const d =
        defaultAmbassadors.find((de) => de.slug === (typeof x.slug === "string" ? x.slug : "")) ??
        defaultAmbassadors[i % defaultAmbassadors.length];
      const slugRaw =
        typeof x.slug === "string" && x.slug.trim()
          ? x.slug
          : typeof x.title === "string"
            ? x.title
            : d.slug;
      const slug = normalizeAmbassadorSlug(slugRaw);
      return {
        id: typeof x.id === "string" && x.id ? x.id : d.id,
        slug: slug || d.slug,
        title: typeof x.title === "string" && x.title.trim() ? x.title.trim() : d.title,
        subtitle: typeof x.subtitle === "string" ? x.subtitle : d.subtitle,
        role: typeof x.role === "string" ? x.role : d.role,
        slot: typeof x.slot === "string" ? x.slot : d.slot,
        image: typeof x.image === "string" && x.image ? x.image : d.image,
        city: typeof x.city === "string" ? x.city : d.city,
        coverBlurb: typeof x.coverBlurb === "string" ? x.coverBlurb : d.coverBlurb,
        profiles: normalizeAmbassadorProfiles((x as Partial<Ambassador>).profiles)
      };
    })
    .filter((a) => a.title.length > 0);
  return rows.length ? rows : defaultAmbassadors.map((a) => ({ ...a }));
}

export function getAmbassadorBySlug(list: Ambassador[], slug: string | null): Ambassador | null {
  if (!slug) return null;
  return list.find((a) => a.slug === slug) ?? null;
}

export function ensureUniqueAmbassadorSlug(list: Ambassador[], slug: string, excludeId?: string): string {
  let base = normalizeAmbassadorSlug(slug);
  if (!base) base = "club";
  let s = base;
  let n = 0;
  while (list.some((a) => a.slug === s && a.id !== excludeId)) {
    n += 1;
    s = `${base}-${n}`;
  }
  return s;
}

const defaultCityPrints: NonNullable<Product["cityPrints"]> = cityPrintsForProducts();

export const defaultProducts: Product[] = [
  {
    id: "almaty-classic",
    slug: "almaty-classic",
    title: "Almaty Classic",
    subtitle: "Тишина формы. Темп города.",
    price: 21990,
    colors: ["Тёмно-синий", "Чёрный",],
    sizes: ["S", "M", "L"],
    unavailableSizes: ["L"],
    position: "Верхняя одежда",
    image: "/www/photos/solo/01.jpg",
    imagesByColor: {
      "Тёмно-синий": ["/www/photos/solo/03.jpg", "/www/photos/solo/05.jpg", "/www/photos/solo/06.jpg"],
      "Чёрный": ["/www/photos/solo/01.jpg", "/www/photos/solo/02.jpg", "/www/photos/solo/04.jpg"]
    },
    customizable: true,
    skuCode: "04",
    colorSkus: {
      "Тёмно-синий": "041",
      "Чёрный": "042"
    },
    cityPrints: defaultCityPrints,
    description: "Оверсайз-пальто для межсезонья с чистым силуэтом и плотной посадкой по плечам.",
    specifications: "Силуэт: прямой. Подклад: вискоза. Детали: потайные пуговицы, внутренний карман.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Талия (см)", "Бёдра (см)"],
      rows: [
        ["S", "86-92", "66-72", "90-96"],
        ["M", "92-98", "72-78", "96-102"],
        ["L", "98-104", "78-84", "102-108"]
      ]
    },
    composition: "80% шерсть, 20% полиэстер. Сухая чистка.",
    videoSrc: "/www/videos/story.mov"
  },
  {
    id: "steppe-crest",
    slug: "steppe-crest",
    title: "Steppe Crest",
    subtitle: "Мягкий слой для долгих дней и ясных целей.",
    price: 17990,
    colors: ["Темно-синий", "Черный", "Тёмно-зелёный"],
    sizes: ["S", "M", "L", "XL"],
    position: "Трикотаж",
    image: "/www/photos/solo/03.jpg",
    imagesByColor: {
      "Темно-синий": ["/www/photos/solo/03.jpg", "/www/photos/solo/07.jpg", "/www/photos/solo/08.jpg"],
      "Черный": ["/www/photos/solo/03.jpg", "/www/photos/solo/07.jpg", "/www/photos/solo/08.jpg"],
      "Тёмно-зелёный": ["/www/photos/solo/09.jpg", "/www/photos/solo/10.jpg", "/www/photos/solo/11.jpg"]
    },
    customizable: true,
    skuCode: "05",
    colorSkus: {
      "Темно-синий": "051",
      "Черный": "052",
      "Тёмно-зелёный": "053"
    },
    cityPrints: defaultCityPrints,
    description: "Плотный свитшот из смесовой пряжи для базовых и многослойных образов.",
    specifications: "Ворот: круглый. Манжеты: эластичные. Посадка: regular.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Длина (см)", "Рукав (см)"],
      rows: [
        ["S", "88-94", "65", "61"],
        ["M", "94-100", "67", "63"],
        ["L", "100-106", "69", "65"],
        ["XL", "106-112", "71", "67"]
      ]
    },
    composition: "Премиум-хлопок и кашемировый микс. Стирка 30°C.",
    videoSrc: "/www/videos/hero.mov"
  },
  {
    id: "school-unity",
    slug: "school-unity",
    title: "School Unity",
    subtitle: "Единый ритм поколения — без шума, только присутствие.",
    price: 18990,
    colors: ["Темно-синий", "Чёрный", "Темно-зеленый"],
    sizes: ["M", "L", "XL"],
    position: "Худи",
    image: "/www/photos/team/01.jpg",
    imagesByColor: {
      "Темно-синий": ["/www/photos/team/01.jpg", "/www/photos/team/02.jpg", "/www/photos/team/03.jpg"],
      "Чёрный": ["/www/photos/team/04.jpg", "/www/photos/team/05.jpg", "/www/photos/team/06.jpg"],
      "Темно-зеленый": ["/www/photos/team/04.jpg", "/www/photos/team/05.jpg", "/www/photos/team/06.jpg"]
    },
    backImageByColor: {
      "Темно-синий": "/www/photos/team/03.jpg",
      "Черный": "/www/photos/team/03.jpg",
      "Темно-зеленый": "/www/photos/team/06.jpg"
    },
    customizable: true,
    skuCode: "06",
    colorSkus: {
      "Темно-синий": "061",
      "Чёрный": "062",
      "Темно-зеленый": "063"
    },
    cityPrints: defaultCityPrints,
    description: "Худи свободного кроя с мягкой изнанкой для ежедневного ритма кампуса и города.",
    specifications: "Капюшон: двойной. Карман: кенгуру. Низ: эластичная резинка.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Длина (см)"],
      rows: [
        ["M", "96-102", "68"],
        ["L", "102-108", "70"],
        ["XL", "108-114", "72"]
      ]
    },
    composition: "Хлопок френч терри. Стирка 30°C, без отбеливателя."
  },
  {
    id: "scholar-core",
    slug: "scholar-core",
    title: "Scholar Core",
    subtitle: "База под всё: олимпиады, проекты, старт.",
    price: 10990,
    colors: ["Белый"],
    sizes: ["S", "M", "L", "XL"],
    position: "Футболки",
    image: "/www/photos/team/12.jpg",
    imagesByColor: {
      "Белый": ["/www/photos/team/12.jpg", "/www/photos/team/13.jpg", "/www/photos/team/14.jpg"]
    },
    customizable: true,
    skuCode: "03",
    cityPrints: defaultCityPrints,
    description: "Плотная футболка с формоустойчивым воротом и прямым силуэтом.",
    specifications: "Плотность: 220 gsm. Посадка: regular. Швы: усиленные.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Длина (см)"],
      rows: [
        ["S", "84-90", "64"],
        ["M", "90-96", "67"],
        ["L", "96-102", "70"],
        ["XL", "102-108", "73"]
      ]
    },
    composition: "Плотный органический хлопок 220 gsm."
  },
  {
    id: "astana-line",
    slug: "astana-line",
    title: "Astana Line",
    subtitle: "Чистые линии и гибкая многослойность.",
    price: 14990,
    colors: ["Белый", "Молочный"],
    sizes: ["S", "M", "L"],
    position: "Рубашки",
    image: "/www/photos/solo/12.jpg",
    imagesByColor: {
      "Белый": ["/www/photos/solo/12.jpg", "/www/photos/solo/13.jpg"],
      "Молочный": ["/www/photos/solo/14.jpg", "/www/photos/solo/15.jpg"]
    },
    customizable: true,
    skuCode: "01",
    cityPrints: defaultCityPrints,
    description: "Рубашка из мягкой смесовой ткани с чёткой линией плеч.",
    specifications: "Манжета: классическая. Силуэт: прямой.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Талия (см)"],
      rows: [
        ["S", "88-94", "70-76"],
        ["M", "94-100", "76-82"],
        ["L", "100-106", "82-88"]
      ]
    }
  },
  {
    id: "nomad-track",
    slug: "nomad-track",
    title: "Nomad Track",
    subtitle: "Лёгкий комплект для поездок и движения.",
    price: 51900,
    colors: ["Темно-синий", "Песочный"],
    sizes: ["M", "L", "XL"],
    unavailableSizes: ["XL"],
    position: "Брюки",
    image: "/www/photos/team/18.jpg",
    imagesByColor: {
      "Синий": ["/www/photos/team/18.jpg", "/www/photos/team/19.jpg"],
      "Песочный": ["/www/photos/team/20.jpg", "/www/photos/team/21.jpg"]
    },
    customizable: true,
    cityPrints: defaultCityPrints,
    description: "Брюки с комфортной талией и заужением к низу.",
    specifications: "Посадка: средняя. Карманы: 4. Ткань: дышащая.",
    sizeChart: {
      headers: ["Размер", "Талия (см)", "Бёдра (см)", "Длина (см)"],
      rows: [
        ["M", "74-80", "94-100", "102"],
        ["L", "80-86", "100-106", "104"],
        ["XL", "86-92", "106-112", "106"]
      ]
    }
  },
  {
    id: "aurora-knit",
    slug: "aurora-knit",
    title: "Aurora Knit",
    subtitle: "Тёплый минимализм с мягкой фактурой.",
    price: 18990,
    colors: ["Темно-синий", "Черный", "Белый"],
    sizes: ["S", "M", "L", "XL"],
    position: "Трикотаж",
    image: "/www/photos/solo/16.jpg",
    imagesByColor: {
      "Темно-синий": ["/www/photos/solo/16.jpg", "/www/photos/solo/17.jpg"],
      "Черный": ["/www/photos/solo/18.jpg", "/www/photos/solo/01.jpg"],
      "Белый": ["/www/photos/solo/18.jpg", "/www/photos/solo/01.jpg"]
    },
    customizable: true,
    skuCode: "07",
    colorSkus: {
      "Темно-синий": "071",
      "Черный": "072",
      "Белый": "073",
    },
    cityPrints: defaultCityPrints,
    description: "Трикотажный джемпер для прохладных дней и многослойных образов.",
    specifications: "Пряжа: смесовая. Горловина: эластичная.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Длина (см)", "Рукав (см)"],
      rows: [
        ["S", "86-92", "63", "60"],
        ["M", "92-98", "66", "62"],
        ["L", "98-104", "69", "64"],
        ["XL", "104-110", "72", "66"]
      ]
    }
  },
  {
    id: "city-shell",
    slug: "city-shell",
    title: "City Shell",
    subtitle: "Ветровка для переменчивой погоды мегаполиса.",
    price: 17990,
    colors: ["Темно-синий"],
    sizes: ["S", "M", "L"],
    position: "Верхняя одежда",
    image: "/www/photos/team/22.jpg",
    imagesByColor: {
      "Темно-синий": ["/www/photos/team/22.jpg", "/www/photos/team/11.jpg"]
    },
    customizable: true,
    skuCode: "08",
    cityPrints: defaultCityPrints,
    description: "Лёгкая ветровка с защитой от ветра и аккуратной матовой фактурой.",
    specifications: "Молния: двусторонняя. Карманы: на молнии.",
    sizeChart: {
      headers: ["Размер", "Грудь (см)", "Талия (см)", "Длина (см)"],
      rows: [
        ["S", "88-94", "70-76", "66"],
        ["M", "94-100", "76-82", "69"],
        ["L", "100-106", "82-88", "72"]
      ]
    }
  }
];

export function formatCurrency(amount: number) {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} ₸`;
}

export function createTracking(status: DemoOrder["status"]): TrackingStep[] {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  if (status === "cancelled") {
    return [
      { label: "Заказ отменён", done: true, date: iso },
      { label: "Собран", done: false, date: "—" },
      { label: "В пути", done: false, date: "—" },
      { label: "Доставлен", done: false, date: "—" }
    ];
  }
  return [
    { label: "Заказ принят", done: true, date: iso },
    { label: "Собран", done: status !== "processing", date: status !== "processing" ? iso : "—" },
    {
      label: "В пути",
      done: status === "shipped" || status === "delivered",
      date: status !== "processing" ? iso : "—"
    },
    { label: "Доставлен", done: status === "delivered", date: status === "delivered" ? iso : "—" }
  ];
}

function isOrderLineItem(item: unknown): item is OrderLineItem {
  if (!item || typeof item !== "object") return false;
  const o = item as OrderLineItem;
  return (
    typeof o.productId === "string" &&
    typeof o.sku === "string" &&
    typeof o.selectedCityId === "string" &&
    typeof o.quantity === "number"
  );
}

function legacyProductToLineItem(p: Product): OrderLineItem {
  const cityId =
    (Array.isArray(p.cityPrints) && p.cityPrints.length > 0 && p.cityPrints[0]?.city) ??
    (Array.isArray(defaultCityPrints) && defaultCityPrints[0]?.city) ??
    "astana";
  const color = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors[0] : "—";
  const size = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : "—";
  return {
    productId: p.id,
    productName: p.title,
    sku: computeLineSku(p, color, size, cityId),
    color,
    size,
    selectedCityId: cityId,
    quantity: 1,
    image: p.image,
    unitPrice: p.price
  };
}

export function normalizeDemoOrder(raw: LegacyDemoOrder | DemoOrder): DemoOrder {
  const base = raw as DemoOrder;
  const firstItem = base.items[0];
  let items: OrderLineItem[];
  if (firstItem && isOrderLineItem(firstItem)) {
    items = base.items as OrderLineItem[];
  } else {
    items = (base.items as unknown as Product[]).map(legacyProductToLineItem);
  }
  const total =
    typeof base.total === "number" && base.total > 0
      ? base.total
      : items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const shippingAddress: ShippingAddress =
    base.shippingAddress ?? {
      region: "",
      city: "",
      street: "",
      house: "",
      apartment: "",
      postalCode: ""
    };

  const status = base.status ?? "processing";
  const allowed: OrderFulfillmentStatus[] = ["processing", "shipped", "delivered", "cancelled"];
  const safeStatus = allowed.includes(status as OrderFulfillmentStatus)
    ? (status as OrderFulfillmentStatus)
    : "processing";

  return {
    id: base.id,
    accountId: base.accountId ?? "legacy",
    customerFullName: base.customerFullName ?? "",
    phone: base.phone ?? "",
    shippingAddress,
    nisSchool: base.nisSchool,
    customerSource: base.customerSource,
    items,
    total,
    createdAt: base.createdAt,
    status: safeStatus,
    paymentStatus: base.paymentStatus ?? "pending",
    tracking: Array.isArray(base.tracking) ? base.tracking : createTracking(safeStatus),
    cancelReason: base.cancelReason,
    closedDate: base.closedDate,
    stockProcessed: base.stockProcessed === true
  };
}

export function emptyShippingAddress(): ShippingAddress {
  return { region: "", city: "", street: "", house: "", apartment: "", postalCode: "" };
}

/** Demo seed order after normalization */
export function createSeedDemoOrder(): DemoOrder {
  const p0 = defaultProducts[0];
  const p2 = defaultProducts[2];
  const line0 = legacyProductToLineItem(p0);
  const line2 = legacyProductToLineItem(p2);
  const raw: DemoOrder = {
    id: "JQ-20931",
    accountId: "acc-admin-demo",
    customerFullName: "Jarqyn Admin",
    phone: "+7 700 000 00 00",
    shippingAddress: {
      region: "Абай облысы",
      city: "Семей",
      street: "пр. Независимости",
      house: "1",
      apartment: "",
      postalCode: "070000"
    },
    items: [line0, line2],
    total: p0.price + p2.price,
    createdAt: new Date().toISOString(),
    status: "shipped",
    paymentStatus: "paid",
    tracking: createTracking("shipped"),
    stockProcessed: false
  };
  return normalizeDemoOrder(raw);
}
