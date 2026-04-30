// import React, { useState, useEffect, useContext } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Image,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import { AuthContext } from "@/src/core/context/AuthContext";
// import api from "@/src/core/api/apiClient";
// import {
//   Colors,
//   FontFamily,
//   FontSize,
//   Spacing,
//   Radius,
//   Shadow,
//   ButtonSize,
// } from "@/src/shared/constants/theme";
// import {
//   isValidEmail,
//   isValidMobile,
//   isValidPinCode,
// } from "@/src/shared/utils/validation";

// // ── Types ─────────────────────────────────────────────────────────────────────

// type CleanerPersonalForm = {
//   name: string;
//   gender: string;
//   dob: string;
//   email: string;
//   phone: string;
//   altPhone: string;
//   bloodGroup: string;
//   addr1: string;
//   addr2: string;
//   city: string;
//   state: string;
//   pin: string;
//   summary: string;
//   pan: string;
//   aadhaar: string;
// };

// type FormErrors = Partial<Record<keyof CleanerPersonalForm, string>>;

// const EMPTY_FORM: CleanerPersonalForm = {
//   name: "",
//   gender: "",
//   dob: "",
//   email: "",
//   phone: "",
//   altPhone: "",
//   bloodGroup: "",
//   addr1: "",
//   addr2: "",
//   city: "",
//   state: "",
//   pin: "",
//   summary: "",
//   pan: "",
//   aadhaar: "",
// };

// const GENDER_OPTIONS = ["Male", "Female", "Other"];
// const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// const isPdfBase64 = (b64 = "") => b64.startsWith("JVBER");

// // ── Helpers ───────────────────────────────────────────────────────────────────

// function validateForm(form: CleanerPersonalForm): FormErrors {
//   const err: FormErrors = {};
//   if (!form.name.trim()) err.name = "Full name is required";
//   if (!form.gender.trim()) err.gender = "Gender is required";
//   if (!form.dob.trim()) err.dob = "Date of birth is required";
//   if (!form.email.trim()) err.email = "Email is required";
//   else if (!isValidEmail(form.email)) err.email = "Enter a valid email address";
//   if (!form.phone.trim()) err.phone = "Phone number is required";
//   else if (!isValidMobile(form.phone))
//     err.phone = "Enter a valid 10-digit mobile number";
//   if (form.altPhone && !isValidMobile(form.altPhone))
//     err.altPhone = "Enter a valid 10-digit number";
//   if (!form.addr1.trim()) err.addr1 = "Address is required";
//   if (!form.city.trim()) err.city = "City is required";
//   if (!form.state.trim()) err.state = "State is required";
//   if (!form.pin.trim()) err.pin = "Pincode is required";
//   else if (!isValidPinCode(form.pin)) err.pin = "Enter a valid 6-digit PIN";
//   return err;
// }

// // ── Main Component ────────────────────────────────────────────────────────────

// export default function PersonalDetailsScreen() {
//   const router = useRouter();
//   const auth = useContext(AuthContext);
//   const vendorId = auth?.user?.vendorId;

//   const [form, setForm] = useState<CleanerPersonalForm>(EMPTY_FORM);
//   const [originalForm, setOriginalForm] =
//     useState<CleanerPersonalForm>(EMPTY_FORM);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [statusMsg, setStatusMsg] = useState<{
//     text: string;
//     ok: boolean;
//   } | null>(null);

//   // Document images (base64 or uri)
//   const [profileImg, setProfileImg] = useState<string | null>(null);
//   const [licenseDoc, setLicenseDoc] = useState<string | null>(null);
//   const [panDoc, setPanDoc] = useState<string | null>(null);
//   const [aadhaarDoc, setAadhaarDoc] = useState<string | null>(null);

//   // Dropdown menus
//   const [showGenderMenu, setShowGenderMenu] = useState(false);
//   const [showBloodMenu, setShowBloodMenu] = useState(false);

//   useEffect(() => {
//     if (vendorId) loadPersonalDetails();
//   }, [vendorId]);

//   const loadPersonalDetails = async () => {
//   try {
//     const res = await api.get(
//       `/api/Cleaner/GetCleanerPersonnelInfoById/${vendorId}`
//     );

//     const d = res.data?.data?.cleaner || {};
//     const images = res.data?.data?.images || {};

//     console.log("Fetched personal details:", d);

//     const loaded = {
//       name: d.full_name ?? "",
//       gender: d.gender ?? "",
//       dob: d.dob ?? "",
//       email: d.email ?? "",
//       phone: d.mobile ?? "",
//       altPhone: d.mobile_1 ?? "",
//       bloodGroup: d.bloodG ?? "", // ⚠️ IMPORTANT FIX
//       addr1: d.adrs_1 ?? "",
//       addr2: d.adrs_2 ?? "",
//       city: d.city ?? "",
//       state: d.state ?? "",
//       pin: d.pin_code ?? "",
//       summary: d.summary ?? "",
//       pan: d.panNo ?? "",       // ⚠️ IMPORTANT FIX
//       aadhaar: d.adhaarNo ?? "" // ⚠️ IMPORTANT FIX
//     };

//     setForm(loaded);
//     setOriginalForm(loaded);

//     // Profile Image
//     if (images?.photo) {
//       if (!isPdfBase64(images.photo)) {
//         setProfileImg(`data:image/*;base64,${images.photo}`);
//       }
//     }

//     // Documents
//     if (images?.license) setLicenseDoc(images.license);
//     if (images?.pan) setPanDoc(images.pan);
//     if (images?.adhaar) setAadhaarDoc(images.adhaar);

//   } catch (e) {
//     console.log("Personal details fetch error:", e);
//   } finally {
//     setLoading(false);
//   }
// };

//   function update(key: keyof CleanerPersonalForm, val: string) {
//     setForm((prev) => ({ ...prev, [key]: val }));
//     if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
//   }

//   function showStatus(text: string, ok: boolean) {
//     setStatusMsg({ text, ok });
//     setTimeout(() => setStatusMsg(null), 3500);
//   }

//   function handleEdit() {
//     setOriginalForm(form);
//     setErrors({});
//     setIsEditing(true);
//   }

//   function handleCancel() {
//     setForm(originalForm);
//     setErrors({});
//     setIsEditing(false);
//     setShowGenderMenu(false);
//     setShowBloodMenu(false);
//   }

//   const pickProfileImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission required",
//         "Allow photo library access to upload a photo.",
//       );
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.7,
//       base64: true,
//     });
//     if (!result.canceled && result.assets[0]) {
//       const asset = result.assets[0];
//       setProfileImg(asset.uri);
//     }
//   };

//   const pickDocument = async (
//     setter: (v: string | null) => void,
//     label: string,
//   ) => {
//     if (!isEditing) return;
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission required",
//         `Allow photo library access to upload ${label}.`,
//       );
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//       base64: true,
//     });
//     if (!result.canceled && result.assets[0]) {
//       setter(result.assets[0].uri);
//     }
//   };

//   const handleSignOut = async () => {
//     await auth?.logout();
//   };

//   const handleUpdate = async () => {
//     const validationErrors = validateForm(form);
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setSaving(true);
//     try {
//       const payload = new FormData();
//       payload.append("vendor_id", vendorId ?? "");
//       payload.append("full_name", form.name);
//       payload.append("gender", form.gender);
//       payload.append("dob", form.dob);
//       payload.append("email", form.email);
//       payload.append("mobile", form.phone);
//       payload.append("mobile_1", form.altPhone);
//       payload.append("blood_group", form.bloodGroup);
//       payload.append("adrs_1", form.addr1);
//       payload.append("adrs_2", form.addr2);
//       payload.append("City", form.city);
//       payload.append("State", form.state);
//       payload.append("pin_code", form.pin);
//       payload.append("Summary", form.summary);
//       payload.append("pan", form.pan);
//       payload.append("aadhaar", form.aadhaar);

