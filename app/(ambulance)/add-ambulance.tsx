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
import React, { useEffect, useState ,useRef } from "react";
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
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

const API_ADD =
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/ADD_Ambulance_Info";

const API_UPDATE =
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/Update_Ambulance_Info";

type FileType = {
  uri: string;
  name?: string;
  mimeType?: string;
  type?: string;
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

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const convertDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
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
  const [showPicker, setShowPicker] = useState<null | keyof FormType>(null);

  const [rcChanged, setRcChanged] = useState(false);
const [fitnessChanged, setFitnessChanged] = useState(false);
const [insuranceChanged, setInsuranceChanged] = useState(false);
const [permitChanged, setPermitChanged] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null); // Ref for scrolling to top
  const [form, setForm] = useState<FormType>(EMPTY_FORM);

  const isEdit = mode === "edit";
  const isPdfBase64 = (base64: string) => {
  return base64?.startsWith("JVBER"); // PDF signature
};
  // const docs = initialData?.ambulanceDocs?.[0] || {};
   const normalizeType = (type: string) => {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t === "advance") return "Advance";
  if (t === "basic") return "Basic";
  return "";
};
useEffect(() => {
  if (!initialData || Object.keys(initialData).length === 0) return;

  const docs = initialData?.ambulanceDocs?.[0] || {};

  setForm({
    ...EMPTY_FORM,
    ...initialData,

    ambulance_type: normalizeType(initialData?.ambulance_type),

    rate_Km: initialData?.rate_Km?.toString() || "",
    Min_Rate:
      initialData?.min_Rate?.toString() ||
      initialData?.Min_Rate?.toString() ||
      "",

    rc_old: docs?.rc || null,
    fitness_old: docs?.fitness || null,
    insurance_old: docs?.insurence || null,
    permit_old: docs?.permit || null,

    rcPreview: docs?.rc
      ? isPdfBase64(docs.rc)
        ? "PDF"
        : `data:image/jpeg;base64,${docs.rc}`
      : null,

    fitnessPreview: docs?.fitness
      ? isPdfBase64(docs.fitness)
        ? "PDF"
        : `data:image/jpeg;base64,${docs.fitness}`
      : null,

    insurancePreview: docs?.insurence
      ? isPdfBase64(docs.insurence)
        ? "PDF"
        : `data:image/jpeg;base64,${docs.insurence}`
      : null,

    permitPreview: docs?.permit
      ? isPdfBase64(docs.permit)
        ? "PDF"
        : `data:image/jpeg;base64,${docs.permit}`
      : null,
  });
}, [initialData]);

useEffect(() => {
  if (!successMessage) return;

  const timer = setTimeout(() => {
    setSuccessMessage("");
    router.back();
  }, 4000);

  return () => clearTimeout(timer);
}, [successMessage]);

useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      }
    );

    return () => subscription.remove(); // ✅ correct cleanup
  }, [])
);

  // const [form, setForm] = useState<FormType>({
  //   ...EMPTY_FORM,
  //   ...initialData,

  //   ambulance_type: normalizeType(initialData?.ambulance_type),

  //   rate_Km: initialData?.rate_Km?.toString() || "",
  // Min_Rate: initialData?.min_Rate?.toString() || initialData?.Min_Rate?.toString() || "",

  //    // ✅ FIXED (correct path)
  // rc_old: docs?.rc || null,
  // fitness_old: docs?.fitness || null,
  // insurance_old: docs?.insurence || null,
  // permit_old: docs?.permit || null,

  // // ✅ FIXED preview
  // rcPreview: docs?.rc
  // ? isPdfBase64(docs.rc)
  //   ? "PDF"
  //   : `data:image/jpeg;base64,${docs.rc}`
  // : null,
  // fitnessPreview: docs?.fitness
  // ? isPdfBase64(docs.fitness)
  //   ? "PDF"
  //   : `data:image/jpeg;base64,${docs.fitness}`
  // : null,

  // insurancePreview: docs?.insurence
  // ? isPdfBase64(docs.insurence)
  //   ? "PDF"
  //   : `data:image/jpeg;base64,${docs.insurence}`
  // : null,

  // permitPreview: docs?.permit 
  // ? isPdfBase64(docs.permit )
  //   ? "PDF"
  //   : `data:image/jpeg;base64,${docs.permit }`
  // : null,


  // });

  const formatDate = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();

  return `${y}-${m}-${d}`; // ✅ FIXED
};

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const loadId = async () => {
      const user = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(user || "{}");
      setVendorId(parsed.vendorId);
   
    };
    loadId();
  }, []);

  
 

  const set = (key: keyof FormType, value: any) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };
  const urlToFile = async (url: string, name: string) => {
  const response = await fetch(url);
  const blob = await response.blob();

  return {
    uri: url,
    name: name,
    type: blob.type || "image/jpeg",
  };
};

  // ✅ VALIDATION
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

    if (!form.insuence_expiry) e.insuence_expiry = "Insurance expiry required";
    if (!form.fitness_expiry) e.fitness_expiry = "Fitness expiry required";
    if (!form.permit_expiry) e.permit_expiry = "Permit expiry required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ FILE PICKER
 const pickFile = async (field: keyof FormType) => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*", "application/pdf"],
  });

  if (!result.canceled) {
    const file = result.assets?.[0];
    if (!file) return;

    set(field, file);
    set((field + "Preview") as keyof FormType, file.uri);

    // ✅ mark changed
    if (field === "rc") setRcChanged(true);
    if (field === "fitness") setFitnessChanged(true);
    if (field === "insurance") setInsuranceChanged(true);
    if (field === "permit") setPermitChanged(true);
  }
};
 

  // ✅ SUBMIT
  const onSubmit = async () => {
  if (!validate()) return;
  setLoading(true);

  try {
    const fd = new FormData();

    // Standard Fields
    fd.append("vendor_id", vendorId || "");
    fd.append("vehical_number", form.vehical_number);
    fd.append("ambulance_type", form.ambulance_type.toLowerCase());
    fd.append("rate_Km", String(form.rate_Km));
    fd.append("Min_Rate", String(form.Min_Rate));
    fd.append("insuence_expiry", form.insuence_expiry);
    fd.append("fitness_expiry", form.fitness_expiry);
    fd.append("permit_expiry", form.permit_expiry);

    if (isEdit && form.ambulance_id) {
      fd.append("ambulance_id", String(form.ambulance_id));
    }

    // --- IMAGE LOGIC ---
    const appendDocument = (key: string, newFile: any, oldData: any) => {
      if (newFile && newFile.uri) {
        // Case A: User picked a NEW file
        fd.append(key, {
          uri: newFile.uri,
          name: newFile.name || `${key}.jpg`,
          type: newFile.mimeType || "image/jpeg",
        } as any);
      } else if (isEdit && oldData) {
        // Case B: User is editing and didn't change the file
        // We send the old Base64 back as a "file"
        const uri = oldData.startsWith("data:") 
                    ? oldData 
                    : `data:image/jpeg;base64,${oldData}`;
        
        fd.append(key, {
          uri: uri,
          name: `${key}.jpg`,
          type: "image/jpeg",
        } as any);
      }
    };

    appendDocument("rc", form.rc, form.rc_old);
    appendDocument("fitness", form.fitness, form.fitness_old);
    appendDocument("insurance", form.insurance, form.insurance_old);
    appendDocument("permit", form.permit, form.permit_old);

    const res = await fetch(isEdit ? API_UPDATE : API_ADD, {
      method: "POST",
      body: fd,
      headers: {
        "Accept": "application/json",
        "Content-Type": "multipart/form-data",
      },
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

  return (
    <SafeAreaView>
    <ScrollView  ref={scrollRef} contentContainerStyle={styles.container}>
      {successMessage ? (
  <View style={{
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  }}>
    <Text style={{ color: "#065F46", fontWeight: "600" }}>
      {successMessage}
    </Text>
  </View>
) : null}
      <Text style={styles.title}>Ambulance Form</Text>

      <View style={styles.card}>
        <Input
          label="Vehicle Number"
          value={form.vehical_number}
          onChange={(v) => set("vehical_number", v)}
          error={errors.vehical_number}
        />

        <Text style={styles.label}>Ambulance Type</Text>
        <View style={styles.row}>
          {["Basic", "Advance"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.option,
                form.ambulance_type === type && styles.optionActive,
              ]}
              onPress={() => set("ambulance_type", type)}
            >
              <Text>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.ambulance_type && <Text style={styles.error}>{errors.ambulance_type}</Text>}

        <Input label="Rate Per KM" value={form.rate_Km} onChange={(v) => set("rate_Km", v)} error={errors.rate_Km} />
        <Input label="Minimum Rate" value={form.Min_Rate} onChange={(v) => set("Min_Rate", v)} error={errors.Min_Rate} />

        <FileInput label="RC" file={form.rcPreview} onPress={() => pickFile("rc")} />
        {errors.rc && <Text style={styles.error}>{errors.rc}</Text>}

        <FileInput label="Fitness" file={form.fitnessPreview} onPress={() => pickFile("fitness")} />
        {errors.fitness && <Text style={styles.error}>{errors.fitness}</Text>}

        <FileInput label="Insurance" file={form.insurancePreview} onPress={() => pickFile("insurance")} />
        {errors.insurance && <Text style={styles.error}>{errors.insurance}</Text>}

        <FileInput label="Permit" file={form.permitPreview} onPress={() => pickFile("permit")} />
        {errors.permit && <Text style={styles.error}>{errors.permit}</Text>}

        {/* <Input label="Insurance Expiry" value={form.insuence_expiry} onChange={(v) => set("insuence_expiry", v)} error={errors.insuence_expiry} /> */}
        <TouchableOpacity onPress={() => setShowPicker("insuence_expiry")}>
  <Text style={styles.label}>Insurance Expiry</Text>
  <View style={styles.input}>
    <Text>{form.insuence_expiry || "Select Date"}</Text>
  </View>
</TouchableOpacity>
{errors.insuence_expiry && <Text style={styles.error}>{errors.insuence_expiry}</Text>}
       <TouchableOpacity onPress={() => setShowPicker("fitness_expiry")}>
  <Text style={styles.label}>Fitness Expiry</Text>
  <View style={styles.input}>
    <Text>{form.fitness_expiry || "Select Date"}</Text>
  </View>
</TouchableOpacity>
{errors.fitness_expiry && (
  <Text style={styles.error}>{errors.fitness_expiry}</Text>
)}
<TouchableOpacity onPress={() => setShowPicker("permit_expiry")}>
  <Text style={styles.label}>Permit Expiry</Text>
  <View style={styles.input}>
    <Text>{form.permit_expiry || "Select Date"}</Text>
  </View>
</TouchableOpacity>
{errors.permit_expiry && (
  <Text style={styles.error}>{errors.permit_expiry}</Text>
)}

        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit</Text>}
        </TouchableOpacity>
        {showPicker && (
  <DateTimePicker
    value={new Date()}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowPicker(null);

      if (selectedDate) {
        const formatted = formatDate(selectedDate);
        set(showPicker, formatted);
      }
    }}
  />
)}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

// ✅ FIXED INPUT (TYPED)
const Input: React.FC<InputProps> = ({ label, value, onChange, error }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} style={styles.input} />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const FileInput = ({ label, file, onPress }: any) => {
  const isPdf =
    file === "PDF" || // from base64 detection
    file?.includes("application/pdf") || // from picker
    file?.toLowerCase().includes(".pdf"); // fallback

  return (
    <TouchableOpacity style={styles.fileBox} onPress={onPress}>
      {!file && <Text>Upload {label}</Text>}

      {file && isPdf && (
        <Text style={{ color: "#0F766E", fontWeight: "600" }}>
          PDF Uploaded
        </Text>
      )}

      {file && !isPdf && (
        <Image source={{ uri: file }} style={styles.preview} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F1F5F9", padding: 16},
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  input: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12 },
  button: { backgroundColor: "#0F766E", padding: 16, borderRadius: 14, alignItems: "center", marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "600" },
  fileBox: { borderWidth: 1, borderStyle: "dashed", padding: 20, marginBottom: 10, alignItems: "center", borderRadius: 10 },
  preview: { width: 80, height: 80 },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  option: { padding: 10, borderWidth: 1, borderRadius: 8 },
  optionActive: { backgroundColor: "#0F766E" },
  error: { color: "red", fontSize: 12 },
});