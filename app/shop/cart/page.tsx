"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { useDemoStore } from "@/components/demo-provider";
import { cityLabelFromId } from "@/lib/city-catalog";
import { cartApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/demo-store";

export default function CartPage() {
  const { cart, removeCartLine, setCartLineQuantity, clearCart } = useDemoStore();

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const handleQuantityChange = async (lineId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    const line = cart.find((item) => item.lineId === lineId);
    setCartLineQuantity(lineId, quantity);
    if (line?.backendItemId) {
      try {
        await cartApi.updateItem(line.backendItemId, quantity);
      } catch (error) {
        console.error("Failed to update cart item quantity", error);
      }
    }
  };

  const handleRemoveLine = async (lineId: string) => {
    const line = cart.find((item) => item.lineId === lineId);
    removeCartLine(lineId);
    if (line?.backendItemId) {
      try {
        await cartApi.deleteItem(line.backendItemId);
      } catch (error) {
        console.error("Failed to delete cart item", error);
      }
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await cartApi.clearCart();
      if (!response.ok) {
        console.error("Failed to clear cart", response.error || response.message);
      }
    } catch (error) {
      console.error("Failed to clear cart", error);
    } finally {
      clearCart();
    }
  };

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="min-h-screen bg-ink px-6 pb-24 pt-[6.5rem] text-fog sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-[10px] uppercase tracking-[0.38em] text-brass">Корзина</p>
          <h1 className="mt-4 font-display text-3xl uppercase tracking-tight">Ваш заказ</h1>
          <p className="mt-3 text-sm text-mist">
            Город принта задаётся на странице товара и фиксируется в каждой позиции; здесь только просмотр и количество.
          </p>

          {cart.length === 0 ? (
            <div className="mt-12 border border-white/[0.08] bg-ink/60 p-10 text-center">
              <p className="text-sm text-mist">Корзина пуста.</p>
              <Link
                href="/shop"
                className="focus-ring mt-6 inline-block font-display text-[10px] uppercase tracking-[0.24em] text-brass"
              >
                ← В коллекцию
              </Link>
            </div>
          ) : (
            <ul className="mt-10 space-y-4">
              {cart.map((line) => (
                <li key={line.lineId} className="flex flex-col gap-4 border border-white/[0.08] bg-ink/70 p-5 sm:flex-row sm:items-start">
                  <div className="relative h-36 w-full shrink-0 overflow-hidden border border-white/[0.08] sm:h-32 sm:w-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm uppercase tracking-[0.14em]">{line.productName}</p>
                    <p className="mt-2 text-xs text-mist">
                      {line.color} · {line.size} · город: {cityLabelFromId(line.selectedCityId)}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist">SKU {line.sku}</p>
                    <p className="mt-3 font-display text-[11px] uppercase tracking-[0.14em] text-brass">
                      {formatCurrency(line.unitPrice)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-mist">
                        Кол-во
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(line.lineId, Number(e.target.value) || 1)}
                          className="w-16 border border-white/[0.14] bg-ink px-2 py-1 text-xs text-fog"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.lineId)}
                        className="focus-ring text-[10px] uppercase tracking-[0.18em] text-mist underline-offset-4 hover:text-brass"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {cart.length > 0 ? (
            <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.28em] text-mist">Итого</p>
                <p className="mt-2 font-display text-xl uppercase tracking-tight text-brass">{formatCurrency(total)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="focus-ring border border-white/[0.18] px-6 py-3 font-display text-[10px] uppercase tracking-[0.22em] text-mist hover:border-fog hover:text-fog"
                >
                  Очистить
                </button>
                <Link
                  href="/shop/order"
                  className="focus-ring inline-flex justify-center border border-fog bg-fog px-10 py-3 font-display text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-transparent hover:text-fog"
                >
                  Оформить заказ
                </Link>
              </div>
            </div>
          ) : null}

          <Link href="/shop" className="focus-ring mt-12 inline-block text-[10px] uppercase tracking-[0.24em] text-mist hover:text-fog">
            ← В коллекцию
          </Link>
        </div>
      </main>
    </>
  );
}
