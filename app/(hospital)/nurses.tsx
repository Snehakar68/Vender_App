import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import api from '@/src/core/api/apiClient';
import { Colors, Spacing, Radius, Shadow, FontFamily, FontSize } from '@/src/shared/constants/theme';

const STORAGE_KEY = 'hospital_added_nurses';

// ── Types ─────────────────────────────────────────────────────────────────────

type Nurse = {
  vendor_id?: string;
  nurse_id?: string;
  full_Name?: string;
  full_name?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  dep_id?: number | string;
  qualification?: string | number;
  specialization?: string;
  is_approved?: string;
  nurseIMG?: { photo?: string }[];
};

type MasterItem = { id: number | string; name: string };

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NursesScreen() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [allNursesFromAPI, setAllNursesFromAPI] = useState<Nurse[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Master data
  const [nurseDepartmentList, setNurseDepartmentList] = useState<MasterItem[]>([]);

  useEffect(() => {
    loadPersistedNurses();
    loadMasterData();
  }, []);

  const loadPersistedNurses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setNurses(JSON.parse(stored));
    } catch {
      // ignore
    }
  };

  const persistNurses = async (list: Nurse[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const loadMasterData = async () => {
    try {
      const res = await api.get('/api/Nurse/GetNurseDepartments');
      console.log('Nurse departments response:', res.data);
      const data: any[] = res.data || [];
      setNurseDepartmentList(
        data.map((item) => ({
          id: item.dep_id ?? item.id ?? item.Id,
          name: item.depName ?? item.name ?? item.Name ?? '',
        }))
      );
    } catch {
      // ignore
    }
  };

  // ── Helper ───────────────────────────────────────────────────────────────────

  const getNurseDepartmentName = (id: number | string | undefined): string => {
    if (id === undefined || id === null || id === '') return '—';
    const match = nurseDepartmentList.find((item) => String(item.id) === String(id));
    return match?.name || '—';
  };

  // ── Modal ─────────────────────────────────────────────────────────────────────

  const loadModalNurses = async () => {
    try {
      setModalLoading(true);
      const res = await api.get('/api/Nurse/GetNurseListForAdmin');
      console.log('Nurses for modal response:', res.data);
      setAllNursesFromAPI(res.data?.nurses || res.data || []);
    } catch {
      setAllNursesFromAPI([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setSelectedNurse(null);
    setShowDropdown(false);
    loadModalNurses();
  };

  const handleAddNurse = () => {
    if (!selectedNurse) return;
    const id = getNurseId(selectedNurse);
    const exists = nurses.some((n) => getNurseId(n) === id);
    if (!exists) {
      const updated = [selectedNurse, ...nurses];
      setNurses(updated);
      persistNurses(updated);
    }
    setModalOpen(false);
    setSelectedNurse(null);
    setShowDropdown(false);
  };

  const handleDeleteNurse = (id: string) => {
    const updated = nurses.filter((n) => getNurseId(n) !== id);
    setNurses(updated);
    persistNurses(updated);
  };

  // ── Utilities ─────────────────────────────────────────────────────────────────

  const getNurseId = (n: Nurse) => String(n.vendor_id || n.nurse_id || '');
  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
  const getNurseLabel = (n: Nurse) =>
    `${n.full_Name || n.full_name || ''}, ${n.city || ''}, ${n.state || ''}, ${n.pin_code || ''}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Registered Nurses</Text>
          <Text style={styles.headerSub}>{`${nurses.length} healthcare professionals`}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenModal} activeOpacity={0.8}>
          <MaterialIcons name="add" size={18} color={Colors.light.primary} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={nurses}
        keyExtractor={(item, i) => getNurseId(item) || String(i)}
        renderItem={({ item }) => (
          <NurseCard
            nurse={item}
            getNurseDepartmentName={getNurseDepartmentName}
            onView={() =>
              router.push({
                pathname: '/(hospital)/nurse-details/[id]',
                params: { id: getNurseId(item) },
              })
            }
            onDelete={() => handleDeleteNurse(getNurseId(item))}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="health-and-safety" size={48} color={Colors.light.outlineVariant} />
            <Text style={styles.emptyText}>No nurses added yet</Text>
            <Text style={styles.emptyHint}>Tap "+ Add New" to add a nurse</Text>
          </View>
        }
      />

      {/* Add Nurse Modal */}
      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBadge}>
                <MaterialIcons name="person-add" size={22} color={Colors.light.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add Nurse</Text>
                <Text style={styles.modalSub}>Select a nursing professional</Text>
              </View>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <MaterialIcons name="close" size={22} color={Colors.light.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Label */}
            <Text style={styles.fieldLabel}>
              Nursing Professional <Text style={styles.required}>*</Text>
            </Text>

            {/* Dropdown trigger */}
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectText, !selectedNurse && styles.placeholder]} numberOfLines={1}>
                {selectedNurse ? getNurseLabel(selectedNurse) : 'Select a nurse...'}
              </Text>
              {modalLoading ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <MaterialIcons
                  name={showDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={Colors.light.onSurfaceVariant}
                />
              )}
            </TouchableOpacity>

            {/* Options list */}
            {showDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {allNursesFromAPI.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>No nurses available</Text>
                  ) : (
                    allNursesFromAPI.map((n, i) => (
                      <TouchableOpacity
                        key={getNurseId(n) || String(i)}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedNurse(n);
                          setShowDropdown(false);
                        }}
                      >
                        <View style={styles.dropdownAvatar}>
                          <Text style={styles.dropdownAvatarText}>
                            {getInitials(n.full_Name || n.full_name || '?')}
                          </Text>
                        </View>
                        <Text style={styles.dropdownItemText} numberOfLines={1}>
                          {getNurseLabel(n)}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            {/* Info note */}
            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={16} color={Colors.light.tertiary} />
              <Text style={styles.infoText}>
                The selected nurse will be notified about this assignment.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalOpen(false);
                  setSelectedNurse(null);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtnModal, !selectedNurse && styles.addBtnDisabled]}
                onPress={handleAddNurse}
                disabled={!selectedNurse}
              >
                <Text style={styles.addBtnModalText}>Add Nurse</Text>
              </TouchableOpacity>
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
  getNurseDepartmentName,
  onView,
  onDelete,
}: {
  nurse: Nurse;
  getNurseDepartmentName: (id: number | string | undefined) => string;
  onView: () => void;
  onDelete: () => void;
}) {
  const name = nurse.full_Name || nurse.full_name || 'Unknown';
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
  const photo = nurse.nurseIMG?.[0]?.photo;
  const isApproved = nurse.is_approved === 'Y';

  const depName = getNurseDepartmentName(nurse.dep_id);
  const department = nurse.specialization || (depName !== '—' ? depName : '—');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {/* Avatar with online dot */}
        <View style={styles.avatarWrapper}>
          {photo ? (
            <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          {isApproved && <View style={styles.onlineDot} />}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.department} numberOfLines={1}>{department}</Text>
          <Text style={styles.credentials}>
            {[nurse.city, nurse.state].filter(Boolean).join(', ') || '—'}
          </Text>
        </View>

        {/* Status + actions */}
        <View style={styles.rightCol}>
          <View style={[styles.statusBadge, isApproved ? styles.activeBadge : styles.pendingBadge]}>
            <Text style={[styles.statusText, isApproved ? styles.activeText : styles.pendingText]}>
              {isApproved ? 'ACTIVE' : 'PENDING'}
            </Text>
          </View>
          <View style={styles.iconBtns}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <MaterialIcons name="check-circle" size={20} color={Colors.light.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onDelete}>
              <MaterialIcons name="delete" size={20} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={onView} activeOpacity={0.8}>
        <Text style={styles.viewBtnText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
  },
  headerTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.headlineSmall, color: Colors.light.onSurface },
  headerSub: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant, marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: Colors.light.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 7,
  },
  addBtnText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge, color: Colors.light.primary },

  // List
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  emptyContainer: { alignItems: 'center', paddingTop: Spacing.xl * 2, gap: Spacing.xs },
  emptyText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface },
  emptyHint: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant },

  // Card
  card: {
    backgroundColor: Colors.light.surfaceContainerLowest, borderRadius: Radius.lg,
    padding: Spacing.sm + 4, gap: Spacing.sm, ...Shadow.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },

  // Avatar
  avatarWrapper: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', flexShrink: 0 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: { width: 50, height: 50 },
  avatarText: { fontFamily: FontFamily.headline, fontSize: FontSize.titleSmall, color: Colors.light.primary },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.light.tertiary,
    borderWidth: 2, borderColor: Colors.light.surfaceContainerLowest,
  },

  // Info
  info: { flex: 1, gap: 2 },
  name: { fontFamily: FontFamily.headlineMedium, fontSize: FontSize.titleSmall, color: Colors.light.onSurface },
  department: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge, color: Colors.light.secondary },
  credentials: { fontFamily: FontFamily.body, fontSize: FontSize.labelSmall, color: Colors.light.onSurfaceVariant },

  // Right col
  rightCol: { alignItems: 'flex-end', gap: Spacing.xs, flexShrink: 0 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  activeBadge: { backgroundColor: Colors.light.tertiaryFixed + '80' },
  pendingBadge: { backgroundColor: Colors.light.errorContainer },
  statusText: { fontFamily: FontFamily.label, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase' },
  activeText: { color: Colors.light.tertiary },
  pendingText: { color: Colors.light.error },
  iconBtns: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 32, height: 32, borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceContainerLow, alignItems: 'center', justifyContent: 'center',
  },

  // View button
  viewBtn: {
    borderWidth: 1.5, borderColor: Colors.light.primary,
    borderRadius: Radius.lg, paddingVertical: 9, alignItems: 'center',
  },
  viewBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.labelLarge, color: Colors.light.primary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    width: '90%', backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md, ...Shadow.elevated,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modalIconBadge: {
    width: 44, height: 44, borderRadius: Radius.lg,
    backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.titleLarge, color: Colors.light.onSurface },
  modalSub: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant },
  fieldLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface },
  required: { color: Colors.light.error },
  selectBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: Colors.light.outlineVariant, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: Colors.light.surfaceContainerLow,
  },
  selectText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface, flex: 1 },
  placeholder: { color: Colors.light.onSurfaceVariant },
  dropdownList: {
    borderWidth: 1, borderColor: Colors.light.outlineVariant,
    borderRadius: Radius.lg, overflow: 'hidden',
    backgroundColor: Colors.light.surface, ...Shadow.subtle,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm + 2 },
  dropdownAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.light.primaryFixed, alignItems: 'center', justifyContent: 'center',
  },
  dropdownAvatarText: { fontFamily: FontFamily.headline, fontSize: 11, color: Colors.light.primary },
  dropdownItemText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurface, flex: 1 },
  dropdownEmpty: { padding: Spacing.md, fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurfaceVariant },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs,
    backgroundColor: Colors.light.tertiaryFixed + '30',
    borderRadius: Radius.lg, padding: Spacing.sm + 2,
  },
  infoText: { flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurface },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.light.outlineVariant,
    alignItems: 'center', backgroundColor: Colors.light.surfaceContainerLow,
  },
  cancelText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge, color: Colors.light.onSurfaceVariant },
  addBtnModal: {
    flex: 1, paddingVertical: 13, borderRadius: Radius.lg,
    backgroundColor: Colors.light.primary, alignItems: 'center', ...Shadow.subtle,
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnModalText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.labelLarge, color: Colors.light.onPrimary },
});
