"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Ambassador,
  AmbassadorProfile,
  CartLineItem,
  DemoOrder,
  DemoUser,
  HeroContent,
  InventoryRow,
  LegacyDemoOrder,
  ManifestoBlock,
  ManifestoContent,
  OrderLineItem,
  Product,
  ShippingAddress,
  createSeedDemoOrder,
  createTracking,
  defaultAmbassadors,
  defaultHeroContent,
  defaultManifestoContent,
  defaultProducts,
  ensureUniqueAmbassadorSlug,
  mergeAmbassadors,
  mergeHeroContent,
  mergeManifestoContent,
  normalizeDemoOrder
} from "@/lib/demo-store";
import type { CustomerSourceOption } from "@/lib/nis-schools";
import {
  buildStockPositionRow,
  deductInventoryForLines,
  inventoryFromProducts,
  inventoryRowsForProduct,
  mergePersistedInventory,
  replaceInventoryForProduct,
  restoreInventoryForLines,
  stripInventoryForProduct,
  type StockPositionInput
} from "@/lib/inventory-sync";
import { computeLineSku } from "@/lib/order-utils";
import { CITY_PRINT_ASSETS, cityPrintsForProducts } from "@/lib/city-catalog";
import { mergeSiteInformation, type SiteInformationContent } from "@/lib/site-information";

const ADMIN_EMAIL = "admin@jarqyn.kz";
const ADMIN_PASSWORD = "admin123";

type DemoStore = {
  user: DemoUser | null;
  isAdmin: boolean;
  accounts: DemoUser[];
  products: Product[];
  favorites: string[];
  orders: DemoOrder[];
  cart: CartLineItem[];
  /** Global city selection — synced to cart lines when changed */
  selectedCityId: string;
  setSelectedCityId: (cityId: string) => void;
  heroContent: HeroContent;
  manifestoContent: ManifestoContent;
  signIn: (email: string, password: string) => { ok: boolean; message: string };
  register: (name: string, email: string, password: string) => { ok: boolean; message: string };
  signOut: () => void;
  toggleFavorite: (productId: string) => void;
  addToCart: (line: Omit<OrderLineItem, "sku"> & Pick<CartLineItem, "backendItemId"> & { sku?: string }) => void;
  syncCartLineWithBackend: (sku: string, variantId: number, backendItemId: number, quantity: number) => void;
  removeCartLine: (lineId: string) => void;
  setCartLineQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  updateProfilePhone: (phone: string) => void;
  submitOrder: (payload: {
    customerFullName: string;
    phone: string;
    shippingAddress: ShippingAddress;
    nisSchool?: string;
    customerSource?: CustomerSourceOption;
  }) => Promise<{ ok: boolean; message: string; orderId?: string }>;
  updateOrderAdminFields: (
    orderId: string,
    patch: Partial<Pick<DemoOrder, "status" | "cancelReason" | "closedDate">>
  ) => void;
  markOrderPaid: (orderId: string) => void;
  inventory: InventoryRow[];
  siteInformation: SiteInformationContent;
  setSiteInformation: (content: SiteInformationContent) => void;
  setInventoryQuantity: (sku: string, quantity: number) => void;
  removeInventoryRow: (sku: string) => void;
  addInventoryPosition: (input: StockPositionInput) => { ok: boolean; message: string };
  updateInventoryPosition: (oldSku: string, input: StockPositionInput) => { ok: boolean; message: string };
  deleteOrder: (orderId: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (productId: string, updates: Omit<Product, "id">) => void;
  deleteProduct: (productId: string) => void;
  updateHeroContent: (updates: Partial<HeroContent>) => void;
  updateManifestoSectionLabel: (sectionLabel: string) => void;
  updateManifestoBlock: (id: string, patch: Partial<Pick<ManifestoBlock, "kicker" | "text">>) => void;
  addManifestoBlock: () => void;
  removeManifestoBlock: (id: string) => void;
  resetManifestoContent: () => void;
  ambassadors: Ambassador[];
  addAmbassador: (row: Omit<Ambassador, "id">) => void;
  updateAmbassador: (id: string, patch: Partial<Omit<Ambassador, "id">>) => void;
  deleteAmbassador: (id: string) => void;
  resetAmbassadors: () => void;
  addAmbassadorProfile: (ambassadorId: string, profile: Omit<AmbassadorProfile, "id">) => void;
  updateAmbassadorProfile: (
    ambassadorId: string,
    profileId: string,
    patch: Partial<Omit<AmbassadorProfile, "id">>
  ) => void;
  deleteAmbassadorProfile: (ambassadorId: string, profileId: string) => void;
};

const STORAGE_KEY = "jarqyn-demo-store";

const DemoContext = createContext<DemoStore | null>(null);

type StoredAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: DemoUser["role"];
  phone?: string;
};

