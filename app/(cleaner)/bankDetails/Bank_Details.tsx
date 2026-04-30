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
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
//   validateBankDetails,
//   ValidationErrors,
//   BankFormState,
// } from "@/src/shared/utils/validation";

// const ACCOUNT_TYPES = ["Savings Account", "Current Account", "Salary Account"];

// const EMPTY_FORM: BankFormState = {
//   bankName: "",
//   branch: "",
//   ifsc: "",
//   holderName: "",
//   accountNumber: "",
//   confirmAccount: "",
//   accountType: "Savings Account",
// };

// export default function BankDetailsScreen() {
//   const router = useRouter();
//   const auth = useContext(AuthContext);
//   const vendorId = auth?.user?.vendorId;

//   const [form, setForm] = useState<BankFormState>(EMPTY_FORM);
//   const [originalForm, setOriginalForm] = useState<BankFormState>(EMPTY_FORM);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showTypeMenu, setShowTypeMenu] = useState(false);
//   const [errors, setErrors] = useState<ValidationErrors<BankFormState>>({});
//   const [statusMsg, setStatusMsg] = useState<{
//     text: string;
//     ok: boolean;
//   } | null>(null);

//   useEffect(() => {
//     if (vendorId) loadBankDetails();
//   }, [vendorId]);

//   const loadBankDetails = async () => {
//     try {
//       const res = await api.get(`/api/Bank/GetBankDetailsById/${vendorId}`);
//       const d = res.data;
//       const loaded: BankFormState = {
//         bankName: d.BankName ?? d.bank_name ?? "",
//         branch: d.BranchName ?? d.branch ?? "",
//         ifsc: d.IFSCCode ?? d.ifsc ?? "",
//         holderName: d.Account_HolderName ?? d.account_holder ?? "",
//         accountNumber: d.account_number ?? "",
//         confirmAccount: d.account_number ?? "",
//         accountType: d.account_type ?? "Savings Account",
//       };
//       setForm(loaded);
//       setOriginalForm(loaded);
//     } catch (e) {
//       console.log("Bank details fetch failed:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   function update(key: keyof BankFormState, val: string) {
//     setForm((prev) => ({ ...prev, [key]: val }));
//     if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
//   }

//   function showStatus(text: string, ok: boolean) {
//     setStatusMsg({ text, ok });
//     setTimeout(() => setStatusMsg(null), 3000);
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
//     setShowTypeMenu(false);
//   }

//   const handleUpdate = async () => {
//     const validationErrors = validateBankDetails(form);

//     if (form.accountNumber !== form.confirmAccount) {
//       validationErrors.confirmAccount = "Account numbers do not match";
//     }

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setSaving(true);

//     try {
//       const payload = {
//         vendor_id: vendorId,
//         BankName: form.bankName,
//         BranchName: form.branch,
//         IFSCCode: form.ifsc,
//         Account_HolderName: form.holderName,
//         account_number: form.accountNumber,
//         account_type: form.accountType,
//       };

//       const response = await fetch(
//         "https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/UpdateBankDetails",
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${auth?.user?.token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || "Update failed");
//       }

//       setOriginalForm(form);
//       setIsEditing(false);
//       showStatus("Bank details saved successfully.", true);
//     } catch (e: any) {
//       console.log("Bank update error:", e);
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
//         <Text style={styles.headerTitle}>Bank Details</Text>
//         {isEditing ? (
//           <TouchableOpacity
//             onPress={handleCancel}
//             style={styles.editBtn}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.editBtnText, { color: Colors.light.error }]}>
//               Cancel
//             </Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             onPress={handleEdit}
//             style={styles.editBtn}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.editBtnText}>Edit</Text>
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
//           {/* Info card */}
//           <View style={styles.infoCard}>
//             <View style={styles.infoIconWrap}>
//               <MaterialIcons
//                 name="account-balance"
//                 size={24}
//                 color={Colors.light.onPrimary}
//               />
//             </View>
//             <View style={styles.infoText}>
//               <Text style={styles.infoTitle}>Payout Account</Text>
//               <Text style={styles.infoDesc}>
//                 Ensure your settlement information is accurate for timely
//                 reimbursements.
//               </Text>
//             </View>
//           </View>

