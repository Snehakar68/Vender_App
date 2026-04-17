import { ReactNode, useContext } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "@/src/core/context/AuthContext";

type Props = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedLayout({ children, allowedRoles }: Props) {
  const auth = useContext(AuthContext);

  // ⏳ Loading state
  if (auth?.user === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  // ❌ Not logged in
  if (!auth?.user) {
    return <Redirect href="/(auth)/login" />;
  }

  // ❌ Role not allowed
  if (allowedRoles && !allowedRoles.includes(auth.user.role || "")) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}