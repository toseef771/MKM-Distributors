import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "distributor" | "admin" | null;

interface AuthUser {
  role: UserRole;
  phone?: string;
  name?: string;
  shopName?: string;
  city?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginDistributor: (data: AuthUser) => Promise<void>;
  loginAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persistence Logic: App khulne par check karega ke koi purana user save hai ya nahi
  useEffect(() => {
    const loadUser = async () => {
      try {
        const val = await AsyncStorage.getItem("mkm_user");
        if (val) {
          setUser(JSON.parse(val));
        }
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const loginDistributor = async (data: AuthUser) => {
    const userData: AuthUser = { ...data, role: "distributor" };
    await AsyncStorage.setItem("mkm_user", JSON.stringify(userData));
    setUser(userData);
  };

  const loginAdmin = async () => {
    const userData: AuthUser = { role: "admin" };
    await AsyncStorage.setItem("mkm_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("mkm_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoading, loginDistributor, loginAdmin, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
