"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearCustomerToken,
  customerApi,
  getCustomerToken,
  CUSTOMER_USER_KEY,
} from "@/lib/customer-api";
import type { CustomerAuthUser } from "@/lib/types";

interface CustomerAuthContextValue {
  customer: CustomerAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function CustomerAuthProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(CUSTOMER_USER_KEY);
    if (stored && getCustomerToken()) {
      try {
        setCustomer(JSON.parse(stored) as CustomerAuthUser);
      } catch {
        clearCustomerToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await customerApi.login(email, password);
    setCustomer(data.customer);
  }, []);

  const logout = useCallback(() => {
    clearCustomerToken();
    setCustomer(null);
    router.push("/portal/login");
  }, [router]);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      isAuthenticated: !!customer && !!getCustomerToken(),
      isLoading,
      login,
      logout,
    }),
    [customer, isLoading, login, logout]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth harus dipakai di dalam CustomerAuthProvider");
  return ctx;
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  return <CustomerAuthProviderInner>{children}</CustomerAuthProviderInner>;
}
