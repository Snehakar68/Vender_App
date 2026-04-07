import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Radius, Spacing, Shadow, FontFamily, FontSize } from '@/src/shared/constants/theme';

// ── Static data ───────────────────────────────────────────────────────────────

const SERVICES = [
  { id: 'ambulance', label: 'Ambulance', icon: 'emergency',          bg: Colors.light.error },
  { id: 'doctor',    label: 'Doctor',    icon: 'person-search',      bg: Colors.light.primary },
  { id: 'nurse',     label: 'Nurse',     icon: 'local-hospital',     bg: '#1565C0' },
  { id: 'cleaner',   label: 'Cleaner',   icon: 'cleaning-services',  bg: '#E65100' },
] as const;

const TASKS = [
  { id: '1', patient: 'Rajesh Kumar',  task: 'Post-op Checkup',    time: '10:30 AM', initials: 'RK' },
  { id: '2', patient: 'Priya Sharma',  task: 'Wound Dressing',     time: '11:00 AM', initials: 'PS' },
  { id: '3', patient: 'Mohan Das',     task: 'Medication Review',  time: '12:15 PM', initials: 'MD' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HospitalHome() {
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
          {/* Decorative circle */}
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

        {/* ── Quick Services Grid ── */}
        <Text style={styles.sectionLabel}>Quick Services</Text>
        <View style={styles.servicesGrid}>
          {SERVICES.map((s) => (
            <TouchableOpacity key={s.id} style={[styles.serviceCard, { backgroundColor: s.bg }]} activeOpacity={0.85}>
              <MaterialIcons name={s.icon as any} size={28} color="#fff" />
              <Text style={styles.serviceLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Upcoming Tasks ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Upcoming Tasks</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {TASKS.map((t) => (
          <View key={t.id} style={styles.taskCard}>
            <View style={styles.taskAvatar}>
              <Text style={styles.taskAvatarText}>{t.initials}</Text>
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskPatient}>{t.patient}</Text>
              <Text style={styles.taskType}>{t.task}</Text>
            </View>
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>{t.time}</Text>
            </View>
          </View>
        ))}

        {/* ── Health Tip ── */}
        <View style={styles.tipCard}>
          <MaterialIcons name="tips-and-updates" size={20} color={Colors.light.tertiary} />
          <Text style={styles.tipText}>
            Ensure all staff complete daily handover notes before shift change.
          </Text>
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

  // Section labels
  sectionLabel: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
    marginBottom: -Spacing.xs,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -Spacing.xs,
  },
  seeAll: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelMedium,
    color: Colors.light.primary,
  },

  // Services Grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  serviceCard: {
    width: '47.5%',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  serviceLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: '#fff',
  },

  // Task Cards
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  taskAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskAvatarText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },
  taskInfo: {
    flex: 1,
    gap: 2,
  },
  taskPatient: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  taskType: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
  },
  timeBadge: {
    backgroundColor: Colors.light.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  timeBadgeText: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },

  // Health Tip
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.tertiaryFixed + '40',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.tertiary,
    lineHeight: 20,
  },
});
