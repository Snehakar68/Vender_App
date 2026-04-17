import { clearTokens, getAccessToken } from "./tokenStorage";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const logout = async (setUser?: (val: any) => void) => {
  try {
    const token = await getAccessToken();
    const storedUser = await AsyncStorage.getItem("user");
    const vendorId = storedUser ? JSON.parse(storedUser).vendorId : null;

    if (token) {
      await axios.post(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-vendor-id": vendorId, // 👈 vendor-aware logout
          },
        }
      );
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status !== 401) {
        console.log("Logout API error", err.response?.status);
      }
    }
  }

  // 🔥 Clear everything
  await clearTokens();
  await AsyncStorage.removeItem("user");

  if (setUser) {
    setUser(null);
  }

  router.replace("/login");
};