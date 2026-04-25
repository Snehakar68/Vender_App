// import React, { useState, useEffect, useContext } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   Linking,
//   Image,
//   ActivityIndicator,
//   Dimensions,
//   Modal,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { router, useLocalSearchParams } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import * as DocumentPicker from "expo-document-picker";
// import * as FileSystem from "expo-file-system/legacy";
// import * as ImageManipulator from "expo-image-manipulator";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   AmbColors,
//   AmbRadius,
//   AmbShadow,
// } from "@/src/features/ambulance/constants/ambulanceTheme";
// import TransactionalHeader from "@/src/features/ambulance/components/TransactionalHeader";
// import { AuthContext } from "@/src/core/context/AuthContext";
// import ActionModal from "@/src/shared/components/ActionModal";

// const API_BASE =
//   "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance";

// export default function AddDriverScreen() {
//   const {
//     mode = "add",
//     id,
//     driverName,
//     driverPhone,
//     driverLicense,
//     driverLicenseExpiry,
//     driverPhoto,
//     driverLicenseDoc,
//     driverAmbulance,
//   } = useLocalSearchParams<{
//     mode?: string;
//     id?: string;
//     driverName?: string;
//     driverPhone?: string;
//     driverLicense?: string;
//     driverLicenseExpiry?: string;
//     driverPhoto?: string;
//     driverLicenseDoc?: string;
//     driverAmbulance?: string;
//   }>();

//   const isView = mode === "view";
//   const isEdit = mode === "edit";

//   const auth = useContext(AuthContext);
//   const vendorId = auth?.user?.vendorId ?? "";

//   // ── Form state ────────────────────────────────────────────────────────────
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [licenseNumber, setLicenseNumber] = useState("");
//   const [licenseExpiry, setLicenseExpiry] = useState("");
//   const [assignedAmbulance, setAssignedAmbulance] = useState("");

//   const [photoUri, setPhotoUri] = useState<string | null>(null);
//   const [photoBase64, setPhotoBase64] = useState<string | null>(null);

//   const [licenseDocUri, setLicenseDocUri] = useState<string | null>(null);
//   const [licenseDocBase64, setLicenseDocBase64] = useState<string | null>(null);
//   const [licenseDocMimeType, setLicenseDocMimeType] = useState<string | null>(
//     null,
//   );
//   const [licenseDocName, setLicenseDocName] = useState<string | null>(null);

//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [viewingImageUri, setViewingImageUri] = useState<string | null>(null);

//   // ── Prefill from URL params ────────────────────────────────────────────────
//   useEffect(() => {
//     if ((!isView && !isEdit) || !id) return;
//     if (driverName) setName(decodeURIComponent(driverName));
//     if (driverPhone) setPhone(decodeURIComponent(driverPhone));
//     if (driverLicense) setLicenseNumber(decodeURIComponent(driverLicense));
//     if (driverLicenseExpiry)
//       setLicenseExpiry(decodeURIComponent(driverLicenseExpiry).split("T")[0]);
//     if (driverAmbulance)
//       setAssignedAmbulance(decodeURIComponent(driverAmbulance));
//     if (driverPhoto) setPhotoBase64(decodeURIComponent(driverPhoto));
//     if (driverLicenseDoc) {
//       setLicenseDocBase64(decodeURIComponent(driverLicenseDoc));
//       setLicenseDocName("Document uploaded");
//     }
//   }, [id, mode]);

//   // ── FIX 1: Fetch full driver detail — correctly reads driverDocs[0] ──────
//   useEffect(() => {
//     if ((!isView && !isEdit) || !id) return;

//     fetch(`${API_BASE}/Get_Driver_By_driver_id/${id}`)
//       .then((r) => r.json())
//       .then((data: any) => {
//         // API returns an array → grab first element
//         const driver = Array.isArray(data) ? data[0] : data;
//         if (!driver) return;

//         console.log("[AddDriver] Driver keys:", Object.keys(driver));

//         // ── Photo: top-level inside driverDocs[0]
//         const docsArray = driver.driverDocs ?? [];
//         const docEntry = docsArray.length > 0 ? docsArray[0] : null;

//         if (docEntry) {
//           console.log("[AddDriver] driverDocs[0] keys:", Object.keys(docEntry));

//           // ── License expiry from driverDocs[0].license_expiry
//           const expiry = (
//             docEntry.license_expiry ??
//             docEntry.licenseExpiry ??
//             ""
//           ).split("T")[0];
//           console.log("[AddDriver] Resolved expiry from driverDocs:", expiry);
//           if (expiry) setLicenseExpiry(expiry);

//           // ── License document from driverDocs[0].license
//           const rawDoc =
//             docEntry.license ??
//             docEntry.licenseDoc ??
//             docEntry.license_doc ??
//             docEntry.licenseDocument ??
//             null;

//           if (rawDoc) {
//             const cleanDoc = rawDoc
//               .replace(/^data:[^;]+;base64,/, "")
//               .replace(/[\s\r\n]/g, "");
//             console.log(
//               "[AddDriver] License doc base64 length:",
//               cleanDoc.length,
//             );
//             setLicenseDocBase64(cleanDoc);
//             setLicenseDocName("Document uploaded");
//           }

//           // ── Photo from driverDocs[0].photo (if not already set from params)
//           const rawPhoto = docEntry.photo ?? null;
//           if (rawPhoto) {
//             const cleanPhoto = rawPhoto
//               .replace(/^data:[^;]+;base64,/, "")
//               .replace(/[\s\r\n]/g, "");
//             setPhotoBase64((prev) => prev ?? cleanPhoto);
//           }
//         }

//         // ── Also check top-level expiry (fallback)
//         const topLevelExpiry = (
//           driver.license_expiry ??
//           driver.licenseExpiry ??
//           ""
//         ).split("T")[0];
//         if (topLevelExpiry) {
//           setLicenseExpiry((prev) => prev || topLevelExpiry);
//         }
//       })
//       .catch((err) => console.error("[AddDriver] Fetch error:", err));
//   }, [id, mode]);

