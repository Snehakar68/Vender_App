// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   ActivityIndicator,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import { router } from 'expo-router';
// import api from '@/src/core/api/apiClient';
// import { Colors, Spacing, Radius, Shadow, FontFamily, FontSize } from '@/src/shared/constants/theme';

// const STORAGE_KEY = 'hospital_added_nurses';

// // ── Types ─────────────────────────────────────────────────────────────────────

// type Nurse = {
//   vendor_id?: string;
//   nurse_id?: string;
//   full_Name?: string;
//   full_name?: string;
//   city?: string;
//   state?: string;
//   pin_code?: string;
//   dep_id?: number | string;
//   qualification?: string | number;
//   specialization?: string;
//   is_approved?: string;
//   nurseIMG?: { photo?: string }[];
// };

// type MasterItem = { id: number | string; name: string };

// // ── Screen ────────────────────────────────────────────────────────────────────

// export default function NursesScreen() {
//   const [nurses, setNurses] = useState<Nurse[]>([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [allNursesFromAPI, setAllNursesFromAPI] = useState<Nurse[]>([]);
//   const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [modalLoading, setModalLoading] = useState(false);

//   // Master data
//   const [nurseDepartmentList, setNurseDepartmentList] = useState<MasterItem[]>([]);

//   useEffect(() => {
//     loadPersistedNurses();
//     loadMasterData();
//   }, []);

//   const loadPersistedNurses = async () => {
//     try {
//       const stored = await AsyncStorage.getItem(STORAGE_KEY);
//       if (stored) setNurses(JSON.parse(stored));
//     } catch {
//       // ignore
//     }
//   };

//   const persistNurses = async (list: Nurse[]) => {
//     try {
//       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
//     } catch {
//       // ignore
//     }
//   };

//   const loadMasterData = async () => {
//     try {
//       const res = await api.get('/api/Nurse/GetNurseDepartments');
//       console.log('Nurse departments response:', res.data);
//       const data: any[] = res.data || [];
//       setNurseDepartmentList(
//         data.map((item) => ({
//           id: item.dep_id ?? item.id ?? item.Id,
//           name: item.depName ?? item.name ?? item.Name ?? '',
//         }))
//       );
//     } catch {
//       // ignore
//     }
//   };

//   // ── Helper ───────────────────────────────────────────────────────────────────

//   const getNurseDepartmentName = (id: number | string | undefined): string => {
//     if (id === undefined || id === null || id === '') return '—';
//     const match = nurseDepartmentList.find((item) => String(item.id) === String(id));
//     return match?.name || '—';
//   };

//   // ── Modal ─────────────────────────────────────────────────────────────────────

