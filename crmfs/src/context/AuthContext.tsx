import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, type UserProfile } from "@/lib/api";

interface AuthContextValue {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: UserProfile) => void;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem("accessToken")
  );
  const [isLoading, setIsLoading] = useState(false);

  // Restore user from localStorage or fetch from API
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    } else if (accessToken) {
      // If we have a token but no user data, fetch it
      import("@/lib/api").then(({ userApi }) => {
        userApi.getMe().then(userData => {
          localStorage.setItem("user", JSON.stringify(userData));
          setUserState(userData);
        }).catch(() => {
          // Token might be invalid
          localStorage.removeItem("accessToken");
          setAccessToken(null);
        });
      });
    }
  }, [accessToken]);

  const login = useCallback((token: string, userData?: UserProfile) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUserState(userData);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // ignore server errors on logout
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setAccessToken(null);
      setUserState(null);
      setIsLoading(false);
    }
  }, []);

  const setUser = useCallback((userData: UserProfile) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