//           <Field
//             label="Account Holder's Name"
//             icon="person"
//             value={form.holderName}
//             placeholder="As per bank passbook"
//             onChangeText={(v) => update("holderName", v)}
//             editable={isEditing}
//             required
//             error={errors.holderName}
//           />
//           <Field
//             label="Bank Name"
//             icon="business"
//             value={form.bankName}
//             placeholder="e.g. HealthFirst Trust Bank"
//             onChangeText={(v) => update("bankName", v)}
//             editable={isEditing}
//             required
//             error={errors.bankName}
//           />
//           <View style={styles.rowFields}>
//             <View style={{ flex: 1 }}>
//               <Field
//                 label="Branch"
//                 icon="location-on"
//                 value={form.branch}
//                 placeholder="Branch location"
//                 onChangeText={(v) => update("branch", v)}
//                 editable={isEditing}
//                 required
//                 error={errors.branch}
//               />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Field
//                 label="IFSC Code"
//                 icon="qr-code-2"
//                 value={form.ifsc}
//                 placeholder="IFSC000123"
//                 onChangeText={(v) => update("ifsc", v.toUpperCase())}
//                 autoCapitalize="characters"
//                 editable={isEditing}
//                 required
//                 error={errors.ifsc}
//               />
//             </View>
//           </View>
//           <Field
//             label="Account Number"
//             icon="tag"
//             value={form.accountNumber}
//             placeholder="Enter account number"
//             onChangeText={(v) => update("accountNumber", v)}
//             keyboardType="numeric"
//             secureTextEntry={!isEditing}
//             editable={isEditing}
//             required
//             error={errors.accountNumber}
//           />
//           {isEditing && (
//             <Field
//               label="Confirm Account Number"
//               icon="verified-user"
//               value={form.confirmAccount}
//               placeholder="Re-enter account number"
//               onChangeText={(v) => update("confirmAccount", v)}
//               keyboardType="numeric"
//               editable
//               required
//               error={errors.confirmAccount}
//             />
//           )}

//           {/* Account Type */}
//           <View style={styles.fieldWrap}>
//             <View style={styles.labelRow}>
//               <Text style={styles.fieldLabel}>Account Type</Text>
//               <Text style={styles.requiredStar}>*</Text>
//             </View>
//             {isEditing ? (
//               <>
//                 <TouchableOpacity
//                   style={[
//                     styles.dropdownBtn,
//                     errors.accountType ? styles.inputError : null,
//                   ]}
//                   onPress={() => setShowTypeMenu((p) => !p)}
//                   activeOpacity={0.75}
//                 >
//                   <MaterialIcons
//                     name="account-tree"
//                     size={18}
//                     color={Colors.light.onSurfaceVariant}
//                     style={styles.fieldIcon}
//                   />
//                   <Text style={styles.dropdownValue}>{form.accountType}</Text>
//                   <MaterialIcons
//                     name={
//                       showTypeMenu ? "keyboard-arrow-up" : "keyboard-arrow-down"
//                     }
//                     size={22}
//                     color={Colors.light.outline}
//                   />
//                 </TouchableOpacity>
//                 {errors.accountType && (
//                   <Text style={styles.errorText}>{errors.accountType}</Text>
//                 )}
//                 {showTypeMenu && (
//                   <View style={styles.dropdownMenu}>
//                     {ACCOUNT_TYPES.map((type) => (
//                       <TouchableOpacity
//                         key={type}
//                         style={[
//                           styles.dropdownItem,
//                           form.accountType === type &&
//                             styles.dropdownItemActive,
//                         ]}
//                         onPress={() => {
//                           update("accountType", type);
//                           setShowTypeMenu(false);
//                         }}
//                         activeOpacity={0.7}
//                       >
//                         <Text
//                           style={[
//                             styles.dropdownItemText,
//                             form.accountType === type &&
//                               styles.dropdownItemTextActive,
//                           ]}
//                         >
//                           {type}
//                         </Text>
//                         {form.accountType === type && (
//                           <MaterialIcons
//                             name="check"
//                             size={16}
//                             color={Colors.light.primary}
//                           />
//                         )}
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 )}
//               </>
//             ) : (
//               <View style={styles.readOnlyRow}>
//                 <MaterialIcons
//                   name="account-tree"
//                   size={18}
//                   color={Colors.light.onSurfaceVariant}
//                   style={styles.fieldIcon}
//                 />
//                 <Text style={styles.readOnlyValue}>
//                   {form.accountType || "—"}
//                 </Text>
//               </View>
//             )}
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