//   // ── Image pickers ─────────────────────────────────────────────────────────
//   const pickPhoto = async () => {
//     if (isView) return;
//     try {
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission needed",
//           "Gallery permission is required to select a photo",
//         );
//         return;
//       }
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ["images"],
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
//       if (!result.canceled) {
//         const uri = result.assets[0].uri;
//         const info = await FileSystem.getInfoAsync(uri);
//         if ((info as any).size > 204800) {
//           Alert.alert("File too large", "Only 200KB size allowed");
//           return;
//         }
//         setPhotoUri(uri);
//         setPhotoBase64(null);
//       }
//     } catch {
//       Alert.alert("Error", "Could not open gallery");
//     }
//   };

//   const compressPhoto = async (uri: string): Promise<string> => {
//     try {
//       const info = await FileSystem.getInfoAsync(uri);
//       if ((info as any).size <= 204800) return uri;
//       let result = await ImageManipulator.manipulateAsync(
//         uri,
//         [{ resize: { width: 800 } }],
//         { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
//       );
//       const info2 = await FileSystem.getInfoAsync(result.uri);
//       if ((info2 as any).size <= 204800) return result.uri;
//       result = await ImageManipulator.manipulateAsync(
//         uri,
//         [{ resize: { width: 600 } }],
//         { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
//       );
//       return result.uri;
//     } catch {
//       return uri;
//     }
//   };

//   const pickPhotoFromCamera = async () => {
//     if (isView) return;
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission needed",
//           "Camera permission is required to take a photo",
//         );
//         return;
//       }
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
//       if (!result.canceled) {
//         const compressed = await compressPhoto(result.assets[0].uri);
//         const info = await FileSystem.getInfoAsync(compressed);
//         if ((info as any).size > 204800) {
//           Alert.alert("File too large", "Only 200KB size allowed");
//           return;
//         }
//         setPhotoUri(compressed);
//         setPhotoBase64(null);
//       }
//     } catch {
//       Alert.alert("Error", "Could not open camera");
//     }
//   };

//   const handlePhotoPress = () => {
//     if (isView) return;
//     Alert.alert("Profile Photo", "Choose source", [
//       { text: "Camera", onPress: pickPhotoFromCamera },
//       { text: "Gallery", onPress: pickPhoto },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const pickLicenseDoc = async () => {
//     if (isView) return;
//     const result = await DocumentPicker.getDocumentAsync({
//       type: ["image/*", "application/pdf"],
//       copyToCacheDirectory: true,
//     });
//     if (result.canceled) return;
//     const file = result.assets[0];
//     if (file.size && file.size > 204800) {
//       setErrors((prev) => ({
//         ...prev,
//         licenseDoc: "File must be under 200KB",
//       }));
//       return;
//     }
//     setLicenseDocUri(file.uri);
//     setLicenseDocName(file.name);
//     setLicenseDocMimeType(file.mimeType ?? "image/jpeg");
//     setLicenseDocBase64(null);
//   };

//   // ── FIX 3: PDF viewer — write base64 to cache then open ──────────────────
//   const viewLicenseDoc = async () => {
//     try {
//       if (licenseDocUri) {
//         // Newly picked file — open directly
//         if (licenseDocMimeType === "application/pdf") {
//           const uri =
//             Platform.OS === "android"
//               ? await FileSystem.getContentUriAsync(licenseDocUri)
//               : licenseDocUri;
//           await Linking.openURL(uri);
//         } else {
//           setViewingImageUri(licenseDocUri);
//         }
//         return;
//       }

//       if (licenseDocBase64) {
//         // Strip any data URI prefix and whitespace
//         const cleanDoc = licenseDocBase64
//           .replace(/^data:[^;]+;base64,/, "")
//           .replace(/[\s\r\n]/g, "");

//         // Detect type: PDFs start with "JVBER" (base64 of "%PDF")
//         const isPdf = cleanDoc.startsWith("JVBER");
//         console.log(
//           "[ViewDoc] isPdf:",
//           isPdf,
//           "base64 length:",
//           cleanDoc.length,
//         );

//         if (isPdf) {
//           // Write to cache directory so it can be opened
//           const tmpUri = `${FileSystem.cacheDirectory}license_doc_${Date.now()}.pdf`;
//           await FileSystem.writeAsStringAsync(tmpUri, cleanDoc, {
//             encoding: FileSystem.EncodingType.Base64,
//           });

//           console.log("[ViewDoc] Written PDF to:", tmpUri);

//           if (Platform.OS === "android") {
//             const contentUri = await FileSystem.getContentUriAsync(tmpUri);
//             await Linking.openURL(contentUri);
//           } else {
//             // iOS: use file:// URI directly
//             await Linking.openURL(tmpUri);
//           }
//         } else {
//           // It's an image — show in modal
//           setViewingImageUri(`data:image/jpeg;base64,${cleanDoc}`);
//         }
//       }
//     } catch (err) {
//       console.error("[ViewDoc] Error:", err);
//       Alert.alert("Error", "Could not open document. Please try again.");
//     }
//   };

//   const clearError = (key: string) =>
//     setErrors((prev) => ({ ...prev, [key]: "" }));

//   const handleDateChange = (_: unknown, date?: Date) => {
//     setShowDatePicker(false);
//     if (date) setLicenseExpiry(date.toISOString().split("T")[0]);
//   };

//   // ── Validation ────────────────────────────────────────────────────────────
//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!name.trim()) e.name = "Driver name is required";
//     if (!phone.trim()) e.phone = "Mobile number is required";
//     else if (!/^[6-9]\d{9}$/.test(phone))
//       e.phone = "Enter valid 10 digit mobile number";
//     if (!licenseNumber.trim()) e.license = "License number required";
//     if (!licenseExpiry) e.expiry = "License expiry required";
//     if (!isEdit && !photoUri && !photoBase64) e.photo = "Driver photo required";
//     if (!isEdit && !licenseDocUri && !licenseDocBase64)
//       e.licenseDoc = "License document required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSubmitting(true);
//     try {
//       const fd = new FormData();
//       fd.append("vendor_id", vendorId);
//       fd.append("driver_name", name.trim());
//       fd.append("mobile", phone.trim());
//       fd.append("license_no", licenseNumber.trim());
//       fd.append("license_expiry", licenseExpiry);

