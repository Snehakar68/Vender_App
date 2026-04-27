import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  ButtonSize,
} from '@/src/shared/constants/theme';
import { Department } from '@/src/features/services/constants/departments';
import { AuthContext } from '@/src/core/context/AuthContext';
import api from '@/src/core/api/apiClient';
import ActionModal from '@/src/shared/components/ActionModal';

// ── Icon helper (matches department name to icon) ─────────────────────────────
const getDepartmentIcon = (name: string): string => {
  const n = name?.toLowerCase() || '';
  if (n.includes('cardio') || n.includes('heart')) return 'favorite';
  if (n.includes('dent') || n.includes('oral')) return 'coronavirus';
  if (n.includes('neuro') || n.includes('brain')) return 'device-hub';
  if (n.includes('pediatr') || n.includes('child')) return 'child-friendly';
  if (n.includes('ent') || n.includes('ear') || n.includes('throat')) return 'hearing';
  if (n.includes('radio') || n.includes('xray') || n.includes('scan')) return 'image-search';
  if (n.includes('ortho') || n.includes('bone') || n.includes('joint')) return 'accessible';
  if (n.includes('physio') || n.includes('rehab')) return 'self-improvement';
  if (n.includes('psych') || n.includes('mental')) return 'psychology-alt';
  if (n.includes('gynec') || n.includes('women')) return 'pregnant-woman';
  if (n.includes('ophthal') || n.includes('eye')) return 'visibility';
  if (n.includes('dermat') || n.includes('skin')) return 'face';
  if (n.includes('oncol') || n.includes('cancer')) return 'biotech';
  if (n.includes('urol') || n.includes('kidney')) return 'water-drop';
  if (n.includes('general') || n.includes('medicine')) return 'local-hospital';
  if (n.includes('ambulance') || n.includes('emergency') || n.includes('rescue')) return 'emergency';
  if (n.includes('icu') || n.includes('intensive') || n.includes('critical')) return 'monitor-heart';
  if (n.includes('pharma') || n.includes('dispensar')) return 'local-pharmacy';
  if (n.includes('diagnos') || n.includes('pathol') || n.includes('lab')) return 'science';
  if (n.includes('surg') || n.includes('operation') || n.includes('theatre')) return 'healing';
  if (n.includes('blood') || n.includes('hemo') || n.includes('transfus')) return 'bloodtype';
  if (n.includes('neonatal') || n.includes('nicu') || n.includes('newborn')) return 'child-care';
  if (n.includes('trauma') || n.includes('accident')) return 'emergency';
  if (n.includes('nutrition') || n.includes('diet')) return 'restaurant';
  return 'medical-services';
};

export default function SelectServicesScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedNames, setUpdatedNames] = useState('');

  useEffect(() => {
    if (vendorId) {
      loadDepartments();
    }
  }, [vendorId]);

  const loadDepartments = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get all departments
      const deptRes = await api.get('/api/Hospital/GetDeprt_HOSP');
      const allDepts = deptRes.data || [];

      const formattedDepartments = allDepts.map((d: any) => ({
        id: String(d.dep_id || d.id),   // ✅ use dep_id like web version
        name: d.dep_name,
        specialty: d.specialty || '',
        description: d.description || '',
        icon: getDepartmentIcon(d.dep_name),
      }));

      setDepartments(formattedDepartments);

      // 2️⃣ Get already selected departments
      const hospitalRes = await api.get(`/api/Hospital/GetHospitalById/${vendorId}`);
      const selectedIds = hospitalRes.data?.departments || hospitalRes.data?.dept_ids || [];

      setSelected(new Set(selectedIds.map(String)));
    } catch (err) {
      console.log('❌ Load departments error', err);
    } finally {
      setLoading(false);
    }
  };

  function toggle(id: string) {
    setError('');
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Update API — mirrors web version exactly ──────────────────────────────
  async function handleUpdate() {
    if (!vendorId) return;

    if (selected.size === 0) {
      setError('Please select at least one department.');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      // Web sends plain array of IDs: JSON.stringify(depIds)
      const depIds = Array.from(selected).map(Number);

      const res = await api.post(
        `/api/Hospital/UpdateHospitalServices/${vendorId}`,
        depIds,  // ✅ plain array, not wrapped in object
      );

      console.log('Update result:', res.data);

      const names = departments
        .filter(d => selected.has(d.id))
        .map(d => d.name)
        .join(', ');
      setUpdatedNames(names);
      setShowSuccessModal(true);
    } catch (err) {
      console.log('❌ Update services error', err);
      setError('Failed to update services. Please try again.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  function renderItem({ item }: ListRenderItemInfo<Department>) {
    const isSelected = selected.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggle(item.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
          {isSelected && <MaterialIcons name="check" size={14} color="#fff" />}
        </View>

        <View style={styles.iconWrap}>
          <MaterialIcons
            name={item.icon as any}
            size={22}
            color={isSelected ? Colors.light.primary : Colors.light.onSurfaceVariant}
          />
        </View>

        <Text
          style={[styles.cardName, isSelected && styles.cardNameSelected]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text style={styles.cardSpecialty} numberOfLines={1}>
          {item.specialty}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Select Services</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Choose the departments you wish to subscribe to for homecare assistance.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialIcons name="error-outline" size={16} color={Colors.light.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={departments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={[styles.updateBtn, updating && { opacity: 0.7 }]}
          onPress={handleUpdate}
          activeOpacity={0.85}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.updateBtnText}>Update Services</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <ActionModal
        visible={showSuccessModal}
        title="Services Updated"
        message={`Active departments: ${updatedNames}`}
        confirmText="OK"
        iconName="check-circle"
        iconColor={Colors.light.primary}
        buttonColor={Colors.light.primary}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.replace('/(hospital)/services/your-services');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineLarge,
    color: Colors.light.onSurface,
  },
  cancelText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 20,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.errorContainer,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.error,
    flex: 1,
  },

  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },

  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.card,
  },
  cardSelected: { borderColor: Colors.light.primary },

  checkCircle: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkCircleSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  cardName: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
    marginBottom: 2,
  },
  cardNameSelected: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.light.primary,
  },
  cardSpecialty: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },

  btnContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    height: ButtonSize.minHeight,
    ...Shadow.elevated,
  },
  updateBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: '#fff',
  },
});