//           {/* Security note */}
//           <View style={styles.securityNote}>
//             <MaterialIcons name="lock" size={12} color={Colors.light.outline} />
//             <Text style={styles.securityText}>
//               Payments are encrypted and processed through secure vault
//             </Text>
//           </View>

//           <View style={{ height: isEditing ? 80 : Spacing.lg }} />
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
//               <Text style={styles.updateBtnText}>Update Details →</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// // ── Field Component ───────────────────────────────────────────────────────────

// function Field({
//   label,
//   icon,
//   value,
//   placeholder,
//   onChangeText,
//   keyboardType,
//   autoCapitalize,
//   secureTextEntry,
//   editable = true,
//   required = false,
//   error,
// }: {
//   label: string;
//   icon: string;
//   value: string;
//   placeholder: string;
//   onChangeText: (v: string) => void;
//   keyboardType?: any;
//   autoCapitalize?: any;
//   secureTextEntry?: boolean;
//   editable?: boolean;
//   required?: boolean;
//   error?: string;
// }) {
//   return (
//     <View style={styles.fieldWrap}>
//       <View style={styles.labelRow}>
//         <Text style={styles.fieldLabel}>{label}</Text>
//         {required && <Text style={styles.requiredStar}>*</Text>}
//       </View>
//       {editable ? (
//         <View style={[styles.inputRow, error ? styles.inputError : null]}>
//           <MaterialIcons
//             name={icon as any}
//             size={18}
//             color={Colors.light.onSurfaceVariant}
//             style={styles.fieldIcon}
//           />
//           <TextInput
//             style={styles.input}
//             value={value}
//             placeholder={placeholder}
//             placeholderTextColor={Colors.light.outline}
//             onChangeText={onChangeText}
//             keyboardType={keyboardType ?? "default"}
//             autoCapitalize={autoCapitalize ?? "words"}
//             secureTextEntry={secureTextEntry}
//           />
//         </View>
//       ) : (
//         <View style={styles.readOnlyRow}>
//           <MaterialIcons
//             name={icon as any}
//             size={18}
//             color={Colors.light.onSurfaceVariant}
//             style={styles.fieldIcon}
//           />
//           <Text style={styles.readOnlyValue}>
//             {secureTextEntry && value ? "••••••••" : value || "—"}
//           </Text>
//         </View>
//       )}
//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: Colors.light.surface },
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
//   editBtn: {
//     minWidth: 60,
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: Spacing.sm,
//   },
//   editBtnText: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.primary,
//   },

//   scroll: { flex: 1 },
//   scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

//   infoCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: Spacing.md,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.xl,
//     padding: Spacing.md,
//     marginBottom: Spacing.lg,
//     ...Shadow.card,
//   },
//   infoIconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: Radius.lg,
//     backgroundColor: Colors.light.primary,
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   },
//   infoText: { flex: 1 },
//   infoTitle: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.titleSmall,
//     color: Colors.light.onSurface,
//     marginBottom: 2,
//   },
//   infoDesc: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodySmall,
//     color: Colors.light.onSurfaceVariant,
//     lineHeight: 18,
//   },

//   rowFields: { flexDirection: "row", gap: Spacing.sm },

//   fieldWrap: { marginBottom: Spacing.md },
//   labelRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     marginBottom: Spacing.xs,
//   },
//   fieldLabel: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.labelLarge,
//     color: Colors.light.onSurface,
//   },
//   requiredStar: {
//     color: Colors.light.error,
//     fontSize: FontSize.labelMedium,
//     fontFamily: FontFamily.bodyMedium,
//   },
//   errorText: {
//     color: Colors.light.error,
//     fontSize: FontSize.labelSmall,
//     fontFamily: FontFamily.body,
//     marginTop: 4,
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.light.surfaceContainerLow,
//     borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md,
//   },
//   inputError: { borderWidth: 1, borderColor: Colors.light.error },
//   fieldIcon: { marginRight: Spacing.sm },
//   input: {
//     flex: 1,
//     paddingVertical: 14,
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//   },
//   readOnlyRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   readOnlyValue: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//     flex: 1,
//   },

//   dropdownBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.light.surfaceContainerLow,
//     borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 14,
//     marginBottom: Spacing.xs,
//   },
//   dropdownValue: {
//     flex: 1,
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.onSurface,
//   },
//   dropdownMenu: {
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.lg,
//     marginBottom: Spacing.md,
//     overflow: "hidden",
//     ...Shadow.subtle,
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 14,
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

//   banner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: Spacing.xs,
//     marginTop: Spacing.md,
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

