// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   Alert,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import { router, useLocalSearchParams } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
// import { useAmbulanceContext } from '@/src/features/ambulance/context/AmbulanceContext';
// import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// type AmbType = 'Basic' | 'Advanced' | '';

// const UPLOAD_SLOTS = [
//   { label: 'Registration', icon: 'description' as const },
//   { label: 'Insurance', icon: 'shield' as const },
//   { label: 'Fitness Cert.', icon: 'fact-check' as const },
//   { label: 'Permit', icon: 'approval' as const },
// ];

// const VALIDITY_LABELS = ['Insurance Expiry', 'Fitness Expiry', 'Permit Expiry'];
// const VALIDITY_ICONS = ['shield', 'fact-check', 'approval'] as const;

// export default function AddAmbulanceScreen() {
//   const { mode = 'add', id } = useLocalSearchParams<{ mode?: string; id?: string }>();
//   const isView = mode === 'view';
//   const isEdit = mode === 'edit';

//   const { addAmbulance, updateAmbulance, getAmbulanceById } = useAmbulanceContext();

//   const [vehicleNumber, setVehicleNumber] = useState('');
//   const [ambType, setAmbType] = useState<AmbType>('');
//   const [ratePerKm, setRatePerKm] = useState('');
//   const [minRate, setMinRate] = useState('');
//   const [photoUri, setPhotoUri] = useState<string | null>(null);
//   const [docUris, setDocUris] = useState<(string | null)[]>([null, null, null, null]);
//   const [validityDates, setValidityDates] = useState<string[]>(['', '', '']);
//   const [showDatePicker, setShowDatePicker] = useState<number | null>(null);

//   // Prefill form when editing or viewing
//   useEffect(() => {
//     if ((isView || isEdit) && id) {
//       const amb = getAmbulanceById(id);
//       if (amb) {
//         setVehicleNumber(amb.vehicleNumber);
//         setAmbType(amb.type);
//         setRatePerKm(String(amb.ratePerKm));
//         if (amb.photoUri) setPhotoUri(amb.photoUri);
//         setValidityDates([
//           amb.insuranceExpiry ?? '',
//           amb.fitnessExpiry ?? '',
//           amb.permitExpiry ?? '',
//         ]);
//       }
//     }
//   }, [id, mode]);

//   const pickPhoto = async () => {
//     if (isView) return;
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [16, 9],
//       quality: 0.8,
//     });
//     if (!result.canceled) setPhotoUri(result.assets[0].uri);
//   };

//   const pickDoc = async (index: number) => {
//     if (isView) return;
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: false,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       const updated = [...docUris];
//       updated[index] = result.assets[0].uri;
//       setDocUris(updated);
//     }
//   };

//   const handleDateChange = (index: number, date?: Date) => {
//     setShowDatePicker(null);
//     if (date) {
//       const iso = date.toISOString().split('T')[0];
//       const updated = [...validityDates];
//       updated[index] = iso;
//       setValidityDates(updated);
//     }
//   };

//   const handleSubmit = () => {
//     if (!vehicleNumber.trim()) {
//       Alert.alert('Validation', 'Please enter the vehicle number.');
//       return;
//     }
//     if (!ambType) {
//       Alert.alert('Validation', 'Please select an ambulance type.');
//       return;
//     }

//     const payload = {
//       vehicleNumber: vehicleNumber.trim(),
//       type: ambType as 'Basic' | 'Advanced',
//       ratePerKm: Number(ratePerKm) || 0,
//       status: 'Active' as const,
//       crewInitials: [],
//       photoUri: photoUri ?? undefined,
//       insuranceExpiry: validityDates[0] || undefined,
//       fitnessExpiry: validityDates[1] || undefined,
//       permitExpiry: validityDates[2] || undefined,
//     };

//     if (isEdit && id) {
//       updateAmbulance(id, payload);
//     } else {
//       addAmbulance(payload);
//     }
//     router.back();
//   };

//   const headerTitle = isView ? 'View Ambulance' : isEdit ? 'Edit Ambulance' : 'Add Ambulance';

