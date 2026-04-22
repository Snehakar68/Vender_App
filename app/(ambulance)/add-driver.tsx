import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  AmbColors,
  AmbRadius,
  AmbShadow,
} from "@/src/features/ambulance/constants/ambulanceTheme";
import TransactionalHeader from "@/src/features/ambulance/components/TransactionalHeader";
import { AuthContext } from "@/src/core/context/AuthContext";
import ActionModal from "@/src/shared/components/ActionModal";

const API_BASE = "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance";

export default function AddDriverScreen() {
  const {
    mode = "add",
    id,
    driverName,
    driverPhone,
    driverLicense,
    driverLicenseExpiry,
    driverPhoto,      // base64 string from API
    driverLicenseDoc, // base64 string from API
    driverAmbulance,
  } = useLocalSearchParams<{
    mode?: string;
    id?: string;
    driverName?: string;
    driverPhone?: string;
    driverLicense?: string;
    driverLicenseExpiry?: string;
    driverPhoto?: string;
    driverLicenseDoc?: string;
    driverAmbulance?: string;
  }>();

  const isView = mode === "view";
  const isEdit = mode === "edit";

  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? "";

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [assignedAmbulance, setAssignedAmbulance] = useState("");

  // photo: uri = newly picked, base64 = loaded from API via params
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  // license doc: same pattern
  const [licenseDocUri, setLicenseDocUri] = useState<string | null>(null);
  const [licenseDocBase64, setLicenseDocBase64] = useState<string | null>(null);
  const [licenseDocMimeType, setLicenseDocMimeType] = useState<string | null>(null);
  const [licenseDocName, setLicenseDocName] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [viewingImageUri, setViewingImageUri] = useState<string | null>(null);

  // ── Prefill from params (mirrors web initialData) ─────────────────────────
  useEffect(() => {
    if ((!isView && !isEdit) || !id) return;
    if (driverName) setName(decodeURIComponent(driverName));
    if (driverPhone) setPhone(decodeURIComponent(driverPhone));
    if (driverLicense) setLicenseNumber(decodeURIComponent(driverLicense));
    if (driverLicenseExpiry) setLicenseExpiry(decodeURIComponent(driverLicenseExpiry));
    if (driverAmbulance) setAssignedAmbulance(decodeURIComponent(driverAmbulance));
    if (driverPhoto) setPhotoBase64(decodeURIComponent(driverPhoto));
    if (driverLicenseDoc) setLicenseDocBase64(decodeURIComponent(driverLicenseDoc));
  }, [id, mode]);

  // ── Image pickers ─────────────────────────────────────────────────────────
  const pickPhoto = async () => {
    if (isView) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(null);
    }
  };

  const pickLicenseDoc = async () => {
    if (isView) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (file.size && file.size > 204800) {
      setErrors(prev => ({ ...prev, licenseDoc: "File must be under 200KB" }));
      return;
    }
    setLicenseDocUri(file.uri);
    setLicenseDocName(file.name);
    setLicenseDocMimeType(file.mimeType ?? "image/jpeg");
    setLicenseDocBase64(null);
  };

  const viewLicenseDoc = async () => {
    if (licenseDocUri) {
      if (licenseDocMimeType === "application/pdf") {
        await Sharing.shareAsync(licenseDocUri, { mimeType: "application/pdf" });
      } else {
        setViewingImageUri(licenseDocUri);
      }
    } else if (licenseDocBase64) {
      setViewingImageUri(`data:image/jpeg;base64,${licenseDocBase64}`);
    }
  };

  const clearError = (key: string) => setErrors(prev => ({ ...prev, [key]: "" }));

  const handleDateChange = (_: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) setLicenseExpiry(date.toISOString().split("T")[0]);
  };

  // ── Validation (mirrors web validate()) ──────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Driver name is required";
    if (!phone.trim()) e.phone = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(phone)) e.phone = "Enter valid 10 digit mobile number";
    if (!licenseNumber.trim()) e.license = "License number required";
    if (!licenseExpiry) e.expiry = "License expiry required";
    if (!isEdit && !photoUri && !photoBase64) e.photo = "Driver photo required";
    if (!isEdit && !licenseDocUri && !licenseDocBase64) e.licenseDoc = "License document required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("vendor_id", vendorId);
      fd.append("driver_name", name.trim());
      fd.append("mobile", phone.trim());
      fd.append("license_no", licenseNumber.trim());
      fd.append("license_expiry", licenseExpiry);

      if (photoUri) {
        fd.append("photo", { uri: photoUri, name: "photo.jpg", type: "image/jpeg" } as any);
      }
      if (licenseDocUri) {
        const ext = licenseDocMimeType === "application/pdf" ? "pdf" : "jpg";
        fd.append("license", { uri: licenseDocUri, name: `license.${ext}`, type: licenseDocMimeType ?? "image/jpeg" } as any);
      }
      if (isEdit && id) {
        fd.append("driver_Id", Number(id) as any);
      }

      const endpoint = isEdit
        ? `${API_BASE}/Update_DriversInfo`
        : `${API_BASE}/ADD_DriversInfo`;

      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Submission failed");

      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const photoSource = photoUri
    ? { uri: photoUri }
    : photoBase64
      ? { uri: `data:image/jpeg;base64,${photoBase64}` }
      : null;

  const hasLicenseDoc = !!(licenseDocUri || licenseDocBase64);
  const licenseDocLabel = licenseDocName
    ?? (licenseDocUri ? licenseDocUri.split("/").pop() : null)
    ?? (licenseDocBase64 ? "Document uploaded" : null);

  const headerTitle = isView ? "View Driver" : isEdit ? "Edit Driver" : "Add Driver";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <TransactionalHeader title={headerTitle} onBack={() => router.back()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isView && (
            <View style={styles.viewModeBanner}>
              <MaterialIcons name="visibility" size={16} color={AmbColors.primary} />
              <Text style={styles.viewModeBannerText}>Read-only view</Text>
            </View>
          )}

          {/* ── Section 1: Personal Information ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={styles.photoCircle}
                onPress={pickPhoto}
                activeOpacity={isView ? 1 : 0.7}
                disabled={isView}
              >
                {photoSource ? (
                  <Image source={photoSource} style={styles.photoImage} />
                ) : (
                  <MaterialIcons name="camera-alt" size={28} color={`${AmbColors.primary}80`} />
                )}
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                {isView ? (photoSource ? "Profile photo" : "No photo") : "Tap to add photo"}
              </Text>
              {errors.photo ? <Text style={styles.errorText}>{errors.photo}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="person" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rahul Singh"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={name}
                  onChangeText={v => { setName(v); clearError("name"); }}
                  autoCapitalize="words"
                  editable={!isView}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="phone" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={phone}
                  onChangeText={v => { setPhone(v); clearError("phone"); }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isView}
                />
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            {/* Assigned ambulance — view only, mirrors web */}
            {isView && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ASSIGNED AMBULANCE</Text>
                <View style={[styles.inputRow, styles.inputDisabled]}>
                  <View style={styles.inputIconBox}>
                    <MaterialIcons name="emergency" size={18} color={AmbColors.primary} />
                  </View>
                  <Text style={[styles.textInput, { paddingTop: 4 }]}>
                    {assignedAmbulance || "Not Assigned"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Section 2: License Information ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>License Information</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>LICENSE NUMBER</Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="badge" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. DL-12345"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={licenseNumber}
                  onChangeText={v => { setLicenseNumber(v); clearError("license"); }}
                  autoCapitalize="characters"
                  editable={!isView}
                />
              </View>
              {errors.license ? <Text style={styles.errorText}>{errors.license}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>LICENSE EXPIRY DATE</Text>
              <TouchableOpacity
                style={[styles.dateRow, isView && styles.inputDisabled]}
                onPress={() => !isView && setShowDatePicker(true)}
                activeOpacity={isView ? 1 : 0.7}
              >
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="calendar-today" size={18} color={AmbColors.primary} />
                </View>
                <Text style={[styles.dateText, !licenseExpiry && styles.datePlaceholder]}>
                  {licenseExpiry || "Select expiry date"}
                </Text>
                {!isView && (
                  <MaterialIcons name="expand-more" size={20} color={AmbColors.outline} style={styles.dateChevron} />
                )}
              </TouchableOpacity>
              {errors.expiry ? <Text style={styles.errorText}>{errors.expiry}</Text> : null}
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  value={licenseExpiry ? new Date(licenseExpiry) : new Date()}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>LICENSE DOCUMENT</Text>
              <TouchableOpacity
                style={[styles.docUploadBox, hasLicenseDoc && styles.docUploadBoxDone]}
                onPress={hasLicenseDoc ? viewLicenseDoc : isView ? undefined : pickLicenseDoc}
                activeOpacity={isView && !hasLicenseDoc ? 1 : 0.7}
                disabled={isView && !hasLicenseDoc}
              >
                {hasLicenseDoc ? (
                  <View style={styles.docUploadedRow}>
                    <MaterialIcons name="check-circle" size={22} color={AmbColors.tertiary} />
                    <Text style={styles.docUploadedName} numberOfLines={1}>
                      {licenseDocLabel}
                    </Text>
                    {!isView && (
                      <TouchableOpacity
                        onPress={pickLicenseDoc}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialIcons name="edit" size={16} color={AmbColors.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.docUploadPlaceholder}>
                    <MaterialIcons name="upload-file" size={28} color={`${AmbColors.outline}60`} />
                    <Text style={styles.docUploadLabel}>
                      {isView ? "No document uploaded" : "Tap to upload (PDF or image, max 200KB)"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.licenseDoc ? <Text style={styles.errorText}>{errors.licenseDoc}</Text> : null}
            </View>
          </View>

          <View style={styles.availabilityCard}>
            <View style={styles.availabilityLeft}>
              <MaterialIcons name="schedule" size={20} color={AmbColors.tertiary} />
              <View>
                <Text style={styles.availabilityTitle}>Availability</Text>
                <Text style={styles.availabilitySub}>
                  {isView ? "Schedule not configured" : "Set working hours after adding driver"}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={`${AmbColors.secondary}66`} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {!isView && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name={isEdit ? "save" : "person-add"} size={20} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Driver"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ActionModal
        visible={showSuccessModal}
        title={isEdit ? "Driver Updated" : "Driver Added Successfully"}
        message={isEdit ? "Driver information has been updated." : "The driver has been added to your fleet."}
        confirmText="OK"
        onConfirm={() => { setShowSuccessModal(false); router.back(); }}
        // onCancel={() => { setShowSuccessModal(false); router.back(); }}
        iconName="check-circle"
      />

      <Modal
        visible={!!viewingImageUri}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingImageUri(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setViewingImageUri(null)}>
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {viewingImageUri && (
            <Image
              source={{ uri: viewingImageUri }}
              style={styles.imageViewerImg}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  viewModeBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: `${AmbColors.primary}10`,
    borderRadius: AmbRadius.md, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  viewModeBannerText: { fontFamily: "Inter_500Medium", fontSize: 13, color: AmbColors.primary },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 4 },
  sectionNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: AmbColors.primary, justifyContent: "center", alignItems: "center" },
  sectionNumberText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#ffffff" },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: AmbColors.onSurface },

  formCard: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl, padding: 20, gap: 18, marginBottom: 20, ...AmbShadow.subtle,
  },

  photoSection: { alignItems: "center", gap: 10 },
  photoCircle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: "dashed",
    borderColor: AmbColors.outlineVariant, justifyContent: "center", alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerLow, overflow: "hidden",
  },
  photoImage: { width: 100, height: 100, borderRadius: 50 },
  photoHint: { fontFamily: "Inter_500Medium", fontSize: 13, color: `${AmbColors.outline}aa` },

  fieldGroup: { gap: 6 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: AmbColors.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 11, color: AmbColors.error, marginTop: 2 },

  inputRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md, height: 50, paddingRight: 14, overflow: "hidden",
  },
  inputDisabled: { backgroundColor: AmbColors.surfaceContainerHighest, opacity: 0.7 },
  inputIconBox: { width: 46, height: 50, justifyContent: "center", alignItems: "center", backgroundColor: `${AmbColors.primary}10` },
  textInput: { flex: 1, paddingLeft: 12, fontFamily: "Inter_400Regular", fontSize: 14, color: AmbColors.onSurface },

  dateRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md, height: 50, overflow: "hidden",
  },
  dateText: { flex: 1, paddingLeft: 12, fontFamily: "Inter_400Regular", fontSize: 14, color: AmbColors.onSurface },
  datePlaceholder: { color: `${AmbColors.outline}80` },
  dateChevron: { marginRight: 12 },

  docUploadBox: {
    borderWidth: 1.5, borderStyle: "dashed", borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md, height: 80, justifyContent: "center", alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerLow,
  },
  docUploadBoxDone: { borderColor: AmbColors.tertiary, borderStyle: "solid", backgroundColor: `${AmbColors.tertiary}08` },
  docUploadedRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  docUploadedName: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13, color: AmbColors.tertiary },
  docUploadPlaceholder: { alignItems: "center", gap: 6 },
  docUploadLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: `${AmbColors.outline}bb` },

  availabilityCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: AmbColors.surfaceContainerLowest, borderRadius: AmbRadius.xl, padding: 18, ...AmbShadow.subtle,
  },
  availabilityLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  availabilityTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: AmbColors.onSurface },
  availabilitySub: { fontFamily: "Inter_400Regular", fontSize: 11, color: AmbColors.secondary, marginTop: 2 },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: AmbColors.surfaceContainerLowest,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, ...AmbShadow.elevated,
  },
  submitBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 10, height: 54, backgroundColor: AmbColors.primary, borderRadius: AmbRadius.md, ...AmbShadow.card,
  },
  submitBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#ffffff" },

  imageViewerOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center",
  },
  imageViewerClose: { position: "absolute", top: 48, right: 20, zIndex: 10, padding: 8 },
  imageViewerImg: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.75,
  },
});
