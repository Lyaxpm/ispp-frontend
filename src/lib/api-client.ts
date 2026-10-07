import axios, { AxiosError, type AxiosInstance } from "axios";
import type { LoginResponse } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const TOKEN_KEY = "isp_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Error API terstruktur dengan pesan yang aman ditampilkan ke pengguna. */
export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
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

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(new ApiError(extractMessage(err), err.response?.status, err.response?.data));
  }
);

/** Helper bertipe untuk memanggil API. */
export const api = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await apiClient.get<T>(url, { params });
    return res.data;
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiClient.post<T>(url, body);
    return res.data;
  },
  async put<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiClient.put<T>(url, body);
    return res.data;
  },
  async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiClient.patch<T>(url, body);
    return res.data;
  },
  async del<T>(url: string): Promise<T> {
    const res = await apiClient.delete<T>(url);
    return res.data;
  },
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(data.access_token);
    return data;
  },
};