//   return (
//     <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
//       <TransactionalHeader title={headerTitle} onBack={() => router.back()} />

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scroll}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* ── Hero photo card ──────────────────────────────────────── */}
//           <TouchableOpacity style={styles.heroCard} onPress={pickPhoto} activeOpacity={isView ? 1 : 0.8}>
//             {photoUri ? (
//               <Image source={{ uri: photoUri }} style={styles.heroImage} resizeMode="cover" />
//             ) : (
//               <View style={styles.heroPlaceholder}>
//                 <MaterialIcons name="add-a-photo" size={36} color={`${AmbColors.primary}60`} />
//                 <Text style={styles.heroPlaceholderText}>
//                   {isView ? 'No photo added' : 'Tap to add vehicle photo'}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.heroLabel}>
//               <Text style={styles.heroLabelSub}>
//                 {isView ? 'VIEW MODE' : isEdit ? 'EDIT ENTRY' : 'NEW ENTRY'}
//               </Text>
//               <Text style={styles.heroLabelTitle}>Fleet Management</Text>
//             </View>
//           </TouchableOpacity>

//           {/* ── Vehicle info ─────────────────────────────────────────── */}
//           <View style={styles.cardSection}>
//             <Text style={styles.cardSectionTitle}>Vehicle Information</Text>

//             {/* Vehicle number */}
//             <View style={styles.fieldGroup}>
//               <Text style={styles.fieldLabel}>VEHICLE NUMBER</Text>
//               <View style={[styles.inputWrapper, isView && styles.inputDisabled]}>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="e.g. MH 12 AB 1234"
//                   placeholderTextColor={`${AmbColors.outline}80`}
//                   value={vehicleNumber}
//                   onChangeText={setVehicleNumber}
//                   autoCapitalize="characters"
//                   editable={!isView}
//                 />
//               </View>
//             </View>

//             {/* Ambulance type */}
//             <View style={styles.fieldGroup}>
//               <Text style={styles.fieldLabel}>AMBULANCE TYPE</Text>
//               <View style={styles.typeSelector}>
//                 {(['Basic', 'Advanced'] as AmbType[]).map((t) => (
//                   <TouchableOpacity
//                     key={t}
//                     style={[styles.typeBtn, ambType === t && styles.typeBtnActive]}
//                     onPress={() => !isView && setAmbType(t)}
//                     activeOpacity={isView ? 1 : 0.8}
//                     disabled={isView}
//                   >
//                     <Text style={[styles.typeBtnText, ambType === t && styles.typeBtnTextActive]}>
//                       {t}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Rate + Min rate */}
//             <View style={styles.rateRow}>
//               <View style={[styles.fieldGroup, { flex: 1 }]}>
//                 <Text style={styles.fieldLabel}>RATE / KM</Text>
//                 <View style={[styles.prefixInputWrapper, isView && styles.inputDisabled]}>
//                   <Text style={styles.prefix}>₹</Text>
//                   <TextInput
//                     style={styles.prefixInput}
//                     placeholder="0"
//                     placeholderTextColor={`${AmbColors.outline}80`}
//                     value={ratePerKm}
//                     onChangeText={setRatePerKm}
//                     keyboardType="numeric"
//                     editable={!isView}
//                   />
//                 </View>
//               </View>
//               <View style={[styles.fieldGroup, { flex: 1 }]}>
//                 <Text style={styles.fieldLabel}>MINIMUM FARE</Text>
//                 <View style={[styles.prefixInputWrapper, isView && styles.inputDisabled]}>
//                   <Text style={styles.prefix}>₹</Text>
//                   <TextInput
//                     style={styles.prefixInput}
//                     placeholder="0"
//                     placeholderTextColor={`${AmbColors.outline}80`}
//                     value={minRate}
//                     onChangeText={setMinRate}
//                     keyboardType="numeric"
//                     editable={!isView}
//                   />
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* ── Document uploads ─────────────────────────────────────── */}
//           <View style={styles.cardSection}>
//             <Text style={styles.cardSectionTitle}>Digital Compliance</Text>
//             <Text style={styles.cardSectionSub}>
//               {isView ? 'Uploaded documents' : 'Upload required documents'}
//             </Text>
//             <View style={styles.uploadGrid}>
//               {UPLOAD_SLOTS.map((slot, i) => (
//                 <TouchableOpacity
//                   key={i}
//                   style={[styles.uploadBox, docUris[i] && styles.uploadBoxDone]}
//                   onPress={() => pickDoc(i)}
//                   activeOpacity={isView ? 1 : 0.7}
//                   disabled={isView}
//                 >
//                   {docUris[i] ? (
//                     <>
//                       <MaterialIcons name="check-circle" size={24} color={AmbColors.tertiary} />
//                       <Text style={[styles.uploadLabel, { color: AmbColors.tertiary }]} numberOfLines={1}>
//                         {docUris[i]!.split('/').pop()}
//                       </Text>
//                     </>
//                   ) : (
//                     <>
//                       <MaterialIcons name={slot.icon} size={28} color={`${AmbColors.outline}60`} />
//                       <Text style={styles.uploadLabel}>{slot.label}</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* ── Validity dates ───────────────────────────────────────── */}
//           <View style={styles.cardSection}>
//             <Text style={styles.cardSectionTitle}>Validity Dates</Text>
//             {VALIDITY_LABELS.map((label, i) => (
//               <View key={i}>
//                 <TouchableOpacity
//                   style={styles.validityRow}
//                   onPress={() => !isView && setShowDatePicker(i)}
//                   activeOpacity={isView ? 1 : 0.7}
//                 >
//                   <View style={styles.validityLeft}>
//                     <View style={styles.validityIconBox}>
//                       <MaterialIcons name={VALIDITY_ICONS[i]} size={18} color={AmbColors.primary} />
//                     </View>
//                     <Text style={styles.validityLabel}>{label}</Text>
//                   </View>
//                   <View style={styles.validityRight}>
//                     <Text style={[styles.validityDateText, !validityDates[i] && styles.validityPlaceholder]}>
//                       {validityDates[i] || 'Select date'}
//                     </Text>
//                     {!isView && (
//                       <MaterialIcons name="calendar-today" size={16} color={AmbColors.outline} />
//                     )}
//                   </View>
//                 </TouchableOpacity>