//       const response = await fetch(
//         "https://coreapi-service-111763741518.asia-south1.run.app/api/Cleaner/UpdateCleanerPersonnelInfo",
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${auth?.user?.token}`,
//           },
//           body: payload,
//         },
//       );

//       const data = await response.json();
//       console.log("Update response:", data);
//       if (!response.ok) {
//         throw new Error(data?.message || "Update failed");
//       }

//       setOriginalForm(form);
//       setIsEditing(false);
//       showStatus("Profile updated successfully.", true);
//     } catch (e: any) {
//       console.log("Personal details update error:", e);
//       showStatus("Failed to save. Please try again.", false);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered} edges={["top"]}>
//         <ActivityIndicator size="large" color={Colors.light.primary} />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top"]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.backBtn}
//           activeOpacity={0.7}
//         >
//           <MaterialIcons
//             name="arrow-back"
//             size={24}
//             color={Colors.light.onSurface}
//           />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Personal Details</Text>
//         {isEditing ? (
//           <TouchableOpacity
//             onPress={handleCancel}
//             style={styles.actionBtn}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.actionBtnText, { color: Colors.light.error }]}>
//               Cancel
//             </Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             onPress={handleEdit}
//             style={styles.actionBtn}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionBtnText}>Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <ScrollView
//           style={styles.scroll}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* ── Profile Photo ─────────────────────────────────────── */}
//           <View style={styles.profileSection}>
//             <View style={styles.avatarWrap}>
//               {profileImg ? (
//                 <Image source={{ uri: profileImg }} style={styles.avatar} />
//               ) : (
//                 <View style={styles.avatarPlaceholder}>
//                   <MaterialIcons
//                     name="person"
//                     size={56}
//                     color={Colors.light.onSurfaceVariant}
//                   />
//                 </View>
//               )}
//               {isEditing && (
//                 <TouchableOpacity
//                   style={styles.editAvatarBtn}
//                   onPress={pickProfileImage}
//                   activeOpacity={0.8}
//                 >
//                   <MaterialIcons
//                     name="edit"
//                     size={16}
//                     color={Colors.light.onPrimary}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>
//             <Text style={styles.profileName}>
//               {form.name || "Staff Profile"}
//             </Text>
//             <Text style={styles.profileRole}>Medical Professional</Text>
//           </View>

//           {/* ── Personal Information Card ─────────────────────────── */}
//           <View style={styles.sectionCard}>
//             <View style={styles.sectionHeader}>
//               <View style={styles.sectionIconWrap}>
//                 <MaterialIcons
//                   name="person"
//                   size={20}
//                   color={Colors.light.primary}
//                 />
//               </View>
//               <Text style={styles.sectionTitle}>Personal Information</Text>
//             </View>

//             {/* Full Name */}
//             <FormField
//               label="Full Name"
//               value={form.name}
//               placeholder="Enter full name"
//               onChangeText={(v) => update("name", v)}
//               editable={isEditing}
//               error={errors.name}
//             />

//             {/* Gender + DOB row */}
//             <View style={styles.twoCol}>
//               <View style={{ flex: 1 }}>
//                 {isEditing ? (
//                   <DropdownField
//                     label="Gender"
//                     value={form.gender}
//                     options={GENDER_OPTIONS}
//                     open={showGenderMenu}
//                     onToggle={() => {
//                       setShowGenderMenu((p) => !p);
//                       setShowBloodMenu(false);
//                     }}
//                     onSelect={(v) => {
//                       update("gender", v);
//                       setShowGenderMenu(false);
//                     }}
//                     error={errors.gender}
//                   />
//                 ) : (
//                   <FormField
//                     label="Gender"
//                     value={form.gender}
//                     placeholder="—"
//                     onChangeText={() => {}}
//                     editable={false}
//                   />
//                 )}
//               </View>
//               <View style={{ flex: 1 }}>
//                 <FormField
//                   label="DOB"
//                   value={form.dob}
//                   placeholder="DD-MM-YYYY"
//                   onChangeText={(v) => update("dob", v)}
//                   editable={isEditing}
//                   error={errors.dob}
//                   keyboardType="numeric"
//                 />
//               </View>
//             </View>

//             {/* Email */}
//             <FormField
//               label="Email Address"
//               value={form.email}
//               placeholder="Enter email"
//               onChangeText={(v) => update("email", v)}
//               editable={isEditing}
//               error={errors.email}
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />

//             {/* Phone + Alt Phone row */}
//             <View style={styles.twoCol}>
//               <View style={{ flex: 1 }}>
//                 <FormField
//                   label="Phone"
//                   value={form.phone}
//                   placeholder="10-digit number"
//                   onChangeText={(v) => update("phone", v)}
//                   editable={isEditing}
//                   error={errors.phone}
//                   keyboardType="phone-pad"
//                   autoCapitalize="none"
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <FormField
//                   label="Alt. Phone"
//                   value={form.altPhone}
//                   placeholder="Optional"
//                   onChangeText={(v) => update("altPhone", v)}
//                   editable={isEditing}
//                   error={errors.altPhone}
//                   keyboardType="phone-pad"
//                   autoCapitalize="none"
//                 />
//               </View>
//             </View>

//             {/* Blood Group */}
//             {isEditing ? (
//               <DropdownField
//                 label="Blood Group"
//                 value={form.bloodGroup}
//                 options={BLOOD_GROUPS}
//                 open={showBloodMenu}
//                 onToggle={() => {
//                   setShowBloodMenu((p) => !p);
//                   setShowGenderMenu(false);
//                 }}
//                 onSelect={(v) => {
//                   update("bloodGroup", v);
//                   setShowBloodMenu(false);
//                 }}
//                 trailingIcon="bloodtype"
//                 trailingIconColor={Colors.light.error}
//               />
//             ) : (
//               <View style={styles.fieldWrap}>
//                 <Text style={styles.fieldLabel}>Blood Group</Text>
//                 <View style={styles.readOnlyWithTrail}>
//                   <Text style={styles.readOnlyText}>
//                     {form.bloodGroup || "—"}
//                   </Text>
//                   <MaterialIcons
//                     name="bloodtype"
//                     size={20}
//                     color={Colors.light.error}
//                   />
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* ── Address Card ──────────────────────────────────────── */}
//           <View style={styles.sectionCard}>
//             <View style={styles.sectionHeader}>
//               <View
//                 style={[
//                   styles.sectionIconWrap,
//                   { backgroundColor: Colors.light.tertiaryFixed + "30" },
//                 ]}
//               >
//                 <MaterialIcons
//                   name="location-on"
//                   size={20}
//                   color={Colors.light.tertiary}
//                 />
//               </View>
//               <Text style={styles.sectionTitle}>Address</Text>
//             </View>

//             <FormField
//               label="Street Address"
//               value={form.addr1}
//               placeholder="123 Health Avenue, Phase 2"
//               onChangeText={(v) => update("addr1", v)}
//               editable={isEditing}
//               error={errors.addr1}
//               multiline
//             />
//             <FormField
//               label="Address Line 2"
//               value={form.addr2}
//               placeholder="Landmark, area (optional)"
//               onChangeText={(v) => update("addr2", v)}
//               editable={isEditing}
//             />
//             <View style={styles.twoCol}>
//               <View style={{ flex: 1 }}>
//                 <FormField
//                   label="City"
//                   value={form.city}
//                   placeholder="City"
//                   onChangeText={(v) => update("city", v)}
//                   editable={isEditing}
//                   error={errors.city}
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <FormField
//                   label="State"
//                   value={form.state}
//                   placeholder="State"
//                   onChangeText={(v) => update("state", v)}
//                   editable={isEditing}
//                   error={errors.state}
//                 />
//               </View>
//             </View>
//             <FormField
//               label="Pincode"
//               value={form.pin}
//               placeholder="6-digit PIN"
//               onChangeText={(v) => update("pin", v)}
//               editable={isEditing}
//               error={errors.pin}
//               keyboardType="numeric"
//               autoCapitalize="none"
//             />
//           </View>

//           {/* ── Verification Documents Card ───────────────────────── */}
//           <View style={styles.sectionCard}>
//             <View style={styles.sectionHeader}>
//               <View
//                 style={[
//                   styles.sectionIconWrap,
//                   { backgroundColor: Colors.light.primaryFixed },
//                 ]}
//               >
//                 <MaterialIcons
//                   name="description"
//                   size={20}
//                   color={Colors.light.primary}
//                 />
//               </View>
//               <Text style={styles.sectionTitle}>Verification Documents</Text>
//             </View>

//             <DocumentRow
//               icon="badge"
//               label="License"
//               value={form.pan /* reusing pan field as license number */}
//               docUri={licenseDoc}
//               isEditing={isEditing}
//               onUpload={() => pickDocument(setLicenseDoc, "License")}
//             />
//             <DocumentRow
//               icon="credit-card"
//               label="PAN Card"
//               value={form.pan}
//               docUri={panDoc}
//               isEditing={isEditing}
//               onUpload={() => pickDocument(setPanDoc, "PAN Card")}
//             />
//             <DocumentRow
//               icon="fingerprint"
//               label="Aadhaar Card"
//               value={form.aadhaar}
//               docUri={aadhaarDoc}
//               isEditing={isEditing}
//               onUpload={() => pickDocument(setAadhaarDoc, "Aadhaar Card")}
//             />
//           </View>

//           {/* Status banner */}
//           {statusMsg && (
//             <View
//               style={[
//                 styles.banner,
//                 statusMsg.ok ? styles.bannerOk : styles.bannerErr,
//               ]}
//             >
//               <MaterialIcons
//                 name={statusMsg.ok ? "check-circle" : "error-outline"}
//                 size={16}
//                 color={
//                   statusMsg.ok ? Colors.light.tertiary : Colors.light.error
//                 }
//               />
//               <Text
//                 style={[
//                   styles.bannerText,
//                   {
//                     color: statusMsg.ok
//                       ? Colors.light.tertiary
//                       : Colors.light.error,
//                   },
//                 ]}
//               >
//                 {statusMsg.text}
//               </Text>
//             </View>
//           )}

//           {/* Sign Out */}
//           {!isEditing && (
//             <TouchableOpacity
//               style={styles.signOutBtn}
//               onPress={handleSignOut}
//               activeOpacity={0.8}
//             >
//               <MaterialIcons name="logout" size={18} color={Colors.light.error} />
//               <Text style={styles.signOutText}>Sign Out</Text>
//             </TouchableOpacity>
//           )}

//           <View style={{ height: isEditing ? 100 : Spacing.xl }} />
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Sticky Update button */}
//       {isEditing && (
//         <View style={styles.updateBar}>
//           <TouchableOpacity
//             style={styles.updateBtn}
//             onPress={handleUpdate}
//             disabled={saving}
//             activeOpacity={0.85}
//           >
//             {saving ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <>
//                 <Text style={styles.updateBtnText}>Update Details</Text>
//                 <MaterialIcons name="arrow-forward" size={20} color="#fff" />
//               </>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// // ── Sub-components ────────────────────────────────────────────────────────────

// function FormField({
//   label,
//   value,
//   placeholder,
//   onChangeText,
//   editable = true,
//   error,
//   keyboardType,
//   autoCapitalize,
//   multiline,
// }: {
//   label: string;
//   value: string;
//   placeholder: string;
//   onChangeText: (v: string) => void;
//   editable?: boolean;
//   error?: string;
//   keyboardType?: any;
//   autoCapitalize?: any;
//   multiline?: boolean;
// }) {
//   return (
//     <View style={styles.fieldWrap}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       {editable ? (
//         <TextInput
//           style={[
//             styles.textInput,
//             error ? styles.inputError : null,
//             multiline ? styles.multilineInput : null,
//           ]}
//           value={value}
//           placeholder={placeholder}
//           placeholderTextColor={Colors.light.outline}
//           onChangeText={onChangeText}
//           keyboardType={keyboardType ?? "default"}
//           autoCapitalize={autoCapitalize ?? "words"}
//           multiline={multiline}
//           numberOfLines={multiline ? 3 : 1}
//         />
//       ) : (
//         <View style={styles.readOnlyBox}>
//           <Text style={styles.readOnlyText}>{value || "—"}</Text>
//         </View>
//       )}
//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// }

// function DropdownField({
//   label,
//   value,
//   options,
//   open,
//   onToggle,
//   onSelect,
//   error,
//   trailingIcon,
//   trailingIconColor,
// }: {
//   label: string;
//   value: string;
//   options: string[];
//   open: boolean;
//   onToggle: () => void;
//   onSelect: (v: string) => void;
//   error?: string;
//   trailingIcon?: string;
//   trailingIconColor?: string;
// }) {
//   return (
//     <View style={styles.fieldWrap}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <TouchableOpacity
//         style={[styles.dropdownTrigger, error ? styles.inputError : null]}
//         onPress={onToggle}
//         activeOpacity={0.75}
//       >
//         <Text
//           style={[
//             styles.dropdownText,
//             !value && { color: Colors.light.outline },
//           ]}
//         >
//           {value || `Select ${label}`}
//         </Text>
//         {trailingIcon ? (
//           <MaterialIcons
//             name={trailingIcon as any}
//             size={20}
//             color={trailingIconColor ?? Colors.light.onSurfaceVariant}
//           />
//         ) : (
//           <MaterialIcons
//             name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
//             size={22}
//             color={Colors.light.outline}
//           />
//         )}
//       </TouchableOpacity>
//       {error && <Text style={styles.errorText}>{error}</Text>}
//       {open && (
//         <View style={styles.dropdownMenu}>
//           {options.map((opt) => (
//             <TouchableOpacity
//               key={opt}
//               style={[
//                 styles.dropdownItem,
//                 value === opt && styles.dropdownItemActive,
//               ]}
//               onPress={() => onSelect(opt)}
//               activeOpacity={0.7}
//             >
//               <Text
//                 style={[
//                   styles.dropdownItemText,
//                   value === opt && styles.dropdownItemTextActive,
//                 ]}
//               >
//                 {opt}
//               </Text>
//               {value === opt && (
//                 <MaterialIcons
//                   name="check"
//                   size={16}
//                   color={Colors.light.primary}
//                 />
//               )}
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }

// function DocumentRow({
//   icon,
//   label,
//   value,
//   docUri,
//   isEditing,
//   onUpload,
// }: {
//   icon: string;
//   label: string;
//   value: string;
//   docUri: string | null;
//   isEditing: boolean;
//   onUpload: () => void;
// }) {
//   const hasDoc = !!docUri;
//   return (
//     <View style={styles.docRow}>
//       <View style={styles.docIconWrap}>
//         <MaterialIcons
//           name={icon as any}
//           size={24}
//           color={Colors.light.primary}
//         />
//       </View>
//       <View style={styles.docInfo}>
//         <Text style={styles.docLabel}>{label}</Text>
//         <Text style={styles.docValue} numberOfLines={1}>
//           {value || (hasDoc ? "Uploaded" : "Not Uploaded")}
//         </Text>
//       </View>
//       {isEditing ? (
//         <TouchableOpacity
//           style={styles.uploadBtn}
//           onPress={onUpload}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.uploadBtnText}>
//             {hasDoc ? "CHANGE" : "UPLOAD"}
//           </Text>
//         </TouchableOpacity>
//       ) : hasDoc ? (
//         <MaterialIcons
//           name="check-circle"
//           size={24}
//           color={Colors.light.tertiary}
//         />
//       ) : (
//         <MaterialIcons
//           name="radio-button-unchecked"
//           size={24}
//           color={Colors.light.outline}
//         />
//       )}
//     </View>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: Colors.light.background },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.sm,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.light.outlineVariant,
//   },
//   backBtn: {
//     width: 40,
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: Radius.full,
//   },
//   headerTitle: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.titleLarge,
//     color: Colors.light.onSurface,
//   },
//   actionBtn: {
//     minWidth: 60,
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: Spacing.sm,
//   },
//   actionBtnText: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.primary,
//   },

//   scroll: { flex: 1 },
//   scrollContent: {
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.lg,
//     gap: Spacing.md,
//   },

//   // Profile section
//   profileSection: { alignItems: "center", marginBottom: Spacing.sm },
//   avatarWrap: { position: "relative" },
//   avatar: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 4,
//     borderColor: Colors.light.surfaceContainerLowest,
//   },
//   avatarPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: Colors.light.surfaceContainerHighest,
//     borderWidth: 4,
//     borderColor: Colors.light.surfaceContainerLowest,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   editAvatarBtn: {
//     position: "absolute",
//     bottom: 2,
//     right: 2,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: Colors.light.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     ...Shadow.card,
//   },
//   profileName: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.headlineSmall,
//     color: Colors.light.onSurface,
//     marginTop: Spacing.md,
//     letterSpacing: -0.3,
//   },
//   profileRole: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodySmall,
//     color: Colors.light.onSurfaceVariant,
//     textTransform: "uppercase",
//     letterSpacing: 1.5,
//     marginTop: 4,
//   },

//   // Section card
//   sectionCard: {
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.xl,
//     padding: Spacing.lg,
//     ...Shadow.subtle,
//     gap: Spacing.md,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: Spacing.sm,
//     marginBottom: Spacing.xs,
//   },
//   sectionIconWrap: {
//     width: 40,
//     height: 40,
//     borderRadius: Radius.lg,
//     backgroundColor: Colors.light.primaryFixed,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   sectionTitle: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.titleLarge,
//     color: Colors.light.onSurface,
//   },

//   // Fields
//   twoCol: { flexDirection: "row", gap: Spacing.sm },
//   fieldWrap: { gap: 6 },
//   fieldLabel: {
//     fontFamily: FontFamily.bodySemiBold,
//     fontSize: FontSize.labelSmall,
//     color: Colors.light.onSurfaceVariant,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//   },
//   textInput: {
//     backgroundColor: Colors.light.surfaceContainerHigh,
//     borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 12,
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//   },
//   multilineInput: {
//     minHeight: 80,
//     textAlignVertical: "top",
//   },
//   inputError: { borderWidth: 1, borderColor: Colors.light.error },
//   errorText: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.labelSmall,
//     color: Colors.light.error,
//   },
//   readOnlyBox: {
//     backgroundColor: Colors.light.surfaceContainerHigh,
//     borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 12,
//   },
//   readOnlyText: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//   },
//   readOnlyWithTrail: {
//     backgroundColor: Colors.light.surfaceContainerHigh,
//     borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   // Dropdown
//   dropdownTrigger: {
//     backgroundColor: Colors.light.surfaceContainerHigh,
//     borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   dropdownText: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//     flex: 1,
//   },
//   dropdownMenu: {
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.lg,
//     overflow: "hidden",
//     ...Shadow.subtle,
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 12,
//   },
//   dropdownItemActive: { backgroundColor: Colors.light.surfaceContainerLow },
//   dropdownItemText: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//   },
//   dropdownItemTextActive: {
//     fontFamily: FontFamily.bodyMedium,
//     color: Colors.light.primary,
//   },

//   // Document rows
//   docRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: Spacing.md,
//     backgroundColor: Colors.light.surfaceContainerHigh,
//     borderRadius: Radius.xl,
//     padding: Spacing.md,
//     borderWidth: 1.5,
//     borderStyle: "dashed",
//     borderColor: Colors.light.outlineVariant,
//   },
//   docIconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: Radius.lg,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   },
//   docInfo: { flex: 1 },
//   docLabel: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.bodySmall,
//     color: Colors.light.onSurface,
//   },
//   docValue: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.labelSmall,
//     color: Colors.light.onSurfaceVariant,
//     marginTop: 2,
//   },
//   uploadBtn: {
//     backgroundColor: Colors.light.primary,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 6,
//     borderRadius: Radius.md,
//   },
//   uploadBtnText: {
//     fontFamily: FontFamily.bodySemiBold,
//     fontSize: FontSize.labelSmall,
//     color: Colors.light.onPrimary,
//   },

//   // Status banner
//   banner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: Spacing.xs,
//     padding: Spacing.sm,
//     borderRadius: Radius.lg,
//   },
//   bannerOk: { backgroundColor: Colors.light.tertiaryFixed + "40" },
//   bannerErr: { backgroundColor: Colors.light.errorContainer },
//   bannerText: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodySmall,
//     flex: 1,
//   },

//   // Update bar
//   updateBar: {
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.sm,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderTopWidth: 1,
//     borderTopColor: Colors.light.outlineVariant,
//   },
//   updateBtn: {
//     backgroundColor: Colors.light.primary,
//     borderRadius: Radius.xl,
//     height: ButtonSize.minHeight + 8,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: Spacing.sm,
//     ...Shadow.card,
//   },
//   updateBtnText: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.bodyMedium,
//     color: "#fff",
//   },

//   signOutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: Spacing.sm,
//     borderWidth: 1,
//     borderColor: Colors.light.error,
//     borderRadius: Radius.lg,
//     height: ButtonSize.minHeight,
//     marginTop: Spacing.sm,
//   },
//   signOutText: {
//     fontFamily: FontFamily.bodySemiBold,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.error,
//   },
// });

import React, { useEffect, useState ,useRef,useCallback } from "react";
import AppHeader from "@/src/shared/components/AppHeader";
import { GoogleMapApiKey } from "@/src/utils/Apis";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "react-native";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import * as IntentLauncher from "expo-intent-launcher";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { Platform } from "react-native";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";


/* ✅ TYPES */
type FormType = {
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  mobile: string;
  altMobile: string;
  bloodGroup: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  aadhaar: string;
  summary: string;

  photoUrl: string;
  panUrl: string;
  aadhaarUrl: string;
  licenseUrl: string;
};

type ErrorType = Partial<Record<keyof FormType | "photoFile" | "panFile" | "aadhaarFile" | "licenseFile", string>>;

export default function Personal() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
 type FileType = {
  uri: string;
  name: string;
  type: string;
} | null;

const [files, setFiles] = useState<{
  photo: FileType;
  pan: FileType;
  aadhaar: FileType;
  license: FileType;
}>({
  photo: null,
  pan: null,
  aadhaar: null,
  license: null,
});

  const [formData, setFormData] = useState<FormType>({
    fullName: "",
    gender: "",
    dob: "",
    email: "",
    mobile: "",
    altMobile: "",
    bloodGroup: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    aadhaar: "",
    summary: "",

    photoUrl: "",
  panUrl: "",
  aadhaarUrl: "",
  licenseUrl: "",
    
  });
  const [viewer, setViewer] = useState<{
  visible: boolean;
  uri: string;
  type: "image" | "pdf" | null;
}>({
  visible: false,
  uri: "",
  type: null,
});
const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);
const navigation = useNavigation();

const GENDER_MAP: Record<string, string> = {
  "M": "Male",
  "F": "Female",
  "O": "Other",
  "Male": "M",
  "Female": "F",
  "Other": "O"
};
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const [showDatePicker, setShowDatePicker] = useState(false);
const scrollRef = useRef<ScrollView>(null); // Ref for scrolling to top
  const [successMessage, setSuccessMessage] = useState("");
  const [cityQuery, setCityQuery] = useState("");
const [cityResults, setCityResults] = useState<any[]>([]);
const [citySelected, setCitySelected] = useState(false);
const [isCityFocused, setIsCityFocused] = useState(false);
const [successModal, setSuccessModal] = useState(false);
const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
const router = useRouter();

useEffect(() => {
  setCityQuery(formData.city);
}, [formData.city]);

useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(nurse)/profile"); // navigate
        return true; // prevent default back
      }
    );

    return () => subscription.remove(); // cleanup
  }, [])
);

useEffect(() => {
  if (!isCityFocused) return;
  if (citySelected) return;
  if (!isEditing) return;
  if (cityQuery.length < 2) {
    setCityResults([]);
    return;
  }



  const timer = setTimeout(async () => {
    try {
      const res = await fetch(
  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(cityQuery)}&types=(cities)&components=country:in&key=${GoogleMapApiKey}`
);

      const data = await res.json();
      setCityResults(data.predictions || []);
    } catch (err) {
      console.log("Autocomplete error:", err);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [cityQuery, isEditing, isCityFocused]);

