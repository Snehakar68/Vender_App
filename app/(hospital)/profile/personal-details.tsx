import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  ButtonSize,
} from "@/constants/theme";

export default function PersonalDetailsScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    hospitalName: "LifeCare Specialty Hospital",
    addressLine1: "Plot 42, Health City Enclave",
    addressLine2: "Near Central Park East",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400001",
    email: "contact@lifecarehospital.com",
    mobile: "+91 98765 43210",
    altMobile: "",
    landline: "022 2345 6789",
    aboutUs:
      "LifeCare Specialty Hospital is committed to providing world-class healthcare with a personalized touch. Our team of experts specializes in cardiac care and rehabilitative services, ensuring patients receive comprehensive treatment.",
  });

  function update(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.light.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <View style={{ width: 40 }} />
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
            />
            <InputField
              label="Address Line 1"
              value={form.addressLine1}
              onChangeText={(v) => update("addressLine1", v)}
            />
            <InputField
              label="Address Line 2"
              value={form.addressLine2}
              onChangeText={(v) => update("addressLine2", v)}
            />
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="City"
                  value={form.city}
                  onChangeText={(v) => update("city", v)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="State"
                  value={form.state}
                  onChangeText={(v) => update("state", v)}
                />
              </View>
            </View>
            <InputField
              label="PIN Code"
              value={form.pinCode}
              onChangeText={(v) => update("pinCode", v)}
              keyboardType="numeric"
            />
          </View>

          {/* LOCATION & MAP */}
          <Text style={styles.sectionLabel}>LOCATION & MAP</Text>
          <View style={styles.section}>
            <View style={styles.addressRow}>
              <MaterialIcons
                name="location-on"
                size={16}
                color={Colors.light.primary}
              />
              <Text style={styles.addressText}>
                {form.addressLine1}, {form.city}, MH {form.pinCode}
              </Text>
            </View>
            <View style={styles.mapPlaceholder}>
              <MaterialIcons
                name="add-location"
                size={36}
                color={Colors.light.onPrimary}
              />
            </View>
          </View>

          {/* CONTACT INFORMATION */}
          <Text style={styles.sectionLabel}>CONTACT INFORMATION</Text>
          <View style={styles.section}>
            <InputField
              label="Email"
              value={form.email}
              onChangeText={(v) => update("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Mobile Number"
              value={form.mobile}
              onChangeText={(v) => update("mobile", v)}
              keyboardType="phone-pad"
            />
            <InputField
              label="Alternate Mobile Number"
              value={form.altMobile}
              placeholder="Enter alternate mobile"
              onChangeText={(v) => update("altMobile", v)}
              keyboardType="phone-pad"
            />
            <InputField
              label="Landline Number"
              value={form.landline}
              onChangeText={(v) => update("landline", v)}
              keyboardType="phone-pad"
            />
          </View>

          {/* IMAGES */}
          <Text style={styles.sectionLabel}>IMAGES</Text>
          <View style={styles.section}>
            <View style={styles.imagesRow}>
              <View style={styles.imageTile}>
                <View style={styles.imageThumb}>
                  <Text style={styles.imageThumbText}>View Image</Text>
                </View>
              </View>
              <View style={styles.imageTile}>
                <View style={styles.imageThumb}>
                  <Text style={styles.imageThumbText}>View Image</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addImageTile} activeOpacity={0.7}>
                <MaterialIcons
                  name="photo-camera"
                  size={24}
                  color={Colors.light.outline}
                />
                <Text style={styles.addImageText}>ADD MORE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ABOUT US */}
          <Text style={styles.sectionLabel}>ABOUT US *</Text>
          <View style={styles.section}>
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
          </View>

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        placeholder={placeholder ?? label}
        placeholderTextColor={Colors.light.outline}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
      />
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
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
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

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

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
  row2: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  // Location
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  addressText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    flex: 1,
  },
  mapPlaceholder: {
    height: 140,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Images
  imagesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  imageTile: {
    flex: 1,
  },
  imageThumb: {
    aspectRatio: 1,
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  imageThumbText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },
  addImageTile: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addImageText: {
    fontFamily: FontFamily.label,
    fontSize: 9,
    color: Colors.light.outline,
    letterSpacing: 0.5,
  },

  // About
  aboutInput: {
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontFamily: FontFamily.body,
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

  // Save button
  saveBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    height: ButtonSize.minHeight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    ...Shadow.elevated,
  },
  saveBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: "#fff",
  },
});
