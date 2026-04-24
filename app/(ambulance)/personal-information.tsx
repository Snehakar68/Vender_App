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
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Switch,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  AmbColors,
  AmbRadius,
  AmbShadow,
} from "@/src/features/ambulance/constants/ambulanceTheme";
import TransactionalHeader from "@/src/features/ambulance/components/TransactionalHeader";
import { AuthContext } from "@/src/core/context/AuthContext";
import { GoogleMapApiKey } from "@/src/utils/Apis";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  ButtonSize,
} from "@/src/shared/constants/theme";

const BASE_URL = "https://coreapi-service-111763741518.asia-south1.run.app";

const GENDER_OPTIONS = [
  { label: "Male", value: "M" },
  { label: "Female", value: "F" },
  { label: "Other", value: "O" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DEFAULT_FORM = {
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
  adhaarNo: "",
  panNo: "",
};

// ✅ FIX 1: Safe base64 → temp file writer with null-guard and string encoding
async function base64ToTempUri(base64: string, filename: string): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error("Cache directory unavailable on this device.");
  const uri = cacheDir + filename;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: "base64" as any, // ✅ avoids FileSystem.EncodingType.Base64 enum crash
  });
  return uri;
}

function InputField({
  label, field, placeholder, keyboardType, maxLength, autoCapitalize, required,
  isEditing, value, onChangeText, error,
}: {
  label: string; field: string; placeholder?: string;
  keyboardType?: any; maxLength?: number; autoCapitalize?: any; required?: boolean;
  isEditing: boolean; value: string; onChangeText: (v: string) => void; error?: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder || label}
          placeholderTextColor={`${AmbColors.outline}70`}
          value={value}
          onChangeText={onChangeText}
          editable={isEditing}
          keyboardType={keyboardType || "default"}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || "sentences"}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function PersonalInformationScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? "";

  const [form, setForm] = useState(DEFAULT_FORM);
  const [backupForm, setBackupForm] = useState(DEFAULT_FORM);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [panUri, setPanUri] = useState<string | null>(null);
  const [panBase64, setPanBase64] = useState<string | null>(null);
  const [panIsPdf, setPanIsPdf] = useState(false);
  const [panMimeType, setPanMimeType] = useState<string | null>(null);
  const [panName, setPanName] = useState<string | null>(null);
  const [adhaarUri, setAdhaarUri] = useState<string | null>(null);
  const [adhaarBase64, setAdhaarBase64] = useState<string | null>(null);
  const [adhaarIsPdf, setAdhaarIsPdf] = useState(false);
  const [adhaarMimeType, setAdhaarMimeType] = useState<string | null>(null);
  const [adhaarName, setAdhaarName] = useState<string | null>(null);
  const [viewingImageUri, setViewingImageUri] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [citySelected, setCitySelected] = useState(false);

  useEffect(() => {
    setCityQuery(form.city);
  }, [form.city]);

  useEffect(() => {
    if (citySelected) return;
    if (!isEditing) return;
    if (cityQuery.length < 2) {
      setCityResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            cityQuery,
          )}&types=(cities)&components=country:in&key=${GoogleMapApiKey}`,
        );
        const data = await res.json();
        setCityResults(data.predictions || []);
      } catch (err) {
        console.log("Autocomplete error:", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [cityQuery, isEditing, citySelected]);

  const fetchPlaceDetails = async (placeId: string) => {
    setCitySelected(true);
    setCityResults([]);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GoogleMapApiKey}&fields=address_component`,
      );
      const data = await res.json();
      const details = data.result;
      let city = "";
      let state = "";
      let pin = "";
      details.address_components.forEach((comp: any) => {
        const types = comp.types;
        if (types.includes("locality")) city = comp.long_name;
        if (!city && types.includes("administrative_area_level_2")) city = comp.long_name;
        if (types.includes("administrative_area_level_1")) state = comp.long_name;
        if (types.includes("postal_code")) pin = comp.long_name;
      });
      setCityQuery(city);
      setForm((prev) => ({ ...prev, city, state, ...(pin ? { pin } : {}) }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.city;
        delete copy.state;
        if (pin?.length === 6) delete copy.pin;
        return copy;
      });
    } catch (err) {
      console.log("Place details error:", err);
    }
  };

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/Ambulance/GetAmbulance_Owner_ById/${vendorId}`)
      .then((r) => r.json())
      .then((data) => {
        const d = data || {};
        const isPdfB64 = (b64 = "") => b64.startsWith("JVBER");
        const docs = d.ambulanceDocs ?? {};
        const mapped = {
          name: d.full_Name ?? "",
          gender: d.gender ?? "",
          dob: d.dob?.split("T")[0] ?? "",
          email: d.email ?? "",
          phone: d.mobile ?? "",
          altPhone: d.mobile_1 ?? "",
          bloodGroup: d.bloodG ?? "",
          addr1: d.adrs_1 ?? "",
          addr2: d.adrs_2 ?? "",
          city: d.city ?? "",
          state: d.state ?? "",
          pin: d.pin_code ?? "",
          adhaarNo: d.adhaarNo ?? "",
          panNo: d.panNo ?? "",
        };
        setForm(mapped);
        setBackupForm(mapped);
        setCityQuery(mapped.city);
        if (docs.photo) setPhotoBase64(docs.photo);
        if (docs.pan) {
          if (isPdfB64(docs.pan)) { setPanIsPdf(true); setPanBase64(docs.pan); }
          else setPanBase64(docs.pan);
        }
        if (docs.adhaar) {
          if (isPdfB64(docs.adhaar)) { setAdhaarIsPdf(true); setAdhaarBase64(docs.adhaar); }
          else setAdhaarBase64(docs.adhaar);
        }
      })
      .catch((e) => console.error("Fetch personal info:", e))
      .finally(() => setLoading(false));
  }, [vendorId]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const setField = (key: keyof typeof DEFAULT_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit mode
      setForm(backupForm);
      setCityQuery(backupForm.city); // Reset query to saved value
      setCitySelected(true); // Mark as not-user-modified to prevent auto-search
      setErrors({});
      setSuccessMsg("");
      setCityResults([]);
      setIsEditing(false);
    } else {
      // Enter edit mode
      setCitySelected(true); // SET THIS FIRST - guard prevents auto-search on edit mode enter
      setBackupForm(form);
      setErrors({});
      setSuccessMsg("");
      setCityQuery(backupForm.city);
      setCityResults([]);
      setIsEditing(true);
    }
  };

  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery permission is required to select a photo");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const info = await FileSystem.getInfoAsync(uri);
        if ((info as any).size > 204800) {
          Alert.alert("File too large", "Only 200KB size allowed");
          return;
        }
        setPhotoUri(uri);
        setPhotoBase64(null);
      }
    } catch {
      Alert.alert("Error", "Could not open gallery");
    }
  };

  const compressPhoto = async (uri: string): Promise<string> => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if ((info as any).size <= 204800) return uri;
      let result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      const info2 = await FileSystem.getInfoAsync(result.uri);
      if ((info2 as any).size <= 204800) return result.uri;
      result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
      );
      return result.uri;
    } catch {
      return uri;
    }
  };

  const pickPhotoFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required to take a photo");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const compressed = await compressPhoto(result.assets[0].uri);
        const info = await FileSystem.getInfoAsync(compressed);
        if ((info as any).size > 204800) {
          Alert.alert("File too large", "Only 200KB size allowed");
          return;
        }
        setPhotoUri(compressed);
        setPhotoBase64(null);
      }
    } catch {
      Alert.alert("Error", "Could not open camera");
    }
  };

  const handlePhotoPress = () => {
    if (!isEditing) return;
    Alert.alert("Profile Photo", "Choose source", [
      { text: "Camera", onPress: pickPhotoFromCamera },
      { text: "Gallery", onPress: pickPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickPanDoc = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (file.size && file.size > 204800) {
      setErrors(prev => ({ ...prev, pan: "File must be under 200KB" }));
      return;
    }
    const isPdf = file.mimeType === "application/pdf";
    setPanUri(file.uri);
    setPanBase64(null);
    setPanIsPdf(isPdf);
    setPanMimeType(file.mimeType ?? "image/jpeg");
    setPanName(file.name);
  };

  const pickAdhaarDoc = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (file.size && file.size > 204800) {
      setErrors(prev => ({ ...prev, adhaar: "File must be under 200KB" }));
      return;
    }
    const isPdf = file.mimeType === "application/pdf";
    setAdhaarUri(file.uri);
    setAdhaarBase64(null);
    setAdhaarIsPdf(isPdf);
    setAdhaarMimeType(file.mimeType ?? "image/jpeg");
    setAdhaarName(file.name);
  };

  const viewAdhaarDoc = async () => {
    if (adhaarUri) {
      if (adhaarIsPdf) {
        try {
          const uri = Platform.OS === "android"
            ? await FileSystem.getContentUriAsync(adhaarUri)
            : adhaarUri;
          await Linking.openURL(uri);
        } catch {
          Alert.alert("Error", "Could not open document");
        }
      } else {
        setViewingImageUri(adhaarUri);
      }
    } else if (adhaarBase64) {
      if (adhaarIsPdf) {
        try {
          const tmpUri = await base64ToTempUri(adhaarBase64, "adhaar_doc.pdf");
          const uri = Platform.OS === "android"
            ? await FileSystem.getContentUriAsync(tmpUri)
            : tmpUri;
          await Linking.openURL(uri);
        } catch {
          Alert.alert("Error", "Could not open document");
        }
      } else {
        setViewingImageUri(`data:image/jpeg;base64,${adhaarBase64}`);
      }
    }
  };

  const viewPanDoc = async () => {
    if (panUri) {
      if (panIsPdf) {
        try {
          const uri = Platform.OS === "android"
            ? await FileSystem.getContentUriAsync(panUri)
            : panUri;
          await Linking.openURL(uri);
        } catch {
          Alert.alert("Error", "Could not open document");
        }
      } else {
        setViewingImageUri(panUri);
      }
    } else if (panBase64) {
      if (panIsPdf) {
        try {
          const tmpUri = await base64ToTempUri(panBase64, "pan_doc.pdf");
          const uri = Platform.OS === "android"
            ? await FileSystem.getContentUriAsync(tmpUri)
            : tmpUri;
          await Linking.openURL(uri);
        } catch {
          Alert.alert("Error", "Could not open document");
        }
      } else {
        setViewingImageUri(`data:image/jpeg;base64,${panBase64}`);
      }
    }
  };

  const handleDobChange = (_: any, date?: Date) => {
    setShowDobPicker(false);
    if (date) setField("dob", date.toISOString().split("T")[0]);
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Full Name is required";
    else if (!/^[A-Za-z\s]+$/.test(form.name)) err.name = "Only alphabets allowed";
    if (!form.gender) err.gender = "Gender is required";
    if (!form.dob) err.dob = "Date of Birth is required";
    if (!form.email) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Invalid email format";
    if (!form.phone) err.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone)) err.phone = "Phone must be 10 digits";
    if (form.altPhone && !/^\d{10}$/.test(form.altPhone)) err.altPhone = "Alt phone must be 10 digits";
    if (!form.addr1.trim()) err.addr1 = "Address Line 1 is required";
    if (!form.city.trim()) err.city = "City is required";
    if (!form.state.trim()) err.state = "State is required";
    if (!form.pin) err.pin = "PIN code is required";
    else if (!/^\d{6}$/.test(form.pin)) err.pin = "PIN must be 6 digits";
    if (!form.adhaarNo) err.adhaarNo = "Aadhaar number required";
    else if (!/^\d{12}$/.test(form.adhaarNo)) err.adhaarNo = "Aadhaar must be 12 digits";
    if (!form.panNo) err.panNo = "PAN number required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo)) err.panNo = "Invalid PAN format (e.g. ABCDE1234F)";
    if (!photoUri && !photoBase64) err.photo = "Profile photo is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!vendorId) {
      Alert.alert("Error", "Vendor ID not found. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("vendor_id", vendorId);
      fd.append("full_name", form.name.trim());
      fd.append("Gender", form.gender);
      fd.append("dob", form.dob);
      fd.append("email", form.email.trim());
      fd.append("mobile", form.phone);
      fd.append("mobile_1", form.altPhone || form.phone);
      fd.append("BloodG", form.bloodGroup || "O+");
      fd.append("adrs_1", form.addr1.trim());
      fd.append("adrs_2", form.addr2.trim() || "NA");
      fd.append("City", form.city.trim());
      fd.append("State", form.state.trim());
      fd.append("pin_code", form.pin);
      fd.append("adhaarNo", form.adhaarNo);
      fd.append("panNo", form.panNo);

      // ✅ FIX 3: For base64 images from API, write to temp file safely
      // Photo
      // if (photoUri) {
      //   fd.append("photo", { uri: photoUri, name: "photo.jpg", type: "image/jpeg" } as any);
      // } else if (photoBase64) {
      //   const tmpUri = await base64ToTempUri(photoBase64, "photo.jpg");
      //   fd.append("photo", { uri: tmpUri, name: "photo.jpg", type: "image/jpeg" } as any);
      // }

      // // Aadhaar doc
      // if (adhaarUri) {
      //   fd.append("adhaar", { uri: adhaarUri, name: "adhaar.jpg", type: "image/jpeg" } as any);
      // } else if (adhaarBase64) {
      //   const tmpUri = await base64ToTempUri(adhaarBase64, "adhaar.jpg");
      //   fd.append("adhaar", { uri: tmpUri, name: "adhaar.jpg", type: "image/jpeg" } as any);
      // }

      // // PAN doc
      // if (panUri) {
      //   fd.append("pan", { uri: panUri, name: "pan.jpg", type: "image/jpeg" } as any);
      // } else if (panBase64) {
      //   const tmpUri = await base64ToTempUri(panBase64, "pan.jpg");
      //   fd.append("pan", { uri: tmpUri, name: "pan.jpg", type: "image/jpeg" } as any);
      // }
      // Photo
if (photoUri) {
  fd.append("photo", { uri: photoUri, name: "photo.jpg", type: "image/jpeg" } as any);
}

// Aadhaar doc
if (adhaarUri) {
  const adhaarExt = adhaarMimeType === "application/pdf" ? "pdf" : "jpg";
  fd.append("adhaar", { uri: adhaarUri, name: adhaarName ?? `adhaar.${adhaarExt}`, type: adhaarMimeType ?? "image/jpeg" } as any);
}

// PAN doc
if (panUri) {
  const panExt = panMimeType === "application/pdf" ? "pdf" : "jpg";
  fd.append("pan", { uri: panUri, name: panName ?? `pan.${panExt}`, type: panMimeType ?? "image/jpeg" } as any);
}

      const res = await fetch(
        `${BASE_URL}/api/Ambulance/UpdateAmbulance_Owner_Info`,
        { method: "POST", body: fd },
      );
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || "Update failed");

      setSuccessMsg(data?.message || "Personal information updated successfully");
      setBackupForm(form);
      setIsEditing(false);
    } catch (e: any) {
      console.error("Update error:", e);
      Alert.alert("Update Failed", e.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const photoSource = photoUri
    ? { uri: photoUri }
    : photoBase64
      ? { uri: `data:image/jpeg;base64,${photoBase64}` }
      : null;

  const initials = form.name.trim()
    ? form.name.trim().split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "PI";

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <TransactionalHeader title="Personal Information" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AmbColors.primary} />
          <Text style={styles.loadingText}>Loading information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <TransactionalHeader
        title="Personal Information"
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={handleEditToggle}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isEditing ? 'close' : 'edit'}
              size={14}
              color={isEditing ? AmbColors.error : AmbColors.primary}
            />
            {/* <Text style={[styles.editBtnText, isEditing && styles.editBtnTextActive]}>
              {isEditing ? "Cancel" : "Edit"}
            </Text> */}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!!successMsg && (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={16} color={AmbColors.tertiary} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* ── Profile Hero ── */}
          <View style={styles.heroCard}>
            <TouchableOpacity
              style={styles.photoCircle}
              onPress={isEditing ? handlePhotoPress : undefined}
              activeOpacity={isEditing ? 0.8 : 1}
            >
              {photoSource ? (
                <Image source={photoSource} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoInitials}>{initials}</Text>
              )}
              {isEditing && (
                <View style={styles.photoBadge}>
                  <MaterialIcons name="camera-alt" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {errors.photo ? <Text style={[styles.errorText, { marginTop: 4 }]}>{errors.photo}</Text> : null}
            <Text style={styles.heroName}>{form.name || "Ambulance Owner"}</Text>
            <Text style={styles.heroId}>ID: {vendorId || "—"}</Text>
          </View>

          {/* ── Basic Details ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Basic Details</Text>
            </View>
            <InputField label="Full Name" field="name" placeholder="Alex Thompson" required isEditing={isEditing} value={form.name} onChangeText={(v) => setField("name", v)} error={errors.name} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>GENDER <Text style={styles.required}>*</Text></Text>
              <View style={styles.chipRow}>
                {GENDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optChip, form.gender === opt.value && styles.optChipActive]}
                    onPress={() => isEditing && setField("gender", opt.value)}
                    activeOpacity={isEditing ? 0.8 : 1}
                    disabled={!isEditing}
                  >
                    <Text style={[styles.optChipText, form.gender === opt.value && styles.optChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DATE OF BIRTH <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.dateRow, !isEditing && styles.inputDisabled]}
                onPress={() => isEditing && setShowDobPicker(true)}
                activeOpacity={isEditing ? 0.8 : 1}
              >
                <MaterialIcons name="cake" size={18} color={AmbColors.outline} />
                <Text style={[styles.dateText, !form.dob && styles.datePlaceholder]}>
                  {form.dob || "Select date"}
                </Text>
                {isEditing && <MaterialIcons name="calendar-today" size={16} color={AmbColors.outline} />}
              </TouchableOpacity>
              {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
              {showDobPicker && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  value={form.dob ? new Date(form.dob) : new Date()}
                  onChange={handleDobChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>BLOOD GROUP</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {BLOOD_GROUPS.map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[styles.bloodChip, form.bloodGroup === bg && styles.bloodChipActive]}
                      onPress={() => isEditing && setField("bloodGroup", bg)}
                      activeOpacity={isEditing ? 0.8 : 1}
                      disabled={!isEditing}
                    >
                      <Text style={[styles.bloodChipText, form.bloodGroup === bg && styles.bloodChipTextActive]}>
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* ── Contact Information ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-phone" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <InputField label="Email Address" field="email" placeholder="alex@example.com" keyboardType="email-address" autoCapitalize="none" required isEditing={isEditing} value={form.email} onChangeText={(v) => setField("email", v)} error={errors.email} />
            <InputField label="Phone Number" field="phone" placeholder="+91 88765 43210" keyboardType="phone-pad" maxLength={10} required isEditing={isEditing} value={form.phone} onChangeText={(v) => setField("phone", v)} error={errors.phone} />
            <InputField label="Alt Phone Number" field="altPhone" placeholder="+91 88765 43211" keyboardType="phone-pad" maxLength={10} isEditing={isEditing} value={form.altPhone} onChangeText={(v) => setField("altPhone", v)} error={errors.altPhone} />
          </View>

          {/* ── Residential Address ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Residential Address</Text>
            </View>
            <InputField label="Address Line 1" field="addr1" placeholder="42, Emerald Heights Residency" required isEditing={isEditing} value={form.addr1} onChangeText={(v) => setField("addr1", v)} error={errors.addr1} />
            <InputField label="Address Line 2" field="addr2" placeholder="Near Central Park, Sector 15" isEditing={isEditing} value={form.addr2} onChangeText={(v) => setField("addr2", v)} error={errors.addr2} />

            <View style={{ zIndex: 9999 }}>
              <View style={fieldStyles.labelRow}>
                <Text style={fieldStyles.label}>City</Text>
                <Text style={fieldStyles.requiredStar}>*</Text>
              </View>
              {isEditing ? (
                <>
                  <TextInput
                    style={[fieldStyles.input, errors.city ? fieldStyles.inputError : null]}
                    value={cityQuery}
                    placeholder="Type city name"
                    placeholderTextColor={Colors.light.outline}
                    onChangeText={(text) => {
                      setCitySelected(false);
                      setCityQuery(text);
                      setForm((p) => ({ ...p, city: text }));
                    }}
                  />
                  {errors.city && <Text style={fieldStyles.errorText}>{errors.city}</Text>}
                  {cityResults.length > 0 && (
                    <View style={styles.cityDropdown}>
                      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                        {cityResults.map((item) => (
                          <TouchableOpacity
                            key={item.place_id}
                            style={styles.cityDropdownItem}
                            onPress={() => fetchPlaceDetails(item.place_id)}
                          >
                            <MaterialIcons name="location-on" size={14} color={Colors.light.outline} style={{ marginRight: 6, marginTop: 1 }} />
                            <Text style={styles.cityDropdownText} numberOfLines={1}>{item.description}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              ) : (
                <Text style={fieldStyles.valueText}>{form.city || "—"}</Text>
              )}
            </View>

            <View style={fieldStyles.wrap}>
              <View style={fieldStyles.labelRow}>
                <Text style={fieldStyles.label}>State</Text>
                <Text style={fieldStyles.requiredStar}>*</Text>
              </View>
              <TextInput
                value={form.state}
                editable={false}
                placeholder="Auto-filled from city"
                placeholderTextColor={Colors.light.outline}
                style={[fieldStyles.input, { backgroundColor: "#E5E7EB" }]}
              />
              {errors.state && <Text style={fieldStyles.errorText}>{errors.state}</Text>}
            </View>

            <View style={fieldStyles.wrap}>
              <View style={fieldStyles.labelRow}>
                <Text style={fieldStyles.label}>PIN Code</Text>
                <Text style={fieldStyles.requiredStar}>*</Text>
              </View>
              {isEditing ? (
                <TextInput
                  value={form.pin}
                  keyboardType="number-pad"
                  placeholder="Enter PIN"
                  placeholderTextColor={Colors.light.outline}
                  maxLength={6}
                  style={[fieldStyles.input, errors.pin ? fieldStyles.inputError : null]}
                  onChangeText={(text) => {
                    const value = text.replace(/[^0-9]/g, "").slice(0, 6);
                    setForm((p) => ({ ...p, pin: value }));
                    if (value.length === 6) setErrors((prev) => { const copy = { ...prev }; delete copy.pin; return copy; });
                  }}
                />
              ) : (
                <Text style={fieldStyles.valueText}>{form.pin || "—"}</Text>
              )}
              {errors.pin && <Text style={fieldStyles.errorText}>{errors.pin}</Text>}
            </View>
          </View>

          {/* ── Identity Documents ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="badge" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Identity Documents</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>AADHAAR NUMBER <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="XXXX XXXX XXXX"
                  placeholderTextColor={`${AmbColors.outline}70`}
                  value={form.adhaarNo}
                  onChangeText={(v) => setField("adhaarNo", v.replace(/\D/g, "").slice(0, 12))}
                  editable={isEditing}
                  keyboardType="numeric"
                  maxLength={12}
                />
              </View>
              {errors.adhaarNo ? <Text style={styles.errorText}>{errors.adhaarNo}</Text> : null}
            </View>

            <DocUploadBox label="Aadhaar Document" uri={adhaarUri} base64={adhaarBase64} isPdf={adhaarIsPdf} isEditing={isEditing} onPick={pickAdhaarDoc} onView={viewAdhaarDoc} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PAN NUMBER <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="ABCDE 1234 F"
                  placeholderTextColor={`${AmbColors.outline}70`}
                  value={form.panNo}
                  onChangeText={(v) => setField("panNo", v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                  editable={isEditing}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
              {errors.panNo ? <Text style={styles.errorText}>{errors.panNo}</Text> : null}
            </View>

            <DocUploadBox label="PAN Document" uri={panUri} base64={panBase64} isPdf={panIsPdf} isEditing={isEditing} onPick={pickPanDoc} onView={viewPanDoc} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="check-circle" size={20} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </View>
      )}

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

// ─── Doc Upload Box ───────────────────────────────────────────────────────────

function DocUploadBox({
  label, uri, base64, isPdf, isEditing, onPick, onView,
}: {
  label: string; uri: string | null; base64: string | null;
  isPdf: boolean; isEditing: boolean; onPick: () => void; onView?: () => void;
}) {
  const hasDoc = !!(uri || base64 || isPdf);
  const imageSource = (!isPdf && uri)
    ? { uri }
    : (!isPdf && base64)
      ? { uri: `data:image/jpeg;base64,${base64}` }
      : null;

  const handlePress = () => {
    if (hasDoc && !isEditing && onView) { onView(); }
    else if (isEditing) { onPick(); }
  };

  return (
    <TouchableOpacity
      style={[styles.docBox, hasDoc && styles.docBoxDone]}
      onPress={handlePress}
      activeOpacity={(isEditing || (hasDoc && onView)) ? 0.8 : 1}
      disabled={!isEditing && !(hasDoc && onView)}
    >
      {hasDoc ? (
        imageSource ? (
          <Image source={imageSource} style={styles.docThumb} resizeMode="cover" />
        ) : (
          <View style={styles.docPdfBadge}>
            <MaterialIcons name="picture-as-pdf" size={28} color={AmbColors.error} />
            <Text style={styles.docPdfText}>PDF Uploaded</Text>
          </View>
        )
      ) : (
        <View style={styles.docPlaceholder}>
          <MaterialIcons name="upload-file" size={28} color={`${AmbColors.outline}60`} />
          <Text style={styles.docPlaceholderText}>{isEditing ? `Upload ${label}` : `No ${label}`}</Text>
        </View>
      )}
      <View style={styles.docLabelRow}>
        <Text style={styles.docLabel}>{label}</Text>
        {hasDoc && <MaterialIcons name="check-circle" size={14} color={AmbColors.tertiary} />}
        {isEditing && !hasDoc && <MaterialIcons name="add" size={14} color={AmbColors.outline} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.sm },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 4 },
  label: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelMedium, color: Colors.light.onSurfaceVariant },
  requiredStar: { color: Colors.light.error, fontSize: FontSize.labelMedium, fontFamily: FontFamily.bodyMedium },
  errorText: { color: Colors.light.error, fontSize: FontSize.labelSmall, fontFamily: FontFamily.body, marginTop: 4 },
  input: {
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  inputError: { borderWidth: 1, borderColor: Colors.light.error },
  valueText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface, paddingVertical: 6 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14, color: AmbColors.secondary },

  successBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: `${AmbColors.tertiary}12`, borderWidth: 1,
    borderColor: `${AmbColors.tertiary}30`, borderRadius: AmbRadius.md,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
  },
  successText: { fontFamily: "Inter_500Medium", fontSize: 13, color: AmbColors.tertiary, flex: 1 },

  cityDropdown: {
    position: "absolute", top: 52, left: 0, right: 0,
    backgroundColor: "#fff", borderRadius: Radius.lg,
    elevation: 10, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, zIndex: 9999,
  },
  cityDropdownItem: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.light.outlineVariant,
  },
  cityDropdownText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurface },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: AmbRadius.pill,
    backgroundColor: `${AmbColors.primary}15`,
  },
  editBtnActive: { backgroundColor: `${AmbColors.error}15` },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: AmbColors.primary },
  editBtnTextActive: { color: AmbColors.error },

  heroCard: {
    backgroundColor: AmbColors.surfaceContainerLowest, borderRadius: AmbRadius.xl,
    padding: 24, marginBottom: 14, alignItems: "center", gap: 6, ...AmbShadow.subtle,
  },
  photoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: AmbColors.primaryFixed,
    justifyContent: "center", alignItems: "center",
    marginBottom: 4, overflow: "hidden",
    borderWidth: 3, borderColor: AmbColors.surfaceContainerLow, ...AmbShadow.card,
  },
  photoImage: { width: 100, height: 100 },
  photoInitials: { fontFamily: "Inter_600SemiBold", fontSize: 32, color: AmbColors.primary },
  photoBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: AmbColors.primary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  heroName: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: AmbColors.onSurface },
  heroId: { fontFamily: "Inter_400Regular", fontSize: 12, color: AmbColors.secondary },

  section: {
    backgroundColor: AmbColors.surfaceContainerLowest, borderRadius: AmbRadius.xl,
    padding: 20, marginBottom: 14, gap: 14, ...AmbShadow.subtle,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: AmbColors.onSurface },

  fieldGroup: { gap: 6 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: AmbColors.onSurfaceVariant, letterSpacing: 1, textTransform: "uppercase" },
  required: { color: AmbColors.error },
  inputWrapper: { backgroundColor: AmbColors.surfaceContainerLow, borderRadius: AmbRadius.md, height: 50, justifyContent: "center", paddingHorizontal: 14 },
  inputDisabled: { backgroundColor: AmbColors.surfaceContainerHighest, opacity: 0.75 },
  textInput: { fontFamily: "Inter_400Regular", fontSize: 14, color: AmbColors.onSurface },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 11, color: AmbColors.error },

  dateRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: AmbColors.surfaceContainerLow, borderRadius: AmbRadius.md,
    height: 50, paddingHorizontal: 14,
  },
  dateText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: AmbColors.onSurface },
  datePlaceholder: { color: `${AmbColors.outline}70` },

  rowFields: { flexDirection: "row", gap: 10 },

  chipRow: { flexDirection: "row", gap: 8 },
  optChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: AmbRadius.pill, backgroundColor: AmbColors.surfaceContainerLow, borderWidth: 1, borderColor: AmbColors.outlineVariant },
  optChipActive: { backgroundColor: AmbColors.primary, borderColor: AmbColors.primary },
  optChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: AmbColors.onSurfaceVariant },
  optChipTextActive: { color: "#fff" },

  bloodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: AmbRadius.pill, backgroundColor: AmbColors.surfaceContainerLow, borderWidth: 1, borderColor: AmbColors.outlineVariant },
  bloodChipActive: { backgroundColor: AmbColors.primaryContainer, borderColor: AmbColors.primaryContainer },
  bloodChipText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: AmbColors.onSurfaceVariant },
  bloodChipTextActive: { color: "#fff" },

  docBox: { borderWidth: 1.5, borderStyle: "dashed", borderColor: AmbColors.outlineVariant, borderRadius: AmbRadius.md, overflow: "hidden", backgroundColor: AmbColors.surfaceContainerLow, minHeight: 120 },
  docBoxDone: { borderStyle: "solid", borderColor: AmbColors.tertiary, backgroundColor: `${AmbColors.tertiary}08` },
  docThumb: { width: "100%", height: 100 },
  docPdfBadge: { height: 90, justifyContent: "center", alignItems: "center", gap: 6 },
  docPdfText: { fontFamily: "Inter_500Medium", fontSize: 12, color: AmbColors.error },
  docPlaceholder: { height: 90, justifyContent: "center", alignItems: "center", gap: 6 },
  docPlaceholderText: { fontFamily: "Inter_500Medium", fontSize: 12, color: `${AmbColors.outline}80` },
  docLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: AmbColors.surfaceContainerHigh },
  docLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: AmbColors.onSurfaceVariant },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: AmbColors.surfaceContainerLowest,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, ...AmbShadow.elevated,
  },
  submitBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, height: 54, backgroundColor: AmbColors.primary, borderRadius: AmbRadius.md, ...AmbShadow.card },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#ffffff" },

  imageViewerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" },
  imageViewerClose: { position: "absolute", top: 48, right: 20, zIndex: 10, padding: 8 },
  imageViewerImg: { width: Dimensions.get("window").width, height: Dimensions.get("window").height * 0.75 },
});