const fetchPlaceDetails = async (placeId: string) => {
  setCitySelected(true);
  setCityResults([]);

  try {
    const res = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GoogleMapApiKey}&fields=address_components`
);

    const data = await res.json();
    const details = data.result;

    let city = "";
    let state = "";
    let pin = "";

    details.address_components.forEach((comp: any) => {
      const types = comp.types;

      if (types.includes("locality")) city = comp.long_name;
      if (!city && types.includes("administrative_area_level_2"))
        city = comp.long_name;
      if (types.includes("administrative_area_level_1"))
        state = comp.long_name;
      if (types.includes("postal_code"))
        pin = comp.long_name;
    });

    setCityQuery(city);

    setFormData((prev) => ({
      ...prev,
      city,
      state,
      pincode: pin || prev.pincode,
    }));

     setErrors((prev) => ({
      ...prev,
      city: "",
    }));

  } catch (err) {
    console.log("Place details error:", err);
  }
};

// Helper function to format Date object to YYYY-MM-DD
const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const onDateChange = (event: any, selectedDate?: Date) => {
  setShowDatePicker(false); // Hide picker
  if (selectedDate) {
    const formattedDate = formatDateForApi(selectedDate);
    handleChange("dob", formattedDate);
  }
};

const toFileSrc = (b64: string) => {
  if (!b64) return "";

  // if already has prefix → return as-is
  if (b64.startsWith("data:")) return b64;

  // detect PDF (same like your old code)
  const isPdf = b64.startsWith("JVBER");

  return isPdf
    ? `data:application/pdf;base64,${b64}`
    : `data:image/jpeg;base64,${b64}`;
};

useEffect(() => {
    if (successModal) {
        const timer = setTimeout(() => {
            setSuccessModal(false);
        }, 2000);
        return () => clearTimeout(timer);
    }
}, [successModal]);

const openFile = async (uri: string) => {
  if (!uri) return;

  const isPdf = uri.includes("application/pdf") || uri.startsWith("data:application/pdf") || uri.includes("JVBER");

  if (isPdf) {
    try {
      // 1. Clean the base64 string
      const cleanBase64 = uri.includes(",") ? uri.split(",")[1] : uri;

      // 2. Create a local path
      const fileUri = FileSystem.cacheDirectory + `temp_doc_${Date.now()}.pdf`;

      // 3. Write file to storage
      await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "android") {
        // 4. Get Content URI (Required for Android 10+)
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        
        // 5. Launch the Intent
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1, // Read permission
          type: "application/pdf",
        });
      } else {
        // iOS can open file URIs directly in Linking or a WebView
        Linking.openURL(fileUri);
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Could not open PDF viewer.");
    }
    return;
  }

  // If it's an image, use your existing state-based viewer
  setViewer({
    visible: true,
    uri,
    type: "image",
  });
};

const FileViewer = () => {
  if (!viewer.visible || viewer.type !== "image") return null;

  return (
    <Modal visible={viewer.visible} transparent={true} animationType="fade">
      <View style={styles.modal}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setViewer({ visible: false, uri: "", type: null })}
        >
          <Ionicons name="close-circle" size={40} color="white" />
        </TouchableOpacity>

        <Image
          source={{ uri: viewer.uri }}
          style={{ width: "95%", height: "80%", resizeMode: "contain" }}
        />
      </View>
    </Modal>
  );
};

  const [errors, setErrors] = useState<ErrorType>({});
  const [docs, setDocs] = useState({
  photo: "",
  pan: "",
  aadhaar: "",
});

const pickPhoto = async () => {
  setPhotoPickerVisible(true);
};

const openCamera = async () => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1, // take full quality first
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // 🔥 COMPRESS + RESIZE IMAGE
      const compressed = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 800 } }], // resize width (auto height)
        {
          compress: 0.3, // 🔥 main compression (0.1–0.4 best)
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // ✅ CHECK FINAL SIZE
      const fileInfo = await FileSystem.getInfoAsync(compressed.uri);

      if (fileInfo.exists && fileInfo.size && fileInfo.size > 200 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photoFile: "Compressed image still >200KB, try again",
        }));
        return;
      }

      const file = {
        uri: compressed.uri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      setFiles((prev) => ({
        ...prev,
        photo: file,
      }));

      setFormData((prev) => ({
        ...prev,
        photoUrl: compressed.uri,
      }));

      setErrors((prev) => ({
        ...prev,
        photoFile: "",
      }));
    }
  } catch (err) {
    console.log("Camera error:", err);
  }
};

const openGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      handlePickedImage(result.assets[0]);
    }
  } catch (err) {
    console.log("Gallery error:", err);
  }
};

const handlePickedImage = (asset: any) => {
  const maxSize = 200 * 1024;

  if (asset.fileSize && asset.fileSize > maxSize) {
    setErrors((prev) => ({
      ...prev,
      photoFile: "File must be less than 200KB",
    }));
    return;
  }

  const file = {
    uri: asset.uri,
    name: `photo_${Date.now()}.jpg`,
    type: "image/jpeg",
  };

  setFiles((prev) => ({
    ...prev,
    photo: file,
  }));

  setFormData((prev) => ({
    ...prev,
    photoUrl: asset.uri, // preview
  }));

  setErrors((prev) => ({
    ...prev,
    photoFile: "",
  }));
};

const pickPhotoOption = () => {
  Alert.alert(
    "Upload Photo",
    "Choose option",
    [
      {
        text: "Camera",
        onPress: openCamera,
      },
      {
        text: "Files",
        onPress: () => pickFile("photo"), // ✅ your existing logic
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]
  );
};

 const pickFile = async (type: "photo" | "pan" | "aadhaar"  | "license") => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset || !asset.uri) return;

    // ✅ 200KB Size Validation
    const maxSize = 200 * 1024; // 204,800 bytes
    if (asset.size && asset.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [`${type}File`]: "File size must be less than 200KB",
      }));
      return; // Stop execution
    }

    // Clear error if size is valid
    setErrors((prev) => ({ ...prev, [`${type}File`]: "" }));

    const file = {
      uri: asset.uri,
      name: asset.name || `file_${Date.now()}`,
      type: asset.mimeType || "application/octet-stream",
    };

    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
    
    // Update preview if it's an image
    if (file.type.includes("image")) {
       setFormData(prev => ({...prev, [`${type}Url`]: file.uri}));
    }

  } catch (err) {
    console.log("FILE PICK ERROR:", err);
  }
};
  /* 🔥 API CALL */
useEffect(() => {
  const init = async () => {
    try {
      
       const user = await AsyncStorage.getItem("user");
const parsed = JSON.parse(user || "{}");

const id = parsed?.vendorId;
    
      if (!id) return;

      setVendorId(id);
      fetchData(id);
    } catch (e) {
      console.log(e);
    }
  };

  init();
}, []);
const fetchData = async (id: string) => {
  setLoading(true);

const res = await fetch(
  `https://coreapi-service-111763741518.asia-south1.run.app/api/Cleaner/GetCleanerPersonnelInfoById/${id}`
);

