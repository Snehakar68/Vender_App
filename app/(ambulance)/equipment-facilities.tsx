import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';
import { AuthContext } from '@/src/core/context/AuthContext';

const BASE_URL = 'https://coreapi-service-111763741518.asia-south1.run.app';

export default function EquipmentFacilitiesScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? '';

  const [form, setForm] = useState({ equipmentList: '', gpsTracker: false });
  const [backupForm, setBackupForm] = useState({ equipmentList: '', gpsTracker: false });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/Ambulance/GetAmbulanceById/${vendorId}`)
      .then(r => r.json())
      .then(data => {
        const eq = data?.equipmentDetails ?? {};
        const parsed = {
          equipmentList: eq.medical_equipment ?? '',
          gpsTracker:
            eq.gpsTracker === true ||
            eq.gpsTracker === 'true' ||
            eq.gpsTracker === 't',
        };
        setForm(parsed);
        setBackupForm(parsed);
      })
      .catch(e => console.error('Fetch equipment:', e))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // ── Success message auto-dismiss ─────────────────────────────────────────
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── Edit toggle ──────────────────────────────────────────────────────────
  const handleEditToggle = () => {
    if (isEditing) {
      setForm(backupForm);
      setErrors({});
      setSuccessMsg('');
      setIsEditing(false);
    } else {
      setBackupForm(form);
      setErrors({});
      setSuccessMsg('');
      setIsEditing(true);
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.equipmentList.trim()) err.equipmentList = 'Medical Equipment List is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!vendorId) { Alert.alert('Error', 'Vendor ID not found. Please log in again.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('vendor_id', vendorId);
      fd.append('medical_equipment', form.equipmentList.trim());
      fd.append('gpsTracker', form.gpsTracker ? 'true' : 'false');

      const res = await fetch(`${BASE_URL}/api/Ambulance/UpdateEquipmentFacilities`, {
        method: 'PUT',
        body: fd,
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Update failed');

      setSuccessMsg(data?.message || 'Equipment & Facilities updated successfully');
      setBackupForm(form);
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Inventory count ──────────────────────────────────────────────────────
  const inventoryCount = form.equipmentList.trim()
    ? form.equipmentList.split(',').filter(s => s.trim()).length
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TransactionalHeader title="Equipment & Facilities" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AmbColors.primary} />
          <Text style={styles.loadingText}>Loading equipment data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TransactionalHeader
        title="Equipment & Facilities"
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={handleEditToggle}
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
          {/* Success banner */}
          {!!successMsg && (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={16} color={AmbColors.tertiary} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* ── Stats Row ────────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            {/* Inventory count */}
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="medical-services" size={22} color={AmbColors.primary} />
              </View>
              <Text style={styles.statValue}>{inventoryCount}</Text>
              <Text style={styles.statLabel}>ITEMS</Text>
              <Text style={styles.statSub}>INVENTORY</Text>
            </View>

            {/* GPS Status */}
            <View style={[styles.statCard, styles.statCardGps]}>
              <View style={styles.statIconBox}>
                <MaterialIcons name="gps-fixed" size={22} color={form.gpsTracker ? AmbColors.tertiary : AmbColors.secondary} />
              </View>
              <View style={[
                styles.gpsBadge,
                { backgroundColor: form.gpsTracker ? `${AmbColors.tertiary}15` : `${AmbColors.outline}15` },
              ]}>
                <Text style={[
                  styles.gpsBadgeText,
                  { color: form.gpsTracker ? AmbColors.tertiary : AmbColors.secondary },
                ]}>
                  {form.gpsTracker ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
              <Text style={styles.statSub}>GPS STATUS</Text>
            </View>
          </View>

          {/* ── Detailed Inventory ───────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="format-list-bulleted" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Detailed Inventory</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MEDICAL EQUIPMENT LIST <Text style={styles.required}>*</Text></Text>
              <View style={[styles.textAreaWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter all equipment separated by commas&#10;e.g. Oxygen Cylinder, Stretcher, AED, Pulse Oximeter, Suction Unit..."
                  placeholderTextColor={`${AmbColors.outline}70`}
                  value={form.equipmentList}
                  onChangeText={v => {
                    setForm(prev => ({ ...prev, equipmentList: v }));
                    if (errors.equipmentList) setErrors(prev => { const n = { ...prev }; delete n.equipmentList; return n; });
                  }}
                  editable={isEditing}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
              {errors.equipmentList
                ? <Text style={styles.errorText}>{errors.equipmentList}</Text>
                : <Text style={styles.hintText}>Separate each item with a comma</Text>
              }
            </View>

            {/* Equipment tag preview */}
            {form.equipmentList.trim().length > 0 && (
              <View style={styles.tagWrap}>
                {form.equipmentList.split(',').filter(s => s.trim()).slice(0, 8).map((item, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{item.trim()}</Text>
                  </View>
                ))}
                {form.equipmentList.split(',').filter(s => s.trim()).length > 8 && (
                  <View style={[styles.tag, styles.tagMore]}>
                    <Text style={[styles.tagText, { color: AmbColors.primary }]}>
                      +{form.equipmentList.split(',').filter(s => s.trim()).length - 8} more
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── GPS Tracker ──────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="gps-fixed" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>GPS Tracker</Text>
            </View>

            <View style={styles.gpsRow}>
              <View style={styles.gpsTextBlock}>
                <Text style={styles.gpsLabel}>GPS Tracker Installed</Text>
                <Text style={styles.gpsSub}>Real-time location monitoring enabled</Text>
              </View>
              <Switch
                value={form.gpsTracker}
                onValueChange={v => isEditing && setForm(prev => ({ ...prev, gpsTracker: v }))}
                disabled={!isEditing}
                trackColor={{ false: AmbColors.surfaceContainerHighest, true: `${AmbColors.primary}55` }}
                thumbColor={form.gpsTracker ? AmbColors.primary : AmbColors.outline}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Sticky Footer (edit mode only) ──────────────────────────────────── */}
      {isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="check-circle" size={20} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.secondary },

  // Success banner
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${AmbColors.tertiary}12`,
    borderWidth: 1, borderColor: `${AmbColors.tertiary}30`,
    borderRadius: AmbRadius.md, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14,
  },
  successText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: AmbColors.tertiary, flex: 1 },

  // Edit button
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: AmbRadius.pill, backgroundColor: `${AmbColors.primary}15`,
  },
  editBtnActive: { backgroundColor: `${AmbColors.error}15` },
  editBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: AmbColors.primary },
  editBtnTextActive: { color: AmbColors.error },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: {
    flex: 1, borderRadius: AmbRadius.xl, padding: 18, alignItems: 'center', gap: 6,
    ...AmbShadow.subtle,
  },
  statCardPrimary: { backgroundColor: `${AmbColors.primary}08` },
  statCardGps: { backgroundColor: AmbColors.surfaceContainerLowest },
  statIconBox: {
    width: 44, height: 44, borderRadius: AmbRadius.md,
    backgroundColor: AmbColors.surfaceContainerLow,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  statValue: { fontFamily: 'Inter_600SemiBold', fontSize: 22, color: AmbColors.primary },
  statLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: AmbColors.onSurface },
  statSub: {
    fontFamily: 'Inter_600SemiBold', fontSize: 9, color: AmbColors.secondary,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  gpsBadge: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: AmbRadius.pill, marginBottom: 2,
  },
  gpsBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.5 },

  // Section
  section: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl, padding: 20, marginBottom: 14, gap: 14,
    ...AmbShadow.subtle,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: AmbColors.onSurface },

  // Field
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 10,
    color: AmbColors.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase',
  },
  required: { color: AmbColors.error },
  textAreaWrapper: {
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md, padding: 14, minHeight: 120,
  },
  inputDisabled: { backgroundColor: AmbColors.surfaceContainerHighest, opacity: 0.75 },
  textArea: {
    fontFamily: 'Inter_400Regular', fontSize: 14,
    color: AmbColors.onSurface, lineHeight: 22, minHeight: 100,
  },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: AmbColors.error },
  hintText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: `${AmbColors.outline}99` },

  // Equipment tags
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: AmbRadius.pill,
    backgroundColor: `${AmbColors.primary}12`,
  },
  tagMore: { backgroundColor: `${AmbColors.primary}08`, borderWidth: 1, borderColor: `${AmbColors.primary}30` },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: AmbColors.onSurfaceVariant },

  // GPS row
  gpsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md, padding: 16, gap: 14,
  },
  gpsTextBlock: { flex: 1 },
  gpsLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: AmbColors.onSurface },
  gpsSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: AmbColors.secondary, marginTop: 2 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: AmbColors.surfaceContainerLowest,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    ...AmbShadow.elevated,
  },
  submitBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    height: 54, backgroundColor: AmbColors.primary, borderRadius: AmbRadius.md,
    ...AmbShadow.card,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#ffffff' },
});