//   securityNote: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 4,
//     marginTop: Spacing.md,
//   },
//   securityText: {
//     fontFamily: FontFamily.label,
//     fontSize: FontSize.labelSmall,
//     color: Colors.light.outline,
//     letterSpacing: 0.4,
//   },

//   updateBar: {
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.sm,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderTopWidth: 1,
//     borderTopColor: Colors.light.outlineVariant,
//   },
//   updateBtn: {
//     backgroundColor: Colors.light.primary,
//     borderRadius: Radius.lg,
//     height: ButtonSize.minHeight,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   updateBtnText: {
//     fontFamily: FontFamily.bodySemiBold,
//     fontSize: FontSize.bodyMedium,
//     color: "#fff",
//   },
// });
import AppHeader from "@/src/shared/components/AppHeader";

import React, { useEffect, useState ,useRef,useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type ErrorType = {
  bankName?: string;
  branch?: string;
  ifsc?: string;
  holderName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  accountType?: string;
};

/* ✅ FIX: moved outside */
function Input({
  label,
  value,
  setValue,
  error,
  secure = false,
  isEditing,
  setErrors,
  fieldName,
}: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[styles.input, error && styles.errorBorder]}
        value={secure && !isEditing ? "••••••••••" : value}
        editable={isEditing}
        onChangeText={(text) => {
          setValue(text);

          // ✅ clear only this field error
          setErrors((prev: any) => ({
            ...prev,
            [fieldName]: "",
          }));
        }}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function Bank() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<ErrorType>({});
  const [originalData, setOriginalData] = useState<any>(null);
  const [successModal, setSuccessModal] = useState(false);

  const scrollRef = useRef<ScrollView>(null); // Ref for scrolling to top
    const [successMessage, setSuccessMessage] = useState("");

  const handleCancel = () => {
    if (originalData) {
      setBankName(originalData.bankName);
      setBranch(originalData.branch);
      setIfsc(originalData.ifsc);
      setHolderName(originalData.holderName);
      setAccountNumber(originalData.accountNumber);
      setConfirmAccountNumber(originalData.confirmAccountNumber);
      setAccountType(originalData.accountType);
    }
    setErrors({});
    setIsEditing(false);
  };
  const router = useRouter();

  useEffect(() => {
  if (!successMessage) return;
  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 4000);
  return () => clearTimeout(timer);
}, [successMessage]);

useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(nurse)/profile"); // 👈 force go to profile
        return true; // prevent default behavior
      }
    );

    return () => subscription.remove();
  }, [])
);
useEffect(() => {
  if (successModal) {
    const timer = setTimeout(() => {
      setSuccessModal(false);
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [successModal]);
  // 🚀 FETCH DATA
  useEffect(() => {
    const init = async () => {
      try {
         const user = await AsyncStorage.getItem("user");
const parsed = JSON.parse(user || "{}");

const id = parsed?.vendorId;
        if (!id) return;

        setVendorId(id);

        const res = await fetch(
          `https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/GetBankDetailsById/${id}`
        );

        const data = await res.json();

        if (data && data.vendorId) {
          setHasData(true);
          setIsEditing(false);

          const formattedData = {
            bankName: data.bankName || "",
            branch: data.branchName || "",
            ifsc: data.ifscCode || "",
            holderName: data.accountHolderName || "",
            accountNumber: data.accountNumber || "",
            confirmAccountNumber: data.accountNumber || "",
            accountType:
              data.accountType === "S"
                ? "Savings"
                : data.accountType === "C"
                ? "Current"
                : data.accountType === "A"
                ? "Salary"
                : "",
          };

          setBankName(formattedData.bankName);
          setBranch(formattedData.branch);
          setIfsc(formattedData.ifsc);
          setHolderName(formattedData.holderName);
          setAccountNumber(formattedData.accountNumber);
          setConfirmAccountNumber(formattedData.confirmAccountNumber);
          setAccountType(formattedData.accountType);

          setOriginalData(formattedData);
        } else {
          setHasData(false);
           setIsEditing(false);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ VALIDATION
  const validate = () => {
    let newErrors: ErrorType = {};

    if (!bankName) newErrors.bankName = "Bank Name Required";
    if (!branch) newErrors.branch = "Branch Name Required";
    if (!ifsc) {
  newErrors.ifsc = "IFSC code Required";
} else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
  newErrors.ifsc = "Invalid IFSC code";
}
    if (!holderName) newErrors.holderName = "Name Required";
    if (!accountNumber) newErrors.accountNumber = "Account Number Required";
    if (!confirmAccountNumber)
      newErrors.confirmAccountNumber = "Required";

    if (accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Does not match";
    }

    if (!accountType) newErrors.accountType = "Account Type Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 SAVE
  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      vendor_id: vendorId,
      bankName,
      branchName: branch,
      ifscCode: ifsc,
      account_HolderName: holderName,
      account_number: accountNumber,
      account_type:
        accountType === "Savings"
          ? "S"
          : accountType === "Current"
          ? "C"
          : "SA",
    };

    try {
      const url = hasData
        ? "https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/UpdateBankDetails"
        : "https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/CreateBankDetails";

      const method = hasData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
      setSuccessModal(true);
        setIsEditing(false);
        setHasData(true);
        // Scroll to top to show the message
    scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        alert("❌ Failed");
      }
    } catch (e) {
      console.log(e);
      alert("Error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerOuter}>
        <View style={styles.headerInner}>
      <AppHeader
          title="Bank Details"
          subtitle="Manage your bank information"
          icon="card-outline"
          
          actionText={isEditing ? "Cancel" : "Edit"}
          onActionPress={() => {
            if (isEditing) handleCancel();
            else setIsEditing(true);
          }}
        />
        </View>
         </View>
      <ScrollView
      ref={scrollRef} // ✅ Attach Ref here
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
        
    

        <View style={styles.card}>
          <Input label="Bank Name *" value={bankName} setValue={setBankName} error={errors.bankName} isEditing={isEditing}  setErrors={setErrors}
  fieldName="bankName"/>
          <Input label="Branch *" value={branch} setValue={setBranch} error={errors.branch} isEditing={isEditing}  setErrors={setErrors}
  fieldName="branch"/>
          <Input label="IFSC Code *" value={ifsc} setValue={(text: string) => setIfsc(text.toUpperCase())} error={errors.ifsc} isEditing={isEditing}  setErrors={setErrors}
  fieldName="ifsc"/>
          <Input label="Account Holder Name *" value={holderName} setValue={setHolderName} error={errors.holderName} isEditing={isEditing}  setErrors={setErrors}
  fieldName="holderName"/>
          <Input label="Account Number *" value={accountNumber} setValue={setAccountNumber} error={errors.accountNumber}  isEditing={isEditing}  setErrors={setErrors}
  fieldName="accountNumber"/>
          <Input label="Confirm Account Number *" value={confirmAccountNumber} setValue={setConfirmAccountNumber} error={errors.confirmAccountNumber} secure isEditing={isEditing}  setErrors={setErrors}
  fieldName="confirmAccountNumber"/>

         {/* ACCOUNT TYPE */}
<View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Account Type *</Text>

  <TouchableOpacity
    activeOpacity={0.8}
    disabled={!isEditing}
    style={[
      styles.input,
      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ]}
    onPress={() => setShowDropdown(!showDropdown)}
  >
    <Text style={{ color: accountType ? "#000" : "#94A3B8" }}>
      {accountType || "Select Account Type"}
    </Text>

    <Text style={{ fontSize: 16 }}>
      {showDropdown ? "▲" : "▼"}
    </Text>
  </TouchableOpacity>

  {/* DROPDOWN LIST */}
  {showDropdown && (
    <View style={styles.dropdownBox}>
      {["Savings", "Current", "Salary"].map((t, index) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.dropdownItem,
            index === 2 && { borderBottomWidth: 0 },
          ]}
          onPress={() => {
            setAccountType(t);
            setShowDropdown(false);
            setErrors((prev) => ({
    ...prev,
    accountType: "",
  }));
          }}
        >
          <Text style={{ fontSize: 14 }}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}

  {errors.accountType && (
    <Text style={styles.errorText}>{errors.accountType}</Text>
  )}
</View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>
              {hasData ? "Save Changes" : "Save Details"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
        Bank details saved successfully.
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

  paddingVertical: 6,
},

  

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
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

  saveBtn: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  dropdownItem: {
    padding: 12,
    backgroundColor: "#fff",
   
  },

  errorText: { color: "red", fontSize: 12 },

  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownBox: {
  backgroundColor: "#fff",
  borderRadius: 10,
  marginTop: 4,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  overflow: "hidden",
},
successContainer: {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 1,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'center',
  justifyContent: 'center'
},
successText: {
  color: "#065F46",
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center"
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


});