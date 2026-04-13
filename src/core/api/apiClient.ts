// src/core/api/apiClient.ts

import axios from "axios";
import {
  getAccessToken, 
  getRefreshToken,
  setTokens,
  clearTokens, 
} from "@/src/utils/tokenStorage";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
 
const api = axios.create({
  baseURL:
    "https://coreapi-service-111763741518.asia-south1.run.app",
});
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ✅ REQUEST INTERCEPTOR (already correct)
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  const storedUser = await AsyncStorage.getItem("user");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (storedUser) {
    const { vendorId } = JSON.parse(storedUser);
    config.headers["x-vendor-id"] = vendorId;
  }

  return config;
});


// 🔥 RESPONSE INTERCEPTOR (THIS IS THE MAIN PART)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❗ prevent infinite loop
  if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(api(originalRequest));
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) throw new Error("No refresh token");

    const res = await axios.post(
      "https://coreapi-service-111763741518.asia-south1.run.app/api/auth/refresh-token",
      { refreshToken }
    );

    const newToken = res.data.token;
    const newRefreshToken = res.data.refreshToken;

  await setTokens({
  token: newToken,
  refreshToken: newRefreshToken || refreshToken,
});
const storedUser = await AsyncStorage.getItem("user");

if (storedUser) {
  const parsed = JSON.parse(storedUser);

  await AsyncStorage.setItem(
    "user",
    JSON.stringify({
      ...parsed,
      token: newToken,
      refreshToken: newRefreshToken || refreshToken,
    })
  );
}
    onRefreshed(newToken);

    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    return api(originalRequest);
  } catch (err) {
    await clearTokens();
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
}

    return Promise.reject(error);
  }
);


export default api;