//                 {showDatePicker === i && (
//                   <DateTimePicker
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     value={validityDates[i] ? new Date(validityDates[i]) : new Date()}
//                     onChange={(_, date) => handleDateChange(i, date)}
//                     minimumDate={new Date()}
//                   />
//                 )}
//               </View>
//             ))}
//           </View>

//           <View style={{ height: 100 }} />
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* ── Footer submit button (hidden in view mode) ────────────────── */}
//       {!isView && (
//         <View style={styles.footer}>
//           <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
//             <MaterialIcons name="check-circle" size={20} color="#fff" />
//             <Text style={styles.submitBtnText}>
//               {isEdit ? 'Save Changes' : 'Add to Fleet'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: AmbColors.surface },
//   scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

//   // Hero card
//   heroCard: {
//     height: 160,
//     borderRadius: AmbRadius.xl,
//     backgroundColor: AmbColors.surfaceContainerHigh,
//     overflow: 'hidden',
//     marginBottom: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   heroImage: {
//     position: 'absolute',
//     top: 0, left: 0, right: 0, bottom: 0,
//     width: '100%',
//     height: '100%',
//   },
//   heroPlaceholder: {
//     alignItems: 'center',
//     gap: 8,
//   },
//   heroPlaceholderText: {
//     fontFamily: 'Inter_500Medium',
//     fontSize: 13,
//     color: `${AmbColors.primary}80`,
//   },
//   heroLabel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: `${AmbColors.primary}88`,
//     padding: 14,
//   },
//   heroLabelSub: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 9,
//     color: 'rgba(255,255,255,0.8)',
//     letterSpacing: 1.5,
//     marginBottom: 2,
//   },
//   heroLabelTitle: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 15,
//     color: '#ffffff',
//   },

//   // Card sections
//   cardSection: {
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     borderRadius: AmbRadius.xl,
//     padding: 20,
//     marginBottom: 14,
//     gap: 16,
//     ...AmbShadow.subtle,
//   },
//   cardSectionTitle: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 15,
//     color: AmbColors.onSurface,
//   },
//   cardSectionSub: {
//     fontFamily: 'Inter_400Regular',
//     fontSize: 12,
//     color: AmbColors.secondary,
//     marginTop: -10,
//   },

//   // Field
//   fieldGroup: { gap: 8 },
//   fieldLabel: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 10,
//     color: AmbColors.onSurfaceVariant,
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//   },
//   inputWrapper: {
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: AmbRadius.md,
//     height: 50,
//     justifyContent: 'center',
//     paddingHorizontal: 14,
//   },
//   inputDisabled: {
//     backgroundColor: AmbColors.surfaceContainerHighest,
//     opacity: 0.7,
//   },
//   textInput: {
//     fontFamily: 'Inter_400Regular',
//     fontSize: 14,
//     color: AmbColors.onSurface,
//   },