type StoredState = {
  user: DemoUser | null;
  accounts: StoredAccount[];
  products: Product[];
  favorites: string[];
  orders: DemoOrder[];
  cart: CartLineItem[];
  selectedCityId: string;
  heroContent: HeroContent;
  manifestoContent: ManifestoContent;
  ambassadors: Ambassador[];
  inventory: InventoryRow[];
  siteInformation: SiteInformationContent;
};

const ACC_ADMIN_ID = "acc-admin-demo";

function newAccountId() {
  return `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function migrateAccounts(raw: unknown): StoredAccount[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row, i) => {
    const x = row as Partial<StoredAccount & { password?: string }>;
    const email = typeof x.email === "string" ? x.email : `user-${i}@local`;
    const normalizedEmail = email.trim().toLowerCase();
    return {
      id:
        typeof x.id === "string" && x.id
          ? x.id
          : normalizedEmail === ADMIN_EMAIL.trim().toLowerCase()
            ? ACC_ADMIN_ID
            : `legacy-${email}`,
      name: typeof x.name === "string" ? x.name : "Customer",
      email,
      password: typeof x.password === "string" ? x.password : "",
      role: x.role === "admin" ? "admin" : "customer",
      phone: typeof x.phone === "string" ? x.phone : undefined
    };
  });
}

function userFromAccount(account: StoredAccount): DemoUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role ?? "customer"
  };
}

function migrateCart(raw: unknown, fallbackCityId: string): CartLineItem[] {
  if (!Array.isArray(raw)) return [];
  const rows: CartLineItem[] = [];
  for (const row of raw) {
    const x = row as Partial<CartLineItem>;
    if (!x.productId || !x.color || !x.size) continue;
    const cityId = x.selectedCityId || fallbackCityId;
    rows.push({
      lineId: typeof x.lineId === "string" && x.lineId ? x.lineId : `line-${Math.random().toString(36).slice(2, 10)}`,
      productId: x.productId,
      productName: typeof x.productName === "string" ? x.productName : "",
      color: x.color,
      size: x.size,
      selectedCityId: cityId,
      quantity: Math.max(1, typeof x.quantity === "number" ? x.quantity : 1),
      image: typeof x.image === "string" ? x.image : "",
      unitPrice: typeof x.unitPrice === "number" ? x.unitPrice : 0,
      sku: x.sku ?? computeLineSku({ id: x.productId } as any, x.color, x.size, cityId)
    });
  }
  return rows;
}

function mergeProductWithCurrentCatalog(base: Product, saved?: Product): Product {
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    id: base.id,
    slug: base.slug,
    title: base.title,
    subtitle: base.subtitle,
    price: base.price,
    position: base.position,
    colors: base.colors,
    sizes: base.sizes,
    unavailableSizes: base.unavailableSizes,
    skuCode: base.skuCode,
    colorSkus: base.colorSkus,
    image: base.image,
    imagesByColor: base.imagesByColor,
    backImageByColor: base.backImageByColor,
    cityPrints: base.cityPrints,
    description: base.description,
    specifications: base.specifications,
    composition: base.composition
  };
}

const initialState: StoredState = {
  user: null,
  accounts: [
    {
      id: ACC_ADMIN_ID,
      name: "Jarqyn Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      phone: "+7 700 000 00 00"
    }
  ],
  products: defaultProducts,
  favorites: [],
  orders: [createSeedDemoOrder()],
  cart: [],
  selectedCityId: CITY_PRINT_ASSETS[1]?.id ?? "astana",
  heroContent: defaultHeroContent,
  manifestoContent: mergeManifestoContent(null),
  ambassadors: mergeAmbassadors(null),
  inventory: inventoryFromProducts(defaultProducts),
  siteInformation: mergeSiteInformation(null)
};

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<StoredState> & {
        accounts?: StoredAccount[];
        orders?: DemoOrder[];
        siteInformation?: Partial<SiteInformationContent>;
      };

      let accounts = migrateAccounts(parsed.accounts);
      if (!accounts.length) {
        accounts = initialState.accounts.map((a) => ({ ...a }));
      }
      if (!accounts.some((account) => account.email.toLowerCase() === ADMIN_EMAIL)) {
        accounts.push({
          id: ACC_ADMIN_ID,
          name: "Jarqyn Admin",
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: "admin",
          phone: "+7 700 000 00 00"
        });
      }

      const selectedCityId =
        typeof parsed.selectedCityId === "string" && parsed.selectedCityId
          ? parsed.selectedCityId
          : CITY_PRINT_ASSETS[1]?.id ?? "astana";

      let user: DemoUser | null = null;
      if (parsed.user?.email) {
        const match = accounts.find((a) => a.email.toLowerCase() === parsed.user!.email!.toLowerCase());
        user = match ? userFromAccount(match) : null;
      }

      const ordersRaw = Array.isArray(parsed.orders) ? parsed.orders : [createSeedDemoOrder()];
      const orders = ordersRaw.map((o) => normalizeDemoOrder(o as LegacyDemoOrder));

      const cart = migrateCart(parsed.cart, selectedCityId);

      const normalizedState: StoredState = {
        user,
        accounts,
        products: Array.isArray(parsed.products) ? parsed.products : defaultProducts,
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        orders,
        cart,
        selectedCityId,
        heroContent: mergeHeroContent(parsed.heroContent),
        manifestoContent: mergeManifestoContent(parsed.manifestoContent),
        ambassadors: mergeAmbassadors(parsed.ambassadors),
        inventory: [],
        siteInformation: mergeSiteInformation(null)
      };

      const incomingProducts = normalizedState.products;
      const incomingById = new Map(incomingProducts.map((product) => [product.id, product]));
      normalizedState.products = defaultProducts.map((base, index) =>
        mergeProductWithCurrentCatalog(base, incomingById.get(base.id) ?? incomingProducts[index])
      );
      if (!normalizedState.ambassadors?.length) {
        normalizedState.ambassadors = defaultAmbassadors.map((a) => ({ ...a }));
      }
      normalizedState.siteInformation = mergeSiteInformation(parsed.siteInformation);
      normalizedState.inventory = mergePersistedInventory(normalizedState.products, parsed.inventory);
      setState(normalizedState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<DemoStore>(
    () => ({
      user: state.user,
      isAdmin: state.user?.role === "admin",
      accounts: (state.accounts ?? []).map(({ password: _password, ...account }) => account),
      products: state.products,
      favorites: state.favorites,
      orders: state.orders,
      cart: state.cart,
      selectedCityId: state.selectedCityId,
      setSelectedCityId: (cityId) =>
        setState((prev) => ({
          ...prev,
          selectedCityId: cityId
        })),
      syncCartLineWithBackend: (sku, variantId, backendItemId, quantity) =>
        setState((prev) => ({
          ...prev,
          cart: prev.cart.map((l) =>
            l.sku === sku || l.variantId === variantId
              ? { ...l, variantId, backendItemId, quantity: Math.max(1, quantity) }
              : l
          )
        })),
      heroContent: state.heroContent,
      manifestoContent: state.manifestoContent,
      ambassadors: state.ambassadors,
      inventory: state.inventory,
      siteInformation: state.siteInformation,
      setSiteInformation: (content) =>
        setState((prev) => ({
          ...prev,
          siteInformation: mergeSiteInformation(content)
        })),
      setInventoryQuantity: (sku, quantity) =>
        setState((prev) => {
          const ts = new Date().toISOString();
          return {
            ...prev,
            inventory: prev.inventory.map((row) =>
              row.sku === sku ? { ...row, quantity: Math.max(0, Math.floor(quantity)), updatedAt: ts } : row
            )
          };
        }),
      removeInventoryRow: (sku) =>
        setState((prev) => ({
          ...prev,
          inventory: prev.inventory.filter((row) => row.sku !== sku)
        })),
      addInventoryPosition: (input) => {
        const preview = buildStockPositionRow(state.products, input);
        if (!preview.ok) return { ok: false, message: preview.message };

        let added = false;
        setState((prev) => {
          const built = buildStockPositionRow(prev.products, input);
          if (!built.ok) return prev;
          if (prev.inventory.some((r) => r.sku === built.row.sku)) return prev;
          added = true;
          return { ...prev, inventory: [...prev.inventory, built.row] };
        });

        return added
          ? { ok: true, message: "Позиция добавлена." }
          : {
              ok: false,
              message:
                "Позиция с таким SKU уже есть — измените количество в таблице или выберите другую комбинацию цвета, размера и города."
            };
      },
      updateInventoryPosition: (oldSku, input) => {
        const existing = state.inventory.find((r) => r.sku === oldSku);
        if (!existing) return { ok: false, message: "Строка склада не найдена." };

        const preview = buildStockPositionRow(state.products, input, {
          preserveCreatedAt: existing.createdAt
        });
        if (!preview.ok) return { ok: false, message: preview.message };
        if (preview.row.sku !== oldSku && state.inventory.some((r) => r.sku === preview.row.sku)) {
          return {
            ok: false,
            message:
              "Другая строка уже использует этот SKU — выберите другую комбинацию цвета, размера или города."
          };
        }

        let saved = false;
        setState((prev) => {
          const row = prev.inventory.find((r) => r.sku === oldSku);
          if (!row) return prev;
          const built = buildStockPositionRow(prev.products, input, {
            preserveCreatedAt: row.createdAt
          });
          if (!built.ok) return prev;
          if (built.row.sku !== oldSku && prev.inventory.some((r) => r.sku === built.row.sku)) return prev;
          saved = true;
          return {
            ...prev,
            inventory: prev.inventory.filter((r) => r.sku !== oldSku).concat(built.row)
          };
        });

        return saved
          ? { ok: true, message: "Позиция обновлена." }
          : { ok: false, message: "Не удалось сохранить — данные могли измениться. Попробуйте ещё раз." };
      },
      deleteOrder: (orderId) =>
        setState((prev) => {
          const order = prev.orders.find((o) => o.id === orderId);
          if (!order) return prev;
          let inventory = prev.inventory;
          if (order.stockProcessed) {
            inventory = restoreInventoryForLines(inventory, order.items);
          }
          return {
            ...prev,
            orders: prev.orders.filter((o) => o.id !== orderId),
            inventory
          };
        }),
      signIn: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const match = state.accounts.find(
          (account) => account.email.toLowerCase() === normalizedEmail && account.password === password
        );
        if (!match) return { ok: false, message: "Invalid email or password." };
        setState((prev) => ({
          ...prev,
          user: userFromAccount(match),
          cart: []
        }));
        return { ok: true, message: "Signed in." };
      },
      register: (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!name.trim() || !normalizedEmail || !password.trim()) {
          return { ok: false, message: "Please fill all fields." };
        }
        if (state.accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
          return { ok: false, message: "Account already exists. Please sign in." };
        }
        const id = newAccountId();
        const nextAccount: StoredAccount = {
          id,
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: "customer"
        };
        setState((prev) => ({
          ...prev,
          user: userFromAccount(nextAccount),
          accounts: [...prev.accounts, nextAccount],
          cart: []
        }));
        return { ok: true, message: "Account created." };
      },
      signOut: () => setState((prev) => ({ ...prev, user: null, cart: [] })),
      toggleFavorite: (productId) =>
        setState((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(productId)
            ? prev.favorites.filter((id) => id !== productId)
            : [...prev.favorites, productId]
        })),
      addToCart: (line) =>
        setState((prev) => {
          const cityId = line.selectedCityId || prev.selectedCityId;
          const sku = line.sku ?? computeLineSku(line.productId, line.color, line.size, cityId);
          const quantity = Math.max(1, line.quantity);
          const existing = prev.cart.find((item) => item.sku === sku);
          if (existing) {
            return {
              ...prev,
              cart: prev.cart.map((item) =>
                item.sku === sku
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      variantId: item.variantId ?? line.variantId,
                      backendItemId: item.backendItemId ?? line.backendItemId
                    }
                  : item
              )
            };
          }

          const row: CartLineItem = {
            lineId: `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            productId: line.productId,
            productName: line.productName,
            color: line.color,
            size: line.size,
            selectedCityId: cityId,
            quantity,
            image: line.image,
            unitPrice: line.unitPrice,
            sku,
            variantId: line.variantId,
            backendItemId: line.backendItemId
          };
          return { ...prev, cart: [...prev.cart, row] };
        }),
      removeCartLine: (lineId) =>
        setState((prev) => ({
          ...prev,
          cart: prev.cart.filter((l) => l.lineId !== lineId)
        })),
      setCartLineQuantity: (lineId, quantity) =>
        setState((prev) => ({
          ...prev,
          cart: prev.cart.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.max(1, quantity) } : l))
        })),
      clearCart: () => setState((prev) => ({ ...prev, cart: [] })),
      updateProfilePhone: (phone) =>
        setState((prev) => {
          if (!prev.user) return prev;
          const trimmed = phone.trim();
          return {
            ...prev,
            user: { ...prev.user, phone: trimmed },
            accounts: prev.accounts.map((a) => (a.id === prev.user!.id ? { ...a, phone: trimmed } : a))
          };
        }),
      submitOrder: async (payload) => {
        if (!state.cart.length) return { ok: false, message: "Корзина пуста." };
        const phone = payload.phone.trim();
        if (!phone) return { ok: false, message: "Укажите номер телефона." };

        try {
          const { addressesApi, authApi, ordersApi, tokenManager } = await import("@/lib/api-client");
          
          // Check if user has auth token
          const hasToken = tokenManager.isTokenValid();
          console.log("submitOrder: token valid?", hasToken);
          
          if (!hasToken) {
            console.log("No valid token in localStorage");
            return { ok: false, message: "Войдите в аккаунт, чтобы оформить заказ. Используйте страницу Аккаунт для входа." };
          }

          const cartSnapshot = state.cart.map(({ lineId: _l, ...rest }) => ({ ...rest }));
          const stockProbe = deductInventoryForLines(state.inventory, cartSnapshot);
          if (!stockProbe.ok) return { ok: false, message: stockProbe.message };

          let uid = state.user?.id;
          if (!uid) {
            const currentUserRes = await authApi.getCurrentUser();
            if (currentUserRes.ok && currentUserRes.data) {
              uid = String(currentUserRes.data.id);
            }
          }
          const accountId = uid || "unknown";
          // Persist address to backend first
          const addrPayload = {
            region: payload.shippingAddress.region,
            city: payload.shippingAddress.city,
            street: payload.shippingAddress.street,
            house: payload.shippingAddress.house,
            apartment: payload.shippingAddress.apartment || undefined,
            postal_code: payload.shippingAddress.postalCode
          };
          const addrRes = await addressesApi.create(addrPayload);
          console.log("address create response:", addrRes);
          if (!addrRes.ok || !addrRes.data) {
            throw new Error(addrRes.error || "Не удалось сохранить адрес доставки");
          }
          const addressId = addrRes.data.id;

          const orderRes = await ordersApi.create({ delivery_address_id: addressId });
          console.log("order create response:", orderRes);
          if (!orderRes.ok || !orderRes.data) {
            throw new Error(orderRes.error || "Не удалось создать заказ");
          }
          const { orderId, createdAt } = orderRes.data as { orderId: string; createdAt: string };

          setState((prev) => {
            const items: OrderLineItem[] = prev.cart.map(({ lineId: _lineId, ...rest }) => ({ ...rest }));
            const deduct = deductInventoryForLines(prev.inventory, items);
            if (!deduct.ok) return prev;

            const total = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
            const draft: DemoOrder = {
              id: orderId,
              accountId: accountId,
              customerFullName: payload.customerFullName.trim(),
              phone,
              shippingAddress: payload.shippingAddress,
              nisSchool: payload.nisSchool?.trim() || undefined,
              customerSource: payload.customerSource,
              items,
              total,
              createdAt,
              status: "processing",
              paymentStatus: "pending",
              tracking: createTracking("processing"),
              stockProcessed: true
            };
            const order = normalizeDemoOrder(draft);

            return {
              ...prev,
              inventory: deduct.next,
              orders: [order, ...prev.orders],
              cart: [],
              accounts: prev.accounts.map((a) => (a.id === uid ? { ...a, phone } : a)),
              user: prev.user ? { ...prev.user, phone } : null
            };
          });

          return { ok: true, message: "Заказ создан.", orderId };
        } catch (error: any) {
          console.error("submitOrder error:", error);
          const errorMsg = error?.message || "Не удалось создать заказ. Попробуйте ещё раз.";
          return { ok: false, message: errorMsg };
        }
      },
      updateOrderAdminFields: (orderId, patch) => {
        void (async () => {
          try {
            const numericOrderId = Number(orderId);
            if (!Number.isNaN(numericOrderId) && String(numericOrderId) === String(orderId)) {
              const { ordersApi } = await import("@/lib/api-client");
              const payload: { status?: string; payment_status?: string } = {};
              if (patch.status !== undefined) payload.status = patch.status;
              if ((patch as any).paymentStatus !== undefined) payload.payment_status = (patch as any).paymentStatus;
              const res = await ordersApi.update(orderId, payload);
              if (!res.ok) {
                console.error("Order update failed", res.error || res.message);
                return;
              }
            }
          } catch (error) {
            console.error("Order update API error", error);
          }
        })();

        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order) => {
            if (order.id !== orderId) return order;
            const nextStatus = patch.status ?? order.status;
            const merged: DemoOrder = {
              ...order,
              ...patch,
              status: nextStatus
            };
            return {
              ...merged,
              tracking:
                patch.status !== undefined && patch.status !== order.status
                  ? createTracking(patch.status)
                  : order.tracking
            };
          })
        }));
      },
      markOrderPaid: (orderId) => {
        void (async () => {
          try {
            const numericOrderId = Number(orderId);
            if (!Number.isNaN(numericOrderId) && String(numericOrderId) === String(orderId)) {
              const { ordersApi } = await import("@/lib/api-client");
              const res = await ordersApi.update(orderId, { payment_status: "completed" });
              if (!res.ok) {
                console.error("Mark order paid failed", res.error || res.message);
                return;
              }
            }
          } catch (error) {
            console.error("Mark order paid API error", error);
          }
        })();

        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId ? { ...order, paymentStatus: "paid" } : order
          )
        }));
      },
      addProduct: (product) =>
        setState((prev) => {
          const row: Product = {
            ...product,
            customizable: product.customizable ?? true,
            cityPrints: product.cityPrints?.length ? product.cityPrints : cityPrintsForProducts(),
            id: `prod-${Math.random().toString(36).slice(2, 8)}`
          };
          return {
            ...prev,
            products: [row, ...prev.products],
            inventory: [...prev.inventory, ...inventoryRowsForProduct(row)]
          };
        }),
      updateProduct: (productId, updates) =>
        setState((prev) => {
          const products = prev.products.map((product) =>
            product.id === productId ? { ...product, ...updates } : product
          );
          const merged = products.find((p) => p.id === productId);
          if (!merged) return { ...prev, products };
          return {
            ...prev,
            products,
            inventory: replaceInventoryForProduct(prev.inventory, merged)
          };
        }),
      deleteProduct: (productId) =>
        setState((prev) => ({
          ...prev,
          products: prev.products.filter((product) => product.id !== productId),
          favorites: prev.favorites.filter((id) => id !== productId),
          cart: prev.cart.filter((line) => line.productId !== productId),
          inventory: stripInventoryForProduct(prev.inventory, productId),
          orders: prev.orders.map((order) => {
            const items = order.items.filter((item) => item.productId !== productId);
            const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            return { ...order, items, total };
          })
        })),
      updateHeroContent: (updates) =>
        setState((prev) => ({
          ...prev,
          heroContent: mergeHeroContent({ ...prev.heroContent, ...updates })
        })),
      updateManifestoSectionLabel: (sectionLabel) =>
        setState((prev) => ({
          ...prev,
          manifestoContent: { ...prev.manifestoContent, sectionLabel }
        })),
      updateManifestoBlock: (id, patch) =>
        setState((prev) => ({
          ...prev,
          manifestoContent: {
            ...prev.manifestoContent,
            blocks: prev.manifestoContent.blocks.map((b) =>
              b.id === id ? { ...b, ...patch } : b
            )
          }
        })),
      addManifestoBlock: () =>
        setState((prev) => ({
          ...prev,
          manifestoContent: {
            ...prev.manifestoContent,
            blocks: [
              ...prev.manifestoContent.blocks,
              {
                id: `manifesto-${Date.now().toString(36)}`,
                kicker: "Новый блок",
                text: "Текст блока. Каждое предложение или новая строка появляется при скролле по очереди."
              }
            ]
          }
        })),
      removeManifestoBlock: (id) =>
        setState((prev) => {
          if (prev.manifestoContent.blocks.length <= 1) return prev;
          return {
            ...prev,
            manifestoContent: {
              ...prev.manifestoContent,
              blocks: prev.manifestoContent.blocks.filter((b) => b.id !== id)
            }
          };
        }),
      resetManifestoContent: () =>
        setState((prev) => ({
          ...prev,
          manifestoContent: mergeManifestoContent(null)
        })),
      addAmbassador: (row) =>
        setState((prev) => {
          const slug = ensureUniqueAmbassadorSlug(prev.ambassadors, row.slug || row.title);
          return {
            ...prev,
            ambassadors: [
              ...prev.ambassadors,
              {
                id: `amb-${Date.now().toString(36)}`,
                ...row,
                slug,
                profiles: row.profiles ?? []
              }
            ]
          };
        }),
      updateAmbassador: (id, patch) =>
        setState((prev) => {
          const current = prev.ambassadors.find((a) => a.id === id);
          if (!current) return prev;
          const merged = { ...current, ...patch };
          if (patch.slug !== undefined) {
            const others = prev.ambassadors.filter((a) => a.id !== id);
            merged.slug = ensureUniqueAmbassadorSlug(others, patch.slug || merged.title);
          }
          return {
            ...prev,
            ambassadors: prev.ambassadors.map((a) => (a.id === id ? merged : a))
          };
        }),
      deleteAmbassador: (id) =>
        setState((prev) => ({
          ...prev,
          ambassadors:
            prev.ambassadors.length <= 1 ? prev.ambassadors : prev.ambassadors.filter((a) => a.id !== id)
        })),
      resetAmbassadors: () =>
        setState((prev) => ({
          ...prev,
          ambassadors: mergeAmbassadors(null)
        })),
      addAmbassadorProfile: (ambassadorId, profile) =>
        setState((prev) => ({
          ...prev,
          ambassadors: prev.ambassadors.map((a) =>
            a.id !== ambassadorId
              ? a
              : {
                  ...a,
                  profiles: [
                    ...(a.profiles ?? []),
                    { ...profile, id: `face-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }
                  ]
                }
          )
        })),
      updateAmbassadorProfile: (ambassadorId, profileId, patch) =>
        setState((prev) => ({
          ...prev,
          ambassadors: prev.ambassadors.map((a) => {
            if (a.id !== ambassadorId) return a;
            return {
              ...a,
              profiles: (a.profiles ?? []).map((p) => (p.id === profileId ? { ...p, ...patch } : p))
            };
          })
        })),
      deleteAmbassadorProfile: (ambassadorId, profileId) =>
        setState((prev) => ({
          ...prev,
          ambassadors: prev.ambassadors.map((a) =>
            a.id !== ambassadorId ? a : { ...a, profiles: (a.profiles ?? []).filter((p) => p.id !== profileId) }
          )
        }))
    }),
    [state]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoStore must be used within DemoProvider");
  return context;
}
