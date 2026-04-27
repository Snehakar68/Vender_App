import React, { useState, useEffect, useContext, useRef } from "react";
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
  Modal,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import GoogleMapPicker from "@/src/shared/components/GoogleMapPicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/src/core/context/AuthContext";
import api from "@/src/core/api/apiClient";
import { GoogleMapApiKey } from "@/src/utils/Apis";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
export const HOSPITAL_PROFILE_KEY = "@jhilmil/hospital_profile";
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
  validatePersonalDetails,
  ValidationErrors,
  PersonalFormState,
} from "@/src/shared/utils/validation";
import ActionModal from "@/src/shared/components/ActionModal";

const MIN_IMAGES = 3;
const MAX_IMAGE_BYTES = 200 * 1024; // 200 KB

const EMPTY_FORM: PersonalFormState = {
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

  const [form, setForm] = useState<PersonalFormState>(EMPTY_FORM);
  const [originalForm, setOriginalForm] =
    useState<PersonalFormState>(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [viewingImageUri, setViewingImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ── City autocomplete state ──────────────────────────────────────────────
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [citySelected, setCitySelected] = useState(false);

  useEffect(() => {
    setCityQuery(form.city);
  }, [form.city]);

  // ── Google Places Autocomplete ───────────────────────────────────────────
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
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(cityQuery)}&types=(cities)&components=country:in&key=${GoogleMapApiKey}`,
        );
        const data = await res.json();
        setCityResults(data.predictions || []);
      } catch (err) {
        console.log("Autocomplete error:", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [cityQuery, isEditing]);

  const fetchPlaceDetails = async (placeId: string) => {
    setCitySelected(true);
    setCityResults([]);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GoogleMapApiKey}&fields=address_component`,
      );
      const data = await res.json();
      const details = data.result;
      let city = "",
        state = "",
        pin = "";
      details.address_components.forEach((comp: any) => {
        const types = comp.types;
        if (types.includes("locality")) city = comp.long_name;
        if (!city && types.includes("administrative_area_level_2"))
          city = comp.long_name;
        if (types.includes("administrative_area_level_1"))
          state = comp.long_name;
        if (types.includes("postal_code")) pin = comp.long_name;
      });
      setCityQuery(city);
      setForm((prev) => ({
        ...prev,
        city,
        state,
        ...(pin ? { pinCode: pin } : {}),
      }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.city;
        delete copy.state;
        if (pin?.length === 6) delete copy.pinCode;
        return copy;
      });
    } catch (err) {
      console.log("Place details error:", err);
    }
  };

  // ── Data loading ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (vendorId) loadProfile();
  }, [vendorId]);

  const loadProfile = async () => {
    try {
      const res = await api.get(
        `/api/Hospital/GetHosPersonnelInfoById/${vendorId}`,
      );
      const apiData = res.data?.data?.hospital;
      const loaded: PersonalFormState = {
        hospitalName: apiData?.full_name ?? "",
        addressLine1: apiData?.adrs_1 ?? "",
        addressLine2: apiData?.adrs_2 ?? "",
        city: apiData?.city ?? "",
        state: apiData?.state ?? "",
        pinCode: apiData?.pin_code ?? "",
        email: apiData?.email ?? "",
        mobile: apiData?.mobile ?? "",
        altMobile: apiData?.mobile_1 ?? "",
        landline: apiData?.ph_L ?? "",
        aboutUs: apiData?.summary ?? "",
        latitude: apiData?.latitude ?? "",
        longitude: apiData?.longitude ?? "",
      };
      setForm(loaded);
      setOriginalForm(loaded);
      setCityQuery(loaded.city);

      const rawPhotos: any[] = Array.isArray(res.data?.data?.photos)
        ? res.data.data.photos
        : [];

      const apiImages = rawPhotos
        .filter(Boolean)
        .map((img: any) => {
          if (typeof img === "string") {
            return img.startsWith("data:")
              ? img
              : `data:image/jpeg;base64,${img}`;
          }
          return null;
        })
        .filter(Boolean) as string[];

      setImages(apiImages);
      setOriginalImages(apiImages);

      const profileImage: string | null = apiImages[0] ?? null;
      await AsyncStorage.setItem(
        HOSPITAL_PROFILE_KEY,
        JSON.stringify({ hospitalName: loaded.hospitalName, profileImage }),
      );
    } catch (e) {
      console.log("Profile fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  function update(key: keyof PersonalFormState, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
  }

  function showStatus(text: string, ok: boolean) {
    setStatusMsg({ text, ok });
    setTimeout(() => setStatusMsg(null), 3000);
  }

  function handleEdit() {
    setOriginalForm(form);
    setOriginalImages(images);
    setErrors({});
    setCitySelected(false);
    setCityResults([]);
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(originalForm);
    setImages(originalImages);
    setErrors({});
    setCityQuery(originalForm.city);
    setCitySelected(false);
    setCityResults([]);
    setIsEditing(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ FIX — IMAGE COMPRESSION
  //
  // Compress image down to ≤200KB with up to 3 passes.
  // Returns the compressed URI, or null if it cannot fit under the limit.
  // ─────────────────────────────────────────────────────────────────────────
  const compressToLimit = async (uri: string): Promise<string | null> => {
    try {
      let current = uri;
      const widths = [1200, 900, 700, 500];
      const qualities = [0.8, 0.65, 0.5, 0.35];

      for (let i = 0; i < widths.length; i++) {
        const info = await FileSystem.getInfoAsync(current);
        if ((info as any).size <= MAX_IMAGE_BYTES) return current;

        const result = await ImageManipulator.manipulateAsync(
          uri, // always start from original to avoid quality compounding
          [{ resize: { width: widths[i] } }],
          { compress: qualities[i], format: ImageManipulator.SaveFormat.JPEG },
        );
        current = result.uri;
      }

      // Final check
      const finalInfo = await FileSystem.getInfoAsync(current);
      return (finalInfo as any).size <= MAX_IMAGE_BYTES ? current : null;
    } catch {
      return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ FIX — IMAGE SLOT HANDLERS
  //
  // ROOT CAUSE OF BOTH BUGS:
  //
  // OLD CODE called pickPhotoFromCamera() / pickPhoto() which wrote into
  // photoUri / photoBase64 state — completely separate from the images[]
  // array that the grid renders from. So:
  //   - Camera: triggered a state update that caused a re-render/crash
  //     because the state write had no index and wasn't connected to the grid.
  //   - Gallery: photo was stored in photoUri but never appeared in images[],
  //     so the slot stayed blank.
  //
  // FIX: Both functions now accept an `index` parameter and write directly
  // into images[] at that position. This is the ONLY state that the grid
  // reads from.
  //
  // Both functions also validate the 200KB limit AFTER compression and show
  // a user-friendly Alert if the image is still too large.
  // ─────────────────────────────────────────────────────────────────────────
  const pickImageFromCamera = async (index: number) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Camera permission is required to take a photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1, // capture at full quality — compression happens below
      });

      if (result.canceled) return;

      const raw = result.assets[0].uri;
      const compressed = await compressToLimit(raw);

      if (!compressed) {
        // ✅ Validation: image still too large after all compression passes
        Alert.alert(
          "Image Too Large",
          "The photo exceeds the 200KB limit even after compression. Please choose a different photo or reduce the image resolution in your camera settings.",
          [{ text: "OK" }],
        );
        return;
      }

      // ✅ Write into images[] at the correct slot index
      setImages((prev) => {
        const updated = [...prev];
        updated[index] = compressed;
        return updated;
      });
      if (errors.images)
        setErrors((prev) => {
          const n = { ...prev };
          delete n.images;
          return n;
        });
    } catch (e) {
      console.error("[pickImageFromCamera]", e);
      Alert.alert("Error", "Could not open camera. Please try again.");
    }
  };

  const pickImageFromGallery = async (index: number) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Gallery permission is required to select a photo.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1, // pick at full quality — compression happens below
      });

      if (result.canceled) return;

      const raw = result.assets[0].uri;
      const compressed = await compressToLimit(raw);

      if (!compressed) {
        // ✅ Validation: image too large even after compression
        Alert.alert(
          "Image Too Large",
          "The selected photo exceeds the 200KB limit even after compression. Please choose a smaller image.",
          [{ text: "OK" }],
        );
        return;
      }

      // ✅ Write into images[] at the correct slot index
      setImages((prev) => {
        const updated = [...prev];
        updated[index] = compressed;
        return updated;
      });
      if (errors.images)
        setErrors((prev) => {
          const n = { ...prev };
          delete n.images;
          return n;
        });
    } catch (e) {
      console.error("[pickImageFromGallery]", e);
      Alert.alert("Error", "Could not open gallery. Please try again.");
    }
  };

  // ✅ FIX — Prompt that passes the slot index to the correct picker
  const promptImageSource = (index: number) => {
    Alert.alert("Add Hospital Photo", "Choose source", [
      { text: "Camera", onPress: () => pickImageFromCamera(index) },
      { text: "Gallery", onPress: () => pickImageFromGallery(index) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // const handleUpdate = async () => {
  //   const validationErrors = validatePersonalDetails(form, images.length);
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors as Record<string, string>);
  //     return;
  //   }
  //   setSaving(true);
  //   const tempFiles: string[] = [];
  //   try {
  //     const fd = new FormData();
  //     fd.append("vendor_id", vendorId as string);
  //     fd.append("full_name", form.hospitalName);
  //     fd.append("email", form.email);
  //     fd.append("mobile", form.mobile);
  //     fd.append("mobile_1", form.altMobile || "");
  //     fd.append("Ph_L", form.landline || "");
  //     fd.append("adrs_1", form.addressLine1);
  //     fd.append("adrs_2", form.addressLine2 || "");
  //     fd.append("City", form.city);
  //     fd.append("State", form.state);
  //     fd.append("pin_code", form.pinCode);
  //     fd.append("Summary", form.aboutUs || "test");
  //     fd.append("Latitude", String(Number(form.latitude)));
  //     fd.append("Longitude", String(Number(form.longitude)));

  //     for (let i = 0; i < images.length; i++) {
  //       const uri = images[i];
  //       if (uri.startsWith("file://") || uri.startsWith("content://")) {
  //         const filename = uri.split("/").pop() ?? `image_${i}.jpg`;
  //         (fd as any).append("images", { uri, name: filename, type: "image/jpeg" });
  //       } else if (uri.startsWith("data:")) {
  //         // Existing API image stored as base64 — write to a temp file so it
  //         // can be included in the multipart upload. Without this the server
  //         // receives no images and wipes them on every save.
  //         const base64 = uri.split(",")[1];
  //         const tempPath = `${FileSystem.cacheDirectory}hosp_img_${i}_${Date.now()}.jpg`;
  //         await FileSystem.writeAsStringAsync(tempPath, base64, {
  //           encoding: FileSystem.EncodingType.Base64,
  //         });
  //         tempFiles.push(tempPath);
  //         (fd as any).append("images", { uri: tempPath, name: `image_${i}.jpg`, type: "image/jpeg" });
  //       }
  //     }

  //     const response = await fetch(
  //       "https://coreapi-service-111763741518.asia-south1.run.app/api/Hospital/UpdateHosPersonnelInfo",
  //       {
  //         method: "PUT",
  //         headers: { Authorization: `Bearer ${auth?.user?.token}` },
  //         body: fd,
  //       },
  //     );
  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data?.message || "Update failed");

  //     setOriginalForm(form);
  //     setOriginalImages(images);
  //     setIsEditing(false);
  //     setShowSuccessModal(true);
  //   } catch (e: any) {
  //     console.log("❌ ERROR:", e);
  //     showStatus("Failed to save. Please try again.", false);
  //   } finally {
  //     setSaving(false);
  //     tempFiles.forEach((p) => FileSystem.deleteAsync(p, { idempotent: true }).catch(() => {}));
  //   }
  // };
  const handleUpdate = async () => {
    const validationErrors = validatePersonalDetails(form, images.length);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors as Record<string, string>);
      return;
    }

    setSaving(true);
    const tempFiles: string[] = [];

    try {
      const fd = new FormData();

      // Text fields
      fd.append("vendor_id", vendorId as string);
      fd.append("full_name", form.hospitalName);
      fd.append("email", form.email);
      fd.append("mobile", form.mobile);
      fd.append("mobile_1", form.altMobile || "");
      fd.append("Ph_L", form.landline || "");
      fd.append("adrs_1", form.addressLine1);
      fd.append("adrs_2", form.addressLine2 || "");
      fd.append("City", form.city);
      fd.append("State", form.state);
      fd.append("pin_code", form.pinCode);
      fd.append("Summary", form.aboutUs || "");
      fd.append("Latitude", String(Number(form.latitude) || 0));
      fd.append("Longitude", String(Number(form.longitude) || 0));

      // ── CRITICAL FIX: Multiple Images with Array Notation ──
      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        if (!uri) continue;

        let fileUri: string = uri;
        const fileName = `hospital_image_${Date.now()}_${i}.jpg`;

        if (uri.startsWith("data:")) {
          // Old base64 image from API
          const base64 = uri.split(",")[1];
          const tempPath = `${FileSystem.cacheDirectory}hosp_img_${i}_${Date.now()}.jpg`;

          await FileSystem.writeAsStringAsync(tempPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          tempFiles.push(tempPath);
          fileUri = tempPath;
        }
        // New images (file:// from compression) are used directly

        // Use array-style key: "images[]" or "images[0]", "images[1]" — most backends accept this
        (fd as any).append(`images[${i}]`, {
          uri: fileUri,
          name: fileName,
          type: "image/jpeg",
        });
      }

      const response = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Hospital/UpdateHosPersonnelInfo",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${auth?.user?.token}`,
            // IMPORTANT: Do NOT manually set Content-Type
          },
          body: fd,
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Server error:", errText);
        throw new Error(`Update failed: ${response.status}`);
      }

      const data = await response.json();

      // ── FORCE REFRESH FROM SERVER (critical) ──
      await loadProfile();

      setOriginalForm({ ...form });
      setOriginalImages([...images]);
      setIsEditing(false);
      setShowSuccessModal(true);
    } catch (e: any) {
      console.error("Update error:", e);
      showStatus("Failed to update profile. Please try again.", false);
    } finally {
      setSaving(false);

      // Cleanup temp files
      tempFiles.forEach((path) => {
        FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
      });
    }
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  const imageSlots = Math.max(images.length, MIN_IMAGES);

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
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.editBtnText, { color: Colors.light.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtnText}>Edit</Text>
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
          nestedScrollEnabled
        >
          {/* BASIC INFORMATION */}
          <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
          <View style={[styles.section, { zIndex: 9999 }]}>
            <InputField
              label="Hospital Name"
              value={form.hospitalName}
              onChangeText={(v) => update("hospitalName", v)}
              editable={isEditing}
              required
              error={errors.hospitalName}
            />
            <InputField
              label="Address Line 1"
              value={form.addressLine1}
              onChangeText={(v) => update("addressLine1", v)}
              editable={isEditing}
              required
              error={errors.addressLine1}
            />
            <InputField
              label="Address Line 2"
              value={form.addressLine2}
              onChangeText={(v) => update("addressLine2", v)}
              editable={isEditing}
            />

            {/* City */}
            <View style={{ zIndex: 9999 }}>
              <View style={fieldStyles.labelRow}>
                <Text style={fieldStyles.label}>City</Text>
                <Text style={fieldStyles.requiredStar}>*</Text>
              </View>
              {isEditing ? (
                <>
                  <TextInput
                    style={[
                      fieldStyles.input,
                      errors.city ? fieldStyles.inputError : null,
                    ]}
                    value={cityQuery}
                    placeholder="Type city name"
                    placeholderTextColor={Colors.light.outline}
                    onChangeText={(text) => {
                      setCitySelected(false);
                      setCityQuery(text);
                      setForm((p) => ({ ...p, city: text }));
                    }}
                  />
                  {errors.city && (
                    <Text style={fieldStyles.errorText}>{errors.city}</Text>
                  )}
                  {cityResults.length > 0 && (
                    <View style={styles.cityDropdown}>
                      <ScrollView
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        style={{ maxHeight: 200 }}
                      >
                        {cityResults.map((item) => (
                          <TouchableOpacity
                            key={item.place_id}
                            style={styles.cityDropdownItem}
                            onPress={() => fetchPlaceDetails(item.place_id)}
                          >
                            <MaterialIcons
                              name="location-on"
                              size={14}
                              color={Colors.light.outline}
                              style={{ marginRight: 6, marginTop: 1 }}
                            />
                            <Text
                              style={styles.cityDropdownText}
                              numberOfLines={1}
                            >
                              {item.description}
                            </Text>
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

            {/* State */}
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
              {errors.state && (
                <Text style={fieldStyles.errorText}>{errors.state}</Text>
              )}
            </View>

            {/* PIN Code */}
            <View style={fieldStyles.wrap}>
              <View style={fieldStyles.labelRow}>
                <Text style={fieldStyles.label}>PIN Code</Text>
                <Text style={fieldStyles.requiredStar}>*</Text>
              </View>
              {isEditing ? (
                <TextInput
                  value={form.pinCode}
                  keyboardType="number-pad"
                  placeholder="Enter PIN"
                  placeholderTextColor={Colors.light.outline}
                  maxLength={6}
                  style={[
                    fieldStyles.input,
                    errors.pinCode ? fieldStyles.inputError : null,
                  ]}
                  onChangeText={(text) => {
                    const value = text.replace(/[^0-9]/g, "").slice(0, 6);
                    setForm((p) => ({ ...p, pinCode: value }));
                    if (value.length === 6)
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.pinCode;
                        return copy;
                      });
                  }}
                />
              ) : (
                <Text style={fieldStyles.valueText}>{form.pinCode || "—"}</Text>
              )}
              {errors.pinCode && (
                <Text style={fieldStyles.errorText}>{errors.pinCode}</Text>
              )}
            </View>
          </View>

          {/* ── HOSPITAL IMAGES ── */}
          <Text style={styles.sectionLabel}>HOSPITAL IMAGES</Text>
          <View style={styles.section}>
            <View style={styles.imageGrid}>
              {/*
               * ✅ FIX — Each existing slot:
               *   - Tap when NOT editing → open fullscreen viewer
               *   - Tap when editing AND slot has image → prompt to replace
               *   - Tap when editing AND slot is empty → prompt to add
               * The promptImageSource(i) call passes the slot index so the
               * correct images[i] entry is updated.
               */}
              {Array.from({ length: imageSlots }).map((_, i) => {
                const uri = images[i];
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.imageSlot}
                    onPress={() => {
                      if (!isEditing && uri) {
                        // View mode: open fullscreen
                        setViewingImageUri(uri);
                      } else if (isEditing) {
                        // Edit mode: pick new image for this slot
                        promptImageSource(i);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    {uri ? (
                      <>
                        <Image source={{ uri }} style={styles.imageThumb} />
                        {isEditing && (
                          <View style={styles.imageEditOverlay}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <MaterialIcons
                          name={isEditing ? "add-a-photo" : "image"}
                          size={24}
                          color={Colors.light.outline}
                        />
                        {isEditing && (
                          <Text style={styles.imagePlaceholderText}>
                            Add Photo
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* ✅ FIX — "+" slot appends a new image at images.length index */}
              {isEditing && (
                <TouchableOpacity
                  style={[styles.imageSlot, styles.imageAddSlot]}
                  onPress={() => promptImageSource(images.length)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="add"
                    size={28}
                    color={Colors.light.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {errors.images && (
              <Text style={styles.imageError}>{errors.images}</Text>
            )}
            <Text style={styles.imageHint}>
              {isEditing
                ? `Minimum ${MIN_IMAGES} images required · max 200KB each`
                : `${images.length} image${images.length !== 1 ? "s" : ""}`}
            </Text>
          </View>

          {/* LOCATION */}
          <Text style={styles.sectionLabel}>LOCATION & MAP</Text>
          <View style={styles.section}>
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
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Latitude"
                  value={form.latitude}
                  onChangeText={(v) => update("latitude", v)}
                  keyboardType="numeric"
                  editable={isEditing}
                  required
                  error={errors.latitude}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Longitude"
                  value={form.longitude}
                  onChangeText={(v) => update("longitude", v)}
                  keyboardType="numeric"
                  editable={isEditing}
                  required
                  error={errors.longitude}
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
              required
              error={errors.email}
            />
            <InputField
              label="Mobile Number"
              value={form.mobile}
              onChangeText={(v) => update("mobile", v)}
              keyboardType="phone-pad"
              editable={isEditing}
              required
              error={errors.mobile}
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
            <View style={fieldStyles.labelRow}>
              <Text style={fieldStyles.label}>About Us</Text>
              <Text style={fieldStyles.requiredStar}>*</Text>
            </View>
            {isEditing ? (
              <>
                <TextInput
                  style={[
                    styles.aboutInput,
                    { fontFamily: FontFamily.body },
                    errors.aboutUs ? styles.inputError : null,
                  ]}
                  value={form.aboutUs}
                  onChangeText={(v) => {
                    if (v.length <= 1000) update("aboutUs", v);
                  }}
                  multiline
                  textAlignVertical="top"
                  placeholder="Tell patients about your hospital..."
                  placeholderTextColor={Colors.light.outline}
                />
                <Text style={styles.charCount}>
                  {form.aboutUs.length} / 1000
                </Text>
                {errors.aboutUs && (
                  <Text style={fieldStyles.errorText}>{errors.aboutUs}</Text>
                )}
              </>
            ) : (
              <Text style={styles.aboutReadOnly}>{form.aboutUs || "—"}</Text>
            )}
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

          <View style={{ height: isEditing ? 80 : Spacing.xl }} />
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
              <Text style={styles.updateBtnText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen image viewer */}
      <Modal
        visible={!!viewingImageUri}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingImageUri(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setViewingImageUri(null)}
        >
          {viewingImageUri && (
            <Image
              source={{ uri: viewingImageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setViewingImageUri(null)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ActionModal
        visible={showSuccessModal}
        title="Profile Updated"
        message="Personal information updated successfully."
        confirmText="OK"
        iconColor={Colors.light.primary}
        buttonColor={Colors.light.primary}
        iconName="check-circle"
        onConfirm={() => setShowSuccessModal(false)}
      />
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
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
  required?: boolean;
  error?: string;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.labelRow}>
        <Text style={fieldStyles.label}>{label}</Text>
        {required && <Text style={fieldStyles.requiredStar}>*</Text>}
      </View>
      {editable ? (
        <TextInput
          style={[fieldStyles.input, error ? fieldStyles.inputError : null]}
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
      {error && <Text style={fieldStyles.errorText}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.sm },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelMedium,
    color: Colors.light.onSurfaceVariant,
  },
  requiredStar: {
    color: Colors.light.error,
    fontSize: FontSize.labelMedium,
    fontFamily: FontFamily.bodyMedium,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: FontSize.labelSmall,
    fontFamily: FontFamily.body,
    marginTop: 4,
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
  inputError: { borderWidth: 1, borderColor: Colors.light.error },
  valueText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    paddingVertical: 6,
  },
});

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
    minWidth: 60,
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
  cityDropdown: {
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    marginTop: 4,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 9999,
    overflow: "hidden",
  },
  cityDropdownItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  cityDropdownText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurface,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  imageSlot: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.light.surfaceContainerLow,
  },
  imageThumb: { width: "100%", height: "100%" },
  imageEditOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderTopLeftRadius: Radius.sm,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.outlineVariant,
    borderRadius: Radius.lg,
    borderStyle: "dashed",
    gap: 4,
  },
  imagePlaceholderText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
  },
  imageAddSlot: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    backgroundColor: Colors.light.primaryFixed + "30",
  },
  imageError: {
    color: Colors.light.error,
    fontSize: FontSize.labelSmall,
    fontFamily: FontFamily.body,
    marginTop: 4,
  },
  imageHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
    marginTop: 4,
  },
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
  inputError: { borderWidth: 1, borderColor: Colors.light.error },
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
  updateBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
  },
  updateBtn: {
    backgroundColor: "#16A34A",
    borderRadius: Radius.lg,
    height: ButtonSize.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  updateBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "100%", height: "80%" },
  modalClose: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
