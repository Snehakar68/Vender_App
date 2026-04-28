import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  ButtonSize,
} from "@/src/shared/constants/theme";
import { AuthContext } from "@/src/core/context/AuthContext";
import api from "@/src/core/api/apiClient";
import { HOSPITAL_PROFILE_KEY } from "./personal-details";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "H";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [hospitalName, setHospitalName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [vendorId]);
 const loadProfile = async () => {
    if (!vendorId) {
      setProfileLoading(false);
      return;
    }

    try {
      const res = await api.get(
        `/api/Hospital/GetHosp_APP/${vendorId}`
      );

      console.log("API FULL RESPONSE:", res.data);

      const hospital = res.data?.data?.[0]; // ✅ correct parsing

      if (hospital) {
        const name = hospital.full_name || "";

        // ✅ handle base64 image correctly
        const image = hospital.photo
          ? `data:image/png;base64,${hospital.photo}`
          : null;

        setHospitalName(name);
        setProfileImage(image);

        // cache
        await AsyncStorage.setItem(
          HOSPITAL_PROFILE_KEY,
          JSON.stringify({
            hospitalName: name,
            profileImage: image,
          })
        );
      }
    } catch (error) {
      console.log("API ERROR:", error);
    }

    setProfileLoading(false);
  };
  
  async function handleSignOut() {
    await auth?.logout();
  }

  const displayName = hospitalName || "Hospital";
  const initials = getInitials(displayName);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header card */}
        <View style={styles.headerCard}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {profileLoading ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>
          </View>

          {profileLoading ? (
            <View style={styles.namePlaceholder} />
          ) : (
            <Text style={styles.name}>{displayName}</Text>
          )}
          <Text style={styles.designation}>Partner Hospital</Text>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => router.push("/profile/personal-details")}
            activeOpacity={0.75}
          >
            <Text style={styles.detailsBtnText}>View personal details</Text>
            <MaterialIcons
              name="chevron-right"
              size={18}
              color={Colors.light.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Menu list */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/profile/bank-details")}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <MaterialIcons
                name="account-balance"
                size={20}
                color={Colors.light.onSurfaceVariant}
              />
            </View>
            <Text style={styles.menuLabel}>Bank Details</Text>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={Colors.light.outline}
            />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/profile/privacy-policy")}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <MaterialIcons
                name="policy"
                size={20}
                color={Colors.light.onSurfaceVariant}
              />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={Colors.light.outline}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={20} color={Colors.light.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        {/* <Text style={styles.version}>App Version 2.4.1 (Build 108)</Text> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  headerCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    ...Shadow.card,
  },
  avatarWrap: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primaryFixed,
    borderWidth: 2.5,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineMedium,
    color: Colors.light.primary,
  },
  namePlaceholder: {
    height: 24,
    width: 160,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceContainerLow,
    marginBottom: 4,
  },
  name: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.onSurface,
    marginBottom: 4,
    textAlign: "center",
  },
  designation: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  detailsBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  menuCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadow.card,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.light.onSurface,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.light.surfaceContainerLow,
    marginLeft: 72,
  },

  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.light.errorContainer,
    borderRadius: Radius.xl,
    height: ButtonSize.minHeight,
  },
  signOutText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.error,
  },

  version: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
