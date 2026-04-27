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
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || "Update failed");
//       }

//       setOriginalForm(form);
//       setIsEditing(false);
//       showStatus("Bank details saved successfully.", true);
//     } catch (e: any) {
//       console.log("❌ ERROR:", e);
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
//                 Please provide accurate bank details to receive payments.
//               </Text>
//             </View>
//           </View>

//           <Field
//             label="Bank Name"
//             icon="business"
//             value={form.bankName}
//             placeholder="e.g. State Bank of India"
//             onChangeText={(v) => update("bankName", v)}
//             editable={isEditing}
//             required
//             error={errors.bankName}
//           />
//           <Field
//             label="Branch"
//             icon="location-on"
//             value={form.branch}
//             placeholder="e.g. Connaught Place"
//             onChangeText={(v) => update("branch", v)}
//             editable={isEditing}
//             required
//             error={errors.branch}
//           />
//           <Field
//             label="IFSC Code"
//             icon="qr-code-2"
//             value={form.ifsc}
//             placeholder="E.G. SBIN0001234"
//             onChangeText={(v) => update("ifsc", v.toUpperCase())}
//             autoCapitalize="characters"
//             editable={isEditing}
//             required
//             error={errors.ifsc}
//           />
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
//             label="Account Number"
//             icon="tag"
//             value={form.accountNumber}
//             placeholder="Enter account number"
//             onChangeText={(v) => update("accountNumber", v)}
//             keyboardType="numeric"
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
//                           form.accountType === type && styles.dropdownItemActive,
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
//               END-TO-END ENCRYPTED SECURE VAULT
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
//               <Text style={styles.updateBtnText}>Update</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// // ── Field ─────────────────────────────────────────────────────────────────────

// function Field({
//   label,
//   icon,
//   value,
//   placeholder,
//   onChangeText,
//   keyboardType,
//   autoCapitalize,
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
//           <Text style={styles.readOnlyValue}>{value || "—"}</Text>
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
//   inputError: {
//     borderWidth: 1,
//     borderColor: Colors.light.error,
//   },
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
//     letterSpacing: 0.8,
//   },

//   updateBar: {
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.sm,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderTopWidth: 1,
//     borderTopColor: Colors.light.outlineVariant,
//   },
//   updateBtn: {
//     backgroundColor: "#16A34A",
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
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';
import { AuthContext } from '@/src/core/context/AuthContext';
import ActionModal from '@/src/shared/components/ActionModal';

const BASE_URL = 'https://coreapi-service-111763741518.asia-south1.run.app';

const ACCOUNT_TYPES = ['Savings Account', 'Current Account', 'Salary Account'];

// GET returns abbreviated type codes — map them to display labels
const ACCOUNT_TYPE_MAP: Record<string, string> = {
  S:  'Savings Account',
  C:  'Current Account',
  SA: 'Salary Account',
  // full strings pass through unchanged
  'Savings Account':  'Savings Account',
  'Current Account':  'Current Account',
  'Salary Account':   'Salary Account',
};

// Map display label → abbreviated code for the save payload
const ACCOUNT_TYPE_CODE: Record<string, string> = {
  'Savings Account': 'S',
  'Current Account': 'C',
  'Salary Account':  'SA',
};

type FormState = {
  bankName: string;
  branch: string;
  ifsc: string;
  holderName: string;
  accountNumber: string;
  confirmAccount: string;
  accountType: string;
};

const EMPTY_FORM: FormState = {
  bankName: '',
  branch: '',
  ifsc: '',
  holderName: '',
  accountNumber: '',
  confirmAccount: '',
  accountType: 'Savings Account',
};

export default function AmbulanceBankDetailsScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? '';
  const token = auth?.user?.token;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [backup, setBackup] = useState<FormState>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ─── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!vendorId) { setLoading(false); return; }
    try {
      const res = await fetch(
        `${BASE_URL}/api/Bank/GetBankDetailsById/${vendorId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      const d = await res.json();
      console.log('Bank details fetched:', d);

      // ── FIX: use the actual field names returned by GET ─────────────────
      // Response shape:
      // { vendorId, bankName, branchName, ifscCode,
      //   accountHolderName, accountNumber, accountType }
      const hasData =
        d &&
        typeof d === 'object' &&
        !Array.isArray(d) &&
        (d.bankName || d.accountNumber);

      if (hasData) {
        // accountType may come back as a short code ("S", "C", "SA")
        // — resolve it to the full display label used in the dropdown.
        const resolvedType =
          ACCOUNT_TYPE_MAP[d.accountType] ?? 'Savings Account';

        const loaded: FormState = {
          bankName:       d.bankName            ?? '',
          branch:         d.branchName          ?? '',
          ifsc:           d.ifscCode            ?? '',
          holderName:     d.accountHolderName   ?? '',
          accountNumber:  d.accountNumber       ?? '',
          confirmAccount: d.accountNumber       ?? '',
          accountType:    resolvedType,
        };
        setForm(loaded);
        setBackup(loaded);
        setIsNew(false);
      } else {
        setIsNew(true);
      }
    } catch (e) {
      console.log('Bank details fetch error:', e);
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  }, [vendorId, token]);

  useEffect(() => { load(); }, [load]);

  // ─── Form helpers ────────────────────────────────────────────────────────

  function update(key: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function handleEdit() {
    setBackup(form);
    setErrors({});
    setShowTypeMenu(false);
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(backup);
    setErrors({});
    setShowTypeMenu(false);
    setIsEditing(false);
  }

  function validate(): boolean {
    const err: Partial<Record<keyof FormState, string>> = {};
    if (!form.bankName.trim())        err.bankName       = 'Bank name is required';
    if (!form.branch.trim())          err.branch         = 'Branch is required';
    if (!form.ifsc.trim())            err.ifsc           = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc))
                                      err.ifsc           = 'Invalid IFSC format (e.g. HDFC0001234)';
    if (!form.holderName.trim())      err.holderName     = 'Account holder name is required';
    if (!form.accountNumber.trim())   err.accountNumber  = 'Account number is required';
    if (form.accountNumber !== form.confirmAccount)
                                      err.confirmAccount = 'Account numbers do not match';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // ─── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      // Send the abbreviated code so the API accepts it consistently
      const accountTypeCode = ACCOUNT_TYPE_CODE[form.accountType] ?? form.accountType;

      const payload = {
        vendor_id:          vendorId,
        BankName:           form.bankName,
        BranchName:         form.branch,
        IFSCCode:           form.ifsc,
        Account_HolderName: form.holderName,
        account_number:     form.accountNumber,
        account_type:       accountTypeCode,
      };

      const endpoint = isNew
        ? `${BASE_URL}/api/Bank/CreateBankDetails`
        : `${BASE_URL}/api/Bank/UpdateBankDetails`;

      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Save failed');

      if (isNew) setIsNew(false);

      setBackup(form);
      setIsEditing(false);
      setShowTypeMenu(false);

      setSuccessMessage(
        data?.message ||
        (isNew ? 'Bank details created successfully.' : 'Bank details updated successfully.'),
      );
      setShowSuccessModal(true);

    } catch (e: any) {
      setErrors(prev => ({
        ...prev,
        bankName: e.message || 'Failed to save. Please try again.',
      }));
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TransactionalHeader title="Bank Details" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AmbColors.primary} />
          <Text style={styles.loadingText}>Loading bank details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TransactionalHeader
        title="Bank Details"
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={isEditing ? handleCancel : handleEdit}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isEditing ? 'close' : 'edit'}
              size={14}
              color={isEditing ? AmbColors.error : AmbColors.primary}
            />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Info Banner ── */}
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Secure Payments</Text>
              <Text style={styles.infoBannerDesc}>
                Please ensure your bank information is accurate. This account will be
                used for your monthly service reimbursements and incentives.
              </Text>
            </View>
            <MaterialIcons
              name="account-balance"
              size={80}
              color={AmbColors.onPrimary}
              style={styles.infoBannerWatermark}
            />
          </View>

          {/* ── "No record yet" notice (view mode only) ── */}
          {isNew && !isEditing && (
            <View style={styles.emptyNotice}>
              <MaterialIcons name="info-outline" size={16} color={AmbColors.primary} />
              <Text style={styles.emptyNoticeText}>
                No bank details saved yet. Tap{' '}
                <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Edit</Text> to add your account.
              </Text>
            </View>
          )}

          {/* ── Form Card ── */}
          <View style={styles.section}>
            <Field
              label="Bank Name" icon="business" value={form.bankName}
              placeholder="e.g. HDFC Bank" editable={isEditing}
              onChangeText={v => update('bankName', v)} error={errors.bankName}
            />
            <Field
              label="Branch Name" icon="location-on" value={form.branch}
              placeholder="e.g. South Extension II" editable={isEditing}
              onChangeText={v => update('branch', v)} error={errors.branch}
            />
            <Field
              label="IFSC Code" icon="tag" value={form.ifsc}
              placeholder="HDFC0001234" editable={isEditing}
              autoCapitalize="characters"
              onChangeText={v => update('ifsc', v.toUpperCase())} error={errors.ifsc}
            />
            <Field
              label="Account Holder Name" icon="person" value={form.holderName}
              placeholder="As per bank records" editable={isEditing}
              onChangeText={v => update('holderName', v)} error={errors.holderName}
            />
            <Field
              label="Account Number" icon="numbers" value={form.accountNumber}
              placeholder="Enter account number" editable={isEditing}
              keyboardType="numeric" masked={!isEditing}
              onChangeText={v => update('accountNumber', v)}
              error={errors.accountNumber}
            />

            {/* Confirm field only visible while editing */}
            {isEditing && (
              <Field
                label="Confirm Account Number" icon="verified-user"
                value={form.confirmAccount}
                placeholder="Re-enter account number"
                editable keyboardType="numeric"
                onChangeText={v => update('confirmAccount', v)}
                error={errors.confirmAccount}
              />
            )}

            {/* ── Account Type ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Account Type <Text style={styles.required}>*</Text>
              </Text>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.inputWrapper, errors.accountType ? styles.inputError : null]}
                    onPress={() => setShowTypeMenu(p => !p)}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="account-tree"
                      size={18}
                      color={AmbColors.outline}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.dropdownValue}>{form.accountType}</Text>
                    <MaterialIcons
                      name={showTypeMenu ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={22}
                      color={AmbColors.outline}
                    />
                  </TouchableOpacity>
                  {errors.accountType
                    ? <Text style={styles.errorText}>{errors.accountType}</Text>
                    : null}
                  {showTypeMenu && (
                    <View style={styles.dropdownMenu}>
                      {ACCOUNT_TYPES.map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.dropdownItem,
                            form.accountType === type && styles.dropdownItemActive,
                          ]}
                          onPress={() => { update('accountType', type); setShowTypeMenu(false); }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            form.accountType === type && styles.dropdownItemTextActive,
                          ]}>
                            {type}
                          </Text>
                          {form.accountType === type && (
                            <MaterialIcons name="check" size={16} color={AmbColors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.inputWrapper, styles.inputDisabled]}>
                  <MaterialIcons
                    name="account-tree"
                    size={18}
                    color={AmbColors.outline}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.readValue}>{form.accountType || '—'}</Text>
                </View>
              )}
            </View>

            {/* ── Save Button (edit mode only) ── */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.saveBtnText}>
                      {isNew ? 'Create Bank Details' : 'Save Bank Details'}
                    </Text>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.securityNote}>
            Your data is encrypted and stored securely according to Jhilmil Homecare
            privacy policies.
          </Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionModal
        visible={showSuccessModal}
        title={isNew ? 'Bank Details Saved' : 'Bank Details Updated'}
        message={successMessage}
        confirmText="OK"
        iconName="check-circle"
        onConfirm={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, icon, value, placeholder, onChangeText,
  keyboardType, autoCapitalize, masked, editable = true, error,
}: {
  label: string; icon: string; value: string; placeholder: string;
  onChangeText: (v: string) => void; keyboardType?: any;
  autoCapitalize?: any; masked?: boolean;
  editable?: boolean; error?: string;
}) {
  const displayValue =
    masked && value ? '••••••••••••' + value.slice(-4) : value;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={[
        styles.inputWrapper,
        !editable && styles.inputDisabled,
        error ? styles.inputError : null,
      ]}>
        <MaterialIcons
          name={icon as any}
          size={18}
          color={AmbColors.outline}
          style={styles.inputIcon}
        />
        {editable ? (
          <TextInput
            style={styles.textInput}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={`${AmbColors.outline}70`}
            onChangeText={onChangeText}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize={autoCapitalize ?? 'words'}
          />
        ) : (
          <Text style={styles.readValue}>{displayValue || '—'}</Text>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Styles (unchanged from original) ────────────────────────────────────────

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: AmbColors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:      { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.outline },
  scroll:           { padding: 16, gap: 16 },
  infoBanner: {
    borderRadius: AmbRadius.lg,
    backgroundColor: AmbColors.primary,
    padding: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBannerContent:   { flex: 1, gap: 6 },
  infoBannerTitle:     { fontFamily: 'Inter_700Bold',    fontSize: 16, color: AmbColors.onPrimary },
  infoBannerDesc:      { fontFamily: 'Inter_400Regular', fontSize: 12, color: `${AmbColors.onPrimary}CC`, lineHeight: 18 },
  infoBannerWatermark: { position: 'absolute', right: -10, bottom: -10, opacity: 0.15 },
  emptyNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${AmbColors.primary}12`,
    borderRadius: AmbRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: `${AmbColors.primary}30`,
  },
  emptyNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: AmbColors.primary },
  section: {
    backgroundColor: AmbColors.surface,
    borderRadius: AmbRadius.lg,
    padding: 16,
    gap: 16,
    ...AmbShadow.sm,
  },
  fieldGroup:    { gap: 6 },
  fieldLabel:    { fontFamily: 'Inter_500Medium', fontSize: 13, color: AmbColors.onSurfaceVariant },
  required:      { color: AmbColors.error },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: AmbColors.surface,
    gap: 8,
  },
  inputDisabled: { backgroundColor: `${AmbColors.outline}0A` },
  inputError:    { borderColor: AmbColors.error },
  inputIcon:     { width: 22 },
  textInput:     { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface, padding: 0 },
  readValue:     { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  errorText:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: AmbColors.error },
  dropdownValue: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: AmbColors.surface },
  dropdownItemActive:   { backgroundColor: `${AmbColors.primary}12` },
  dropdownItemText:     { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  dropdownItemTextActive: { fontFamily: 'Inter_600SemiBold', color: AmbColors.primary },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.md, paddingVertical: 14,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },
  editBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: AmbColors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: AmbColors.surface,
  },
  editBtnActive: { borderColor: `${AmbColors.error}40`, backgroundColor: `${AmbColors.error}0D` },
  securityNote:  { fontFamily: 'Inter_400Regular', fontSize: 11, color: AmbColors.outline, textAlign: 'center', paddingHorizontal: 16 },
});
