import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '@/src/core/api/apiClient';
import { Colors, Radius, Spacing, Shadow, FontFamily, FontSize } from '@/src/shared/constants/theme';

// ── Types ─────────────────────────────────────────────────────────────────────

type Counts = {
  doctor: number;
  nurse: number;
  cleaner: number;
  ambulance: number;
  emergency: number;
};

type PendingDoctor = {
  doctor_id: string;
  full_Name?: string;
  full_name?: string;
  city?: string;
  state?: string;
};

type PendingNurse = {
  nurse_id: string;
  nurse_detail: {
    full_name?: string;
    city?: string;
    state?: string;
  };
};

// ── Stat card config ───────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: 'doctor',    label: 'Total Doctors',      icon: 'person-search',     color: '#3b82f6' },
  { key: 'nurse',     label: 'Total Nurses',        icon: 'local-hospital',    color: '#22c55e' },
  { key: 'cleaner',   label: 'Total Cleaners',      icon: 'cleaning-services', color: '#f97316' },
  { key: 'ambulance', label: 'Active Ambulances',   icon: 'emergency',         color: Colors.light.tertiary },
  { key: 'emergency', label: 'Emergency',           icon: 'crisis-alert',      color: '#6366f1' },
] as const;

// ── Bar chart config ───────────────────────────────────────────────────────────

const BAR_CONFIG = [
  { key: 'doctor',    label: 'Docs',   color: '#3b82f6' },
  { key: 'nurse',     label: 'Nurses', color: '#22c55e' },
  { key: 'cleaner',   label: 'Clean',  color: '#f97316' },
  { key: 'ambulance', label: 'Amb',    color: '#38bdf8' },
] as const;

const BAR_MAX_HEIGHT = 80;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HospitalHome() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts>({ doctor: 0, nurse: 0, cleaner: 0, ambulance: 0, emergency: 0 });
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [pendingNurses, setPendingNurses] = useState<PendingNurse[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load vendorId on mount ──────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        const userData = JSON.parse(raw || '{}');
        setVendorId(userData.vendorId ?? null);
      } catch (e) {
        console.error('Failed to load vendorId', e);
      }
    };
    init();
  }, []);

  // ── Fetch helpers ───────────────────────────────────────────────────────────