//   // Type selector
//   typeSelector: { flexDirection: 'row', gap: 10 },
//   typeBtn: {
//     flex: 1,
//     height: 44,
//     borderRadius: AmbRadius.md,
//     borderWidth: 1.5,
//     borderColor: AmbColors.outlineVariant,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: AmbColors.surfaceContainerLow,
//   },
//   typeBtnActive: {
//     backgroundColor: AmbColors.primary,
//     borderColor: AmbColors.primary,
//   },
//   typeBtnText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 14,
//     color: AmbColors.onSurfaceVariant,
//   },
//   typeBtnTextActive: { color: '#ffffff' },

//   // Rate inputs
//   rateRow: { flexDirection: 'row', gap: 12 },
//   prefixInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: AmbRadius.md,
//     height: 50,
//     paddingHorizontal: 14,
//     gap: 6,
//   },
//   prefix: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 15,
//     color: AmbColors.secondary,
//   },
//   prefixInput: {
//     flex: 1,
//     fontFamily: 'Inter_400Regular',
//     fontSize: 14,
//     color: AmbColors.onSurface,
//   },

//   // Upload grid
//   uploadGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   uploadBox: {
//     width: (SCREEN_WIDTH - 40 - 40 - 12) / 2,
//     height: 110,
//     borderWidth: 1.5,
//     borderStyle: 'dashed',
//     borderColor: AmbColors.outlineVariant,
//     borderRadius: AmbRadius.md,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: AmbColors.surfaceContainerLow,
//   },
//   uploadBoxDone: {
//     borderColor: AmbColors.tertiary,
//     borderStyle: 'solid',
//     backgroundColor: `${AmbColors.tertiary}08`,
//   },
//   uploadLabel: {
//     fontFamily: 'Inter_500Medium',
//     fontSize: 12,
//     color: `${AmbColors.outline}bb`,
//     textAlign: 'center',
//     paddingHorizontal: 8,
//   },

//   // Validity rows
//   validityRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: AmbRadius.md,
//     padding: 14,
//   },
//   validityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   validityIconBox: {
//     width: 36,
//     height: 36,
//     borderRadius: AmbRadius.sm,
//     backgroundColor: `${AmbColors.primary}12`,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   validityLabel: {
//     fontFamily: 'Inter_500Medium',
//     fontSize: 13,
//     color: AmbColors.onSurface,
//   },
//   validityRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//   },
//   validityDateText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 13,
//     color: AmbColors.secondary,
//   },
//   validityPlaceholder: {
//     color: `${AmbColors.outline}80`,
//     fontFamily: 'Inter_400Regular',
//   },

//   // Footer
//   footer: {
//     position: 'absolute',
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
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 10,
//     height: 54,
//     backgroundColor: AmbColors.primary,
//     borderRadius: AmbRadius.md,
//     ...AmbShadow.card,
//   },
//   submitBtnText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 16,
//     color: '#ffffff',
//   },
// });

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// --- Constants & Types ---
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Note: Ensure these constants are defined or imported from your theme file
const AmbColors = {
  primary: "#0F766E",
  secondary: "#64748B",
  tertiary: "#10B981",
  surface: "#F8FAFC",
  surfaceContainerLowest: "#FFFFFF",
  onSurface: "#1E293B",
  outline: "#CBD5E1",
  error: "#EF4444",
};

const AmbRadius = { md: 8, xl: 16, xxl: 24 };

const API_ADD = "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/ADD_Ambulance_Info";
const API_UPDATE = "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/Update_Ambulance_Info";

type FileType = {
  uri: string;
  name?: string;
  mimeType?: string;
  type?: string;
  size?: number;
};

type FormType = {
  ambulance_id?: string | number;
  vehical_number: string;
  ambulance_type: string;
  rate_Km: string;
  Min_Rate: string;
  rc: FileType | null;
  fitness: FileType | null;
  insurance: FileType | null;
  permit: FileType | null;
  rc_old?: string;
  fitness_old?: string;
  insurance_old?: string;
  permit_old?: string;
  rcPreview: string | null;
  fitnessPreview: string | null;
  insurancePreview: string | null;
  permitPreview: string | null;
  insuence_expiry: string;
  fitness_expiry: string;
  permit_expiry: string;
};

