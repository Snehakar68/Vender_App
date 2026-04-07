// app/_layout.tsx

import { Stack } from "expo-router";
import { AuthProvider } from "@/src/core/context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}