//       if (photoUri) {
//         fd.append("photo", {
//           uri: photoUri,
//           name: "photo.jpg",
//           type: "image/jpeg",
//         } as any);
//       }

//       if (licenseDocUri) {
//         const ext = licenseDocMimeType === "application/pdf" ? "pdf" : "jpg";
//         fd.append("license", {
//           uri: licenseDocUri,
//           name: `license.${ext}`,
//           type: licenseDocMimeType ?? "image/jpeg",
//         } as any);
//       } else if (licenseDocBase64 && isEdit) {
//         const cleanBase64 = licenseDocBase64
//           .replace(/^data:[^;]+;base64,/, "")
//           .replace(/[\s\r\n]/g, "");
//         const isPdf = cleanBase64.startsWith("JVBER");
//         const ext = isPdf ? "pdf" : "jpg";
//         const mime = isPdf ? "application/pdf" : "image/jpeg";
//         const tmpUri = `${FileSystem.cacheDirectory}license_resubmit.${ext}`;
//         await FileSystem.writeAsStringAsync(tmpUri, cleanBase64, {
//           encoding: FileSystem.EncodingType.Base64,
//         });
//         fd.append("license", {
//           uri: tmpUri,
//           name: `license.${ext}`,
//           type: mime,
//         } as any);
//       }

//       if (isEdit && id) {
//         fd.append("driver_Id", Number(id) as any);
//       }

//       const endpoint = isEdit
//         ? `${API_BASE}/Update_DriversInfo`
//         : `${API_BASE}/ADD_DriversInfo`;

//       const res = await fetch(endpoint, { method: "POST", body: fd });
//       const data = await res.json();
//       console.log("[AddDriver] POST response:", JSON.stringify(data));
//       if (!res.ok) throw new Error(data?.message || "Submission failed");

//       setShowSuccessModal(true);
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Derived display values ────────────────────────────────────────────────
//   const photoSource = photoUri
//     ? { uri: photoUri }
//     : photoBase64
//       ? { uri: `data:image/jpeg;base64,${photoBase64}` }
//       : null;

//   const hasLicenseDoc = !!(licenseDocUri || licenseDocBase64);
//   const licenseDocLabel =
//     licenseDocName ??
//     (licenseDocUri ? licenseDocUri.split("/").pop() : null) ??
//     (licenseDocBase64 ? "Document uploaded" : null);

//   const headerTitle = isView
//     ? "View Driver"
//     : isEdit
//       ? "Edit Driver"
//       : "Add Driver";

