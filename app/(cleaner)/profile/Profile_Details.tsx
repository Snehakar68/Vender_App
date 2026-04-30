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

export default function ProfileDetailsScreen() {
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
      `https://coreapi-service-111763741518.asia-south1.run.app/api/Cleaner/GetCleaner_APP/${vendorId}`
    );

    const json = await res.json();

    setData(json);
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
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0f766e" />
      ) : (
        <>
          {/* 🔥 PROFILE HEADER */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>
                  {data?.full_name?.[0] || "U"}
                </Text>
              )}
            </View>

            <Text style={styles.name}>
              {data?.full_name || "No Name"}
            </Text>

            <Text style={styles.location}>
              {data?.city || "No City"}, {data?.state || "No State"}
            </Text>
          </View>

         

          {/* 🔥 OPTIONS */}
          <View style={styles.menuCard}>
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
            />
          </View>

          {/* 🔥 LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
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

function DetailItem({ label, value }: any) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "-"}</Text>
    </View>
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
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#34d399",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  location: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },

  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },

  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  detailLabel: {
    fontSize: 14,
    color: "#666",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },

  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 15,
    marginLeft: 10,
    color: "#333",
  },

  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },

  version: {
    textAlign: "center",
    marginTop: 15,
    color: "#aaa",
    fontSize: 12,
  },
});
