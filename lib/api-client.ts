/**
 * API Client Utility
 * Centralized HTTP client for all API requests to the backend
 * Handles authentication tokens, error management, and request/response formatting
 */

const API_BASE_URL = "https://jarqyn-backend.onrender.com";
const TOKEN_KEY = "access_token";
const TOKEN_TYPE_KEY = "token_type";
const REFRESH_TOKEN_KEY = "refresh_token";

// Types
export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  role: string;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Token Management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getTokenType: (): string => {
    if (typeof window === "undefined") return "bearer";
    return localStorage.getItem(TOKEN_TYPE_KEY) || "bearer";
  },

  setToken: (token: string, tokenType: string = "bearer", refreshToken?: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isTokenValid: (): boolean => {
    return tokenManager.getToken() !== null;
  }
};

// Generic HTTP Method
async function request<T = any>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<ApiResponse<T>> {
  try {
    const { params, ...init } = options;

    // Build URL with query parameters if provided
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    // Set default headers
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Add authorization token if available
    const token = tokenManager.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Make request
    const response = await fetch(url, {
      ...init,
      headers
    });

    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.detail || data?.message || "Request failed",
        message: data?.detail || data?.message || `HTTP ${response.status}`
      };
    }

    return {
      ok: true,
      status: response.status,
      data
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      error: error?.message || "Network error",
      message: error?.message || "Failed to connect to server"
    };
  }
}

// Auth Endpoints
export const authApi = {
  register: async (userData: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
    const payload = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      surname: userData.surname,
      phone: userData.phone || null,
      role: userData.role || "customer"
    };

    return request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    return request<UserResponse>("/auth/me", {
      method: "GET"
    });
  },

  logout: async (): Promise<ApiResponse> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      await request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken })
      });
    }
    tokenManager.clearToken();
    return { ok: true, status: 200 };
  }
};

export const productVariantsApi = {
  getBySku: async (sku: string): Promise<ApiResponse<any>> => {
    return request(`/product-variants/by-sku/${encodeURIComponent(sku)}`, {
      method: "GET"
    });
  },

  list: async (params?: { product_id?: number; sku?: string }) => {
    return request(`/product-variants`, {
      method: "GET",
      params
    });
  },

  create: async (payload: {
    product_id: number;
    size: string;
    color: string;
    sku: string;
    price?: number | null;
    stock_quantity: number;
  }) => {
    return request(`/product-variants`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  update: async (variantId: number, payload: Partial<{ product_id: number; size: string; color: string; sku: string; price: number | null; stock_quantity: number }>) => {
    return request(`/product-variants/${variantId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  delete: async (variantId: number) => {
    return request(`/product-variants/${variantId}`, {
      method: "DELETE"
    });
  }
};

export const cartApi = {
  addItems: async (items: any[]): Promise<ApiResponse> => {
    return request("/carts", {
      method: "POST",
      body: JSON.stringify({ items })
    });
  },

  getCurrentCart: async (): Promise<ApiResponse<any>> => {
    return request("/carts/me", {
      method: "GET"
    });
  },

  updateItem: async (itemId: number, quantity: number): Promise<ApiResponse<any>> => {
    return request(`/carts/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity })
    });
  },

  deleteItem: async (itemId: number): Promise<ApiResponse<any>> => {
    return request(`/carts/items/${itemId}`, {
      method: "DELETE"
    });
  },

  clearCart: async (): Promise<ApiResponse<any>> => {
    return request("/carts", {
      method: "DELETE"
    });
  }
};

export const addressesApi = {
  create: async (addr: {
    region: string;
    city: string;
    street: string;
    house: string;
    apartment?: string;
    postal_code: string;
  }): Promise<ApiResponse<any>> => {
    return request("/addresses", {
      method: "POST",
      body: JSON.stringify(addr)
    });
  },

  listMy: async (): Promise<ApiResponse<any>> => {
    return request("/addresses/me", { method: "GET" });
  }
};

export const ordersApi = {
  create: async (payload: { delivery_address_id: number; notes?: string; source_id?: number }) => {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  update: async (
    orderId: string | number,
    payload: { status?: string; payment_status?: string }
  ): Promise<ApiResponse<any>> => {
    return request(`/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }
};

// Helper: Generic GET request
export const apiGet = <T = any>(
  endpoint: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "GET",
    params
  });
};

// Helper: Generic POST request
export const apiPost = <T = any>(
  endpoint: string,
  body?: any,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    params
  });
};

// Helper: Generic PUT request
export const apiPut = <T = any>(
  endpoint: string,
  body?: any,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
    params
  });
};

// Helper: Generic PATCH request
export const apiPatch = <T = any>(
  endpoint: string,
  body?: any,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
    params
  });
};

// Helper: Generic DELETE request
export const apiDelete = <T = any>(
  endpoint: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> => {
  return request<T>(endpoint, {
    method: "DELETE",
    params
  });
};

export default {
  authApi,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  tokenManager,
  request
};
