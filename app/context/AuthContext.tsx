import { type ReactNode, useCallback, useEffect, useState } from "react";

import { getItem, removeItem, setItem } from "../utils/storage";
import { AuthContext } from "./Context";
import { KEY } from "@/services/Constant";

let globalLogout: (() => void) | null = null;

export const triggerLogout = () => {
  if (globalLogout) {
    globalLogout();
  }
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    setToken(null);
    setRole(null);
    try {
      await removeItem(KEY.AUTH_TOKEN);
      await removeItem(KEY.ROLE);
      await removeItem(KEY.USER);
    } catch (error) {
      console.error("Failed to remove auth token:", error);
    }
  }, []);

  useEffect(() => {
    // Load token from storage when app starts
    const loadToken = async () => {
      try {
        const storedToken = await getItem(KEY.AUTH_TOKEN);
        const storedRole = await getItem(KEY.ROLE);
        if (storedToken) {
          setToken(storedToken);
          setRole(storedRole);
        }
      } catch (error) {
        console.error("Failed to load auth token:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    globalLogout = logout;
    return () => {
      globalLogout = null;
    };
  }, [logout]);

  const login = useCallback(async (nextToken: string, nextRole:string) => {
    setToken(nextToken);
    setRole(nextRole);
    try {
      await setItem(KEY.AUTH_TOKEN, nextToken);
      await setItem(KEY.ROLE, nextRole);
    } catch (error) {
      console.error("Failed to save auth token:", error);
    }
  }, []);

  if (isLoading) {
    // Optionally return a splash screen / loader here while checking storage
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token),
        role,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