const loadCounts = useCallback(async (vid: string) => {
  try {
    const res = await api.get(
      `/api/Hospital/Total_count_for_Hospital?Hosp_ID=${vid}`
    );

    const result = res.data;

    if (result?.status === true) {
      const countsData = result.data || {};

      setCounts({
        doctor: countsData.doctor ?? 0,
        nurse: countsData.nurse ?? 0,
        cleaner: countsData.cleaner ?? 0,
        ambulance: countsData.ambulance ?? 0,
        emergency: 0,
      });
    }
  } catch (e) {
    console.error('loadCounts error', e);
  }
}, []);

  const loadPendingDoctors = useCallback(async (vid: string) => {
    try {
      const res = await api.get(
        `/api/Hospital/Total_pending_Doctor_Hosp?Hosp_ID=${vid}`
      );
      console.log('Pending doctors response:', res.data);
      const result = res.data;
      console.log('Pending doctors result:', result);
      setPendingDoctors(result?.data ?? result ?? []);
    } catch (e) {
      console.error('loadPendingDoctors error', e);
    }
  }, []);

  const loadPendingNurses = useCallback(async (vid: string) => {
    try {
      const res = await api.get(
        `/api/Hospital/Total_pending_Nurse_Hosp?Hosp_ID=${vid}`
      );
      console.log('Pending nurses response:', res.data);
      const result = res.data;
      console.log('Pending nurses result:', result);
      setPendingNurses(result?.data ?? result ?? []);
    } catch (e) {
      console.error('loadPendingNurses error', e);
    }
  }, []);

  // ── Load all data when vendorId is ready ───────────────────────────────────

  useEffect(() => {
    if (!vendorId) return;
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        loadCounts(vendorId),
        loadPendingDoctors(vendorId),
        loadPendingNurses(vendorId),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, [vendorId, loadCounts, loadPendingDoctors, loadPendingNurses]);

  // ── Approve handlers ────────────────────────────────────────────────────────

  const approveDoctor = async (doctorId: string) => {
    if (!vendorId) return;
    try {
      const res = await api.get(
        `/api/Hospital/Approve_Hospital_Doctor/${vendorId}/${doctorId}`
      );
      console.log('Approve doctor response:', res.data);
      const result = res.data;
      console.log('Approve doctor result:', result);
      if (result?.status === true || res.status === 200) {
        setPendingDoctors(prev => prev.filter(d => d.doctor_id !== doctorId));
        loadCounts(vendorId);
      } else {
        Alert.alert('Error', result?.message ?? 'Could not approve doctor.');
      }
    } catch (e: any) {
      const text = e?.response?.data;
      let msg = 'Could not approve doctor.';
      if (typeof text === 'string') {
        try { msg = JSON.parse(text)?.message ?? msg; } catch { msg = text || msg; }
      } else if (text?.message) {
        msg = text.message;
      }
      console.error('approveDoctor error', e);
      Alert.alert('Error', msg);
    }
  };

  const approveNurse = async (nurseId: string) => {
    if (!vendorId) return;
    try {
      const res = await api.get(
        `/api/Hospital/Approve_Hospital_Nurse/${vendorId}/${nurseId}`
      );
      const result = res.data;
      console.log('Approve nurse response:', result);
      if (result?.status === true || res.status === 200) {
        setPendingNurses(prev => prev.filter(n => n.nurse_id !== nurseId));
        loadCounts(vendorId);
      } else {
        Alert.alert('Error', result?.message ?? 'Could not approve nurse.');
      }
    } catch (e: any) {
      const text = e?.response?.data;
      let msg = 'Could not approve nurse.';
      if (typeof text === 'string') {
        try { msg = JSON.parse(text)?.message ?? msg; } catch { msg = text || msg; }
      } else if (text?.message) {
        msg = text.message;
      }
      console.error('approveNurse error', e);
      Alert.alert('Error', msg);
    }
  };

  // ── Bar chart calculation ───────────────────────────────────────────────────

  const barValues = BAR_CONFIG.map(b => counts[b.key as keyof Counts]);
  const maxVal = Math.max(...barValues, 1);

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="local-hospital" size={18} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Jhilmil Homecare</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JH</Text>
          </View>
        </View>

        {/* ── Welcome Card ── */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeDecor} />
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.welcomeName}>LifeCare Specialty</Text>
            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activePillText}>Active · Zone A</Text>
            </View>
          </View>
          <Text style={styles.welcomeSub}>Your dashboard is up to date</Text>
        </View>

        {/* ── Stat Cards ── */}
        <Text style={styles.sectionLabel}>Overview</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statRow}>
          {STAT_CARDS.map(card => (
            <View key={card.key} style={[styles.statCard, { backgroundColor: card.color }]}>
              <MaterialIcons name={card.icon as any} size={24} color="#fff" />
              <Text style={styles.statCount}>{counts[card.key as keyof Counts]}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Pending Doctors ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pending Doctor Approvals</Text>
            <TouchableOpacity onPress={() => router.push('/(hospital)/doctors')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Column headers */}
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colName, styles.colHead]}>Name</Text>
            <Text style={[styles.col, styles.colCity, styles.colHead]}>City</Text>
            <Text style={[styles.col, styles.colState, styles.colHead]}>State</Text>
            <Text style={[styles.col, styles.colActions, styles.colHead]}>Actions</Text>
          </View>

          {pendingDoctors.length === 0 ? (
            <Text style={styles.emptyText}>No pending doctors</Text>
          ) : (
            <ScrollView nestedScrollEnabled style={styles.tableScroll}>
              {pendingDoctors.map(doc => (
                <View key={doc.doctor_id} style={styles.tableRow}>
                  <Text style={[styles.col, styles.colName]} numberOfLines={1}>
                    {doc.full_Name ?? doc.full_name ?? '—'}
                  </Text>
                  <Text style={[styles.col, styles.colCity]} numberOfLines={1}>
                    {doc.city ?? '—'}
                  </Text>
                  <Text style={[styles.col, styles.colState]} numberOfLines={1}>
                    {doc.state ?? '—'}
                  </Text>
                  <View style={[styles.colActions, styles.actionRow]}>
                    {/* View */}
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/(hospital)/doctor-details/[id]',
                          params: { id: doc.doctor_id },
                        })
                      }>
                      <MaterialIcons name="visibility" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                    {/* Edit — TODO: add edit route */}
                    <TouchableOpacity style={styles.iconBtn}>
                      <MaterialIcons name="edit" size={16} color={Colors.light.onSurfaceVariant} />
                    </TouchableOpacity>
                    {/* Approve */}
                    <TouchableOpacity
                      style={[styles.iconBtn, styles.approveBtn]}
                      onPress={() => approveDoctor(doc.doctor_id)}>
                      <MaterialIcons name="check" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Pending Nurses ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pending Nurse Approvals</Text>
            <TouchableOpacity onPress={() => router.push('/(hospital)/nurses')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Column headers */}
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colName, styles.colHead]}>Name</Text>
            <Text style={[styles.col, styles.colCity, styles.colHead]}>City</Text>
            <Text style={[styles.col, styles.colState, styles.colHead]}>State</Text>
            <Text style={[styles.col, styles.colActions, styles.colHead]}>Actions</Text>
          </View>

          {pendingNurses.length === 0 ? (
            <Text style={styles.emptyText}>No pending nurses</Text>
          ) : (
            <ScrollView nestedScrollEnabled style={styles.tableScroll}>
              {pendingNurses.map(nurse => (
                <View key={nurse.nurse_id} style={styles.tableRow}>
                  <Text style={[styles.col, styles.colName]} numberOfLines={1}>
                    {nurse.nurse_detail?.full_name ?? '—'}
                  </Text>
                  <Text style={[styles.col, styles.colCity]} numberOfLines={1}>
                    {nurse.nurse_detail?.city ?? '—'}
                  </Text>
                  <Text style={[styles.col, styles.colState]} numberOfLines={1}>
                    {nurse.nurse_detail?.state ?? '—'}
                  </Text>
                  <View style={[styles.colActions, styles.actionRow]}>
                    {/* View */}
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/(hospital)/nurse-details/[id]',
                          params: { id: nurse.nurse_id },
                        })
                      }>
                      <MaterialIcons name="visibility" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                    {/* Edit — TODO: add edit route */}
                    <TouchableOpacity style={styles.iconBtn}>
                      <MaterialIcons name="edit" size={16} color={Colors.light.onSurfaceVariant} />
                    </TouchableOpacity>
                    {/* Approve */}
                    <TouchableOpacity
                      style={[styles.iconBtn, styles.approveBtn]}
                      onPress={() => approveNurse(nurse.nurse_id)}>
                      <MaterialIcons name="check" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Staff Bar Chart ── */}
        <View style={styles.card}>
          <Text style={styles.chartTitle}>Staff by Dept</Text>
          <View style={styles.chartArea}>
            {BAR_CONFIG.map((b, i) => {
              const val = barValues[i];
              const barH = Math.max(4, Math.round((val / maxVal) * BAR_MAX_HEIGHT));
              return (
                <View key={b.key} style={styles.barColumn}>
                  <Text style={styles.barValue}>{val}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: barH, backgroundColor: b.color }]} />
                  </View>
                  <Text style={styles.barLabel}>{b.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.titleSmall,
    color: Colors.light.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelMedium,
    color: Colors.light.onSurfaceVariant,
  },

  // Welcome Card
  welcomeCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    gap: Spacing.sm,
  },
  welcomeDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    right: -24,
    top: -24,
  },
  welcomeContent: {
    gap: Spacing.xs,
  },
  welcomeGreeting: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },
  welcomeName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineLarge,
    color: '#fff',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 2,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.light.tertiaryFixed,
  },
  activePillText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelSmall,
    color: '#fff',
    letterSpacing: 0.5,
  },
  welcomeSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelMedium,
    color: 'rgba(255,255,255,0.60)',
  },

  // Section label
  sectionLabel: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
    marginBottom: -Spacing.xs,
  },

  // Stat Cards
  statRow: {
    gap: Spacing.sm,
    paddingBottom: 2,
  },
  statCard: {
    width: 120,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    ...Shadow.card,
  },
  statCount: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.headlineMedium,
    color: '#fff',
  },
  statLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelSmall,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  // Card container
  card: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
  },
  viewAll: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelMedium,
    color: Colors.light.primary,
  },

  // Table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline + '40',
    paddingBottom: Spacing.xs,
  },
  tableScroll: {
    maxHeight: 240,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline + '20',
  },
  col: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurface,
  },
  colHead: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colName: {
    flex: 2.5,
  },
  colCity: {
    flex: 1.5,
  },
  colState: {
    flex: 1.5,
  },
  colActions: {
    flex: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#22c55e',
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },

  // Bar chart
  chartTitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: BAR_MAX_HEIGHT + 36,
    paddingTop: Spacing.sm,
  },
  barColumn: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  barValue: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },
  barTrack: {
    width: 28,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 28,
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },
});
