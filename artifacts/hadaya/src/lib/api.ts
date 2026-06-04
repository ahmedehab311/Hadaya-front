import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "./auth";

// عدّل الـ baseURL حسب الـ backend بتاعك
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: يضيف التوكين تلقائيًا لأي request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.set?.("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Response interceptor: لو التوكين انتهت صلاحيته يعمل logout ويوديك للوجين
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================
// Helpers جاهزة لاستخدام مباشر
// ============================

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  // خزّن التوكين والـ user مباشرة بعد اللوجين
  if (data?.data?.token) {
    authStorage.saveSession(data.data.token, {
      id: data.data.user.id,
      name: data.data.user.name,
      email: data.data.user.email,
      phone: data.data.user.phone,
      role: data.data.user.role,
    });
  }
  return data;
}

export function logout() {
  authStorage.clear();
  if (typeof window !== "undefined") window.location.href = "/login";
}
