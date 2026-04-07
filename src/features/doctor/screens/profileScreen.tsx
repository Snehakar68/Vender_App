import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import { logout} from "@/src/utils/logout";

export default function ProfileScreen() {
const auth = useContext(AuthContext);

if (!auth) return null; // or loader

const { logout } = auth;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>

          {/* AVATAR */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>LC</Text>
            </View>

            <View style={styles.editIcon}>
              <Feather name="edit-2" size={12} color="#fff" />
            </View>
          </View>

          {/* NAME */}
          <Text style={styles.name}>LifeCare Specialty</Text>
          <Text style={styles.subText}>Partner Hospital</Text>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push("/(doctor)/personal-details")}
          >
            <Text style={styles.viewText}>View personal details</Text>
            <Ionicons name="chevron-forward" size={14} color="#0F766E" />
          </TouchableOpacity>
        </View>

        {/* MENU CARD */}
        <View style={styles.menuCard}>

          <MenuItem
            icon="briefcase-outline"
            label="Professional Details"
            onPress={() => router.push("/(doctor)/professional-details")}
          />

          <MenuItem
            icon="business-outline"
            label="Bank Details"
            onPress={() => router.push("/(doctor)/bank-details")}
          />

          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => router.push("/(doctor)/privacy-policy")}
          />
        </View>

        {/* LOGOUT */}
      <TouchableOpacity
  style={styles.logoutBtn}
  onPress={logout}
>
  <Ionicons name="log-out-outline" size={18} color="#DC2626" />
  <Text style={styles.logoutText}>Sign Out</Text>
</TouchableOpacity>

        {/* VERSION */}
        <Text style={styles.version}>
          App Version 2.4.1 (Build 108)
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    paddingBottom: 40,
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0F766E",
  },

  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#065F46",
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0F766E",
    padding: 6,
    borderRadius: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },

  subText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },

  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  viewText: {
    color: "#0F766E",
    fontWeight: "600",
    fontSize: 13,
  },

  /* MENU */
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 6,
    marginBottom: 16,
    elevation: 2,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  menuText: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* LOGOUT */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "600",
  },

  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 14,
  },
});
function MenuItem({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={18} color="#475569" />
        </View>
        <Text style={styles.menuText}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}