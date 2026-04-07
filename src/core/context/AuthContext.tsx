import { createContext, useState, ReactNode, useEffect } from "react";
import {
  getAccessToken,
  clearTokens,
} from "@/src/utils/tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenExpired } from "@/src/utils/tokenStorage";
import { logout as logoutUtil } from "@/src/utils/logout";

type UserType = {
  token: string;
  role?: string;
};

type AuthType = {
  user: UserType | null;
  login: (data: any) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  // 🔥 Restore session
useEffect(() => {
  const loadUser = async () => {
    const token = await getAccessToken();
    const storedUser = await AsyncStorage.getItem("user");

    if (token && storedUser) {
      if (isTokenExpired(token)) {
        await clearTokens();
        await AsyncStorage.removeItem("user");
        return;
      }

      setUser(JSON.parse(storedUser));
    }
  };

  loadUser();
}, []);

  const login = async (data: any) => {
    setUser(data);
    await AsyncStorage.setItem("user", JSON.stringify(data));
  };

const logout = async () => {
  await logoutUtil(setUser);
};

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};