const EMPTY_FORM: FormType = {
  ambulance_id: "",
  vehical_number: "",
  ambulance_type: "",
  rate_Km: "",
  Min_Rate: "",
  rc: null,
  fitness: null,
  insurance: null,
  permit: null,
  rcPreview: null,
  fitnessPreview: null,
  insurancePreview: null,
  permitPreview: null,
  insuence_expiry: "",
  fitness_expiry: "",
  permit_expiry: "",
};

export default function AddAmbulanceScreen({ route }: any) {
  const mode = route?.params?.mode || "add";
  const initialData = route?.params?.data || {};
  const isEdit = mode === "edit";

  const [form, setForm] = useState<FormType>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState<null | keyof FormType>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  // --- Logic Helpers ---
  const isPdfBase64 = (base64: string) => base64?.startsWith("JVBER");
  
  const normalizeType = (type: string) => {
    if (!type) return "";
    const t = type.toLowerCase();
    if (t === "advance") return "Advance";
    if (t === "basic") return "Basic";
    return "";
  };

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  // --- Effects ---
  useEffect(() => {
    const loadId = async () => {
      const user = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(user || "{}");
      setVendorId(parsed.vendorId);
    };
    loadId();
  }, []);

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) return;
    const docs = initialData?.ambulanceDocs?.[0] || {};
    setForm({
      ...EMPTY_FORM,
      ...initialData,
      ambulance_type: normalizeType(initialData?.ambulance_type),
      rate_Km: initialData?.rate_Km?.toString() || "",
      Min_Rate: (initialData?.min_Rate || initialData?.Min_Rate)?.toString() || "",
      rc_old: docs?.rc || null,
      fitness_old: docs?.fitness || null,
      insurance_old: docs?.insurence || null,
      permit_old: docs?.permit || null,
      rcPreview: docs?.rc ? (isPdfBase64(docs.rc) ? "PDF" : `data:image/jpeg;base64,${docs.rc}`) : null,
      fitnessPreview: docs?.fitness ? (isPdfBase64(docs.fitness) ? "PDF" : `data:image/jpeg;base64,${docs.fitness}`) : null,
      insurancePreview: docs?.insurence ? (isPdfBase64(docs.insurence) ? "PDF" : `data:image/jpeg;base64,${docs.insurence}`) : null,
      permitPreview: docs?.permit ? (isPdfBase64(docs.permit) ? "PDF" : `data:image/jpeg;base64,${docs.permit}`) : null,
    });
  }, [initialData]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage("");
      router.replace("/(ambulance)/ambulances");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        router.replace("/(ambulance)/ambulances");
        return true;
      });
      return () => subscription.remove();
    }, [])
  );

  const set = (key: keyof FormType, value: any) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // --- Actions ---
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.vehical_number) e.vehical_number = "Vehicle number required";
    if (!form.ambulance_type) e.ambulance_type = "Type required";
    if (!form.rate_Km) e.rate_Km = "Rate required";
    if (!form.Min_Rate) e.Min_Rate = "Min rate required";
    if (!form.rc && !form.rc_old) e.rc = "RC required";
    if (!form.fitness && !form.fitness_old) e.fitness = "Fitness required";
    if (!form.insurance && !form.insurance_old) e.insurance = "Insurance required";
    if (!form.permit && !form.permit_old) e.permit = "Permit required";
    if (!form.insuence_expiry) e.insuence_expiry = "expiry date Required";
    if (!form.fitness_expiry) e.fitness_expiry = "expiry date Required";
    if (!form.permit_expiry) e.permit_expiry = "expiry date Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

 const pickFile = async (field: keyof FormType) => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*", "application/pdf"],
  });

  if (!result.canceled) {
    const file = result.assets?.[0];
    if (!file) return;
    
    const MAX_FILE_SIZE = 204800; // 200KB

    if (file.size && file.size > MAX_FILE_SIZE) {
      // 1. Clear the form data for this field
      setForm(prev => ({ ...prev, [field]: null, [`${field}Preview`]: null }));
      // 2. Set the specific error message
      setErrors(prev => ({ ...prev, [field]: "File must be < 200KB" }));
      return;
    }

    // If valid, set the file AND clear any existing error for this field
    set(field, file);
    set((field + "Preview") as keyof FormType, file.uri);
    setErrors(prev => ({ ...prev, [field]: "" })); // Clear error on success
  }
};

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("vendor_id", vendorId || "");
      fd.append("vehical_number", form.vehical_number);
      fd.append("ambulance_type", form.ambulance_type.toLowerCase());
      fd.append("rate_Km", String(form.rate_Km));
      fd.append("Min_Rate", String(form.Min_Rate));
      fd.append("insuence_expiry", form.insuence_expiry);
      fd.append("fitness_expiry", form.fitness_expiry);
      fd.append("permit_expiry", form.permit_expiry);

      if (isEdit && form.ambulance_id) fd.append("ambulance_id", String(form.ambulance_id));

      const appendDocument = (key: string, newFile: any, oldData: any) => {
        if (newFile && newFile.uri) {
          fd.append(key, {
            uri: newFile.uri,
            name: newFile.name || `${key}.jpg`,
            type: newFile.mimeType || "image/jpeg",
          } as any);
        } else if (isEdit && oldData) {
          const uri = oldData.startsWith("data:") ? oldData : `data:image/jpeg;base64,${oldData}`;
          fd.append(key, { uri, name: `${key}.jpg`, type: "image/jpeg" } as any);
        }
      };

      appendDocument("rc", form.rc, form.rc_old);
      appendDocument("fitness", form.fitness, form.fitness_old);
      appendDocument("insurance", form.insurance, form.insurance_old);
      appendDocument("permit", form.permit, form.permit_old);

      const res = await fetch(isEdit ? API_UPDATE : API_ADD, {
        method: "POST",
        body: fd,
        headers: { "Accept": "application/json", "Content-Type": "multipart/form-data" },
      });

      const responseData = await res.json();
      if (res.ok) {
        setSuccessMessage(isEdit ? "Ambulance updated successfully" : "Ambulance added successfully");
      } else {
        Alert.alert("Error", responseData.message || "Something went wrong");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    router.replace("/(ambulance)/ambulances");
  };
  const onDateChange = (event: any, selectedDate?: Date) => {
  // 1. Hide the picker immediately (critical for Android)
  const currentField = showPicker;
  setShowPicker(null);

  // 2. Only update if the user pressed "OK" (event.type === "set")
  if (event.type === "set" && selectedDate && currentField) {
    const formatted = formatDate(selectedDate); // uses your YYYY-MM-DD helper
    set(currentField, formatted);
  }
};

  return (
   <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.stickyHeader}>
    <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
      <MaterialIcons name="arrow-back" size={24} color={AmbColors.onSurface} />
    </TouchableOpacity>
    {/* Ensure this is a clean string */}
    <Text style={styles.headerTitle}>
      {isEdit ? "Edit Ambulance" : "Add Ambulance"}
    </Text>
    <View style={{ width: 40 }} />
  </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          ref={scrollRef} 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          
          {successMessage ? (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={18} color="#065F46" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Section 1: Basic Details */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}><Text style={styles.sectionNumberText}>1</Text></View>
            <Text style={styles.sectionTitle}>Ambulance Details</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput 
              label="VEHICLE NUMBER" 
              icon="directions-car"
              value={form.vehical_number} 
              placeholder="e.g. MH 12 AB 1234"
              onChange={(v: string) => set("vehical_number", v)}
              error={errors.vehical_number} 
            />

            <Text style={styles.fieldLabel}>AMBULANCE TYPE</Text>
            <View style={styles.typeRow}>
              {["Basic", "Advance"].map((type) => (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.7}
                  style={[styles.typeOption, form.ambulance_type === type && styles.typeOptionActive]}
                  onPress={() => set("ambulance_type", type)}
                >
                  <MaterialIcons 
                    name={type === "Basic" ? "bolt" : "emergency"}
                    size={18} 
                    color={form.ambulance_type === type ? "#fff" : AmbColors.primary} 
                  />
                  <Text style={[styles.typeText, form.ambulance_type === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.ambulance_type && <Text style={styles.errorText}>{errors.ambulance_type}</Text>}

           <View style={{ marginTop: 10 }}>
  <CustomInput 
    label="RATE / KM" 
    icon="currency-rupee"
    keyboardType="numeric"
    value={form.rate_Km} 
    onChange={(v: string) => set("rate_Km", v)}
    error={errors.rate_Km} 
  />
  <CustomInput 
    label="MIN RATE" 
    icon="payments"
    keyboardType="numeric"
    value={form.Min_Rate} 
    onChange={(v: string) => set("Min_Rate", v)}
    error={errors.Min_Rate} 
  />
</View>
          </View>

          {/* Section 2: Documents (Uploads) */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}><Text style={styles.sectionNumberText}>2</Text></View>
            <Text style={styles.sectionTitle}>Required Documents</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.helperText}>Upload clear images or PDF copies (Max 200KB)</Text>
            

      
            
            {/* Each DocItem now takes full width automatically because we removed docGrid row */}
            <View style={styles.fullWidthDocStack}>
              <DocItem label="RC Copy" file={form.rcPreview} error={errors.rc} onPress={() => pickFile("rc")} />
              <DocItem label="Fitness Certificate" file={form.fitnessPreview} error={errors.fitness} onPress={() => pickFile("fitness")} />
              <DocItem label="Insurance Policy" file={form.insurancePreview} error={errors.insurance} onPress={() => pickFile("insurance")} />
              <DocItem label="Vehicle Permit" file={form.permitPreview} error={errors.permit} onPress={() => pickFile("permit")} />
            </View>
          
          </View>

          {/* Section 3: Expiry Dates */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}><Text style={styles.sectionNumberText}>3</Text></View>
            <Text style={styles.sectionTitle}>Validity & Expiry</Text>
          </View>

          <View style={[styles.formCard, { marginBottom: 40 }]}>
            <DateInput label="INSURANCE EXPIRY" value={form.insuence_expiry} error={errors.insuence_expiry} onPress={() => setShowPicker("insuence_expiry")} />
            <DateInput label="FITNESS EXPIRY" value={form.fitness_expiry} error={errors.fitness_expiry} onPress={() => setShowPicker("fitness_expiry")} />
            <DateInput label="PERMIT EXPIRY" value={form.permit_expiry} error={errors.permit_expiry} onPress={() => setShowPicker("permit_expiry")} />
          </View>

          {/* Bottom Padding for Footer */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name={isEdit ? "save" : "add-circle"} size={22} color="#fff" />
              <Text style={styles.submitBtnText}>{isEdit ? "Save Changes" : "Add Ambulance"}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      {/* ... DateTimePicker remains the same ... */}
      {showPicker && (
  <DateTimePicker
    // Convert string back to Date object, or default to today
    value={form[showPicker] ? new Date(form[showPicker] as string) : new Date()}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={onDateChange}
    // THIS LINE DISABLES PREVIOUS DATES
    minimumDate={new Date()} 
  />
)}
    </SafeAreaView>
  );
}

// --- Sub Components ---

const CustomInput = ({ label, icon, value, onChange, error, ...props }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.inputRow, error && { borderColor: AmbColors.error }]}>
      <View style={styles.inputIconBox}>
        <MaterialIcons name={icon} size={18} color={AmbColors.primary} />
      </View>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={`${AmbColors.secondary}60`}
        {...props}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const DateInput = ({ label, value, onPress, error }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TouchableOpacity 
      style={[
        styles.dateRow, 
        error && { borderColor: AmbColors.error },
        !value && { opacity: 0.7 } // Slight "blur" effect if no date is picked yet
      ]} 
      onPress={onPress}
    >
      <MaterialIcons name="calendar-today" size={18} color={AmbColors.primary} />
      <Text style={[styles.dateText, !value && { color: `${AmbColors.secondary}60` }]}>
        {value || "Select Expiry Date"}
      </Text>
      <MaterialIcons name="expand-more" size={20} color={AmbColors.secondary} />
    </TouchableOpacity>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const DocItem = ({ label, file, onPress, error }: any) => {
  const isPdf = file === "PDF" || file?.includes("application/pdf") || file?.toLowerCase().includes(".pdf");
  return (
    <View style={{ flex: 1 }}> 
      <TouchableOpacity 
        style={[styles.docBox, error ? { borderColor: AmbColors.error, borderWidth: 1.5, borderStyle: 'solid' } : null]} 
        onPress={onPress}
      >
        {file ? (
          isPdf ? (
            <View style={styles.pdfBadge}>
              <MaterialIcons name="picture-as-pdf" size={24} color={AmbColors.primary} />
              <Text style={styles.pdfText}>PDF</Text>
            </View>
          ) : (
            <Image source={{ uri: file }} style={styles.docPreview} />
          )
        ) : (
          <MaterialIcons name="cloud-upload" size={24} color={`${AmbColors.primary}40`} />
        )}
        <Text style={styles.docLabel} numberOfLines={1}>{label}</Text>
        {file && <View style={styles.checkBadge}><MaterialIcons name="check" size={10} color="#fff" /></View>}
      </TouchableOpacity>
      
      {/* ADD THIS LINE TO SHOW THE ACTUAL ERROR MESSAGE */}
      {error ? <Text style={[styles.errorText, { textAlign: 'center' }]}>{error}</Text> : null}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: "#DCFCE7", padding: 14, borderRadius: AmbRadius.md, marginBottom: 20,
    borderWidth: 1, borderColor: "#22C55E"
  },
  successText: { color: "#166534", fontWeight: "600", fontSize: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 24 },
  sectionNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: AmbColors.primary, justifyContent: 'center', alignItems: 'center' },
  sectionNumberText: { fontSize: 13, color: '#fff', fontWeight: '800' },
  // sectionTitle: { fontSize: 17, fontWeight: '400', color: AmbColors.onSurface, letterSpacing: -0.3 },
  formCard: { 
    backgroundColor: AmbColors.surfaceContainerLowest, 
    borderRadius: AmbRadius.xl, 
    padding: 18, 
    elevation: 3, 
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12 
  },
  // fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '300', color: AmbColors.secondary, marginBottom: 8, letterSpacing: 0.6 },
  helperText: { fontSize: 11, color: AmbColors.secondary, marginBottom: 16, marginTop: -8 },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', // Slightly darker surface for depth
    borderRadius: AmbRadius.md, 
    borderWidth: 1, 
    borderColor: AmbColors.outline 
  },
  inputIconBox: { width: 44, alignItems: 'center', justifyContent: 'center' },
  textInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: AmbColors.onSurface, fontWeight: '500' },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeOption: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 14, 
    borderRadius: AmbRadius.md, 
    borderWidth: 1.5, 
    borderColor: AmbColors.primary,
    backgroundColor: '#fff'
  },
  typeOptionActive: { backgroundColor: AmbColors.primary, borderColor: AmbColors.primary },
  typeText: { fontWeight: '700', color: AmbColors.primary, fontSize: 14 },
  typeTextActive: { color: '#fff' },
  docGrid: { flexDirection: 'row', gap: 16 },
  // docBox: { 
  //   flex: 1, 
  //   height: 110, 
  //   backgroundColor: '#F8FAFC', 
  //   borderRadius: AmbRadius.md, 
  //   borderStyle: 'dashed', 
  //   borderWidth: 1.5, 
  //   borderColor: AmbColors.outline, 
  //   justifyContent: 'center', 
  //   alignItems: 'center', 
  //   padding: 10 
  // },
  // docPreview: { width: '100%', height: 65, borderRadius: 6, marginBottom: 6 },
  docLabel: { fontSize: 11, fontWeight: '600', color: AmbColors.secondary },
  pdfBadge: { alignItems: 'center', marginBottom: 6 },
  pdfText: { fontSize: 11, fontWeight: '800', color: AmbColors.primary },
  checkBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: AmbColors.tertiary, borderRadius: 12, padding: 3 },
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    backgroundColor: '#F1F5F9', 
    padding: 14, 
    borderRadius: AmbRadius.md, 
    borderWidth: 1, 
    borderColor: AmbColors.outline 
  },
  dateText: { flex: 1, fontSize: 15, color: AmbColors.onSurface, fontWeight: '500' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  submitBtn: { 
    backgroundColor: AmbColors.primary, 
    flexDirection: 'row', 
    height: 58, 
    borderRadius: AmbRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12 
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '400' },
  errorText: { color: AmbColors.error, fontSize: 11, marginTop: 6, marginLeft: 2, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '400', color: AmbColors.onSurface, letterSpacing: -0.3 },
  
  // Stack for documents
  fullWidthDocStack: { 
    gap: 16 // Consistent gap between full-width documents
  },
  
  docBox: { 
    width: '100%', // Explicitly take full width
    height: 120, // Slightly taller for better visibility
    backgroundColor: '#F8FAFC', 
    borderRadius: AmbRadius.md, 
    borderStyle: 'dashed', 
    borderWidth: 1.5, 
    borderColor: AmbColors.outline, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 12 
  },
  
  docPreview: { 
    width: '60%', // Preview doesn't need to be huge, keeping it centered
    height: 70, 
    borderRadius: 6, 
    marginBottom: 8 
  },
  
  // Adjust spacing for CustomInput when stacked
  fieldGroup: { 
    marginBottom: 16,
    width: '100%' 
  },
 stickyHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 4, // Higher elevation for Fabric
    zIndex: 1000, // Ensure it sits on top
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: AmbColors.onSurface,
  },
  
 
});