//   return (
//     <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
//       <TransactionalHeader title={headerTitle} onBack={() => router.back()} />

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scroll}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           {isView && (
//             <View style={styles.viewModeBanner}>
//               <MaterialIcons
//                 name="visibility"
//                 size={16}
//                 color={AmbColors.primary}
//               />
//               <Text style={styles.viewModeBannerText}>Read-only view</Text>
//             </View>
//           )}

//           {/* ── Section 1: Personal Information ── */}
//           <View style={styles.sectionHeader}>
//             <View style={styles.sectionNumberBadge}>
//               <Text style={styles.sectionNumberText}>1</Text>
//             </View>
//             <Text style={styles.sectionTitle}>Personal Information</Text>
//           </View>

//           <View style={styles.formCard}>
//             {/* ── Photo ── */}
//             <View style={styles.photoSection}>
//               <TouchableOpacity
//                 style={styles.photoCircle}
//                 onPress={handlePhotoPress}
//                 activeOpacity={isView ? 1 : 0.7}
//                 disabled={isView}
//               >
//                 {photoSource ? (
//                   <Image source={photoSource} style={styles.photoImage} />
//                 ) : (
//                   <MaterialIcons
//                     name="camera-alt"
//                     size={28}
//                     color={`${AmbColors.primary}80`}
//                   />
//                 )}
//               </TouchableOpacity>
//               {/* FIX 2: Red asterisk on photo label */}
//               <Text style={styles.photoHint}>
//                 {isView ? (
//                   photoSource ? (
//                     "Profile photo"
//                   ) : (
//                     "No photo"
//                   )
//                 ) : (
//                   <Text>
//                     Tap to add photo
//                     {!isEdit && <Text style={styles.required}> *</Text>}
//                   </Text>
//                 )}
//               </Text>
//               {errors.photo ? (
//                 <Text style={styles.errorText}>{errors.photo}</Text>
//               ) : null}
//             </View>

//             {/* ── Full Name ── */}
//             <View style={styles.fieldGroup}>
//               {/* FIX 2: Red asterisk label */}
//               <Text style={styles.fieldLabel}>
//                 FULL NAME{!isView && <Text style={styles.required}> *</Text>}
//               </Text>
//               <View style={[styles.inputRow, isView && styles.inputDisabled]}>
//                 <View style={styles.inputIconBox}>
//                   <MaterialIcons
//                     name="person"
//                     size={18}
//                     color={AmbColors.primary}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="e.g. Rahul Singh"
//                   placeholderTextColor={`${AmbColors.outline}80`}
//                   value={name}
//                   onChangeText={(v) => {
//                     setName(v);
//                     clearError("name");
//                   }}
//                   autoCapitalize="words"
//                   editable={!isView}
//                 />
//               </View>
//               {errors.name ? (
//                 <Text style={styles.errorText}>{errors.name}</Text>
//               ) : null}
//             </View>

//             {/* ── Phone Number ── */}
//             <View style={styles.fieldGroup}>
//               <Text style={styles.fieldLabel}>
//                 PHONE NUMBER{!isView && <Text style={styles.required}> *</Text>}
//               </Text>
//               <View style={[styles.inputRow, isView && styles.inputDisabled]}>
//                 <View style={styles.inputIconBox}>
//                   <MaterialIcons
//                     name="phone"
//                     size={18}
//                     color={AmbColors.primary}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="e.g. 9876543210"
//                   placeholderTextColor={`${AmbColors.outline}80`}
//                   value={phone}
//                   onChangeText={(v) => {
//                     setPhone(v);
//                     clearError("phone");
//                   }}
//                   keyboardType="phone-pad"
//                   maxLength={10}
//                   editable={!isView}
//                 />
//               </View>
//               {errors.phone ? (
//                 <Text style={styles.errorText}>{errors.phone}</Text>
//               ) : null}
//             </View>

//             {/* Assigned Ambulance — view only */}
//             {isView && (
//               <View style={styles.fieldGroup}>
//                 <Text style={styles.fieldLabel}>ASSIGNED AMBULANCE</Text>
//                 <View style={[styles.inputRow, styles.inputDisabled]}>
//                   <View style={styles.inputIconBox}>
//                     <MaterialIcons
//                       name="emergency"
//                       size={18}
//                       color={AmbColors.primary}
//                     />
//                   </View>
//                   <Text style={[styles.textInput, { paddingTop: 4 }]}>
//                     {assignedAmbulance || "Not Assigned"}
//                   </Text>
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* ── Section 2: License Information ── */}
//           <View style={styles.sectionHeader}>
//             <View style={styles.sectionNumberBadge}>
//               <Text style={styles.sectionNumberText}>2</Text>
//             </View>
//             <Text style={styles.sectionTitle}>License Information</Text>
//           </View>

//           <View style={styles.formCard}>
//             {/* ── License Number ── */}
//             <View style={styles.fieldGroup}>
//               <Text style={styles.fieldLabel}>
//                 LICENSE NUMBER
//                 {!isView && <Text style={styles.required}> *</Text>}
//               </Text>
//               <View style={[styles.inputRow, isView && styles.inputDisabled]}>
//                 <View style={styles.inputIconBox}>
//                   <MaterialIcons
//                     name="badge"
//                     size={18}
//                     color={AmbColors.primary}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="e.g. DL-12345"
//                   placeholderTextColor={`${AmbColors.outline}80`}
//                   value={licenseNumber}
//                   onChangeText={(v) => {
//                     setLicenseNumber(v);
//                     clearError("license");
//                   }}
//                   autoCapitalize="characters"
//                   editable={!isView}
//                 />
//               </View>
//               {errors.license ? (
//                 <Text style={styles.errorText}>{errors.license}</Text>
//               ) : null}
//             </View>

//             {/* ── License Expiry ── */}
//             <View style={styles.fieldGroup}>
//               <Text style={styles.fieldLabel}>
//                 LICENSE EXPIRY DATE
//                 {!isView && <Text style={styles.required}> *</Text>}
//               </Text>
//               <TouchableOpacity
//                 style={[styles.dateRow, isView && styles.inputDisabled]}
//                 onPress={() => !isView && setShowDatePicker(true)}
//                 activeOpacity={isView ? 1 : 0.7}
//               >
//                 <View style={styles.inputIconBox}>
//                   <MaterialIcons
//                     name="calendar-today"
//                     size={18}
//                     color={AmbColors.primary}
//                   />
//                 </View>
//                 <Text
//                   style={[
//                     styles.dateText,
//                     !licenseExpiry && styles.datePlaceholder,
//                   ]}
//                 >
//                   {licenseExpiry || "Select expiry date"}
//                 </Text>
//                 {!isView && (
//                   <MaterialIcons
//                     name="expand-more"
//                     size={20}
//                     color={AmbColors.outline}
//                     style={styles.dateChevron}
//                   />
//                 )}
//               </TouchableOpacity>
//               {errors.expiry ? (
//                 <Text style={styles.errorText}>{errors.expiry}</Text>
//               ) : null}
//               {showDatePicker && (
//                 <DateTimePicker
//                   mode="date"
//                   display={Platform.OS === "ios" ? "spinner" : "default"}
//                   value={licenseExpiry ? new Date(licenseExpiry) : new Date()}
//                   onChange={handleDateChange}
//                   minimumDate={new Date()}
//                 />
//               )}
//             </View>

//             {/* ── License Document ── */}
//             <View style={styles.fieldGroup}>
//               <Text style={styles.fieldLabel}>
//                 LICENSE DOCUMENT
//                 {!isView && !isEdit && <Text style={styles.required}> *</Text>}
//               </Text>
//               <TouchableOpacity
//                 style={[
//                   styles.docUploadBox,
//                   hasLicenseDoc && styles.docUploadBoxDone,
//                 ]}
//                 onPress={
//                   hasLicenseDoc
//                     ? viewLicenseDoc
//                     : isView
//                       ? undefined
//                       : pickLicenseDoc
//                 }
//                 activeOpacity={isView && !hasLicenseDoc ? 1 : 0.7}
//                 disabled={isView && !hasLicenseDoc}
//               >
//                 {hasLicenseDoc ? (
//                   <View style={styles.docUploadedRow}>
//                     <MaterialIcons
//                       name="check-circle"
//                       size={22}
//                       color={AmbColors.tertiary}
//                     />
//                     <Text style={styles.docUploadedName} numberOfLines={1}>
//                       {licenseDocLabel}
//                     </Text>
//                     {!isView && (
//                       <TouchableOpacity
//                         onPress={pickLicenseDoc}
//                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                       >
//                         <MaterialIcons
//                           name="edit"
//                           size={16}
//                           color={AmbColors.secondary}
//                         />
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 ) : (
//                   <View style={styles.docUploadPlaceholder}>
//                     <MaterialIcons
//                       name="upload-file"
//                       size={28}
//                       color={`${AmbColors.outline}60`}
//                     />
//                     <Text style={styles.docUploadLabel}>
//                       {isView
//                         ? "No document uploaded"
//                         : "Tap to upload (PDF or image, max 200KB)"}
//                     </Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//               {errors.licenseDoc ? (
//                 <Text style={styles.errorText}>{errors.licenseDoc}</Text>
//               ) : null}
//             </View>
//           </View>

//           <View style={styles.availabilityCard}>
//             <View style={styles.availabilityLeft}>
//               <MaterialIcons
//                 name="schedule"
//                 size={20}
//                 color={AmbColors.tertiary}
//               />
//               <View>
//                 <Text style={styles.availabilityTitle}>Availability</Text>
//                 <Text style={styles.availabilitySub}>
//                   {isView
//                     ? "Schedule not configured"
//                     : "Set working hours after adding driver"}
//                 </Text>
//               </View>
//             </View>
//             <MaterialIcons
//               name="chevron-right"
//               size={20}
//               color={`${AmbColors.secondary}66`}
//             />
//           </View>

//           <View style={{ height: 100 }} />
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {!isView && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
//             onPress={handleSubmit}
//             activeOpacity={0.85}
//             disabled={submitting}
//           >
//             {submitting ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <MaterialIcons
//                 name={isEdit ? "save" : "person-add"}
//                 size={20}
//                 color="#fff"
//               />
//             )}
//             <Text style={styles.submitBtnText}>
//               {submitting
//                 ? "Saving..."
//                 : isEdit
//                   ? "Save Changes"
//                   : "Add Driver"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <ActionModal
//         visible={showSuccessModal}
//         title={isEdit ? "Driver Updated" : "Driver Added Successfully"}
//         message={
//           isEdit
//             ? "Driver information has been updated."
//             : "The driver has been added to your fleet."
//         }
//         confirmText="OK"
//         onConfirm={() => {
//           setShowSuccessModal(false);
//           router.back();
//         }}
//         iconName="check-circle"
//       />

//       {/* Image Viewer Modal */}
//       <Modal
//         visible={!!viewingImageUri}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setViewingImageUri(null)}
//       >
//         <View style={styles.imageViewerOverlay}>
//           <TouchableOpacity
//             style={styles.imageViewerClose}
//             onPress={() => setViewingImageUri(null)}
//           >
//             <MaterialIcons name="close" size={28} color="#fff" />
//           </TouchableOpacity>
//           {viewingImageUri && (
//             <Image
//               source={{ uri: viewingImageUri }}
//               style={styles.imageViewerImg}
//               resizeMode="contain"
//             />
//           )}
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: AmbColors.surface },
//   scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

//   viewModeBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: `${AmbColors.primary}10`,
//     borderRadius: AmbRadius.md,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     marginBottom: 16,
//   },
//   viewModeBannerText: {
//     fontFamily: "Inter_500Medium",
//     fontSize: 13,
//     color: AmbColors.primary,
//   },

//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginBottom: 12,
//     marginTop: 4,
//   },
//   sectionNumberBadge: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: AmbColors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sectionNumberText: {
//     fontFamily: "Inter_600SemiBold",
//     fontSize: 13,
//     color: "#ffffff",
//   },
//   sectionTitle: {
//     fontFamily: "Inter_600SemiBold",
//     fontSize: 16,
//     color: AmbColors.onSurface,
//   },

//   formCard: {
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     borderRadius: AmbRadius.xl,
//     padding: 20,
//     gap: 18,
//     marginBottom: 20,
//     ...AmbShadow.subtle,
//   },

//   photoSection: { alignItems: "center", gap: 10 },
//   photoCircle: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderStyle: "dashed",
//     borderColor: AmbColors.outlineVariant,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: AmbColors.surfaceContainerLow,
//     overflow: "hidden",
//   },
//   photoImage: { width: 100, height: 100, borderRadius: 50 },
//   photoHint: {
//     fontFamily: "Inter_500Medium",
//     fontSize: 13,
//     color: `${AmbColors.outline}aa`,
//   },
//   fieldGroup: { gap: 6 },
//   fieldLabel: {
//     fontFamily: "Inter_600SemiBold",
//     fontSize: 10,
//     color: AmbColors.onSurfaceVariant,
//     letterSpacing: 1,
//     textTransform: "uppercase",
//   },
//   // FIX 2: Red asterisk style
//   required: { color: "#E53935", fontFamily: "Inter_600SemiBold" },
//   errorText: {
//     fontFamily: "Inter_400Regular",
//     fontSize: 11,
//     color: AmbColors.error,
//     marginTop: 2,
//   },

//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: AmbRadius.md,
//     height: 50,
//     paddingRight: 14,
//     overflow: "hidden",
//   },
//   inputDisabled: {
//     backgroundColor: AmbColors.surfaceContainerHighest,
//     opacity: 0.7,
//   },
//   inputIconBox: {
//     width: 46,
//     height: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: `${AmbColors.primary}10`,
//   },
//   textInput: {
//     flex: 1,
//     paddingLeft: 12,
//     fontFamily: "Inter_400Regular",
//     fontSize: 14,
//     color: AmbColors.onSurface,
//   },

//   dateRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: AmbRadius.md,
//     height: 50,
//     overflow: "hidden",
//   },
//   dateText: {
//     flex: 1,
//     paddingLeft: 12,
//     fontFamily: "Inter_400Regular",
//     fontSize: 14,
//     color: AmbColors.onSurface,
//   },
//   datePlaceholder: { color: `${AmbColors.outline}80` },
//   dateChevron: { marginRight: 12 },

//   docUploadBox: {
//     borderWidth: 1.5,
//     borderStyle: "dashed",
//     borderColor: AmbColors.outlineVariant,
//     borderRadius: AmbRadius.md,
//     height: 80,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: AmbColors.surfaceContainerLow,
//   },
//   docUploadBoxDone: {
//     borderColor: AmbColors.tertiary,
//     borderStyle: "solid",
//     backgroundColor: `${AmbColors.tertiary}08`,
//   },
//   docUploadedRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 16,
//   },
//   docUploadedName: {
//     flex: 1,
//     fontFamily: "Inter_500Medium",
//     fontSize: 13,
//     color: AmbColors.tertiary,
//   },
//   docUploadPlaceholder: { alignItems: "center", gap: 6 },
//   docUploadLabel: {
//     fontFamily: "Inter_500Medium",
//     fontSize: 12,
//     color: `${AmbColors.outline}bb`,
//   },

//   availabilityCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     borderRadius: AmbRadius.xl,
//     padding: 18,
//     ...AmbShadow.subtle,
//   },
//   availabilityLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   availabilityTitle: {
//     fontFamily: "Inter_600SemiBold",
//     fontSize: 14,
//     color: AmbColors.onSurface,
//   },
//   availabilitySub: {
//     fontFamily: "Inter_400Regular",
//     fontSize: 11,
//     color: AmbColors.secondary,
//     marginTop: 2,
//   },

//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     paddingHorizontal: 20,
//     paddingTop: 14,
//     paddingBottom: 24,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     ...AmbShadow.elevated,
//   },
//   submitBtn: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 10,
//     height: 54,
//     backgroundColor: AmbColors.primary,
//     borderRadius: AmbRadius.md,
//     ...AmbShadow.card,
//   },
//   submitBtnText: {
//     fontFamily: "Inter_600SemiBold",
//     fontSize: 16,
//     color: "#ffffff",
//   },

//   imageViewerOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.92)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   imageViewerClose: {
//     position: "absolute",
//     top: 48,
//     right: 20,
//     zIndex: 10,
//     padding: 8,
//   },
//   imageViewerImg: {
//     width: Dimensions.get("window").width,
//     height: Dimensions.get("window").height * 0.75,
//   },
// });
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
  Linking,
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
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
// ✅ FIX: Import IntentLauncher for Android PDF opening with explicit MIME type
import * as IntentLauncher from "expo-intent-launcher";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  AmbColors,
  AmbRadius,
  AmbShadow,
} from "@/src/features/ambulance/constants/ambulanceTheme";
import TransactionalHeader from "@/src/features/ambulance/components/TransactionalHeader";
import { AuthContext } from "@/src/core/context/AuthContext";
import ActionModal from "@/src/shared/components/ActionModal";

