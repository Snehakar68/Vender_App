import { Stack } from "expo-router";
import { AuthProvider } from "@/src/core/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false, // ✅ removes header everywhere
        }}
      />
    </AuthProvider>
  );
}