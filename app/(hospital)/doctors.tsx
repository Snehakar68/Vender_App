import React, { useState, useEffect } from "react";
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
import { useBase64ImageUri } from "@/hooks/use-base64-image-uri";
import { router } from "expo-router";
import api from "@/src/core/api/apiClient";
import {
  Colors,
  Spacing,
  Radius,
  Shadow,
  FontFamily,
  FontSize,
} from "@/src/shared/constants/theme";

const STORAGE_KEY = "hospital_added_doctors";

// ── Types ─────────────────────────────────────────────────────────────────────

type Doctor = {
  vendor_id?: string;
  doctor_id?: string;
  full_Name?: string;
  full_name?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  specialization?: string;
  qualification?: string;
  degree?: number | string;
  dep_id?: number | string;
  designation?: number | string;
  is_approved?: string;
  doctorDocs?: { photo?: string }[];
};

type MasterItem = { id: number | string; name: string };

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DoctorsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [allDoctorsFromAPI, setAllDoctorsFromAPI] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // Master data
  const [degreeList, setDegreeList] = useState<MasterItem[]>([]);
  const [departmentList, setDepartmentList] = useState<MasterItem[]>([]);
  const [designationList, setDesignationList] = useState<MasterItem[]>([]);

  useEffect(() => {
    loadPersistedDoctors();
    loadMasterData();
  }, []);
  const loadPersistedDoctors = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setDoctors(JSON.parse(stored));
    } catch {
      // ignore
    }
  };

  const persistDoctors = async (list: Doctor[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const loadMasterData = async () => {
    try {
      const [degRes, depRes, desRes] = await Promise.all([
        api.get("/api/Doctor/GetDegree"),
        api.get("/api/Doctor/GetDeprt_Doc"),
        api.get("/api/Doctor/Get_Doctor_Designation"),
      ]);
      console.log("Degree response:", degRes.data);
      console.log("Department response:", depRes.data);
      console.log("Designation response:", desRes.data);

      const toItems = (data: any[]): MasterItem[] =>
        data.map((item) => ({
          id:
            item.degree_id ??
            item.dep_id ??
            item.designation_id ??
            item.id ??
            item.Id,
          name:
            item.degree_Name ??
            item.dep_Name ??
            item.desig_name ??
            item.name ??
            item.Name ??
            "",
        }));
      setDegreeList(toItems(degRes.data || []));
      setDepartmentList(toItems(depRes.data || []));
      setDesignationList(toItems(desRes.data || []));
    } catch {
      // Master data fetch failed silently
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const findName = (list: MasterItem[], id: number | string | undefined) => {
    if (id === undefined || id === null || id === "") return "—";
    const match = list.find((item) => String(item.id) === String(id));
    return match?.name || "—";
  };

  const getDegreeName = (id: number | string | undefined) =>
    findName(degreeList, id);
  console.log("Degree list:", degreeList);
  const getDepartmentName = (id: number | string | undefined) =>
    findName(departmentList, id);
  console.log("Department list:", departmentList);
  const getDesignationName = (id: number | string | undefined) =>
    findName(designationList, id);

  // ── Modal ─────────────────────────────────────────────────────────────────────

  const loadModalDoctors = async () => {
    try {
      setModalLoading(true);
      const res = await api.get("/api/Doctor/GetDoctorListForAdmin");
      console.log("Doctors for modal response:", res.data);
      setAllDoctorsFromAPI(res.data?.doctors || res.data || []);
    } catch {
      setAllDoctorsFromAPI([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setSelectedDoctor(null);
    setShowDropdown(false);
    loadModalDoctors();
  };

  const handleAddDoctor = () => {
    if (!selectedDoctor) return;
    const id = getDoctorId(selectedDoctor);
    const exists = doctors.some((d) => getDoctorId(d) === id);
    if (!exists) {
      const updated = [selectedDoctor, ...doctors];
      setDoctors(updated);
      persistDoctors(updated);
    }
    setModalOpen(false);
    setSelectedDoctor(null);
    setShowDropdown(false);
  };

  const handleDeleteDoctor = (id: string) => {
    const updated = doctors.filter((d) => getDoctorId(d) !== id);
    setDoctors(updated);
    persistDoctors(updated);
  };

  // ── Utilities ─────────────────────────────────────────────────────────────────

  const getDoctorId = (d: Doctor) => String(d.vendor_id || d.doctor_id || "");
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  const getDoctorLabel = (d: Doctor) =>
    `${d.full_Name || d.full_name || ""}, ${d.city || ""}, ${d.state || ""}, ${d.pin_code || ""}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Doctors Directory</Text>
          <Text
            style={styles.headerSub}
          >{`${doctors.length} medical staff profiles`}</Text>
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

      <FlatList
        data={doctors}
        keyExtractor={(item, i) => getDoctorId(item) || String(i)}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            getDegreeName={getDegreeName}
            getDepartmentName={getDepartmentName}
            getDesignationName={getDesignationName}
            onView={() =>
              router.push({
                pathname: "/(hospital)/doctor-details/[id]",
                params: { id: getDoctorId(item) },
              })
            }
            onDelete={() => handleDeleteDoctor(getDoctorId(item))}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="person-search"
              size={48}
              color={Colors.light.outlineVariant}
            />
            <Text style={styles.emptyText}>No doctors added yet</Text>
            <Text style={styles.emptyHint}>
              Tap "+ Add New" to add a doctor
            </Text>
          </View>
        }
      />

      {/* Add Doctor Modal */}
      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBadge}>
                <MaterialIcons
                  name="person-add"
                  size={22}
                  color={Colors.light.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add Doctor</Text>
                <Text style={styles.modalSub}>Select from the directory</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <MaterialIcons
                  name="close"
                  size={22}
                  color={Colors.light.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {/* Label */}
            <Text style={styles.fieldLabel}>
              Search Directory <Text style={styles.required}>*</Text>
            </Text>

            {/* Dropdown trigger */}
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.selectText,
                  !selectedDoctor && styles.placeholder,
                ]}
                numberOfLines={1}
              >
                {selectedDoctor
                  ? getDoctorLabel(selectedDoctor)
                  : "Select a doctor..."}
              </Text>
              {modalLoading ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <MaterialIcons
                  name={
                    showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={20}
                  color={Colors.light.onSurfaceVariant}
                />
              )}
            </TouchableOpacity>

            {/* Options list */}
            {showDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {allDoctorsFromAPI.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>
                      No doctors available
                    </Text>
                  ) : (
                    allDoctorsFromAPI.map((d, i) => {
                      const label = getDoctorLabel(d);
                      return (
                        <TouchableOpacity
                          key={getDoctorId(d) || String(i)}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedDoctor(d);
                            setShowDropdown(false);
                          }}
                        >
                          <View style={styles.dropdownAvatar}>
                            <Text style={styles.dropdownAvatarText}>
                              {getInitials(d.full_Name || d.full_name || "?")}
                            </Text>
                          </View>
                          <Text
                            style={styles.dropdownItemText}
                            numberOfLines={1}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalOpen(false);
                  setSelectedDoctor(null);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addBtnModal,
                  !selectedDoctor && styles.addBtnDisabled,
                ]}
                onPress={handleAddDoctor}
                disabled={!selectedDoctor}
              >
                <Text style={styles.addBtnModalText}>Add Doctor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── DoctorCard ────────────────────────────────────────────────────────────────

function DoctorCard({
  doctor,
  getDegreeName,
  getDepartmentName,
  getDesignationName,
  onView,
  onDelete,
}: {
  doctor: Doctor;
  getDegreeName: (id: number | string | undefined) => string;
  getDepartmentName: (id: number | string | undefined) => string;
  getDesignationName: (id: number | string | undefined) => string;
  onView: () => void;
  onDelete: () => void;
}) {
  const name = doctor.full_Name || doctor.full_name || "Unknown";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const photoUri = useBase64ImageUri(doctor.doctorDocs?.[0]?.photo);
  const isApproved = doctor.is_approved === "Y";

  const degName = getDegreeName(doctor.degree);
  const depName = getDepartmentName(doctor.dep_id);
  const desName = getDesignationName(doctor.designation);

  // Build readable specialty line: prefer mapped values, fallback to raw strings
  const specialty =
    doctor.specialization ||
    [desName !== "—" ? desName : null, depName !== "—" ? depName : null]
      .filter(Boolean)
      .join(" · ") ||
    doctor.qualification ||
    "—";

  const credential = degName !== "—" ? degName : doctor.qualification || "—";

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {photoUri ? (
            <Image
              source={photoUri}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty} numberOfLines={1}>
            {specialty}
          </Text>
          <Text style={styles.credential} numberOfLines={1}>
            {credential}
          </Text>
          <Text style={styles.location}>
            {[doctor.city, doctor.state].filter(Boolean).join(", ") || "—"}
          </Text>
        </View>

        {/* Status + actions */}
        <View style={styles.rightCol}>
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
          <View style={styles.iconBtns}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={Colors.light.tertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={onDelete}
            >
              <MaterialIcons
                name="delete"
                size={20}
                color={Colors.light.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.profileBtn}
        onPress={onView}
        activeOpacity={0.8}
      >
        <Text style={styles.profileBtnText}>View Profile</Text>
      </TouchableOpacity>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    flexShrink: 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 50, height: 50 },
  avatarText: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.primary,
  },

  // Info
  info: { flex: 1, gap: 2 },
  name: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
  },
  specialty: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },
  credential: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelMedium,
    color: Colors.light.secondary,
  },
  location: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },

  // Right col
  rightCol: { alignItems: "flex-end", gap: Spacing.xs, flexShrink: 0 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activeBadge: { backgroundColor: Colors.light.tertiaryFixed + "80" },
  pendingBadge: { backgroundColor: Colors.light.errorContainer },
  statusText: {
    fontFamily: FontFamily.label,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  activeText: { color: Colors.light.tertiary },
  pendingText: { color: Colors.light.error },
  iconBtns: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },

  // View Profile button
  profileBtn: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radius.lg,
    paddingVertical: 9,
    alignItems: "center",
  },
  profileBtnText: {
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
});
