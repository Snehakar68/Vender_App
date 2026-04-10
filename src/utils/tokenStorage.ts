import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

const ROLE = "role";
const VENDOR_ID = "vendorId";
const EMAIL = "email";
const PHONE = "phone";
const NAME = "name";

// ✅ SAVE EVERYTHING
export const setAuthData = async ({
  token,
  refreshToken,
  role,
  vendorId,
  email,
  phone,
  name,
}: any) => {
  // 🔐 Secure
  if (token) {
    await SecureStore.setItemAsync(ACCESS_TOKEN, token);
  }

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN, refreshToken);
  }

  // 📦 AsyncStorage
  await AsyncStorage.multiSet([
    [ROLE, role || ""],
    [VENDOR_ID, vendorId || ""],
    [EMAIL, email || ""],
    [PHONE, phone || ""],
    [NAME, name || ""],
  ]);
};

// ✅ GETTERS
export const getAccessToken = () =>
  SecureStore.getItemAsync(ACCESS_TOKEN);

export const getRefreshToken = () =>
  SecureStore.getItemAsync(REFRESH_TOKEN);

export const getUserData = async () => {
  const values = await AsyncStorage.multiGet([
    ROLE,
    VENDOR_ID,
    EMAIL,
    PHONE,
    NAME,
  ]);

  return {
    role: values[0][1],
    vendorId: values[1][1],
    email: values[2][1],
    phone: values[3][1],
    name: values[4][1],
  };
};

// ✅ CLEAR
export const clearAuthData = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN);

  await AsyncStorage.multiRemove([
    ROLE,
    VENDOR_ID,
    EMAIL,
    PHONE,
    NAME,
  ]);
};
export const clearTokens = clearAuthData;


export const isTokenExpired = (token: string) => {
  try {
    if (!token) return true;

    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );

    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};