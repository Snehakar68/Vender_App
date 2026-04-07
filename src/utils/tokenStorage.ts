import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

export const setTokens = async ({
  token,
  refreshToken,
}: {
  token?: string;
  refreshToken?: string;
}) => {
  if (token) {
    await SecureStore.setItemAsync(ACCESS_TOKEN, token);
  }

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN, refreshToken);
  }
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync(ACCESS_TOKEN);
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN);
};
export const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );

    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};