const json = await res.json();


if (!res.ok) throw new Error("Failed to fetch data");

// ✅ CORRECT STRUCTURE
const cleaner = json?.data?.cleaner || {};
const images = json?.data?.images || {};

// ✅ FILES
const photoBase64 = images?.photo || "";
const panBase64 = images?.pan || "";
const aadhaarBase64 = images?.adhaar || images?.aadhaar || "";
const licenseBase64 = images?.license || "";

// ✅ BASE64 HANDLER
const toImage = (b64: string) => {
  if (!b64) return "";

  if (b64.startsWith("data:")) return b64;

  const isPdf = b64.startsWith("JVBER");

  return isPdf
    ? `data:application/pdf;base64,${b64}`
    : `data:image/jpeg;base64,${b64}`;
};

// ✅ SET FORM
setFormData((prev) => ({
  ...prev,
  fullName: cleaner.full_name || "",
  gender: GENDER_MAP[cleaner.gender] || cleaner.gender || "",
  dob: cleaner.dob || "",
  email: cleaner.email || "",
  mobile: cleaner.mobile || "",
  altMobile: cleaner.mobile_1 || "",
  bloodGroup: cleaner.bloodG || "",
  address1: cleaner.adrs_1 || "",
  address2: cleaner.adrs_2 || "",
  city: cleaner.city || "",
  state: cleaner.state || "",
  pincode: cleaner.pin_code || "",
  pan: cleaner.panNo || "",
  aadhaar: cleaner.adhaarNo || "",
  summary: cleaner.summary || "",
  qualification: cleaner.qualification || "",
  experience: String(cleaner.exp || ""),

  photoUrl: toImage(photoBase64),
  panUrl: toImage(panBase64),
  aadhaarUrl: toImage(aadhaarBase64),
  licenseUrl: toImage(licenseBase64),
}));

