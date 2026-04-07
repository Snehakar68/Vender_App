import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Radius, Spacing, Shadow, FontFamily, FontSize } from '@/constants/theme';

// ── Data ──────────────────────────────────────────────────────────────────────

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  initials: string;
};

const DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Jenkins',   specialty: 'Senior Cardiologist',  credentials: 'MBBS, MD, DM Cardiology',  initials: 'SJ' },
  { id: '2', name: 'Dr. Marcus Thorne',   specialty: 'Neurologist',           credentials: 'MBBS, MD, DNB Neurology',  initials: 'MT' },
  { id: '3', name: 'Dr. Elena Rodriguez', specialty: 'Pediatrician',          credentials: 'MBBS, DCH, MD Pediatrics', initials: 'ER' },
  { id: '4', name: 'Dr. James Wilson',    specialty: 'Orthopedic Surgeon',    credentials: 'MBBS, MS Orthopedics',     initials: 'JW' },
  { id: '5', name: 'Dr. Amara Okafor',    specialty: 'Dermatologist',         credentials: 'MBBS, MD Dermatology',     initials: 'AO' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DoctorsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Doctors Directory</Text>
          <Text style={styles.headerSub}>Manage medical staff profiles</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <MaterialIcons name="add" size={18} color={Colors.light.primary} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DOCTORS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DoctorCard doctor={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

    </SafeAreaView>
  );
}

// ── DoctorCard ────────────────────────────────────────────────────────────────

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{doctor.initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <Text style={styles.credentials}>{doctor.credentials}</Text>
        </View>

        {/* Status + actions */}
        <View style={styles.rightCol}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
          <View style={styles.iconBtns}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <MaterialIcons name="check-circle" size={20} color={Colors.light.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <MaterialIcons name="delete" size={20} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* View Profile button */}
      <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8}>
        <Text style={styles.profileBtnText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
  },
  addBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // Card
  card: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.primary,
  },

  // Info
  info: {
    flex: 1,
    gap: 2,
  },
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
  credentials: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 0,
    textTransform: 'none',
  },

  // Right column
  rightCol: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  activeBadge: {
    backgroundColor: Colors.light.tertiaryFixed + '60',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activeBadgeText: {
    fontFamily: FontFamily.label,
    fontSize: 9,
    letterSpacing: 0.8,
    color: Colors.light.tertiary,
    textTransform: 'uppercase',
  },
  iconBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // View Profile button
  profileBtn: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radius.lg,
    paddingVertical: 9,
    alignItems: 'center',
  },
  profileBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },
});
