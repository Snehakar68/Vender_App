import { clearTokens, getAccessToken } from "./tokenStorage";
import { router } from "expo-router";
import axios, { AxiosError } from "axios";

export const logout = async (setUser?: (val: any) => void) => {
  try {
    const token = await getAccessToken();
    

    if (token) {
      await axios.post(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

  await clearTokens();

  if (setUser) {
    setUser(null);
  }

  router.replace("/login");
};