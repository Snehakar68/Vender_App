// src/features/auth/services/authApi.ts

import apiClient from "@/src/core/api/apiClient";

export const checkUserIdApi = (userid: string) =>
  apiClient.post("/api/auth/Check-userid", { userid });

export const requestOtpApi = (email: string) =>
  apiClient.post("/api/auth/request-otp", { email });

export const verifyOtpApi = (email: string, otp: string) =>
  apiClient.post("/api/auth/verify-otp", {
    email, 
    emailOtp: otp,
  });

export const registerApi = (data: any) => 
  apiClient.post("/api/auth/Registration", data);

export const loginApi = async (userId: string, password: string) => {
  const res = await apiClient.post("/api/auth/User-login", {
    userId,
    password,
  });

  return res.data;
};