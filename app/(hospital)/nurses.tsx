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

type Nurse = {
  id: string;
  name: string;
  department: string;
  credentials: string;
  initials: string;
  online: boolean;
};

const NURSES: Nurse[] = [
  { id: '1', name: 'Sarah Jenkins',   department: 'Critical Care Unit',   credentials: 'MSN, RN',                     initials: 'SJ', online: true  },
  { id: '2', name: 'David Miller',    department: 'Pediatrics Dept.',      credentials: 'BSN, Licensed Practitioner',   initials: 'DM', online: true  },
  { id: '3', name: 'Mei Lin',         department: 'Emergency Care',        credentials: 'DNP, Advanced Practice',       initials: 'ML', online: false },
  { id: '4', name: 'Robert Chen',     department: 'Geriatric Homecare',    credentials: 'MSN, Gerontology Specialist',  initials: 'RC', online: true  },
  { id: '5', name: 'Elena Rodriguez', department: 'Oncology Services',     credentials: 'RN, Certified Clinical Care',  initials: 'ER', online: false },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NursesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Registered Nurses</Text>
          <Text style={styles.headerSub}>Managing {NURSES.length} healthcare professionals</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <MaterialIcons name="add" size={18} color={Colors.light.primary} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={NURSES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NurseCard nurse={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

    </SafeAreaView>
  );
}

// ── NurseCard ─────────────────────────────────────────────────────────────────

function NurseCard({ nurse }: { nurse: Nurse }) {
  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        {/* Avatar with online dot */}
        <View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nurse.initials}</Text>
          </View>
          {nurse.online && <View style={styles.onlineDot} />}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{nurse.name}</Text>
          <Text style={styles.department}>{nurse.department}</Text>
          <Text style={styles.credentials}>{nurse.credentials}</Text>
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

      {/* View button */}
      <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
        <Text style={styles.viewBtnText}>View Profile</Text>
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
  },
  avatarText: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.tertiary,
    borderWidth: 2,
    borderColor: Colors.light.surfaceContainerLowest,
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
  department: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.secondary,
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

  // View button
  viewBtn: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: Radius.lg,
    paddingVertical: 9,
    alignItems: 'center',
  },
  viewBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLarge,
    color: Colors.light.primary,
  },
});