const API_BASE =
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance";

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIX — ROOT CAUSE + FIX:
//
// OLD CODE used Linking.openURL(contentUri) on Android.
// Linking fires an implicit ACTION_VIEW intent WITHOUT a MIME type.
// Android cannot reliably resolve the PDF viewer from a content:// URI alone
// because the extension is not exposed through the content provider.
// Result: PDF app opens but receives wrong/no type → renders blank.
//
// FIX: On Android, use IntentLauncher.startActivityAsync with
// contentType: "application/pdf" explicitly set.
// This fires ACTION_VIEW with the MIME type attached → PDF renders correctly.
// On iOS, Linking.openURL with the file:// URI still works fine.
// ─────────────────────────────────────────────────────────────────────────────
async function openPdf(fileUri: string): Promise<void> {
  console.log("[openPdf] fileUri:", fileUri);

  if (Platform.OS === "android") {
    // Convert file:// → content:// so Android can share it across apps
    const contentUri = await FileSystem.getContentUriAsync(fileUri);
    console.log("[openPdf] contentUri:", contentUri);
    // Use IntentLauncher with explicit MIME type — this is the fix
    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: "application/pdf",
    });
  } else {
    // iOS: file:// URI works directly with Linking
    await Linking.openURL(fileUri);
  }
}