setLoading(false);
};

// const getImage = (b64: string) => {
//   if (!b64) return "";
//   return `data:image/jpeg;base64,${b64}`;
// };
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (vendorId) {
    fetchData(vendorId);
  }// reset to API data
  };

  const handleChange = (key: keyof FormType, value: string) => {
     let newValue = value; 

    // ✅ Aadhaar → only numbers + max 12 digits
  if (key === "aadhaar") {
     newValue = value.replace(/\D/g, "").slice(0, 12);
  }

   // ✅ PAN → uppercase + max 10
  if (key === "pan") {
    newValue = value.toUpperCase().slice(0, 10);
  }

  // ✅ Mobile → only numbers + max 10
  if (key === "mobile" || key === "altMobile") {
    newValue = value.replace(/\D/g, "").slice(0, 10);
  }

  // ✅ Pincode → only numbers + max 6
  if (key === "pincode") {
    newValue = value.replace(/\D/g, "").slice(0, 6);
  }

  setFormData((prev) => ({
    ...prev,
    [key]: newValue,
  }));

  // ✅ CLEAR ERROR WHEN USER TYPES (IMPORTANT)
  setErrors((prev) => ({
    ...prev,
    [key]: "",
  }));
};

  /* 🔥 VALIDATION */
 const validate = () => {
  const newErrors: ErrorType = {};

  if (!formData.fullName || formData.fullName.trim() === "")
    newErrors.fullName = "Full name required";

  if (!formData.gender || formData.gender.trim() === "")
    newErrors.gender = "Gender required";

  if (!formData.dob || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
  newErrors.dob = "Valid DOB (YYYY-MM-DD) required";
}

  if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
    newErrors.email = "Invalid email";

  if (!/^\d{10}$/.test(formData.mobile))
    newErrors.mobile = "Mobile must be 10 digits";

  if (formData.altMobile && !/^\d{10}$/.test(formData.altMobile))
    newErrors.altMobile = "Alt mobile must be 10 digits";

  if (!formData.bloodGroup || formData.bloodGroup.trim() === "")
    newErrors.bloodGroup = "Blood group required";

  if (!formData.address1 || formData.address1.trim() === "")
    newErrors.address1 = "Address required";

  if (!formData.city || formData.city.trim() === ""){
    console.log("city is requied")
    newErrors.city = "City required";
  }
    

  if (!formData.state || formData.state.trim() === "")
    newErrors.state = "State required";

  if (!formData.pincode|| formData.pincode.trim() === "")
    newErrors.pincode = "Pincode required";
 else if (!/^\d{6}$/.test(formData.pincode))
    newErrors.pincode = "Pincode must be 6 digits";

 if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan))
    newErrors.pan = "Invalid PAN";

 if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar))
    newErrors.aadhaar = "Aadhaar must be 12 digits";

   if (!formData.summary || formData.summary.trim() === ""){
   
    newErrors.summary = "Summary required";
  }

  

