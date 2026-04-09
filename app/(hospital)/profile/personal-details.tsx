import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import GoogleMapPicker from "@/src/shared/components/GoogleMapPicker";
import { AuthContext } from "@/src/core/context/AuthContext";
import api from "@/src/core/api/apiClient";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
} from "@/src/shared/constants/theme";

type FormState = {
  hospitalName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  email: string;
  mobile: string;
  altMobile: string;
  landline: string;
  aboutUs: string;
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: FormState = {
  hospitalName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: "",
  email: "",
  mobile: "",
  altMobile: "",
  landline: "",
  aboutUs: "",
  latitude: "",
  longitude: "",
};

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (vendorId) loadProfile();
  }, [vendorId]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/api/Hospital/GetHospitalById/${vendorId}`);
      const data = res.data;
      console.log("Profile data:", data);
      setForm({
        hospitalName: data.full_name ?? "",
        addressLine1: data.adrs_1 ?? "",
        addressLine2: data.adrs_2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        pinCode: data.pin_code ?? "",
        email: data.email ?? "",
        mobile: data.mobile ?? "",
        altMobile: data.mobile_1 ?? "",
        landline: data.landline ?? "",
        aboutUs: data.about ?? "",
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
      });
    } catch (e) {
      console.log("Profile fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  function update(key: keyof FormState, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function showStatus(text: string, ok: boolean) {
    setStatusMsg({ text, ok });
    setTimeout(() => setStatusMsg(null), 3000);
  }

  const handleEditSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/Hospital/UpdateHosPersonnelInfo", {
        vendorId,
        full_name: form.hospitalName,
        adrs_1: form.addressLine1,
        adrs_2: form.addressLine2,
        city: form.city,
        state: form.state,
        pin_code: form.pinCode,
        email: form.email,
        mobile: form.mobile,
        mobile_1: form.altMobile,
        landline: form.landline,
        about: form.aboutUs,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      setIsEditing(false);
      showStatus("Details saved successfully.", true);
    } catch (e) {
      console.log("Save failed:", e);
      showStatus("Failed to save. Please try again.", false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <TouchableOpacity
          onPress={handleEditSave}
          disabled={saving}
          style={styles.editBtn}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* BASIC INFORMATION */}
          <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
          <View style={styles.section}>
            <InputField
              label="Hospital Name"
              value={form.hospitalName}
              onChangeText={(v) => update("hospitalName", v)}
              editable={isEditing}
            />
            <InputField
              label="Address Line 1"
              value={form.addressLine1}
              onChangeText={(v) => update("addressLine1", v)}
              editable={isEditing}
            />
            <InputField
              label="Address Line 2"
              value={form.addressLine2}
              onChangeText={(v) => update("addressLine2", v)}
              editable={isEditing}
            />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="City"
                  value={form.city}
                  onChangeText={(v) => update("city", v)}
                  editable={isEditing}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="State"
                  value={form.state}
                  onChangeText={(v) => update("state", v)}
                  editable={isEditing}
                />
              </View>
            </View>
            <InputField
              label="PIN Code"
              value={form.pinCode}
              onChangeText={(v) => update("pinCode", v)}
              keyboardType="numeric"
              editable={isEditing}
            />
          </View>

          {/* LOCATION */}
          <Text style={styles.sectionLabel}>LOCATION & MAP</Text>
          <View style={styles.section}>
            {isEditing && (
              <View style={styles.mapContainer}>
                <GoogleMapPicker
                  city={form.city}
                  state={form.state}
                  pin={form.pinCode}
                  address1={form.addressLine1}
                  onLocationSelect={(lat, lng, pin) => {
                    setForm((prev) => ({
                      ...prev,
                      latitude: String(lat),
                      longitude: String(lng),
                      ...(pin ? { pinCode: pin } : {}),
                    }));
                  }}
                />
              </View>
            )}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Latitude"
                  value={form.latitude}
                  onChangeText={(v) => update("latitude", v)}
                  keyboardType="numeric"
                  editable={isEditing}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Longitude"
                  value={form.longitude}
                  onChangeText={(v) => update("longitude", v)}
                  keyboardType="numeric"
                  editable={isEditing}
                />
              </View>
            </View>
          </View>

          {/* CONTACT */}
          <Text style={styles.sectionLabel}>CONTACT INFORMATION</Text>
          <View style={styles.section}>
            <InputField
              label="Email"
              value={form.email}
              onChangeText={(v) => update("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={isEditing}
            />
            <InputField
              label="Mobile Number"
              value={form.mobile}
              onChangeText={(v) => update("mobile", v)}
              keyboardType="phone-pad"
              editable={isEditing}
            />
            <InputField
              label="Alternate Mobile"
              value={form.altMobile}
              onChangeText={(v) => update("altMobile", v)}
              keyboardType="phone-pad"
              editable={isEditing}
            />
            <InputField
              label="Landline"
              value={form.landline}
              onChangeText={(v) => update("landline", v)}
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          {/* ABOUT US */}
          <Text style={styles.sectionLabel}>ABOUT US</Text>
          <View style={styles.section}>
            {isEditing ? (
              <>
                <TextInput
                  style={[styles.aboutInput, { fontFamily: FontFamily.body }]}
                  value={form.aboutUs}
                  onChangeText={(v) => {
                    if (v.length <= 1000) update("aboutUs", v);
                  }}
                  multiline
                  textAlignVertical="top"
                  placeholder="Tell patients about your hospital..."
                  placeholderTextColor={Colors.light.outline}
                />
                <Text style={styles.charCount}>{form.aboutUs.length} / 1000</Text>
              </>
            ) : (
              <Text style={styles.aboutReadOnly}>
                {form.aboutUs || "—"}
              </Text>
            )}
          </View>

          {/* Status banner */}
          {statusMsg && (
            <View style={[styles.banner, statusMsg.ok ? styles.bannerOk : styles.bannerErr]}>
              <MaterialIcons
                name={statusMsg.ok ? "check-circle" : "error-outline"}
                size={16}
                color={statusMsg.ok ? Colors.light.tertiary : Colors.light.error}
              />
              <Text style={[styles.bannerText, { color: statusMsg.ok ? Colors.light.tertiary : Colors.light.error }]}>
                {statusMsg.text}
              </Text>
            </View>
          )}

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── InputField ────────────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={fieldStyles.input}
          value={value}
          placeholder={placeholder ?? label}
          placeholderTextColor={Colors.light.outline}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "sentences"}
        />
      ) : (
        <Text style={fieldStyles.valueText}>{value || "—"}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.sm },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelMedium,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  valueText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    paddingVertical: 6,
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  headerTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },
  editBtn: {
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  editBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  sectionLabel: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  section: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.subtle,
  },
  row2: { flexDirection: "row", gap: Spacing.sm },

  mapContainer: {
    height: 220,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },

  aboutInput: {
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
    textAlign: "right",
    marginTop: 4,
  },
  aboutReadOnly: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    lineHeight: 22,
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
  },
  bannerOk: { backgroundColor: Colors.light.tertiaryFixed + "40" },
  bannerErr: { backgroundColor: Colors.light.errorContainer },
  bannerText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    flex: 1,
  },
});
