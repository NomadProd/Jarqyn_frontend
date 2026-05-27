"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CheckoutProcess } from "@/components/checkout-process";
import { CitySelector } from "@/components/city-selector";
import { useDemoStore } from "@/components/demo-provider";
import { cartApi, productVariantsApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/demo-store";
import { computeLineSku } from "@/lib/order-utils";
import { getVariantStockQuantity } from "@/lib/variant-stock";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const {
    products,
    favorites,
    toggleFavorite,
    addToCart,
    syncCartLineWithBackend,
    selectedCityId,
    setSelectedCityId
  } = useDemoStore();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<"description" | "specifications" | "size-chart" | null>("description");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  const printLoadFailed = false;

  const product = useMemo(
    () => products.find((item) => item.id === slug || item.slug === slug),
    [products, slug]
  );
  const related = useMemo(() => products.filter((item) => item.id !== product?.id).slice(0, 3), [products, product?.id]);
  const colorOptions = product?.colors.length ? product.colors : ["Базовый"];
  const initialColor = colorOptions[0] ?? "";
  const imagesForColor = product ? product.imagesByColor?.[selectedColor] ?? [product.image] : [];
  const fallbackBackImage = imagesForColor.length > 1 ? imagesForColor[imagesForColor.length - 1] : undefined;
  const backImage = product?.backImageByColor?.[selectedColor] ?? fallbackBackImage;
  const galleryImages = backImage && !imagesForColor.includes(backImage) ? [...imagesForColor, backImage] : imagesForColor;
  const isSchoolUnityProduct = product?.id === "school-unity" || product?.title === "School Unity";

  useEffect(() => {
    if (!product) return;
    setSelectedColor(initialColor);
    setSelectedImage((product.imagesByColor?.[initialColor] ?? [product.image])[0] ?? product.image);
  }, [product, initialColor]);

  useEffect(() => {
    if (!product || !galleryImages.length) return;
    if (!galleryImages.includes(selectedImage)) {
      setSelectedImage(galleryImages[0] ?? product.image);
    }
  }, [galleryImages, product, selectedImage]);

  if (!product) {
    return (
      <>
        <SiteHeader variant="solid" />
        <main className="min-h-screen bg-ink px-6 pb-24 pt-32 text-fog">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-mist">Позиция не найдена</p>
          <Link href="/shop" className="focus-ring mt-6 inline-block text-[11px] uppercase tracking-[0.22em] text-brass">
            ← Коллекция
          </Link>
        </main>
      </>
    );
  }

  const isFavorite = favorites.includes(product.id);

  const commitLine = async (): Promise<boolean> => {
    if (!size || !product) return false;

    const computedSku = computeLineSku(product, selectedColor || initialColor, size, selectedCityId);
    const variantResponse = await productVariantsApi.getBySku(computedSku);
    if (!variantResponse.ok || !variantResponse.data?.id) {
      console.error("Unable to resolve variant for SKU", computedSku, variantResponse.error);
      setStockMessage("Не удалось проверить наличие товара.");
      return false;
    }

    const variantId = variantResponse.data.id;
    const stockProbe = await getVariantStockQuantity(variantId);
    if (!stockProbe.ok) {
      console.error("Unable to load variant stock", stockProbe.message);
      setStockMessage("Не удалось проверить наличие товара.");
      return false;
    }
    if (stockProbe.stockQuantity <= 0) {
      setStockMessage("Товар отсутствует на складе.");
      return false;
    }

    const line = {
      productId: product.id,
      productName: product.title,
      color: selectedColor || initialColor,
      size,
      selectedCityId,
      quantity: 1,
      image: selectedImage || product.image,
      unitPrice: product.price,
      sku: computedSku,
      variantId
    };

    setStockMessage("");
    addToCart(line);

    try {
      const cartResponse = await cartApi.addItems([
        {
          variant_id: variantId,
          quantity: line.quantity
        }
      ]);

      if (cartResponse.ok && cartResponse.data?.items) {
        const savedItem = cartResponse.data.items.find((item: any) => item.variant_id === variantId);
        if (savedItem) {
          syncCartLineWithBackend(computedSku, variantId, savedItem.id, savedItem.quantity);
        }
      }
    } catch (error) {
      console.error("Failed to save item to backend cart", error);
    }
    return true;
  };

  const handleGoCart = async () => {
    const ok = await commitLine();
    if (ok) router.push("/shop/cart");
  };

  const handleCheckout = async () => {
    const ok = await commitLine();
    if (ok) router.push("/shop/order");
  };

  return (
    <>
      <SiteHeader variant="solid" />

      <main className="bg-ink text-fog">
        <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-2 lg:gap-x-4">
          <div className="relative min-h-[55vh] bg-graphite lg:min-h-[calc(100dvh-4.25rem)] lg:sticky lg:top-[4.25rem] lg:h-[calc(100dvh-4.25rem)]">
            <motion.div
              initial={reduceMotion ? false : { scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage || product.image}
                alt={`${product.title}, ${selectedColor || initialColor || "базовый цвет"}`}
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent lg:bg-gradient-to-r" aria-hidden />
          </div>

          <div className="flex flex-col px-6 pb-16 pt-12 sm:px-10 lg:max-w-xl lg:justify-center lg:py-20 xl:px-14">
            <Link
              href="/shop"
              className="focus-ring inline-flex w-fit text-[10px] uppercase tracking-[0.32em] text-mist transition-colors hover:text-fog"
            >
              Коллекция
            </Link>

            <div className="mt-8 flex items-start justify-between gap-6">
              <div>
                <h1 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">{product.title}</h1>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className="focus-ring shrink-0 border border-white/[0.12] p-3 transition-colors hover:border-fog/40"
                aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-brass text-brass" : "text-fog/70"}`} />
              </button>
            </div>

            <p className="mt-10 font-display text-[11px] uppercase tracking-[0.28em] text-brass">{formatCurrency(product.price)}</p>

            <div className="mt-10">
              <p className="font-display text-[10px] uppercase tracking-[0.32em] text-mist">Цвет</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const active = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setStockMessage("");
                      const nextImages = product.imagesByColor?.[color] ?? [product.image];
                      setSelectedImage(nextImages[0] ?? product.image);
                      }}
                      className={`focus-ring border px-4 py-2.5 font-display text-[11px] uppercase tracking-[0.18em] transition-colors ${
                        active ? "border-fog bg-fog text-ink" : "border-white/[0.14] text-fog hover:border-fog/40"
                      }`}
                      aria-pressed={active}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {galleryImages.map((src) => {
                const active = src === selectedImage;
                const isBack = Boolean(backImage && src === backImage);
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSelectedImage(src)}
                    className={`focus-ring relative aspect-[3/4] overflow-hidden border transition-colors ${
                      active ? "border-fog" : "border-white/[0.14] hover:border-fog/40"
                    }`}
                    aria-label={`Показать фото ${product.title}`}
                    aria-pressed={active}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    {isBack ? (
                      <span className="absolute bottom-1 left-1 border border-white/25 bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-fog">
                        Спина
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-10">
              <p className="font-display text-[10px] uppercase tracking-[0.32em] text-mist">Размер</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((item) => {
                  const active = size === item;
                  const disabled = product.unavailableSizes?.includes(item) ?? false;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSize(item);
                        setStockMessage("");
                      }}
                      disabled={disabled}
                      className={`focus-ring min-w-[3rem] border px-4 py-2.5 font-display text-[11px] uppercase tracking-[0.18em] transition-colors ${
                        disabled
                          ? "cursor-not-allowed border-white/[0.08] text-mist/50"
                          : active
                            ? "border-fog bg-fog text-ink"
                            : "border-white/[0.14] text-fog hover:border-fog/40"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {isSchoolUnityProduct ? (
              <div className="mt-10 border border-white/[0.08] bg-graphite/25 p-4 sm:p-5">
                <p className="font-display text-[10px] uppercase tracking-[0.32em] text-mist">Город принта</p>
                <p className="mt-2 text-xs text-mist">
                  Выбор сохраняется в позиции при добавлении в корзину; в корзине и при оформлении город только отображается.
                </p>
                <div className="mt-4">
                  <CitySelector
                    value={selectedCityId}
                    onChange={(id) => {
                      setSelectedCityId(id);
                      setStockMessage("");
                    }}
                  />
                </div>
                {printLoadFailed ? (
                  <p className="mt-4 text-sm text-mist">Не удалось загрузить превью принта — попробуйте другой город.</p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              <section>
                <button
                  type="button"
                  className="focus-ring flex w-full items-center justify-between py-4 text-left font-display text-[10px] uppercase tracking-[0.22em]"
                  aria-expanded={openSection === "description"}
                  onClick={() => setOpenSection((prev) => (prev === "description" ? null : "description"))}
                >
                  <span>О товаре: описание товара</span>
                  <span>{openSection === "description" ? "−" : "+"}</span>
                </button>
                {openSection === "description" ? (
                  <p className="pb-4 text-sm leading-relaxed text-mist">{product.description ?? product.subtitle}</p>
                ) : null}
              </section>
              <section>
                <button
                  type="button"
                  className="focus-ring flex w-full items-center justify-between py-4 text-left font-display text-[10px] uppercase tracking-[0.22em]"
                  aria-expanded={openSection === "specifications"}
                  onClick={() => setOpenSection((prev) => (prev === "specifications" ? null : "specifications"))}
                >
                  <span>О товаре: характеристики</span>
                  <span>{openSection === "specifications" ? "−" : "+"}</span>
                </button>
                {openSection === "specifications" ? (
                  <p className="pb-4 text-sm leading-relaxed text-mist">{product.specifications ?? product.composition ?? "—"}</p>
                ) : null}
              </section>
              <section>
                <button
                  type="button"
                  className="focus-ring flex w-full items-center justify-between py-4 text-left font-display text-[10px] uppercase tracking-[0.22em]"
                  aria-expanded={openSection === "size-chart"}
                  onClick={() => setOpenSection((prev) => (prev === "size-chart" ? null : "size-chart"))}
                >
                  <span>Размерная сетка</span>
                  <span>{openSection === "size-chart" ? "−" : "+"}</span>
                </button>
                {openSection === "size-chart" ? (
                  <div className="pb-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left text-xs text-mist sm:text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.08]">
                            {(product.sizeChart?.headers ?? ["Размер"]).map((header) => (
                              <th key={header} className="whitespace-nowrap px-2 py-2 font-display text-[10px] uppercase tracking-[0.16em] text-fog">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(product.sizeChart?.rows ?? product.sizes.map((s) => [s])).map((row, idx) => (
                            <tr key={`${row[0]}-${idx}`} className="border-b border-white/[0.06] last:border-b-0">
                              {row.map((cell, cellIdx) => (
                                <td key={`${cell}-${cellIdx}`} className="whitespace-nowrap px-2 py-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </section>
            </div>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {stockMessage ? <p className="text-sm text-mist">{stockMessage}</p> : null}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!size || Boolean(stockMessage)}
                className="focus-ring inline-flex justify-center border border-fog bg-fog px-10 py-4 font-display text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-transparent hover:text-fog disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-mist"
              >
                Оформить заказ
              </button>
              <button
                type="button"
                onClick={handleGoCart}
                disabled={!size || Boolean(stockMessage)}
                className="focus-ring inline-flex justify-center border border-white/[0.18] px-10 py-4 font-display text-[11px] uppercase tracking-[0.26em] text-fog transition-colors hover:border-fog disabled:cursor-not-allowed disabled:border-white/10 disabled:text-mist"
              >
                В корзину
              </button>
              {!size ? (
                <span className="text-[11px] uppercase tracking-[0.14em] text-mist">Выберите размер</span>
              ) : null}
            </div>

            <div className="mt-14 flex items-center gap-4 border-t border-white/[0.06] pt-10">
              <span className="relative h-11 w-11 overflow-hidden rounded-sm border border-white/10">
                <Image src="/jarqyn-logo.png" alt="" fill className="object-cover p-1.5" sizes="44px" />
              </span>
              <p className="text-sm leading-relaxed text-mist">
                Добавьте позицию в корзину или сразу перейдите к оформлению — город принта и конфигурация сохраняются.
              </p>
            </div>
          </div>
        </div>

        <CheckoutProcess className="border-t border-white/[0.06]" />

        {related.length > 0 ? (
          <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-12">
            <p className="font-display text-[10px] uppercase tracking-[0.38em] text-mist">Дальше</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/shop/${item.id}`} className="group focus-ring block overflow-hidden bg-slate">
                  <div className="relative aspect-[3/4] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p className="sr-only">{item.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