// ✅ EXISTING SIZE ERRORS (keep this also)
if (errors.photoFile) newErrors.photoFile = errors.photoFile;
if (errors.panFile) newErrors.panFile = errors.panFile;
if (errors.aadhaarFile) newErrors.aadhaarFile = errors.aadhaarFile;

  setErrors(newErrors);
  console.log(newErrors,"errrr");
  return Object.keys(newErrors).length === 0;
};


  
 const base64ToFile = async (base64: string, name: string) => {
        const path = FileSystem.cacheDirectory + name;

        await FileSystem.writeAsStringAsync(
            path,
            base64.replace(/^data:.*;base64,/, ""),
            { encoding: "base64" }
        );

        return {
            uri: path,
            name,
            type: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
        } as any;
    };
    

  const handleSave = async () => {
  if (!validate()) return;

  try {
    if (!vendorId) return;

    setLoading(true);

    const form = new FormData();

    // ✅ REQUIRED FIELD
    form.append("vendor_id", vendorId);

    // ✅ TEXT FIELDS
    form.append("full_name", formData.fullName);
    form.append("Gender", GENDER_MAP[formData.gender] || formData.gender);
    form.append("dob", formData.dob);
    form.append("email", formData.email);
    form.append("mobile", formData.mobile);
    form.append("mobile_1", formData.altMobile);
    form.append("BloodG", formData.bloodGroup);
    form.append("adrs_1", formData.address1);
    form.append("adrs_2", formData.address2);
    form.append("City", formData.city);
    form.append("State", formData.state);
    form.append("pin_code", formData.pincode);
    form.append("Summary", formData.summary);
    form.append("adhaarNo", formData.aadhaar);
    form.append("panNo", formData.pan);

   
// ✅ PHOTO
if (files.photo) {
  form.append("Photo", {
    uri: files.photo.uri,
    name: files.photo.name,
    type: files.photo.type,
  } as any);
} else if (formData.photoUrl && formData.photoUrl.startsWith("data:")) {
  const file = await base64ToFile(formData.photoUrl, "photo.jpg");
  if (file) form.append("Photo", file as any);
} else {
  form.append("Photo", ""); // Send empty string if no photo exists
}

// ✅ PAN
if (files.pan) {
  form.append("pan", {
    uri: files.pan.uri,
    name: files.pan.name,
    type: files.pan.type,
  } as any);
} else if (formData.panUrl && formData.panUrl.startsWith("data:")) {
  const file = await base64ToFile(formData.panUrl, "pan.pdf");
  if (file) form.append("pan", file as any);
} else {
  form.append("pan", ""); // Send empty string if no PAN exists
}

// ✅ AADHAAR
if (files.aadhaar) {
  form.append("adhaar", {
    uri: files.aadhaar.uri,
    name: files.aadhaar.name,
    type: files.aadhaar.type,
  } as any);
} else if (formData.aadhaarUrl && formData.aadhaarUrl.startsWith("data:")) {
  const file = await base64ToFile(formData.aadhaarUrl, "aadhaar.pdf");
  if (file) form.append("adhaar", file as any);
} else {
  form.append("adhaar", ""); // Send empty string if no Aadhaar exists
}

// ✅ LICENSE
if (files.license) {
  form.append("license", {
    uri: files.license.uri,
    name: files.license.name,
    type: files.license.type,
  } as any);
} else if (formData.licenseUrl && formData.licenseUrl.startsWith("data:")) {
  const file = await base64ToFile(formData.licenseUrl, "license.pdf");
  if (file) form.append("license", file as any);
} else {
  form.append("license", ""); // Send empty string if no License exists
}

   const res = await fetch(
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Cleaner/UpdateCleanerPersonnelInfo",
  {
    method: "PUT",
    body: form,
  }
);

    const json = await res.json();

    console.log("UPDATE RESPONSE:", json);

    if (json?.status) {
     setSuccessModal(true); 
      setIsEditing(false);

      scrollRef.current?.scrollTo({ y: 0, animated: true });

      // 🔁 Refresh latest data
      fetchData(vendorId);
    } else {
      console.log("❌ Update failed");
    }
  } catch (err) {
    console.log("UPDATE ERROR:", err);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    
  <SafeAreaView style={{ flex: 1 }}>
   <View style={styles.headerOuter}>
  <View style={styles.headerInner}>
    <AppHeader
      title="Personal Information"
      subtitle="Manage your personal details"
      icon="person-outline"
      
    
      actionText={!isEditing ? "Edit" : "Cancel"}
      onActionPress={!isEditing ? handleEdit : handleCancel}
    />
  </View>
</View>
    <ScrollView
      ref={scrollRef} // ✅ Attach Ref here
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      
     

      {/* PERSONAL DETAILS */}
      <View style={styles.card}>
        <InputItem label="Full Name *" value={formData.fullName} error={errors.fullName} editable={isEditing} onChange={(v:any)=>handleChange("fullName",v)} />
        {/* <InputItem label="Gender *" value={formData.gender} error={errors.gender} editable={isEditing} onChange={(v:any)=>handleChange("gender",v)} /> */}
       {/* Replace the Gender InputItem with this logic */}
<View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Gender *</Text>
  
  {isEditing ? (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
      {["Male", "Female", "Other"].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleChange("gender", option)}
          style={[
            styles.genderOption,
            formData.gender === option && styles.genderOptionSelected
          ]}
        >
          <Text style={[
            styles.genderText,
            formData.gender === option && styles.genderTextSelected
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  ) : (
    /* When not editing, show a read-only box that looks like your other inputs */
    <View style={[styles.input, { marginTop: 4 }]}>
      <Text style={{ fontSize: 14, color: "#1e293b" }}>
        {formData.gender || "Not Specified"}
      </Text>
    </View>
  )}

  {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
</View>
{errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        {/* <InputItem label="Blood Group" value={formData.bloodGroup} editable={isEditing} onChange={(v:any)=>handleChange("bloodGroup",v)} /> */}
      <View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Blood Group *</Text>
  
  {isEditing ? (
    <TouchableOpacity 
      style={styles.input} 
      onPress={() => setIsBloodModalOpen(true)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: formData.bloodGroup ? "#1e293b" : "#94a3b8" }}>
          {formData.bloodGroup || "Select Blood Group"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </View>
    </TouchableOpacity>
  ) : (
    <View style={styles.input}>
      <Text style={{ fontSize: 14, color: "#1e293b" }}>
        {formData.bloodGroup || "Not Specified"}
      </Text>
    </View>
  )}
</View>
{/* BLOOD GROUP SELECTOR MODAL */}
<Modal
  visible={isBloodModalOpen}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setIsBloodModalOpen(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay} 
    activeOpacity={1} 
    onPress={() => setIsBloodModalOpen(false)}
  >
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Select Blood Group</Text>
      </View>
      
      <ScrollView>
        {BLOOD_GROUPS.map((group) => (
          <TouchableOpacity
            key={group}
            style={styles.sheetOption}
            onPress={() => {
              handleChange("bloodGroup", group);
              setIsBloodModalOpen(false);
            }}
          >
            <Text style={[
              styles.sheetOptionText,
              formData.bloodGroup === group && styles.sheetOptionSelectedText
            ]}>
              {group}
            </Text>
            {formData.bloodGroup === group && (
              <Ionicons name="checkmark" size={20} color="#0F766E" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </TouchableOpacity>
</Modal>
       {/* <InputItem label="Date of Birth *" value={formData.dob} error={errors.dob} editable={isEditing} onChange={(v:any)=>handleChange("dob",v)} /> */}
       <View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Date of Birth *</Text>
  
  {isEditing ? (
    <>
      <TouchableOpacity 
        style={[styles.input, errors.dob && styles.errorBorder]} 
        onPress={() => setShowDatePicker(true)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: formData.dob ? "#1e293b" : "#94a3b8" }}>
            {formData.dob || "Select Date"}
          </Text>
          <Ionicons name="calendar-outline" size={18} color="#64748B" />
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dob ? new Date(formData.dob) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Prevents selecting future dates
        />
      )}
    </>
  ) : (
    <View style={styles.input}>
      <Text style={{ fontSize: 14, color: "#1e293b" }}>
        {formData.dob || "Not Specified"}
      </Text>
    </View>
  )}
  {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
</View>
        <InputItem label="Address Line 1 *" value={formData.address1} error={errors.address1} editable={isEditing} onChange={(v:any)=>handleChange("address1",v)} />
        <InputItem label="Address Line 2" value={formData.address2} editable={isEditing} onChange={(v:any)=>handleChange("address2",v)} />
        {/* <InputItem label="City *" value={formData.city} error={errors.city} editable={isEditing} onChange={(v:any)=>handleChange("city",v)} /> */}
        <View style={{ marginBottom: 14, zIndex: 999 }}>
  <Text style={styles.label}>City *</Text>

  {isEditing ? (
    <>
      <TextInput
        style={[styles.input, errors.city && styles.errorBorder]}
        value={cityQuery}
        placeholder="Type city"
        onFocus={() => setIsCityFocused(true)}   // ✅ open only on click
  onBlur={() => {
    setTimeout(() => setIsCityFocused(false), 200); // delay so click works
  }}
        onChangeText={(text) => {
          setCitySelected(false);
          setCityQuery(text);
          setFormData((prev) => ({ ...prev, city: text }));
        }}
      />

      {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

      {cityResults.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }}>
            {cityResults.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.dropdownItem}
                onPress={() => fetchPlaceDetails(item.place_id)}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  ) : (
    <View style={styles.input}>
      <Text>{formData.city || "—"}</Text>
    </View>
  )}
</View>
        <InputItem label="State *" value={formData.state} error={errors.state}  editable={false}  onChange={(v:any)=>handleChange("state",v)} />
        {/* <InputItem label="PIN Code *" value={formData.pincode} error={errors.pincode} editable={isEditing} onChange={(v:any)=>handleChange("pincode",v)} /> */}
      <InputItem
  label="PIN Code *"
  value={formData.pincode}
  error={errors.pincode}
  editable={isEditing}
  keyboardType="numeric"
  maxLength={6}
  onChange={(v:any)=>handleChange("pincode",v)}
/>
       <InputItem
  label="Aadhaar Number "
  value={formData.aadhaar}
  error={errors.aadhaar}
  editable={isEditing}
  keyboardType="numeric"
   maxLength={12} 
  onChange={(v: any) => handleChange("aadhaar", v)}
/>
        {/* <InputItem label="Aadhaar Number *" value={formData.aadhaar} error={errors.aadhaar} editable={isEditing} onChange={(v:any)=>handleChange("aadhaar",v)} /> */}
        <InputItem label="PAN Number " value={formData.pan} error={errors.pan} editable={isEditing} onChange={(v:any)=>handleChange("pan",v)} />
        <InputItem label="Introduction *" value={formData.summary} error={errors.summary} editable={isEditing} multiline onChange={(v:any)=>handleChange("summary",v)} />
      </View>

      {/* CONTACT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <InputItem label="Email *" value={formData.email} error={errors.email} editable={isEditing} onChange={(v:any)=>handleChange("email",v)} />
        {/* <InputItem label="Mobile Number *" value={formData.mobile} error={errors.mobile} editable={isEditing} onChange={(v:any)=>handleChange("mobile",v)} />
        <InputItem label="Alternate Mobile" value={formData.altMobile} error={errors.altMobile} editable={isEditing} onChange={(v:any)=>handleChange("altMobile",v)} /> */}
        <InputItem
  label="Mobile Number *"
  value={formData.mobile}
  error={errors.mobile}
  editable={isEditing}
  keyboardType="numeric"
  maxLength={10}
  onChange={(v:any)=>handleChange("mobile",v)}
/>

<InputItem
  label="Alternate Mobile"
  value={formData.altMobile}
  error={errors.altMobile}
  editable={isEditing}
  keyboardType="numeric"
  maxLength={10}
  onChange={(v:any)=>handleChange("altMobile",v)}
/>
      </View>

 {/* DOCUMENTS */}
<View style={styles.card}>
  <Text style={styles.sectionTitle}>Documents</Text>

  {/* PHOTO */}
  <TouchableOpacity
   onPress={() =>
  isEditing ? pickPhoto() : openFile(formData.photoUrl)
}
    style={[styles.docBox, !isEditing && styles.docBoxPrimary, errors.photoFile && styles.errorBorder]}
  >
    <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
      {isEditing ? (files.photo ? "Photo Selected" : "Change Photo") : "View Profile Photo"}
    </Text>

    {/* Check files state first (newly picked), then fallback to existing URL */}
    {isEditing && (files.photo || formData.photoUrl) && (
      (files.photo?.type?.includes("pdf") || formData.photoUrl?.startsWith("data:application/pdf")) ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text" size={24} color="#0F766E" />
          <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
        </View>
      ) : (
        <Image source={{ uri: files.photo?.uri || formData.photoUrl }} style={styles.preview} />
      )
    )}
  </TouchableOpacity>
  {errors.photoFile && <Text style={styles.errorText}>{errors.photoFile}</Text>}

  {/* PAN */}
  <TouchableOpacity
onPress={() =>
  isEditing ? pickFile("pan") : openFile(formData.panUrl)
}    style={[styles.docBox, !isEditing && styles.docBoxPrimary, errors.panFile && styles.errorBorder]}
  >
    <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
      {isEditing ? (files.pan ? "PAN Selected" : "Change PAN") : "View PAN Card"}
    </Text>

    {/* Logic: Check if the NEWLY picked file is a PDF OR if the EXISTING URL is a PDF */}
    {isEditing && (files.pan || formData.panUrl) && (
      (files.pan?.type?.includes("pdf") || formData.panUrl?.startsWith("data:application/pdf")) ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text" size={24} color="#0F766E" />
          <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
        </View>
      ) : (
        <Image source={{ uri: files.pan?.uri || formData.panUrl }} style={styles.preview} />
      )
    )}
  </TouchableOpacity>
  {errors.panFile && <Text style={styles.errorText}>{errors.panFile}</Text>}

  {/* AADHAAR */}
  <TouchableOpacity
    onPress={() => isEditing ? pickFile("aadhaar") : openFile(formData.aadhaarUrl)}
    style={[styles.docBox, !isEditing && styles.docBoxPrimary, errors.aadhaarFile && styles.errorBorder]}
  >
    <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
      {isEditing ? (files.aadhaar ? "Aadhaar Selected" : "Change Aadhaar") : "View Aadhaar Card"}
    </Text>

    {isEditing && (files.aadhaar || formData.aadhaarUrl) && (
      (files.aadhaar?.type?.includes("pdf") || formData.aadhaarUrl?.startsWith("data:application/pdf")) ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text" size={24} color="#0F766E" />
          <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
        </View>
      ) : (
        <Image source={{ uri: files.aadhaar?.uri || formData.aadhaarUrl }} style={styles.preview} />
      )
    )}
  </TouchableOpacity>
  {errors.aadhaarFile && <Text style={styles.errorText}>{errors.aadhaarFile}</Text>}

  {/* LICENSE */}
<TouchableOpacity
  onPress={() =>
    isEditing ? pickFile("license") : openFile(formData.licenseUrl)
  }
  style={[
    styles.docBox,
    !isEditing && styles.docBoxPrimary,
    errors.licenseFile && styles.errorBorder,
  ]}
>
  <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
    {isEditing
      ? files.license
        ? "License Selected"
        : "Change License"
      : "View License"}
  </Text>

  {isEditing && (files.license || formData.licenseUrl) && (
    (files.license?.type?.includes("pdf") ||
      formData.licenseUrl?.startsWith("data:application/pdf")) ? (
      <View style={styles.pdfPlaceholder}>
        <Ionicons name="document-text" size={24} color="#0F766E" />
        <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
      </View>
    ) : (
      <Image
        source={{ uri: files.license?.uri || formData.licenseUrl }}
        style={styles.preview}
      />
    )
  )}
</TouchableOpacity>

{errors.licenseFile && (
  <Text style={styles.errorText}>{errors.licenseFile}</Text>
)}
 
</View>

      {isEditing && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>

    {/* ✅ THIS FIXES YOUR ISSUE */}
    <FileViewer />
    <Modal
  visible={successModal}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setSuccessModal(false)}
>
  <View style={styles.successModalOverlay}>
    <View style={styles.successModalBox}>
      
      <Ionicons name="checkmark-circle" size={60} color="#10B981" />

      <Text style={styles.successModalTitle}>
        Success!
      </Text>

      <Text style={styles.successModalText}>
        Your information has been updated successfully.
      </Text>

      <TouchableOpacity
        style={styles.successModalButton}
        onPress={() => setSuccessModal(false)}
      >
        <Text style={styles.successModalButtonText}>OK</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
<Modal
  visible={photoPickerVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setPhotoPickerVisible(false)}
>
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setPhotoPickerVisible(false)}
  >
    <View style={styles.bottomSheet}>
      
   

      <TouchableOpacity
        style={styles.optionBtn}
        onPress={() => {
          setPhotoPickerVisible(false);
          openCamera();
        }}
      >
        <Ionicons name="camera-outline" size={22} color="#0F766E" />
        <Text style={styles.optionText}>Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionBtn}
        onPress={() => {
          setPhotoPickerVisible(false);
          openGallery();
        }}
      >
        <Ionicons name="image-outline" size={22} color="#0F766E" />
        <Text style={styles.optionText}>Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionBtn, { justifyContent: "center" }]}
        onPress={() => setPhotoPickerVisible(false)}
      >
        <Text style={[styles.optionText, { color: "red" }]}>Cancel</Text>
      </TouchableOpacity>

    </View>
  </TouchableOpacity>
</Modal>
  </SafeAreaView>
);
  
}