// Writes a clean base64 string to a temp cache file and returns its URI
async function base64ToTempUri(
  base64: string,
  filename: string
): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error("Cache directory unavailable on this device.");

  console.log("[base64ToTempUri] base64 prefix:", base64?.slice(0, 30));

  // Strip any data URI prefix the API might have included
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;

  const uri = cacheDir + filename;
  await FileSystem.writeAsStringAsync(uri, clean, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log("[base64ToTempUri] written to:", uri);
  return uri;
}

export default function AddDriverScreen() {
  const {
    mode = "add",
    id,
    driverName,
    driverPhone,
    driverLicense,
    driverLicenseExpiry,
    driverPhoto,
    driverLicenseDoc,
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

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const [licenseDocUri, setLicenseDocUri] = useState<string | null>(null);
  const [licenseDocBase64, setLicenseDocBase64] = useState<string | null>(null);
  const [licenseDocIsPdf, setLicenseDocIsPdf] = useState(false);
  const [licenseDocMimeType, setLicenseDocMimeType] = useState<string | null>(null);
  const [licenseDocName, setLicenseDocName] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [viewingImageUri, setViewingImageUri] = useState<string | null>(null);

  // ── Prefill from URL params ────────────────────────────────────────────────
  useEffect(() => {
    if ((!isView && !isEdit) || !id) return;
    if (driverName) setName(decodeURIComponent(driverName));
    if (driverPhone) setPhone(decodeURIComponent(driverPhone));
    if (driverLicense) setLicenseNumber(decodeURIComponent(driverLicense));
    if (driverLicenseExpiry)
      setLicenseExpiry(decodeURIComponent(driverLicenseExpiry).split("T")[0]);
    if (driverAmbulance)
      setAssignedAmbulance(decodeURIComponent(driverAmbulance));
    if (driverPhoto) setPhotoBase64(decodeURIComponent(driverPhoto));
    if (driverLicenseDoc) {
      const raw = decodeURIComponent(driverLicenseDoc);
      const clean = raw.replace(/^data:[^;]+;base64,/, "").replace(/[\s\r\n]/g, "");
      setLicenseDocBase64(clean);
      setLicenseDocIsPdf(clean.startsWith("JVBER"));
      setLicenseDocName("Document uploaded");
    }
  }, [id, mode]);

  // ── Fetch full driver detail ───────────────────────────────────────────────
  useEffect(() => {
    if ((!isView && !isEdit) || !id) return;

    fetch(`${API_BASE}/Get_Driver_By_driver_id/${id}`)
      .then((r) => r.json())
      .then((data: any) => {
        const driver = Array.isArray(data) ? data[0] : data;
        if (!driver) return;

        console.log("[AddDriver] Driver keys:", Object.keys(driver));

        const docsArray = driver.driverDocs ?? [];
        const docEntry = docsArray.length > 0 ? docsArray[0] : null;

        if (docEntry) {
          console.log("[AddDriver] driverDocs[0] keys:", Object.keys(docEntry));

          const expiry = (
            docEntry.license_expiry ??
            docEntry.licenseExpiry ??
            ""
          ).split("T")[0];
          if (expiry) setLicenseExpiry(expiry);

          const rawDoc =
            docEntry.license ??
            docEntry.licenseDoc ??
            docEntry.license_doc ??
            docEntry.licenseDocument ??
            null;

          if (rawDoc) {
            const cleanDoc = rawDoc
              .replace(/^data:[^;]+;base64,/, "")
              .replace(/[\s\r\n]/g, "");
            console.log("[AddDriver] License doc base64 length:", cleanDoc.length);
            setLicenseDocBase64(cleanDoc);
            // ✅ FIX: Detect PDF from base64 signature and store the flag
            setLicenseDocIsPdf(cleanDoc.startsWith("JVBER"));
            setLicenseDocName("Document uploaded");
          }

          const rawPhoto = docEntry.photo ?? null;
          if (rawPhoto) {
            const cleanPhoto = rawPhoto
              .replace(/^data:[^;]+;base64,/, "")
              .replace(/[\s\r\n]/g, "");
            setPhotoBase64((prev) => prev ?? cleanPhoto);
          }
        }

        const topLevelExpiry = (
          driver.license_expiry ??
          driver.licenseExpiry ??
          ""
        ).split("T")[0];
        if (topLevelExpiry) {
          setLicenseExpiry((prev) => prev || topLevelExpiry);
        }
      })
      .catch((err) => console.error("[AddDriver] Fetch error:", err));
  }, [id, mode]);

  // ── Image pickers ─────────────────────────────────────────────────────────
  const pickPhoto = async () => {
    if (isView) return;
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
    if (isView) return;
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
    if (isView) return;
    Alert.alert("Profile Photo", "Choose source", [
      { text: "Camera", onPress: pickPhotoFromCamera },
      { text: "Gallery", onPress: pickPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
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
      setErrors((prev) => ({ ...prev, licenseDoc: "File must be under 200KB" }));
      return;
    }
    const isPdf = file.mimeType === "application/pdf";
    setLicenseDocUri(file.uri);
    setLicenseDocName(file.name);
    setLicenseDocMimeType(file.mimeType ?? "image/jpeg");
    setLicenseDocIsPdf(isPdf);
    setLicenseDocBase64(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ FIX — viewLicenseDoc
  //
  // OLD: await Linking.openURL(contentUri)  ← no MIME type, Android opens blank
  // NEW: await openPdf(tmpUri)              ← uses IntentLauncher with MIME type
  //
  // Also fixed: licenseDocIsPdf state is now properly set when loading from
  // API (base64) so the branch is entered correctly every time.
  // ─────────────────────────────────────────────────────────────────────────
  const viewLicenseDoc = async () => {
    try {
      if (licenseDocUri) {
        // Newly picked file — URI is already on device
        if (licenseDocIsPdf) {
          await openPdf(licenseDocUri);
        } else {
          setViewingImageUri(licenseDocUri);
        }
        return;
      }

      if (licenseDocBase64) {
        const cleanDoc = licenseDocBase64
          .replace(/^data:[^;]+;base64,/, "")
          .replace(/[\s\r\n]/g, "");

        const isPdf = cleanDoc.startsWith("JVBER");
        console.log("[viewLicenseDoc] isPdf:", isPdf, "length:", cleanDoc.length);

        if (isPdf) {
          // Write base64 to a temp file then open with explicit MIME type
          const tmpUri = await base64ToTempUri(
            cleanDoc,
            `license_doc_${Date.now()}.pdf`,
          );
          await openPdf(tmpUri);
        } else {
          setViewingImageUri(`data:image/jpeg;base64,${cleanDoc}`);
        }
      }
    } catch (e) {
      console.error("[viewLicenseDoc]", e);
      Alert.alert("Error", "Could not open document. Please try again.");
    }
  };

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: "" }));

  const handleDateChange = (_: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) setLicenseExpiry(date.toISOString().split("T")[0]);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Driver name is required";
    if (!phone.trim()) e.phone = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(phone))
      e.phone = "Enter valid 10 digit mobile number";
    if (!licenseNumber.trim()) e.license = "License number required";
    if (!licenseExpiry) e.expiry = "License expiry required";
    if (!isEdit && !photoUri && !photoBase64) e.photo = "Driver photo required";
    if (!isEdit && !licenseDocUri && !licenseDocBase64)
      e.licenseDoc = "License document required";
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
        fd.append("photo", {
          uri: photoUri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      }

      if (licenseDocUri) {
        const ext = licenseDocMimeType === "application/pdf" ? "pdf" : "jpg";
        fd.append("license", {
          uri: licenseDocUri,
          name: `license.${ext}`,
          type: licenseDocMimeType ?? "image/jpeg",
        } as any);
      } else if (licenseDocBase64 && isEdit) {
        const cleanBase64 = licenseDocBase64
          .replace(/^data:[^;]+;base64,/, "")
          .replace(/[\s\r\n]/g, "");
        const isPdf = cleanBase64.startsWith("JVBER");
        const ext = isPdf ? "pdf" : "jpg";
        const mime = isPdf ? "application/pdf" : "image/jpeg";
        const tmpUri = await base64ToTempUri(cleanBase64, `license_resubmit.${ext}`);
        fd.append("license", {
          uri: tmpUri,
          name: `license.${ext}`,
          type: mime,
        } as any);
      }

      if (isEdit && id) {
        fd.append("driver_Id", Number(id) as any);
      }

      const endpoint = isEdit
        ? `${API_BASE}/Update_DriversInfo`
        : `${API_BASE}/ADD_DriversInfo`;

      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      console.log("[AddDriver] POST response:", JSON.stringify(data));
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
  const licenseDocLabel =
    licenseDocName ??
    (licenseDocUri ? licenseDocUri.split("/").pop() : null) ??
    (licenseDocBase64 ? "Document uploaded" : null);

  const headerTitle = isView
    ? "View Driver"
    : isEdit
      ? "Edit Driver"
      : "Add Driver";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <TransactionalHeader title={headerTitle} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            {/* ── Photo ── */}
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={styles.photoCircle}
                onPress={handlePhotoPress}
                activeOpacity={isView ? 1 : 0.7}
                disabled={isView}
              >
                {photoSource ? (
                  <Image source={photoSource} style={styles.photoImage} />
                ) : (
                  <MaterialIcons
                    name="camera-alt"
                    size={28}
                    color={`${AmbColors.primary}80`}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                {isView ? (
                  photoSource ? "Profile photo" : "No photo"
                ) : (
                  <Text>
                    Tap to add photo
                    {!isEdit && <Text style={styles.required}> *</Text>}
                  </Text>
                )}
              </Text>
              {errors.photo ? (
                <Text style={styles.errorText}>{errors.photo}</Text>
              ) : null}
            </View>

            {/* ── Full Name ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                FULL NAME{!isView && <Text style={styles.required}> *</Text>}
              </Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="person" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rahul Singh"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={name}
                  onChangeText={(v) => { setName(v); clearError("name"); }}
                  autoCapitalize="words"
                  editable={!isView}
                />
              </View>
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* ── Phone Number ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                PHONE NUMBER{!isView && <Text style={styles.required}> *</Text>}
              </Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="phone" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={phone}
                  onChangeText={(v) => { setPhone(v); clearError("phone"); }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isView}
                />
              </View>
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>

            {/* Assigned Ambulance — view only */}
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
            {/* ── License Number ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                LICENSE NUMBER{!isView && <Text style={styles.required}> *</Text>}
              </Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="badge" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. DL-12345"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={licenseNumber}
                  onChangeText={(v) => { setLicenseNumber(v); clearError("license"); }}
                  autoCapitalize="characters"
                  editable={!isView}
                />
              </View>
              {errors.license ? (
                <Text style={styles.errorText}>{errors.license}</Text>
              ) : null}
            </View>

            {/* ── License Expiry ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                LICENSE EXPIRY DATE{!isView && <Text style={styles.required}> *</Text>}
              </Text>
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
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color={AmbColors.outline}
                    style={styles.dateChevron}
                  />
                )}
              </TouchableOpacity>
              {errors.expiry ? (
                <Text style={styles.errorText}>{errors.expiry}</Text>
              ) : null}
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

            {/* ── License Document ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                LICENSE DOCUMENT
                {!isView && !isEdit && <Text style={styles.required}> *</Text>}
              </Text>
              <TouchableOpacity
                style={[
                  styles.docUploadBox,
                  hasLicenseDoc && styles.docUploadBoxDone,
                ]}
                onPress={
                  hasLicenseDoc
                    ? viewLicenseDoc
                    : isView
                      ? undefined
                      : pickLicenseDoc
                }
                activeOpacity={isView && !hasLicenseDoc ? 1 : 0.7}
                disabled={isView && !hasLicenseDoc}
              >
                {hasLicenseDoc ? (
                  <View style={styles.docUploadedRow}>
                    <MaterialIcons
                      name="check-circle"
                      size={22}
                      color={AmbColors.tertiary}
                    />
                    <Text style={styles.docUploadedName} numberOfLines={1}>
                      {licenseDocLabel}
                    </Text>
                    {!isView && (
                      <TouchableOpacity
                        onPress={pickLicenseDoc}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialIcons
                          name="edit"
                          size={16}
                          color={AmbColors.secondary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.docUploadPlaceholder}>
                    <MaterialIcons
                      name="upload-file"
                      size={28}
                      color={`${AmbColors.outline}60`}
                    />
                    <Text style={styles.docUploadLabel}>
                      {isView
                        ? "No document uploaded"
                        : "Tap to upload (PDF or image, max 200KB)"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.licenseDoc ? (
                <Text style={styles.errorText}>{errors.licenseDoc}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.availabilityCard}>
            <View style={styles.availabilityLeft}>
              <MaterialIcons name="schedule" size={20} color={AmbColors.tertiary} />
              <View>
                <Text style={styles.availabilityTitle}>Availability</Text>
                <Text style={styles.availabilitySub}>
                  {isView
                    ? "Schedule not configured"
                    : "Set working hours after adding driver"}
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={`${AmbColors.secondary}66`}
            />
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
              <MaterialIcons
                name={isEdit ? "save" : "person-add"}
                size={20}
                color="#fff"
              />
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
        message={
          isEdit
            ? "Driver information has been updated."
            : "The driver has been added to your fleet."
        }
        confirmText="OK"
        onConfirm={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        iconName="check-circle"
      />

      {/* Image Viewer Modal */}
      <Modal
        visible={!!viewingImageUri}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingImageUri(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setViewingImageUri(null)}
          >
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${AmbColors.primary}10`,
    borderRadius: AmbRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  viewModeBannerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: AmbColors.primary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AmbColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionNumberText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#ffffff",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: AmbColors.onSurface,
  },

  formCard: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 20,
    gap: 18,
    marginBottom: 20,
    ...AmbShadow.subtle,
  },

  photoSection: { alignItems: "center", gap: 10 },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: AmbColors.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerLow,
    overflow: "hidden",
  },
  photoImage: { width: 100, height: 100, borderRadius: 50 },
  photoHint: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: `${AmbColors.outline}aa`,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: AmbColors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  required: { color: "#E53935", fontFamily: "Inter_600SemiBold" },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: AmbColors.error,
    marginTop: 2,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    paddingRight: 14,
    overflow: "hidden",
  },
  inputDisabled: {
    backgroundColor: AmbColors.surfaceContainerHighest,
    opacity: 0.7,
  },
  inputIconBox: {
    width: 46,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${AmbColors.primary}10`,
  },
  textInput: {
    flex: 1,
    paddingLeft: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: AmbColors.onSurface,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    overflow: "hidden",
  },
  dateText: {
    flex: 1,
    paddingLeft: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  datePlaceholder: { color: `${AmbColors.outline}80` },
  dateChevron: { marginRight: 12 },

  docUploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerLow,
  },
  docUploadBoxDone: {
    borderColor: AmbColors.tertiary,
    borderStyle: "solid",
    backgroundColor: `${AmbColors.tertiary}08`,
  },
  docUploadedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  docUploadedName: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: AmbColors.tertiary,
  },
  docUploadPlaceholder: { alignItems: "center", gap: 6 },
  docUploadLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: `${AmbColors.outline}bb`,
  },

  availabilityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 18,
    ...AmbShadow.subtle,
  },
  availabilityLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  availabilityTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  availabilitySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: AmbColors.secondary,
    marginTop: 2,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AmbColors.surfaceContainerLowest,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...AmbShadow.elevated,
  },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    height: 54,
    backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.md,
    ...AmbShadow.card,
  },
  submitBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },

  imageViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerClose: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  imageViewerImg: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.75,
  },
});