import axios, { AxiosError, type AxiosInstance } from "axios";
import type { CustomerLoginResponse } from "./types";
import { API_BASE_URL, ApiError } from "./api-client";

export const CUSTOMER_TOKEN_KEY = "isp_customer_token";
export const CUSTOMER_USER_KEY = "isp_customer_user";

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerToken(token: string): void {
  window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function clearCustomerToken(): void {
  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_USER_KEY);
}

function extractMessage(err: AxiosError): string {
  const data = err.response?.data as
    | { message?: string | string[]; error?: string }
    | undefined;
  if (data) {
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
  }
  if (err.code === "ERR_NETWORK") {
    return "Tidak dapat terhubung ke server API. Periksa koneksi atau status backend.";
  }
  return err.message || "Terjadi kesalahan tak terduga.";
}

function toApiError(err: AxiosError): ApiError {
  return new ApiError(extractMessage(err), err.response?.status, err.response?.data);
}

/**
 * Client khusus portal pelanggan: mengirim `isp_customer_token` dan mengalihkan
 * ke /portal/login saat token kedaluwarsa. Terpisah dari apiClient staf.
 */
export const customerApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

customerApiClient.interceptors.request.use((config) => {
  const token = getCustomerToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customerApiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearCustomerToken();
      if (window.location.pathname.startsWith("/portal")) {
        window.location.href = "/portal/login";
      }
    }
    return Promise.reject(toApiError(err));
  }
);

/** Client publik tanpa auth & tanpa redirect (dipakai landing page). */
export const publicApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

publicApiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => Promise.reject(toApiError(err))
);

/** Helper bertipe untuk portal pelanggan. */
export const customerApi = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await customerApiClient.get<T>(url, { params });
    return res.data;
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await customerApiClient.post<T>(url, body);
    return res.data;
  },
  async login(email: string, password: string): Promise<CustomerLoginResponse> {
    const data = await customerApi.post<CustomerLoginResponse>("/customer-auth/login", {
      email,
      password,
    });
    setCustomerToken(data.access_token);
    window.localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.customer));
    return data;
  },
};

export { ApiError };