//   const loadModalNurses = async () => {
//     try {
//       setModalLoading(true);
//       const res = await api.get('/api/Nurse/GetNurseListForAdmin');
//       console.log('Nurses for modal response:', res.data);
//       setAllNursesFromAPI(res.data?.nurses || res.data || []);
//     } catch {
//       setAllNursesFromAPI([]);
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const handleOpenModal = () => {
//     setModalOpen(true);
//     setSelectedNurse(null);
//     setShowDropdown(false);
//     loadModalNurses();
//   };

//   const handleAddNurse = () => {
//     if (!selectedNurse) return;
//     const id = getNurseId(selectedNurse);
//     const exists = nurses.some((n) => getNurseId(n) === id);
//     if (!exists) {
//       const updated = [selectedNurse, ...nurses];
//       setNurses(updated);
//       persistNurses(updated);
//     }
//     setModalOpen(false);
//     setSelectedNurse(null);
//     setShowDropdown(false);
//   };

//   const handleDeleteNurse = (id: string) => {
//     const updated = nurses.filter((n) => getNurseId(n) !== id);
//     setNurses(updated);
//     persistNurses(updated);
//   };

//   // ── Utilities ─────────────────────────────────────────────────────────────────

//   const getNurseId = (n: Nurse) => String(n.vendor_id || n.nurse_id || '');
//   const getInitials = (name: string) =>
//     name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
//   const getNurseLabel = (n: Nurse) =>
//     `${n.full_Name || n.full_name || ''}, ${n.city || ''}, ${n.state || ''}, ${n.pin_code || ''}`;

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top']}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.headerTitle}>Registered Nurses</Text>
//           <Text style={styles.headerSub}>{`${nurses.length} healthcare professionals`}</Text>
//         </View>
//         <TouchableOpacity style={styles.addBtn} onPress={handleOpenModal} activeOpacity={0.8}>
//           <MaterialIcons name="add" size={18} color={Colors.light.primary} />
//           <Text style={styles.addBtnText}>Add New</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={nurses}
//         keyExtractor={(item, i) => getNurseId(item) || String(i)}
//         renderItem={({ item }) => (
//           <NurseCard
//             nurse={item}
//             getNurseDepartmentName={getNurseDepartmentName}
//             onView={() =>
//               router.push({
//                 pathname: '/(hospital)/nurse-details/[id]',
//                 params: { id: getNurseId(item) },
//               })
//             }
//             onDelete={() => handleDeleteNurse(getNurseId(item))}
//           />
//         )}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <MaterialIcons name="health-and-safety" size={48} color={Colors.light.outlineVariant} />
//             <Text style={styles.emptyText}>No nurses added yet</Text>
//             <Text style={styles.emptyHint}>Tap "+ Add New" to add a nurse</Text>
//           </View>
//         }
//       />

//       {/* Add Nurse Modal */}
//       <Modal visible={modalOpen} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             {/* Modal Header */}
//             <View style={styles.modalHeader}>
//               <View style={styles.modalIconBadge}>
//                 <MaterialIcons name="person-add" size={22} color={Colors.light.primary} />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.modalTitle}>Add Nurse</Text>
//                 <Text style={styles.modalSub}>Select a nursing professional</Text>
//               </View>
//               <TouchableOpacity onPress={() => setModalOpen(false)}>
//                 <MaterialIcons name="close" size={22} color={Colors.light.onSurfaceVariant} />
//               </TouchableOpacity>
//             </View>

//             {/* Label */}
//             <Text style={styles.fieldLabel}>
//               Nursing Professional <Text style={styles.required}>*</Text>
//             </Text>

//             {/* Dropdown trigger */}
//             <TouchableOpacity
//               style={styles.selectBox}
//               onPress={() => setShowDropdown(!showDropdown)}
//               activeOpacity={0.8}
//             >
//               <Text style={[styles.selectText, !selectedNurse && styles.placeholder]} numberOfLines={1}>
//                 {selectedNurse ? getNurseLabel(selectedNurse) : 'Select a nurse...'}
//               </Text>
//               {modalLoading ? (
//                 <ActivityIndicator size="small" color={Colors.light.primary} />
//               ) : (
//                 <MaterialIcons
//                   name={showDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
//                   size={20}
//                   color={Colors.light.onSurfaceVariant}
//                 />
//               )}
//             </TouchableOpacity>

//             {/* Options list */}
//             {showDropdown && (
//               <View style={styles.dropdownList}>
//                 <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
//                   {allNursesFromAPI.length === 0 ? (
//                     <Text style={styles.dropdownEmpty}>No nurses available</Text>
//                   ) : (
//                     allNursesFromAPI.map((n, i) => (
//                       <TouchableOpacity
//                         key={getNurseId(n) || String(i)}
//                         style={styles.dropdownItem}
//                         onPress={() => {
//                           setSelectedNurse(n);
//                           setShowDropdown(false);
//                         }}
//                       >
//                         <View style={styles.dropdownAvatar}>
//                           <Text style={styles.dropdownAvatarText}>
//                             {getInitials(n.full_Name || n.full_name || '?')}
//                           </Text>
//                         </View>
//                         <Text style={styles.dropdownItemText} numberOfLines={1}>
//                           {getNurseLabel(n)}
//                         </Text>
//                       </TouchableOpacity>
//                     ))
//                   )}
//                 </ScrollView>
//               </View>
//             )}

//             {/* Info note */}
//             <View style={styles.infoBox}>
//               <MaterialIcons name="info-outline" size={16} color={Colors.light.tertiary} />
//               <Text style={styles.infoText}>
//                 The selected nurse will be notified about this assignment.
//               </Text>
//             </View>

//             {/* Buttons */}
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => {
//                   setModalOpen(false);
//                   setSelectedNurse(null);
//                   setShowDropdown(false);
//                 }}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.addBtnModal, !selectedNurse && styles.addBtnDisabled]}
//                 onPress={handleAddNurse}
//                 disabled={!selectedNurse}
//               >
//                 <Text style={styles.addBtnModalText}>Add Nurse</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ── NurseCard ─────────────────────────────────────────────────────────────────

// function NurseCard({
//   nurse,
//   getNurseDepartmentName,
//   onView,
//   onDelete,
// }: {
//   nurse: Nurse;
//   getNurseDepartmentName: (id: number | string | undefined) => string;
//   onView: () => void;
//   onDelete: () => void;
// }) {
//   const name = nurse.full_Name || nurse.full_name || 'Unknown';
//   const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
//   const photo = nurse.nurseIMG?.[0]?.photo;
//   const isApproved = nurse.is_approved === 'Y';

//   const depName = getNurseDepartmentName(nurse.dep_id);
//   const department = nurse.specialization || (depName !== '—' ? depName : '—');

//   return (
//     <View style={styles.card}>
//       <View style={styles.cardTop}>
//         {/* Avatar with online dot */}
//         <View style={styles.avatarWrapper}>
//           {photo ? (
//             <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.avatarImage} />
//           ) : (
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>{initials}</Text>
//             </View>
//           )}
//           {isApproved && <View style={styles.onlineDot} />}
//         </View>

//         {/* Info */}
//         <View style={styles.info}>
//           <Text style={styles.name}>{name}</Text>
//           <Text style={styles.department} numberOfLines={1}>{department}</Text>
//           <Text style={styles.credentials}>
//             {[nurse.city, nurse.state].filter(Boolean).join(', ') || '—'}
//           </Text>
//         </View>

//         {/* Status + actions */}
//         <View style={styles.rightCol}>
//           <View style={[styles.statusBadge, isApproved ? styles.activeBadge : styles.pendingBadge]}>
//             <Text style={[styles.statusText, isApproved ? styles.activeText : styles.pendingText]}>
//               {isApproved ? 'ACTIVE' : 'PENDING'}
//             </Text>
//           </View>
//           <View style={styles.iconBtns}>
//             <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
//               <MaterialIcons name="check-circle" size={20} color={Colors.light.tertiary} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onDelete}>
//               <MaterialIcons name="delete" size={20} color={Colors.light.error} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       <TouchableOpacity style={styles.viewBtn} onPress={onView} activeOpacity={0.8}>
//         <Text style={styles.viewBtnText}>View Profile</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: Colors.light.surface },

//   // Header
//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
//   },
//   headerTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.headlineSmall, color: Colors.light.onSurface },
//   headerSub: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant, marginTop: 2 },
//   addBtn: {
//     flexDirection: 'row', alignItems: 'center', gap: 4,
//     borderWidth: 1.5, borderColor: Colors.light.primary, borderRadius: Radius.full,
//     paddingHorizontal: Spacing.sm + 2, paddingVertical: 7,
//   },
//   addBtnText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge, color: Colors.light.primary },

//   // List
//   listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
//   emptyContainer: { alignItems: 'center', paddingTop: Spacing.xl * 2, gap: Spacing.xs },
//   emptyText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface },
//   emptyHint: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant },

//   // Card
//   card: {
//     backgroundColor: Colors.light.surfaceContainerLowest, borderRadius: Radius.lg,
//     padding: Spacing.sm + 4, gap: Spacing.sm, ...Shadow.card,
//   },
//   cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },

//   // Avatar
//   avatarWrapper: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', flexShrink: 0 },
//   avatar: {
//     width: 50, height: 50, borderRadius: 25,
//     backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center',
//   },
//   avatarImage: { width: 50, height: 50 },
//   avatarText: { fontFamily: FontFamily.headline, fontSize: FontSize.titleSmall, color: Colors.light.primary },
//   onlineDot: {
//     position: 'absolute', bottom: 1, right: 1,
//     width: 12, height: 12, borderRadius: 6,
//     backgroundColor: Colors.light.tertiary,
//     borderWidth: 2, borderColor: Colors.light.surfaceContainerLowest,
//   },

//   // Info
//   info: { flex: 1, gap: 2 },
//   name: { fontFamily: FontFamily.headlineMedium, fontSize: FontSize.titleSmall, color: Colors.light.onSurface },
//   department: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge, color: Colors.light.secondary },
//   credentials: { fontFamily: FontFamily.body, fontSize: FontSize.labelSmall, color: Colors.light.onSurfaceVariant },

//   // Right col
//   rightCol: { alignItems: 'flex-end', gap: Spacing.xs, flexShrink: 0 },
//   statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
//   activeBadge: { backgroundColor: Colors.light.tertiaryFixed + '80' },
//   pendingBadge: { backgroundColor: Colors.light.errorContainer },
//   statusText: { fontFamily: FontFamily.label, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase' },
//   activeText: { color: Colors.light.tertiary },
//   pendingText: { color: Colors.light.error },
//   iconBtns: { flexDirection: 'row', gap: 4 },
//   iconBtn: {
//     width: 32, height: 32, borderRadius: Radius.md,
//     backgroundColor: Colors.light.surfaceContainerLow, alignItems: 'center', justifyContent: 'center',
//   },

//   // View button
//   viewBtn: {
//     borderWidth: 1.5, borderColor: Colors.light.primary,
//     borderRadius: Radius.lg, paddingVertical: 9, alignItems: 'center',
//   },
//   viewBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.labelLarge, color: Colors.light.primary },

//   // Modal
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
//   modalContainer: {
//     width: '90%', backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md, ...Shadow.elevated,
//   },
//   modalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
//   modalIconBadge: {
//     width: 44, height: 44, borderRadius: Radius.lg,
//     backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center',
//   },
//   modalTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.titleLarge, color: Colors.light.onSurface },
//   modalSub: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant },
//   fieldLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface },
//   required: { color: Colors.light.error },
//   selectBox: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     borderWidth: 1.5, borderColor: Colors.light.outlineVariant, borderRadius: Radius.lg,
//     paddingHorizontal: Spacing.md, paddingVertical: 14,
//     backgroundColor: Colors.light.surfaceContainerLow,
//   },
//   selectText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface, flex: 1 },
//   placeholder: { color: Colors.light.onSurfaceVariant },
//   dropdownList: {
//     borderWidth: 1, borderColor: Colors.light.outlineVariant,
//     borderRadius: Radius.lg, overflow: 'hidden',
//     backgroundColor: Colors.light.surface, ...Shadow.subtle,
//   },
//   dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm + 2 },
//   dropdownAvatar: {
//     width: 32, height: 32, borderRadius: 16,
//     backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center',
//   },
//   dropdownAvatarText: { fontFamily: FontFamily.headline, fontSize: 11, color: Colors.light.primary },
//   dropdownItemText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface, flex: 1 },
//   dropdownEmpty: { padding: Spacing.md, fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurfaceVariant },
//   infoBox: {
//     flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs,
//     backgroundColor: Colors.light.tertiaryFixed + '30',
//     borderRadius: Radius.lg, padding: Spacing.sm + 2,
//   },
//   infoText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurface },
//   modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
//   cancelBtn: {
//     flex: 1, paddingVertical: 13, borderRadius: Radius.lg,
//     borderWidth: 1.5, borderColor: Colors.light.outlineVariant,
//     alignItems: 'center', backgroundColor: Colors.light.surfaceContainerLow,
//   },
//   cancelText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge, color: Colors.light.onSurfaceVariant },
//   addBtnModal: {
//     flex: 1, paddingVertical: 13, borderRadius: Radius.lg,
//     backgroundColor: Colors.light.primary, alignItems: 'center', ...Shadow.subtle,
//   },
//   addBtnDisabled: { opacity: 0.5 },
//   addBtnModalText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.labelLarge, color: Colors.light.onPrimary },
// });
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Colors,
  Spacing,
  Radius,
  Shadow,
  FontFamily,
  FontSize,
} from "@/src/shared/constants/theme";
import { AuthContext } from "@/src/core/context/AuthContext";

const API = "https://coreapi-service-111763741518.asia-south1.run.app";

// ── Types ─────────────────────────────────────────────────────────────────────

type Nurse = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  department: number | string;
  qualification: number | string;
  city: string;
  state: string;
  pin_code: string;
  is_approved: string;
  linked_by?: string;
  photo?: string;
};

