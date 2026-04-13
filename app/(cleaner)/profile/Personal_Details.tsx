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
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { AuthContext } from "@/src/core/context/AuthContext";
import api from "@/src/core/api/apiClient";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  ButtonSize,
} from "@/src/shared/constants/theme";
import {
  isValidEmail,
  isValidMobile,
  isValidPinCode,
} from "@/src/shared/utils/validation";

// ── Types ─────────────────────────────────────────────────────────────────────

type CleanerPersonalForm = {
  name: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
  altPhone: string;
  bloodGroup: string;
  addr1: string;
  addr2: string;
  city: string;
  state: string;
  pin: string;
  summary: string;
  pan: string;
  aadhaar: string;
};

type FormErrors = Partial<Record<keyof CleanerPersonalForm, string>>;

const EMPTY_FORM: CleanerPersonalForm = {
  name: "",
  gender: "",
  dob: "",
  email: "",
  phone: "",
  altPhone: "",
  bloodGroup: "",
  addr1: "",
  addr2: "",
  city: "",
  state: "",
  pin: "",
  summary: "",
  pan: "",
  aadhaar: "",
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const isPdfBase64 = (b64 = "") => b64.startsWith("JVBER");

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateForm(form: CleanerPersonalForm): FormErrors {
  const err: FormErrors = {};
  if (!form.name.trim()) err.name = "Full name is required";
  if (!form.gender.trim()) err.gender = "Gender is required";
  if (!form.dob.trim()) err.dob = "Date of birth is required";
  if (!form.email.trim()) err.email = "Email is required";
  else if (!isValidEmail(form.email)) err.email = "Enter a valid email address";
  if (!form.phone.trim()) err.phone = "Phone number is required";
  else if (!isValidMobile(form.phone))
    err.phone = "Enter a valid 10-digit mobile number";
  if (form.altPhone && !isValidMobile(form.altPhone))
    err.altPhone = "Enter a valid 10-digit number";
  if (!form.addr1.trim()) err.addr1 = "Address is required";
  if (!form.city.trim()) err.city = "City is required";
  if (!form.state.trim()) err.state = "State is required";
  if (!form.pin.trim()) err.pin = "Pincode is required";
  else if (!isValidPinCode(form.pin)) err.pin = "Enter a valid 6-digit PIN";
  return err;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [form, setForm] = useState<CleanerPersonalForm>(EMPTY_FORM);
  const [originalForm, setOriginalForm] =
    useState<CleanerPersonalForm>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);

  // Document images (base64 or uri)
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [licenseDoc, setLicenseDoc] = useState<string | null>(null);
  const [panDoc, setPanDoc] = useState<string | null>(null);
  const [aadhaarDoc, setAadhaarDoc] = useState<string | null>(null);

  // Dropdown menus
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showBloodMenu, setShowBloodMenu] = useState(false);

  useEffect(() => {
    if (vendorId) loadPersonalDetails();
  }, [vendorId]);

  const loadPersonalDetails = async () => {
  try {
    const res = await api.get(
      `/api/Cleaner/GetCleanerPersonnelInfoById/${vendorId}`
    );

    const d = res.data?.data?.cleaner || {};
    const images = res.data?.data?.images || {};

    console.log("Fetched personal details:", d);

    const loaded = {
      name: d.full_name ?? "",
      gender: d.gender ?? "",
      dob: d.dob ?? "",
      email: d.email ?? "",
      phone: d.mobile ?? "",
      altPhone: d.mobile_1 ?? "",
      bloodGroup: d.bloodG ?? "", // ⚠️ IMPORTANT FIX
      addr1: d.adrs_1 ?? "",
      addr2: d.adrs_2 ?? "",
      city: d.city ?? "",
      state: d.state ?? "",
      pin: d.pin_code ?? "",
      summary: d.summary ?? "",
      pan: d.panNo ?? "",       // ⚠️ IMPORTANT FIX
      aadhaar: d.adhaarNo ?? "" // ⚠️ IMPORTANT FIX
    };

    setForm(loaded);
    setOriginalForm(loaded);

    // Profile Image
    if (images?.photo) {
      if (!isPdfBase64(images.photo)) {
        setProfileImg(`data:image/*;base64,${images.photo}`);
      }
    }

    // Documents
    if (images?.license) setLicenseDoc(images.license);
    if (images?.pan) setPanDoc(images.pan);
    if (images?.adhaar) setAadhaarDoc(images.adhaar);

  } catch (e) {
    console.log("Personal details fetch error:", e);
  } finally {
    setLoading(false);
  }
};

  function update(key: keyof CleanerPersonalForm, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function showStatus(text: string, ok: boolean) {
    setStatusMsg({ text, ok });
    setTimeout(() => setStatusMsg(null), 3500);
  }

  function handleEdit() {
    setOriginalForm(form);
    setErrors({});
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(originalForm);
    setErrors({});
    setIsEditing(false);
    setShowGenderMenu(false);
    setShowBloodMenu(false);
  }

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Allow photo library access to upload a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfileImg(asset.uri);
    }
  };

  const pickDocument = async (
    setter: (v: string | null) => void,
    label: string,
  ) => {
    if (!isEditing) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        `Allow photo library access to upload ${label}.`,
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const handleSignOut = async () => {
    await auth?.logout();
  };

  const handleUpdate = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("vendor_id", vendorId ?? "");
      payload.append("full_name", form.name);
      payload.append("gender", form.gender);
      payload.append("dob", form.dob);
      payload.append("email", form.email);
      payload.append("mobile", form.phone);
      payload.append("mobile_1", form.altPhone);
      payload.append("blood_group", form.bloodGroup);
      payload.append("adrs_1", form.addr1);
      payload.append("adrs_2", form.addr2);
      payload.append("City", form.city);
      payload.append("State", form.state);
      payload.append("pin_code", form.pin);
      payload.append("Summary", form.summary);
      payload.append("pan", form.pan);
      payload.append("aadhaar", form.aadhaar);

      const response = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Cleaner/UpdateCleanerPersonnelInfo",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${auth?.user?.token}`,
          },
          body: payload,
        },
      );

      const data = await response.json();
      console.log("Update response:", data);
      if (!response.ok) {
        throw new Error(data?.message || "Update failed");
      }

      setOriginalForm(form);
      setIsEditing(false);
      showStatus("Profile updated successfully.", true);
    } catch (e: any) {
      console.log("Personal details update error:", e);
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
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.light.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        {isEditing ? (
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, { color: Colors.light.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
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
          {/* ── Profile Photo ─────────────────────────────────────── */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrap}>
              {profileImg ? (
                <Image source={{ uri: profileImg }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons
                    name="person"
                    size={56}
                    color={Colors.light.onSurfaceVariant}
                  />
                </View>
              )}
              {isEditing && (
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={pickProfileImage}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="edit"
                    size={16}
                    color={Colors.light.onPrimary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.profileName}>
              {form.name || "Staff Profile"}
            </Text>
            <Text style={styles.profileRole}>Medical Professional</Text>
          </View>

          {/* ── Personal Information Card ─────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            {/* Full Name */}
            <FormField
              label="Full Name"
              value={form.name}
              placeholder="Enter full name"
              onChangeText={(v) => update("name", v)}
              editable={isEditing}
              error={errors.name}
            />

            {/* Gender + DOB row */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                {isEditing ? (
                  <DropdownField
                    label="Gender"
                    value={form.gender}
                    options={GENDER_OPTIONS}
                    open={showGenderMenu}
                    onToggle={() => {
                      setShowGenderMenu((p) => !p);
                      setShowBloodMenu(false);
                    }}
                    onSelect={(v) => {
                      update("gender", v);
                      setShowGenderMenu(false);
                    }}
                    error={errors.gender}
                  />
                ) : (
                  <FormField
                    label="Gender"
                    value={form.gender}
                    placeholder="—"
                    onChangeText={() => {}}
                    editable={false}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="DOB"
                  value={form.dob}
                  placeholder="DD-MM-YYYY"
                  onChangeText={(v) => update("dob", v)}
                  editable={isEditing}
                  error={errors.dob}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Email */}
            <FormField
              label="Email Address"
              value={form.email}
              placeholder="Enter email"
              onChangeText={(v) => update("email", v)}
              editable={isEditing}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone + Alt Phone row */}
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Phone"
                  value={form.phone}
                  placeholder="10-digit number"
                  onChangeText={(v) => update("phone", v)}
                  editable={isEditing}
                  error={errors.phone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Alt. Phone"
                  value={form.altPhone}
                  placeholder="Optional"
                  onChangeText={(v) => update("altPhone", v)}
                  editable={isEditing}
                  error={errors.altPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Blood Group */}
            {isEditing ? (
              <DropdownField
                label="Blood Group"
                value={form.bloodGroup}
                options={BLOOD_GROUPS}
                open={showBloodMenu}
                onToggle={() => {
                  setShowBloodMenu((p) => !p);
                  setShowGenderMenu(false);
                }}
                onSelect={(v) => {
                  update("bloodGroup", v);
                  setShowBloodMenu(false);
                }}
                trailingIcon="bloodtype"
                trailingIconColor={Colors.light.error}
              />
            ) : (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Blood Group</Text>
                <View style={styles.readOnlyWithTrail}>
                  <Text style={styles.readOnlyText}>
                    {form.bloodGroup || "—"}
                  </Text>
                  <MaterialIcons
                    name="bloodtype"
                    size={20}
                    color={Colors.light.error}
                  />
                </View>
              </View>
            )}
          </View>

          {/* ── Address Card ──────────────────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconWrap,
                  { backgroundColor: Colors.light.tertiaryFixed + "30" },
                ]}
              >
                <MaterialIcons
                  name="location-on"
                  size={20}
                  color={Colors.light.tertiary}
                />
              </View>
              <Text style={styles.sectionTitle}>Address</Text>
            </View>

            <FormField
              label="Street Address"
              value={form.addr1}
              placeholder="123 Health Avenue, Phase 2"
              onChangeText={(v) => update("addr1", v)}
              editable={isEditing}
              error={errors.addr1}
              multiline
            />
            <FormField
              label="Address Line 2"
              value={form.addr2}
              placeholder="Landmark, area (optional)"
              onChangeText={(v) => update("addr2", v)}
              editable={isEditing}
            />
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="City"
                  value={form.city}
                  placeholder="City"
                  onChangeText={(v) => update("city", v)}
                  editable={isEditing}
                  error={errors.city}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="State"
                  value={form.state}
                  placeholder="State"
                  onChangeText={(v) => update("state", v)}
                  editable={isEditing}
                  error={errors.state}
                />
              </View>
            </View>
            <FormField
              label="Pincode"
              value={form.pin}
              placeholder="6-digit PIN"
              onChangeText={(v) => update("pin", v)}
              editable={isEditing}
              error={errors.pin}
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          {/* ── Verification Documents Card ───────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconWrap,
                  { backgroundColor: Colors.light.primaryFixed },
                ]}
              >
                <MaterialIcons
                  name="description"
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.sectionTitle}>Verification Documents</Text>
            </View>

            <DocumentRow
              icon="badge"
              label="License"
              value={form.pan /* reusing pan field as license number */}
              docUri={licenseDoc}
              isEditing={isEditing}
              onUpload={() => pickDocument(setLicenseDoc, "License")}
            />
            <DocumentRow
              icon="credit-card"
              label="PAN Card"
              value={form.pan}
              docUri={panDoc}
              isEditing={isEditing}
              onUpload={() => pickDocument(setPanDoc, "PAN Card")}
            />
            <DocumentRow
              icon="fingerprint"
              label="Aadhaar Card"
              value={form.aadhaar}
              docUri={aadhaarDoc}
              isEditing={isEditing}
              onUpload={() => pickDocument(setAadhaarDoc, "Aadhaar Card")}
            />
          </View>

          {/* Status banner */}
          {statusMsg && (
            <View
              style={[
                styles.banner,
                statusMsg.ok ? styles.bannerOk : styles.bannerErr,
              ]}
            >
              <MaterialIcons
                name={statusMsg.ok ? "check-circle" : "error-outline"}
                size={16}
                color={
                  statusMsg.ok ? Colors.light.tertiary : Colors.light.error
                }
              />
              <Text
                style={[
                  styles.bannerText,
                  {
                    color: statusMsg.ok
                      ? Colors.light.tertiary
                      : Colors.light.error,
                  },
                ]}
              >
                {statusMsg.text}
              </Text>
            </View>
          )}

          {/* Sign Out */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <MaterialIcons name="logout" size={18} color={Colors.light.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: isEditing ? 100 : Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Update button */}
      {isEditing && (
        <View style={styles.updateBar}>
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.updateBtnText}>Update Details</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  editable = true,
  error,
  keyboardType,
  autoCapitalize,
  multiline,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (v: string) => void;
  editable?: boolean;
  error?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={[
            styles.textInput,
            error ? styles.inputError : null,
            multiline ? styles.multilineInput : null,
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.outline}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "words"}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{value || "—"}</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function DropdownField({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect,
  error,
  trailingIcon,
  trailingIconColor,
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
  error?: string;
  trailingIcon?: string;
  trailingIconColor?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownTrigger, error ? styles.inputError : null]}
        onPress={onToggle}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && { color: Colors.light.outline },
          ]}
        >
          {value || `Select ${label}`}
        </Text>
        {trailingIcon ? (
          <MaterialIcons
            name={trailingIcon as any}
            size={20}
            color={trailingIconColor ?? Colors.light.onSurfaceVariant}
          />
        ) : (
          <MaterialIcons
            name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={22}
            color={Colors.light.outline}
          />
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.dropdownItem,
                value === opt && styles.dropdownItemActive,
              ]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  value === opt && styles.dropdownItemTextActive,
                ]}
              >
                {opt}
              </Text>
              {value === opt && (
                <MaterialIcons
                  name="check"
                  size={16}
                  color={Colors.light.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function DocumentRow({
  icon,
  label,
  value,
  docUri,
  isEditing,
  onUpload,
}: {
  icon: string;
  label: string;
  value: string;
  docUri: string | null;
  isEditing: boolean;
  onUpload: () => void;
}) {
  const hasDoc = !!docUri;
  return (
    <View style={styles.docRow}>
      <View style={styles.docIconWrap}>
        <MaterialIcons
          name={icon as any}
          size={24}
          color={Colors.light.primary}
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={styles.docValue} numberOfLines={1}>
          {value || (hasDoc ? "Uploaded" : "Not Uploaded")}
        </Text>
      </View>
      {isEditing ? (
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={onUpload}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadBtnText}>
            {hasDoc ? "CHANGE" : "UPLOAD"}
          </Text>
        </TouchableOpacity>
      ) : hasDoc ? (
        <MaterialIcons
          name="check-circle"
          size={24}
          color={Colors.light.tertiary}
        />
      ) : (
        <MaterialIcons
          name="radio-button-unchecked"
          size={24}
          color={Colors.light.outline}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
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
  actionBtn: {
    minWidth: 60,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  actionBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },

  // Profile section
  profileSection: { alignItems: "center", marginBottom: Spacing.sm },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.light.surfaceContainerLowest,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surfaceContainerHighest,
    borderWidth: 4,
    borderColor: Colors.light.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  profileName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.onSurface,
    marginTop: Spacing.md,
    letterSpacing: -0.3,
  },
  profileRole: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // Section card
  sectionCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.subtle,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },

  // Fields
  twoCol: { flexDirection: "row", gap: Spacing.sm },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: { borderWidth: 1, borderColor: Colors.light.error },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.error,
  },
  readOnlyBox: {
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  readOnlyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  readOnlyWithTrail: {
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Dropdown
  dropdownTrigger: {
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.subtle,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dropdownItemActive: { backgroundColor: Colors.light.surfaceContainerLow },
  dropdownItemText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  dropdownItemTextActive: {
    fontFamily: FontFamily.bodyMedium,
    color: Colors.light.primary,
  },

  // Document rows
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.light.surfaceContainerHigh,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.light.outlineVariant,
  },
  docIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  docInfo: { flex: 1 },
  docLabel: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurface,
  },
  docValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    marginTop: 2,
  },
  uploadBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  uploadBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onPrimary,
  },

  // Status banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
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

  // Update bar
  updateBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
  },
  updateBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    height: ButtonSize.minHeight + 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    ...Shadow.card,
  },
  updateBtnText: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.bodyMedium,
    color: "#fff",
  },

  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.error,
    borderRadius: Radius.lg,
    height: ButtonSize.minHeight,
    marginTop: Spacing.sm,
  },
  signOutText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.error,
  },
});