function InputItem({
  label,
  value,
  editable,
  onChange,
  error,
  multiline = false,
  keyboardType = "default",
  maxLength, 
}: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType} // ✅ ADD THIS
         maxLength={maxLength} 
        style={[
          styles.input,
          multiline && styles.textArea,
          error && styles.errorBorder,
        ]}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

/* DOC ITEM */
function DocButton({ label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.docBtn} onPress={onPress}>
      <Text style={styles.docText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 10,
    paddingBottom: 40,
  },
  headerWrapper: {
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 0,

  borderBottomWidth: 1,
  borderBottomColor: "#E2E8F0",

  // Shadow (iOS)
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },

  // Shadow (Android)
  elevation: 3,

  zIndex: 10,
},
headerOuter: {
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 12,
  paddingTop: 1,
},

headerInner: {
  backgroundColor: "#FFFFFF",
 
  paddingVertical: 2,
},

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  label: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  errorText: {
    color: "red",
    fontSize: 12,
  },

  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },

  docBtn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  // docText: {
  //   color: "#fff",
  //   fontWeight: "600",
  // },

  saveBtn: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
  modal: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.9)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

closeBtn: {
  position: "absolute",
  top: 50,
  right: 20,
  zIndex: 1000,
},

docBox: {
  padding: 12,
  backgroundColor: "#fff",
  marginBottom: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  // ✅ These two lines handle the centering
  alignItems: "center", 
  justifyContent: "center",
},