type MasterItem = { id: number | string; name: string };
type NurseRaw = Record<string, any>;

// ── Normalize ─────────────────────────────────────────────────────────────────

const normalizeNurse = (n: NurseRaw): Nurse => ({
  id: String(n.nurse_id || n.vendor_id || ""),
  name: n.full_Name || n.full_name || "Unknown",
  email: n.email || "",
  mobile: n.mobile || "",
  department: n.dep_id,
  qualification: n.qualification,
  city: n.city || "",
  state: n.state || "",
  pin_code: n.pin_code || "",
  is_approved: n.is_approved || "N",
  photo: n.nurseIMG?.[0]?.photo || n.photo || "",
});

const DEGREE_MAP: Record<number, string> = {
  1: "ANM",
  2: "GNM",
  3: "BSC Nursing",
};

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NursesScreen() {
  // const [vendorId, setVendorId] = useState<string | null>(null);
  const [nurseList, setNurseList] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [allNurses, setAllNurses] = useState<Nurse[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Nurse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Approve
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Master data
  const [departments, setDepartments] = useState<MasterItem[]>([]);

  // ── Init ───────────────────────────────────────────────────────────────────

  // useEffect(() => {
  //   AsyncStorage.getItem("vendorId").then(id => console.log("vendorId:", id));
  //   AsyncStorage.getItem("vendorId").then((id) => setVendorId(id));
  // }, []);
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;
  console.log("Vendor ID from context:", vendorId);
  useEffect(() => {
    if (!vendorId) return;
    loadLinkedNurses();
    fetchDepartments();
  }, [vendorId]);

  // ── Master Data ───────────────────────────────────────────────────────────

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API}/api/Nurse/GetNurseDepartments`);
      const data = await res.json();
      setDepartments(
        (data || []).map((d: any) => ({
          id: d.dep_id ?? d.id,
          name: d.depName || d.name || "",
        })),
      );
    } catch {}
  };

  const getDepartmentName = (id: number | string | undefined) => {
    if (!id) return "—";
    return departments.find((d) => String(d.id) === String(id))?.name || "—";
  };

  const getDegreeName = (id: number | string | undefined) => {
    if (!id) return "—";
    return DEGREE_MAP[Number(id)] || "—";
  };

  // ── Load Linked Nurses ────────────────────────────────────────────────────

  const loadLinkedNurses = useCallback(async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      const mapRes = await fetch(
        `${API}/api/Hospital/Get_Hospital_Nurse_ById/${vendorId}`,
      );
      const mappings = await mapRes.json();
      console.log("Mappings from API Nurse:", mappings);

      if (!Array.isArray(mappings) || !mappings.length) {
        setNurseList([]);
        return;
      }

      const results = await Promise.all(
        mappings.map(async (m: any) => {
          try {
            const res = await fetch(
              `${API}/api/Nurse/GetNurseById/${m.nurse_id}`,
            );
            const r = await res.json();
            if (r?.error || r?.message) return null;
            const nurse = normalizeNurse(r);
            nurse.is_approved = m.is_approved;
            nurse.linked_by = m.linked_by;
            return nurse;
          } catch {
            return null;
          }
        }),
      );
      console.log("Final nurse list:", results);
      const unique = (results.filter(Boolean) as Nurse[]).filter(
        (nurse, index, self) =>
          self.findIndex((n) => n.id === nurse.id) === index,
      );
      setNurseList(unique);
    } catch (err) {
      console.error("Nurse load failed", err);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  // ── Modal Nurses ──────────────────────────────────────────────────────────

  const loadAvailableNurses = async () => {
    try {
      setModalLoading(true);
      const res = await fetch(`${API}/api/Nurse/GetNurseListForAdmin`);
      const list = await res.json();
      const linkedIds = nurseList.map((n) => n.id);
      const filtered = (list?.nurses || list || [])
        .map(normalizeNurse)
        .filter((n: Nurse) => !linkedIds.includes(n.id));
      setAllNurses(filtered);
    } catch {
      setAllNurses([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setSelectedNurse(null);
    setShowDropdown(false);
    setAddSuccess(false);
    setAddError("");
    loadAvailableNurses();
  };

  // ── Add Nurse ─────────────────────────────────────────────────────────────

  const handleAddNurse = async () => {
    if (!selectedNurse || !vendorId) return;
    try {
      const res = await fetch(`${API}/api/Hospital/add_Hospital_Nurse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: vendorId,
          nurse_id: selectedNurse.id,
          is_approved: "N",
          linked_by: "H",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setAddError(err.message || "Failed to add nurse");
        return;
      }

      setAddSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setAddSuccess(false);
        setSelectedNurse(null);
        loadLinkedNurses();
      }, 2000);
    } catch {
      setAddError("Failed to add nurse");
    }
  };

  // ── Approve Nurse ─────────────────────────────────────────────────────────

  const handleApproveNurse = async (nurseId: string) => {
    if (approvingId || !vendorId) return;
    try {
      setApprovingId(nurseId);
      const res = await fetch(
        `${API}/api/Hospital/Approve_Hospital_Nurse/${vendorId}/${nurseId}`,
        { method: "GET", headers: { accept: "*/*" } },
      );
      const result = await res.json();
      if (!result.status) return;
      setNurseList((prev) =>
        prev.map((n) => (n.id === nurseId ? { ...n, is_approved: "Y" } : n)),
      );
    } catch {
    } finally {
      setApprovingId(null);
    }
  };

  // ── Delete Nurse ──────────────────────────────────────────────────────────

  const handleDeleteNurse = async () => {
    if (!deleteTarget || !vendorId) return;
    try {
      setDeleting(true);
      const res = await fetch(
        `${API}/api/Nurse/Delete_Nurse_Linking?vendor_id=${deleteTarget.id}&hosp_Id=${vendorId}`,
        { method: "DELETE", headers: { accept: "*/*" } },
      );
      if (!res.ok) throw new Error("Delete failed");
      setDeleteTarget(null);
      loadLinkedNurses();
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Registered Nurses</Text>
          <Text style={styles.headerSub}>
            {loading
              ? "Loading..."
              : `${nurseList.length} healthcare professional${nurseList.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleOpenModal}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={18} color={Colors.light.primary} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading nurses...</Text>
        </View>
      ) : (
        <FlatList
          data={nurseList}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({ item }) => (
            <NurseCard
              nurse={item}
              getDepartmentName={getDepartmentName}
              getDegreeName={getDegreeName}
              approvingId={approvingId}
              onApprove={() => handleApproveNurse(item.id)}
              onView={() =>
                router.push({
                  pathname: "/(hospital)/nurse-details/[id]",
                  params: { id: item.id },
                })
              }
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="health-and-safety"
                size={48}
                color={Colors.light.outlineVariant}
              />
              <Text style={styles.emptyText}>No nurses linked yet</Text>
              <Text style={styles.emptyHint}>
                Tap "+ Add New" to add a nurse
              </Text>
            </View>
          }
        />
      )}

      {/* ── Add Nurse Modal ── */}
      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBadge}>
                <MaterialIcons
                  name="person-add"
                  size={22}
                  color={Colors.light.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add Nurse</Text>
                <Text style={styles.modalSub}>
                  Select a nursing professional
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <MaterialIcons
                  name="close"
                  size={22}
                  color={Colors.light.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {addSuccess ? (
              <View style={styles.successBox}>
                <MaterialIcons name="check-circle" size={32} color="#16a34a" />
                <Text style={styles.successText}>
                  Nurse added successfully!
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>
                  Nursing Professional <Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => setShowDropdown(!showDropdown)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !selectedNurse && styles.placeholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedNurse
                      ? `${selectedNurse.name}, ${selectedNurse.city}, ${selectedNurse.state}`
                      : "Select a nurse..."}
                  </Text>
                  {modalLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.primary}
                    />
                  ) : (
                    <MaterialIcons
                      name={
                        showDropdown
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={20}
                      color={Colors.light.onSurfaceVariant}
                    />
                  )}
                </TouchableOpacity>

                {showDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      {allNurses.length === 0 ? (
                        <Text style={styles.dropdownEmpty}>
                          No nurses available
                        </Text>
                      ) : (
                        allNurses.map((n) => (
                          <TouchableOpacity
                            key={n.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedNurse(n);
                              setShowDropdown(false);
                            }}
                          >
                            <View style={styles.dropdownAvatar}>
                              <Text style={styles.dropdownAvatarText}>
                                {n.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((w: string) => w[0]?.toUpperCase() || "")
                                  .join("")}
                              </Text>
                            </View>
                            <Text
                              style={styles.dropdownItemText}
                              numberOfLines={1}
                            >
                              {`${n.name}, ${n.city}, ${n.state}, ${n.pin_code}`}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}

                {addError ? (
                  <Text style={styles.errorText}>{addError}</Text>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setModalOpen(false);
                      setSelectedNurse(null);
                      setShowDropdown(false);
                      setAddError("");
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addBtnModal,
                      !selectedNurse && styles.addBtnDisabled,
                    ]}
                    onPress={handleAddNurse}
                    disabled={!selectedNurse}
                  >
                    <Text style={styles.addBtnModalText}>Add Nurse</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.deleteConfirmText}>
              Are you sure you want to remove{" "}
              <Text style={{ fontWeight: "bold" }}>{deleteTarget?.name}</Text>?
              This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtnModal}
                onPress={handleDeleteNurse}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteBtnText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete Success Modal ── */}
      <Modal visible={deleteSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successBox}>
              <MaterialIcons name="check-circle" size={32} color="#16a34a" />
              <Text style={styles.successText}>
                Nurse deleted successfully.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── NurseCard ─────────────────────────────────────────────────────────────────

function NurseCard({
  nurse,
  getDepartmentName,
  getDegreeName,
  approvingId,
  onApprove,
  onView,
  onDelete,
}: {
  nurse: Nurse;
  getDepartmentName: (id: any) => string;
  getDegreeName: (id: any) => string;
  approvingId: string | null;
  onApprove: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  const isApproved = nurse.is_approved === "Y";
  const isApproving = approvingId === nurse.id;
  // Nurse web logic: approve only if linked_by === "N" (nurse linked themselves)
  const canApprove = nurse.linked_by === "N";

  const initials = nurse.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const depName = getDepartmentName(nurse.department);
  const degName = getDegreeName(nurse.qualification);

  const renderApproveButton = () => {
    if (isApproved) {
      return (
        <View style={styles.approvedBadge}>
          <Text style={styles.approvedBadgeText}>Approved</Text>
        </View>
      );
    }
    if (!canApprove) {
      return (
        <View style={[styles.actionChip, styles.disabledChip]}>
          <Text style={styles.disabledChipText}>Approve</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={[
          styles.actionChip,
          styles.approveChip,
          isApproving && styles.disabledChip,
        ]}
        onPress={onApprove}
        disabled={isApproving}
        activeOpacity={0.8}
      >
        {isApproving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.approveChipText}>Approve</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {nurse.photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${nurse.photo}` }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {isApproved && <View style={styles.onlineDot} />}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {nurse.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                isApproved ? styles.activeBadge : styles.pendingBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isApproved ? styles.activeText : styles.pendingText,
                ]}
              >
                {isApproved ? "ACTIVE" : "PENDING"}
              </Text>
            </View>
          </View>
          {depName !== "—" && (
            <Text style={styles.specialty} numberOfLines={1}>
              {depName}
            </Text>
          )}
          {degName !== "—" && (
            <Text style={styles.credential} numberOfLines={1}>
              {degName}
            </Text>
          )}
          <Text style={styles.location}>
            {[nurse.city, nurse.state].filter(Boolean).join(", ") || "—"}
          </Text>
        </View>
      </View>

      {/* Action row */}
      <View style={styles.actionsRow}>
        {/* Approve */}
        {renderApproveButton()}

        {/* Status indicator */}
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              isApproved ? styles.activeDot : styles.inactiveDot,
            ]}
          />
          <Text
            style={[
              styles.statusIndicatorText,
              isApproved
                ? styles.activeIndicatorText
                : styles.inactiveIndicatorText,
            ]}
          >
            {isApproved ? "Active" : "Inactive"}
          </Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="delete-outline"
            size={18}
            color={Colors.light.error}
          />
          <Text style={styles.deleteBtnLabel}>Delete</Text>
        </TouchableOpacity>

        {/* View Profile */}
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={onView}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBtnText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.onSurface,
  },
  headerSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
  },
  addBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  loadingText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
  },

  // List
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl * 2,
    gap: Spacing.xs,
  },
  emptyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  emptyHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
  },

  // Card
  card: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },

  // Avatar
  avatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
    flexShrink: 0,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 54, height: 54 },
  avatarText: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.light.tertiary,
    borderWidth: 2,
    borderColor: Colors.light.surfaceContainerLowest,
  },

  // Info
  info: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  name: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
    flex: 1,
  },
  specialty: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.secondary,
  },
  credential: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelMedium,
    color: Colors.light.onSurfaceVariant,
  },
  location: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },

  // Status badge (ACTIVE/PENDING pill)
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  activeBadge: { backgroundColor: Colors.light.tertiaryFixed + "80" },
  pendingBadge: { backgroundColor: Colors.light.errorContainer },
  statusText: { fontFamily: FontFamily.label, fontSize: 9, letterSpacing: 0.8 },
  activeText: { color: Colors.light.tertiary },
  pendingText: { color: Colors.light.error },

  // Actions row
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant + "50",
    paddingTop: Spacing.sm,
  },

  // Approve chip
  actionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },
  approveChip: { backgroundColor: Colors.light.primary },
  approvedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
    backgroundColor: "#dcfce7",
  },
  approvedBadgeText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyMedium,
    color: "#15803d",
  },
  disabledChip: { backgroundColor: "#d1d5db" },
  disabledChipText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyMedium,
    color: "#6b7280",
  },
  approveChipText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyMedium,
    color: "#fff",
  },

  // Status indicator (● Active / ● Inactive)
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  activeDot: { backgroundColor: Colors.light.tertiary },
  inactiveDot: { backgroundColor: Colors.light.error },
  statusIndicatorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
  },
  activeIndicatorText: { color: Colors.light.tertiary },
  inactiveIndicatorText: { color: Colors.light.error },

  // Delete
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 5,
  },
  deleteBtnLabel: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.light.error,
  },

  // View Profile
  viewBtn: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radius.lg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  viewBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.elevated,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  modalIconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },
  modalSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
  },
  fieldLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  required: { color: Colors.light.error },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: Colors.light.outlineVariant,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.light.surfaceContainerLow,
  },
  selectText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    flex: 1,
  },
  placeholder: { color: Colors.light.onSurfaceVariant },
  dropdownList: {
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.light.surface,
    ...Shadow.subtle,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
  },
  dropdownAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownAvatarText: {
    fontFamily: FontFamily.headline,
    fontSize: 11,
    color: Colors.light.primary,
  },
  dropdownItemText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    flex: 1,
  },
  dropdownEmpty: {
    padding: Spacing.md,
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.error,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.outlineVariant,
    alignItems: "center",
    backgroundColor: Colors.light.surfaceContainerLow,
  },
  cancelText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.onSurfaceVariant,
  },
  addBtnModal: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    ...Shadow.subtle,
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnModalText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: Colors.light.onPrimary,
  },

  // Delete modal
  deleteConfirmText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    lineHeight: 22,
  },
  deleteBtnModal: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.error,
    alignItems: "center",
  },
  deleteBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: "#fff",
  },

  // Success
  successBox: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  successText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: "#16a34a",
    textAlign: "center",
  },
});
