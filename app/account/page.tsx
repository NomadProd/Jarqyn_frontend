"use client";

import { DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, LogOut, Truck, Wallet } from "lucide-react";
import { AdminAmbassadorsEditor } from "@/components/admin-ambassadors-editor";
import { AdminInformationEditor } from "@/components/admin-information-editor";
import { AdminInventoryPanel } from "@/components/admin-inventory-panel";
import { AdminSiteCopyEditor } from "@/components/admin-site-copy-editor";
import { SiteHeader } from "@/components/site-header";
import { CheckoutProcess } from "@/components/checkout-process";
import { useDemoStore } from "@/components/demo-provider";
import { compressImageToDataUrl } from "@/lib/client-image";
import { cityLabelFromId } from "@/lib/city-catalog";
import { authApi, tokenManager, cartApi, productVariantsApi, productsApi, type UserResponse } from "@/lib/api-client";
import type { DemoOrder, OrderFulfillmentStatus } from "@/lib/demo-store";
import { formatCurrency, Product } from "@/lib/demo-store";

async function loadBackendCartAfterLogin(
  syncCartLineWithBackend: (sku: string, variantId: number, backendItemId: number, quantity: number) => void,
  addToCart: (line: any) => void,
  selectedCityId: string
) {
  try {
    const cartRes = await cartApi.getCurrentCart();
    if (!cartRes.ok || !cartRes.data) {
      console.log("No backend cart found or error fetching cart");
      return;
    }

    const backendCart = cartRes.data;
    if (!backendCart.items || backendCart.items.length === 0) {
      console.log("Backend cart is empty");
      return;
    }

    // For each cart item, fetch variant and product details
    for (const item of backendCart.items) {
      try {
        const variantRes = await productVariantsApi.getById(item.variant_id);
        if (!variantRes.ok || !variantRes.data) {
          console.error(`Failed to fetch variant ${item.variant_id}`);
          continue;
        }

        const variant = variantRes.data;
        const productRes = await productsApi.getById(variant.product_id);
        if (!productRes.ok || !productRes.data) {
          console.error(`Failed to fetch product ${variant.product_id}`);
          continue;
        }

        const product = productRes.data;
        
        // Create CartLineItem from backend data
        addToCart({
          productId: variant.product_id,
          productName: product.name,
          color: variant.color,
          size: variant.size,
          selectedCityId: selectedCityId,
          quantity: item.quantity,
          image: "/www/photos/solo/01.jpg", // Default image, could be enhanced with product images
          unitPrice: variant.price || product.base_price,
          sku: variant.sku,
          variantId: item.variant_id,
          backendItemId: item.id
        });
      } catch (error) {
        console.error(`Failed to load backend cart item ${item.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to load backend cart after login:", error);
  }
}

function AdminOrderControls({
  orderId,
  status,
  cancelReason,
  closedDate,
  onSave,
  onDelete
}: {
  orderId: string;
  status: OrderFulfillmentStatus;
  cancelReason?: string;
  closedDate?: string;
  onSave: (
    orderId: string,
    patch: Partial<Pick<DemoOrder, "status" | "cancelReason" | "closedDate">>
  ) => void;
  onDelete?: (orderId: string) => void;
}) {
  const statuses: OrderFulfillmentStatus[] = ["processing", "shipped", "delivered", "cancelled"];
  const [st, setSt] = useState(status);
  const [reason, setReason] = useState(cancelReason ?? "");
  const [closed, setClosed] = useState(closedDate ?? "");

  useEffect(() => {
    setSt(status);
    setReason(cancelReason ?? "");
    setClosed(closedDate ?? "");
  }, [status, cancelReason, closedDate, orderId]);

  return (
    <div className="mt-4 border border-brass/25 bg-black/20 p-4">
      <p className="font-display text-[10px] uppercase tracking-[0.28em] text-brass">Админ: заказ</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          Статус
          <select
            value={st}
            onChange={(e) => setSt(e.target.value as OrderFulfillmentStatus)}
            className="mt-2 w-full border border-white/[0.14] bg-ink px-3 py-2 text-xs text-fog"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] uppercase tracking-[0.22em] text-mist">
          Дата закрытия
          <input
            value={closed}
            onChange={(e) => setClosed(e.target.value)}
            placeholder="YYYY-MM-DD"
            className="mt-2 w-full border border-white/[0.14] bg-ink px-3 py-2 text-xs text-fog"
          />
        </label>
        <label className="sm:col-span-2 block text-[10px] uppercase tracking-[0.22em] text-mist">
          Причина отмены
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 w-full border border-white/[0.14] bg-ink px-3 py-2 text-xs text-fog"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() =>
          onSave(orderId, {
            status: st,
            cancelReason: reason.trim() || undefined,
            closedDate: closed.trim() || undefined
          })
        }
        className="focus-ring mt-4 border border-white/[0.2] px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] hover:border-fog"
      >
        Применить к заказу
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.confirm(`Удалить заказ ${orderId}? Остатки будут возвращены, если склад уже был списан.`)) {
              onDelete(orderId);
            }
          }}
          className="focus-ring mt-3 ml-4 border border-red-400/35 px-4 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-red-200 hover:border-red-300"
        >
          Удалить заказ
        </button>
      ) : null}
    </div>
  );
}

export default function AccountPage() {
  const {
    favorites,
    orders,
    products,
    markOrderPaid,
    updateOrderAdminFields,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    clearCart,
    addToCart,
    syncCartLineWithBackend,
    selectedCityId
  } = useDemoStore();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPanel, setAdminPanel] = useState<"orders" | "inventory" | "products" | "ambassadors" | "site">("orders");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePhoneMessage, setProfilePhoneMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    title: "",
    subtitle: "",
    position: "",
    price: "",
    colors: "",
    sizes: "",
    image: "",
    composition: "",
    videoSrc: ""
  });
  const [editorById, setEditorById] = useState<Record<string, Omit<Product, "id">>>({});

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken();
      if (token) {
        const response = await authApi.getCurrentUser();
        if (response.ok && response.data) {
          setUser(response.data);
          setIsAdmin(response.data.role === "admin");
          setProfilePhone(response.data.phone || "");
        } else {
          // Token invalid, clear it
          tokenManager.clearToken();
          setUser(null);
          setIsAdmin(false);
        }
      }
    };
    checkAuth();
  }, []);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favorites.includes(product.id)),
    [favorites, products]
  );

  const personalOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter((order) => order.accountId === String(user.id));
  }, [orders, user]);

  const adminOrders = useMemo(() => {
    if (!isAdmin) return [];
    return orders;
  }, [orders, isAdmin]);

  useEffect(() => {
    setEditorById((prev) => {
      const next = { ...prev };
      for (const product of products) {
        if (!next[product.id]) {
          next[product.id] = {
            title: product.title,
            subtitle: product.subtitle,
            position: product.position,
            price: product.price,
            colors: product.colors,
            sizes: product.sizes,
            image: product.image,
            composition: product.composition,
            videoSrc: product.videoSrc
          };
        }
      }
      return next;
    });
  }, [products]);

  const handleSavePhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = profilePhone.trim();
    if (!trimmed) {
      setProfilePhoneMessage("Укажите номер телефона.");
      return;
    }
    // TODO: Save phone to backend
    setProfilePhoneMessage("Телефон сохранён в профиле.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let response;
      if (mode === "signin") {
        response = await authApi.login({ email, password });
      } else {
        response = await authApi.register({
          email,
          password,
          name,
          surname: surname || "",
          phone: ""
        });
        // If registration succeeds, log in
        if (response.ok) {
          const loginResponse = await authApi.login({ email, password });
          response = loginResponse;
        }
      }

      if (response.ok && "access_token" in (response.data || {})) {
        const tokenData = response.data as { access_token: string; token_type: string; refresh_token?: string };
        tokenManager.setToken(tokenData.access_token, tokenData.token_type, tokenData.refresh_token);

        // Clear any stale demo cart state before loading authenticated session
        clearCart();

        // Get user data
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.ok && userResponse.data) {
          setUser(userResponse.data);
          setIsAdmin(userResponse.data.role === "admin");
          setMessage("Успешный вход!");
          setName("");
          setSurname("");
          setEmail("");
          setPassword("");
          
          // Load backend cart for authenticated user
          await loadBackendCartAfterLogin(syncCartLineWithBackend, addToCart, selectedCityId);
          
          router.push("/");
        }
      } else {
        setMessage(response.error || (mode === "signin" ? "Ошибка входа" : "Ошибка регистрации"));
      }
    } catch (error: any) {
      setMessage(error?.message || "Произошла ошибка при обработке запроса");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authApi.logout();
    clearCart();
    setUser(null);
    setIsAdmin(false);
    setMessage("");
    router.push("/");
  };

  const handleAddProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(newProduct.price);
    if (!newProduct.title.trim() || !newProduct.subtitle.trim() || !newProduct.position.trim() || Number.isNaN(price)) {
      setMessage("Заполните обязательные поля позиции.");
      return;
    }
    addProduct({
      title: newProduct.title.trim(),
      subtitle: newProduct.subtitle.trim(),
      position: newProduct.position.trim(),
      price,
      colors: newProduct.colors.split(",").map((v) => v.trim()).filter(Boolean),
      sizes: newProduct.sizes.split(",").map((v) => v.trim()).filter(Boolean),
      image: newProduct.image.trim() || "/www/photos/solo/01.jpg",
      composition: newProduct.composition.trim() || undefined,
      videoSrc: newProduct.videoSrc.trim() || undefined
    });
    setNewProduct({
      title: "",
      subtitle: "",
      position: "",
      price: "",
      colors: "",
      sizes: "",
      image: "",
      composition: "",
      videoSrc: ""
    });
    setMessage("Позиция добавлена.");
  };

  const handleDroppedImage = async (
    event: DragEvent<HTMLElement>,
    onDone: (dataUrl: string) => void
  ) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await compressImageToDataUrl(file);
    onDone(dataUrl);
  };

  const inputClass =
    "mt-2 w-full border border-white/[0.12] bg-ink px-4 py-2.5 text-sm text-fog outline-none transition-colors focus:border-brass";

  if (!user) {
    return (
      <>
        <SiteHeader variant="solid" />
        <main className="min-h-screen bg-ink px-6 pb-24 pt-[6.5rem] text-fog">
          <div className="mx-auto w-full max-w-md">
            <form onSubmit={handleSubmit} className="border border-white/[0.08] bg-graphite/40 p-8 sm:p-10">
              <p className="font-display text-[10px] uppercase tracking-[0.38em] text-brass">Аккаунт</p>
              <h1 className="mt-4 font-display text-2xl uppercase tracking-tight">
                {mode === "signin" ? "Вход" : "Регистрация"}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Избранное, заказы и трекинг — после входа. Платёжные шаги см. ниже на главной карточке товара или здесь, после входа.
              </p>

              <div className="mt-8 grid grid-cols-2 border border-white/[0.08] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setMessage("");
                  }}
                  className={`cursor-pointer px-3 py-2.5 font-display text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    mode === "signin" ? "bg-fog text-ink" : "text-mist hover:text-fog"
                  }`}
                  disabled={isLoading}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                  }}
                  className={`cursor-pointer px-3 py-2.5 font-display text-[10px] uppercase tracking-[0.2em] transition-colors ${
                    mode === "register" ? "bg-fog text-ink" : "text-mist hover:text-fog"
                  }`}
                  disabled={isLoading}
                >
                  Новый аккаунт
                </button>
              </div>

              {mode === "register" && (
                <>
                  <label className="mt-8 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">Имя</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                    placeholder="Аружан"
                    disabled={isLoading}
                  />
                  <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">Фамилия</label>
                  <input
                    value={surname}
                    onChange={(event) => setSurname(event.target.value)}
                    className={inputClass}
                    placeholder="Сагатова"
                    disabled={isLoading}
                  />
                </>
              )}

              <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                disabled={isLoading}
              />

              <label className="mt-6 block font-display text-[10px] uppercase tracking-[0.28em] text-mist">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                placeholder="••••••••"
                disabled={isLoading}
              />

              {message ? <p className="mt-5 text-sm text-mist">{message}</p> : null}

              <button
                type="submit"
                disabled={isLoading}
                className="focus-ring mt-8 w-full border border-fog bg-fog py-3.5 font-display text-[11px] uppercase tracking-[0.24em] text-ink transition-colors hover:bg-transparent hover:text-fog disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (mode === "signin" ? "Загрузка..." : "Создание...") : (mode === "signin" ? "Войти" : "Создать")}
              </button>
            </form>

            <div className="mt-12">
              <CheckoutProcess heading="Как проходит оплата и подтверждение" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="min-h-screen bg-ink px-6 pb-24 pt-[6.5rem] text-fog sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/[0.06] pb-10">
            <div className="max-w-lg">
              <p className="font-display text-[10px] uppercase tracking-[0.38em] text-brass">Кабинет</p>
              <h1 className="mt-3 font-display text-3xl uppercase tracking-tight">Привет, {user.name}</h1>
              <p className="mt-2 text-sm text-mist">{user.email}</p>
              <form onSubmit={handleSavePhone} className="mt-6 border border-white/[0.08] bg-graphite/20 p-5">
                <label className="block font-display text-[10px] uppercase tracking-[0.28em] text-mist">
                  Телефон
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => {
                      setProfilePhone(e.target.value);
                      setProfilePhoneMessage("");
                    }}
                    className={inputClass}
                    placeholder="+7 …"
                    autoComplete="tel"
                  />
                </label>
                <button
                  type="submit"
                  className="focus-ring mt-4 border border-white/[0.18] px-5 py-2 font-display text-[10px] uppercase tracking-[0.2em] hover:border-fog"
                >
                  Сохранить телефон
                </button>
                {profilePhoneMessage ? <p className="mt-3 text-xs text-mist">{profilePhoneMessage}</p> : null}
              </form>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="focus-ring border border-white/[0.14] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] transition-colors hover:border-fog hover:text-fog"
              >
                Коллекция
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="focus-ring inline-flex items-center gap-2 border border-white/[0.14] px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.22em] transition-colors hover:border-brass hover:text-brass"
              >
                <LogOut className="h-3.5 w-3.5" />
                Выйти
              </button>
            </div>
          </div>

          

          <section className="mb-12 border border-white/[0.08] bg-graphite/25 p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-brass">
              <Heart className="h-4 w-4" />
              <h2 className="font-display text-lg uppercase tracking-tight">Избранное</h2>
            </div>
            {favoriteProducts.length === 0 ? (
              <p className="text-sm text-mist">Пока пусто — отметьте позицию на странице товара.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.id}`}
                    className="focus-ring border border-white/[0.06] bg-ink/60 p-4 transition-colors hover:border-white/20"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-mist">{item.subtitle}</p>
                    <p className="mt-3 font-display text-[11px] uppercase tracking-[0.14em] text-brass">{formatCurrency(item.price)}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section id="orders" className="mb-12 scroll-mt-28 border border-white/[0.08] bg-graphite/25 p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-brass">
              <Wallet className="h-4 w-4" />
              <h2 className="font-display text-lg uppercase tracking-tight">Заказы и оплата</h2>
            </div>
            <div className="space-y-4">
              {personalOrders.map((order, orderIndex) => (
                <motion.article
                  key={order.id}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.45, delay: orderIndex * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="border border-white/[0.06] bg-ink/70 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-sm uppercase tracking-[0.14em]">{order.id}</p>
                    <p className="text-sm text-mist">
                      {order.items.length} поз. · {formatCurrency(order.total)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-mist">
                    {order.customerFullName ? `${order.customerFullName} · ` : null}
                    {order.phone || "—"} · {new Date(order.createdAt).toLocaleString("ru-RU")}
                  </p>
                  <p className="mt-1 font-display text-[10px] uppercase tracking-[0.22em] text-mist">
                    Статус: {order.status}
                    {order.cancelReason ? ` · причина: ${order.cancelReason}` : ""}
                    {order.closedDate ? ` · закрыт: ${order.closedDate}` : ""}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-mist">
                    {order.items.map((line, li) => (
                      <li key={`${order.id}-${li}-${line.sku}`} className="flex flex-wrap gap-x-3 gap-y-1">
                        <span className="text-fog">{line.productName}</span>
                        <span>
                          {line.color}, {line.size}, {cityLabelFromId(line.selectedCityId)}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em]">SKU {line.sku}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-display text-[10px] uppercase tracking-[0.22em] text-mist">
                    Оплата: {order.paymentStatus === "paid" ? "получена " : "ожидает оплату"}
                  </p>
                  
                </motion.article>
              ))}
            </div>
          </section>

          <section className="border border-white/[0.08] bg-graphite/25 p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-brass">
              <Truck className="h-4 w-4" />
              <h2 className="font-display text-lg uppercase tracking-tight">Трекинг</h2>
            </div>
            <div className="space-y-6">
              {personalOrders.map((order, orderIndex) => (
                <motion.article
                  key={`track-${order.id}`}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: orderIndex * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="border border-white/[0.06] bg-ink/70 p-5"
                >
                  <p className="mb-4 font-display text-sm uppercase tracking-[0.14em]">{order.id}</p>
                  <div className="space-y-2">
                    {order.tracking.map((step, stepIndex) => (
                      <motion.div
                        key={step.label}
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        transition={
                          reduceMotion ? { duration: 0 } : { duration: 0.35, delay: orderIndex * 0.06 + stepIndex * 0.05, ease: "easeOut" }
                        }
                        className="flex items-center justify-between text-sm"
                      >
                        <p className={step.done ? "text-brass" : "text-mist"}>{step.label}</p>
                        <p className="text-mist">{step.date}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {isAdmin && (
            <section className="mt-12 border border-brass/35 bg-mossdeep/40 p-7 sm:p-8">
              <div className="mb-6">
                <p className="font-display text-[10px] uppercase tracking-[0.32em] text-brass">Админ</p>
                <h2 className="mt-2 font-display text-xl uppercase tracking-tight">Админ-панель</h2>
                <p className="mt-2 text-sm text-mist">admin@jarqyn.kz / admin123 — каталог, склад, заказы, информационные страницы.</p>
              </div>

              <div className="mb-8 flex flex-wrap gap-3">
                {[
                  { id: "orders", label: "Заказы" },
                  { id: "inventory", label: "Склад" },
                  { id: "products", label: "Продукты" },
                  { id: "ambassadors", label: "Амбассадоры" },
                  { id: "site", label: "Сайт" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdminPanel(tab.id as typeof adminPanel)}
                    className={`focus-ring rounded-sm border px-4 py-2 text-sm uppercase tracking-[0.18em] transition-colors ${
                      adminPanel === tab.id
                        ? "border-brass bg-brass text-ink"
                        : "border-white/15 bg-transparent text-fog hover:border-fog hover:text-fog"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {adminPanel === "orders" ? (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="mb-5 flex items-center gap-2 text-brass">
                      <Wallet className="h-4 w-4" />
                      <h3 className="font-display text-lg uppercase tracking-tight">Заказы</h3>
                    </div>
                    <div className="space-y-4">
                      {adminOrders.map((order, orderIndex) => (
                        <motion.article
                          key={order.id}
                          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { duration: 0.45, delay: orderIndex * 0.06, ease: [0.22, 1, 0.36, 1] }
                          }
                          className="border border-white/[0.06] bg-ink/70 p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-display text-sm uppercase tracking-[0.14em]">{order.id}</p>
                            <p className="text-sm text-mist">
                              {order.items.length} поз. · {formatCurrency(order.total)}
                            </p>
                          </div>
                          <p className="mt-2 text-xs text-mist">
                            {order.customerFullName ? `${order.customerFullName} · ` : null}
                            {order.phone || "—"} · {new Date(order.createdAt).toLocaleString("ru-RU")}
                          </p>
                          <p className="mt-1 font-display text-[10px] uppercase tracking-[0.22em] text-mist">
                            Статус: {order.status}
                            {order.cancelReason ? ` · причина: ${order.cancelReason}` : ""}
                            {order.closedDate ? ` · закрыт: ${order.closedDate}` : ""}
                          </p>
                          <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-mist">
                            {order.items.map((line, li) => (
                              <li key={`${order.id}-${li}-${line.sku}`} className="flex flex-wrap gap-x-3 gap-y-1">
                                <span className="text-fog">{line.productName}</span>
                                <span>
                                  {line.color}, {line.size}, {cityLabelFromId(line.selectedCityId)}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.08em]">SKU {line.sku}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 font-display text-[10px] uppercase tracking-[0.22em] text-mist">
                            Оплата: {order.paymentStatus === "paid" ? "получена" : "ожидает оплату"}
                          </p>
                          {isAdmin && order.paymentStatus === "pending" && (
                            <button
                              type="button"
                              onClick={() => markOrderPaid(order.id)}
                              className="focus-ring mt-4 border border-fog bg-fog px-5 py-2 font-display text-[10px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-transparent hover:text-fog"
                            >
                              Отметить оплаченным
                            </button>
                          )}
                          {isAdmin ? (
                            <AdminOrderControls
                              orderId={order.id}
                              status={order.status}
                              cancelReason={order.cancelReason}
                              closedDate={order.closedDate}
                              onSave={updateOrderAdminFields}
                              onDelete={deleteOrder}
                            />
                          ) : null}
                        </motion.article>
                      ))}
                    </div>
                  </div>

                  <div className="border border-white/[0.08] bg-graphite/25 p-7 sm:p-8">
                    <div className="mb-5 flex items-center gap-2 text-brass">
                      <Truck className="h-4 w-4" />
                      <h3 className="font-display text-lg uppercase tracking-tight">Трекинг</h3>
                    </div>
                    <div className="space-y-6">
                      {adminOrders.map((order, orderIndex) => (
                        <motion.article
                          key={`track-${order.id}`}
                          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { duration: 0.5, delay: orderIndex * 0.07, ease: [0.22, 1, 0.36, 1] }
                          }
                          className="border border-white/[0.06] bg-ink/70 p-5"
                        >
                          <p className="mb-4 font-display text-sm uppercase tracking-[0.14em]">{order.id}</p>
                          <div className="space-y-2">
                            {order.tracking.map((step, stepIndex) => (
                              <motion.div
                                key={step.label}
                                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                transition={
                                  reduceMotion
                                    ? { duration: 0 }
                                    : { duration: 0.35, delay: orderIndex * 0.06 + stepIndex * 0.05, ease: "easeOut" }
                                }
                                className="flex items-center justify-between text-sm"
                              >
                                <p className={step.done ? "text-brass" : "text-mist"}>{step.label}</p>
                                <p className="text-mist">{step.date}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : adminPanel === "inventory" ? (
                <AdminInventoryPanel />
              ) : adminPanel === "ambassadors" ? (
                <div className="space-y-10">
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-tight text-fog">Амбассадоры</h3>
                    <p className="mt-2 text-sm text-mist">
                      Полный контроль: новые направления, тексты, slug в адресе, фото с диска или по ссылке.
                    </p>
                  </div>
                  <AdminAmbassadorsEditor showSectionHeading={false} />
                </div>
              ) : adminPanel === "site" ? (
                <div className="space-y-10">
                  <AdminInformationEditor />
                  <div className="mb-10">
                    <p className="mb-6 text-xs leading-relaxed text-mist">
                      Герой и манифест — ниже; на главной то же через «Править текст». Амбассадоров — отдельным блоком ниже:
                      сразу на главной, в /shop/ambassadors и на страницах направлений.
                    </p>
                    <p className="mb-4 font-display text-[10px] uppercase tracking-[0.28em] text-brass">Герой и манифест</p>
                    <AdminSiteCopyEditor mode="embedded" />
                  </div>
                </div>
              ) : adminPanel === "products" ? (
                <div className="space-y-6">
                  <form onSubmit={handleAddProduct} className="grid gap-3 border border-white/[0.08] bg-ink/50 p-5 sm:grid-cols-2">
                    <input
                      value={newProduct.title}
                      onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Название"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.subtitle}
                      onChange={(e) => setNewProduct((p) => ({ ...p, subtitle: e.target.value }))}
                      placeholder="Описание"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.position}
                      onChange={(e) => setNewProduct((p) => ({ ...p, position: e.target.value }))}
                      placeholder="Категория"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                      placeholder="Цена (₸)"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.colors}
                      onChange={(e) => setNewProduct((p) => ({ ...p, colors: e.target.value }))}
                      placeholder="Цвета через запятую"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.sizes}
                      onChange={(e) => setNewProduct((p) => ({ ...p, sizes: e.target.value }))}
                      placeholder="Размеры через запятую"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.composition}
                      onChange={(e) => setNewProduct((p) => ({ ...p, composition: e.target.value }))}
                      placeholder="Состав"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.videoSrc}
                      onChange={(e) => setNewProduct((p) => ({ ...p, videoSrc: e.target.value }))}
                      placeholder="Видео URL (/www/videos/...)"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      value={newProduct.image}
                      onChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))}
                      placeholder="Изображение URL"
                      className={inputClass.replace("mt-2", "mt-0")}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const dataUrl = await compressImageToDataUrl(file);
                        setNewProduct((p) => ({ ...p, image: dataUrl }));
                      }}
                      className={`${inputClass.replace("mt-2", "mt-0")} file:mr-3 file:border-0 file:bg-fog file:px-3 file:py-1.5 file:font-display file:text-[10px] file:uppercase file:tracking-wider file:text-ink`}
                    />
                    <label
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDroppedImage(e, (dataUrl) => setNewProduct((p) => ({ ...p, image: dataUrl })))}
                      className="flex items-center justify-center border border-dashed border-white/25 bg-ink/40 px-4 py-6 text-center text-xs text-mist sm:col-span-2"
                    >
                      Перетащите изображение
                    </label>
                    <button
                      type="submit"
                      className="focus-ring sm:col-span-2 border border-fog bg-fog py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-transparent hover:text-fog"
                    >
                      Добавить позицию
                    </button>
                  </form>

                  {message ? <p className="mt-4 text-sm text-mist">{message}</p> : null}

                  <div className="mt-8 space-y-4">
                    {products.map((product) => {
                      const draft = editorById[product.id];
                      if (!draft) return null;
                      return (
                        <article key={product.id} className="border border-white/[0.08] bg-ink/50 p-5">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              value={draft.title}
                              onChange={(e) =>
                                setEditorById((prev) => ({ ...prev, [product.id]: { ...prev[product.id], title: e.target.value } }))
                              }
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.subtitle}
                              onChange={(e) =>
                                setEditorById((prev) => ({ ...prev, [product.id]: { ...prev[product.id], subtitle: e.target.value } }))
                              }
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.position}
                              onChange={(e) =>
                                setEditorById((prev) => ({ ...prev, [product.id]: { ...prev[product.id], position: e.target.value } }))
                              }
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={String(draft.price)}
                              onChange={(e) =>
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], price: Number(e.target.value) || 0 }
                                }))
                              }
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.colors.join(", ")}
                              onChange={(e) =>
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    ...prev[product.id],
                                    colors: e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                                  }
                                }))
                              }
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.sizes.join(", ")}
                              onChange={(e) =>
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: {
                                    ...prev[product.id],
                                    sizes: e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                                  }
                                }))
                              }
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.composition ?? ""}
                              onChange={(e) =>
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], composition: e.target.value }
                                }))
                              }
                              placeholder="Состав"
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.videoSrc ?? ""}
                              onChange={(e) =>
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], videoSrc: e.target.value }
                                }))
                              }
                              placeholder="Видео URL"
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              value={draft.image}
                              onChange={(e) =>
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], image: e.target.value }
                                }))
                              }
                              placeholder="Изображение URL"
                              className={inputClass.replace("mt-2", "mt-0")}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const dataUrl = await compressImageToDataUrl(file);
                                setEditorById((prev) => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], image: dataUrl }
                                }));
                              }}
                              className={`${inputClass.replace("mt-2", "mt-0")} file:mr-3 file:border-0 file:bg-fog file:px-3 file:py-1.5 file:font-display file:text-[10px] file:uppercase file:text-ink`}
                            />
                            <label
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) =>
                                handleDroppedImage(e, (dataUrl) =>
                                  setEditorById((prev) => ({
                                    ...prev,
                                    [product.id]: { ...prev[product.id], image: dataUrl }
                                  }))
                                )
                              }
                              className="flex items-center justify-center border border-dashed border-white/25 px-3 py-4 text-center text-xs text-mist"
                            >
                              Drop image
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateProduct(product.id, draft)}
                            className="focus-ring mt-4 border border-white/[0.18] px-5 py-2 font-display text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-fog"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(product.id)}
                            className="focus-ring ml-3 mt-4 border border-red-400/35 px-5 py-2 font-display text-[10px] uppercase tracking-[0.2em] text-red-300 transition-colors hover:border-red-300"
                          >
                            Удалить
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