docBoxPrimary: {
  backgroundColor: "#0F766E",
  borderColor: "#0F766E",
  paddingVertical: 14, // Slightly more padding for a better button look
},

docText: {
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center", // Ensure text internally centers
  color: "#1e293b",
},

docTextPrimary: {
  color: "#FFFFFF",
},
dropdown: {
  position: "absolute",
  top: 55,
  left: 0,
  right: 0,
  backgroundColor: "#fff",
  borderRadius: 10,
  elevation: 5,
  zIndex: 9999,
},

dropdownItem: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

preview: {
  width: 100,
  height: 70,
  borderRadius: 8,
  marginTop: 8,
},

genderOption: {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  alignItems: "center",
},
genderOptionSelected: {
  backgroundColor: "#0F766E",
  borderColor: "#0F766E",
},
genderText: {
  color: "#64748B",
  fontSize: 14,
  fontWeight: "500",
},
genderTextSelected: {
  color: "#FFFFFF",
},
modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: 20,
  },
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  sheetOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  sheetOptionText: {
    fontSize: 16,
    color: "#475569",
  },
  sheetOptionSelectedText: {
    color: "#0F766E",
    fontWeight: "700",
  },
  successContainer: {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 1,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'center', // Centers text horizontally
  justifyContent: 'center'
},
successText: {
  color: "#065F46",
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center"
},
pdfPlaceholder: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pdfPlaceholderText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },
  successModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

successModalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 20,
  alignItems: "center",
},

successModalTitle: {
  fontSize: 18,
  fontWeight: "700",
  marginTop: 10,
  color: "#065F46",
},

successModalText: {
  fontSize: 14,
  color: "#475569",
  textAlign: "center",
  marginTop: 8,
},

successModalButton: {
  marginTop: 15,
  backgroundColor: "#0F766E",
  paddingVertical: 10,
  paddingHorizontal: 30,
  borderRadius: 10,
},

successModalButtonText: {
  color: "#fff",
  fontWeight: "600",
},
optionBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#f1f5f9",
},

optionText: {
  fontSize: 15,
  color: "#1e293b",
  fontWeight: "500",
},
});