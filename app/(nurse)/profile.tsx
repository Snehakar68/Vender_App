import React, { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/src/core/context/AuthContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const auth = useContext(AuthContext);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    auth?.logout();
    router.replace("/(auth)/login");
  };

  const fetchData = async () => {
  try {
    setLoading(true);

    const user = await AsyncStorage.getItem("user");
    const parsed = JSON.parse(user || "{}");
    const vendorId = parsed?.vendorId;

    if (!vendorId) return;

    const res = await fetch(
      `https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurse_APP/${vendorId}`
    );

    const json = await res.json();
    setData(json.data?.[0]);
  } catch (err) {
    console.log("API ERROR:", err);
  } finally {
    setLoading(false);
  }
};
useFocusEffect(
  useCallback(() => {
    fetchData();
  }, [])
);

  const imageBase64 = data?.photo;
  const imageUri = imageBase64
    ? `data:image/jpeg;base64,${imageBase64}`
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Loader */}
        {loading ? (
          <ActivityIndicator size="large" color="#0f766e" />
        ) : (
          <>
            {/* Profile Card */}
            <View style={styles.card}>
              <View style={styles.avatar}>
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: 70, height: 70, borderRadius: 35 }}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {data?.full_name?.[0] || "U"}
                  </Text>
                )}

                <View style={styles.editIcon}>
                  <Ionicons name="pencil" size={12} color="#fff" />
                </View>
              </View>

              <Text style={styles.name}>
                {data?.full_name || "No Name"}
              </Text>
<Text style={styles.subText}>
  {data?.qualification === "1"
    ? "ANM"
    : data?.qualification === "2"
    ? "GNM"
    : data?.qualification === "3"
    ? "BSc Nursing"
    : "No Qualification"}
</Text>

              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => router.push("/(nurse)/personal")}
              >
                <Text style={styles.linkText}>View personal details</Text>
                <Ionicons name="chevron-forward" size={16} color="#0f766e" />
              </TouchableOpacity>
            </View>

            {/* Options Card */}
            <View style={styles.card}>
              <MenuItem
                icon="business-outline"
                title="Bank Details"
                onPress={() => router.push("/(nurse)/bank")}
              />

              <MenuItem
                icon="shield-checkmark-outline"
                title="Privacy Policy"
                onPress={() => {}}
              />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>
              App Version 2.4.1 (Build 108)
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ✅ Types */
type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
};

/* ✅ Component */
function MenuItem({ icon, title, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color="#555" />
        <Text style={styles.menuText}>{title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );
}

/* ✅ Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#34d399",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0f766e",
    borderRadius: 10,
    padding: 4,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },

  subText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },

  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  linkText: {
    color: "#0f766e",
    fontSize: 14,
    marginRight: 5,
  },

  menuItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 10,
  },

  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
    marginLeft: 8,
  },

  version: {
    textAlign: "center",
    marginTop: 10,
    color: "#999",
    fontSize: 12,
  },
});