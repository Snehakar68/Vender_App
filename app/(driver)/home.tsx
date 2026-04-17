import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import { MOCK_DRIVERS, Driver } from '@/src/features/ambulance/data/mockData';

type FilterType = 'All' | 'Online' | 'Offline';

// Driver-specific view: shows name, license, assigned ambulance, status
export default function DriverHome() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_DRIVERS.filter((d) => {
    const matchesFilter = filter === 'All' || d.status === filter;
    const matchesSearch =
      search === '' ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Driver Management</Text>
          <Text style={styles.headerSub}>Jhilmil Homecare Fleet</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>JH</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={20} color={AmbColors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or license..."
            placeholderTextColor={`${AmbColors.outline}99`}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color={AmbColors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.chipRow}>
          {(['All', 'Online', 'Offline'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f ? styles.chipActive : styles.chipInactive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              {f !== 'All' && (
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: f === 'Online' ? AmbColors.tertiary : `${AmbColors.outline}66` },
                  ]}
                />
              )}
              <Text style={[styles.chipLabel, filter === f ? styles.chipLabelActive : styles.chipLabelInactive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{MOCK_DRIVERS.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: AmbColors.tertiary }]}>
              {MOCK_DRIVERS.filter((d) => d.status === 'Online').length}
            </Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: AmbColors.secondary }]}>
              {MOCK_DRIVERS.filter((d) => d.status === 'Offline').length}
            </Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Driver Roster</Text>
          <Text style={styles.sectionCount}>{filtered.length} shown</Text>
        </View>

        {/* Driver cards */}
        {filtered.map((driver) => (
          <DriverCard key={driver.id} data={driver} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={40} color={`${AmbColors.outline}60`} />
            <Text style={styles.emptyText}>No drivers found</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DriverCard({ data }: { data: Driver }) {
  const isOnline = data.status === 'Online';

  return (
    <View style={[styles.card, AmbShadow.card]}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{data.initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        {/* Name + status */}
        <View style={styles.nameRow}>
          <Text style={styles.driverName}>{data.name}</Text>
          <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
            <Text style={[styles.badgeText, { color: isOnline ? AmbColors.tertiary : AmbColors.secondary }]}>
              {data.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* License */}
        <View style={styles.infoRow}>
          <MaterialIcons name="badge" size={14} color={AmbColors.outline} />
          <Text style={styles.infoText}>{data.licenseNumber}</Text>
        </View>

        {/* Assigned ambulance */}
        <View style={styles.infoRow}>
          <MaterialIcons name="emergency" size={14} color={AmbColors.primary} />
          <Text style={styles.infoText}>{data.assignedAmbulance}</Text>
        </View>
      </View>

      {/* Status indicator bar */}
      <View style={[styles.statusBar, { backgroundColor: isOnline ? AmbColors.tertiary : AmbColors.surfaceContainerHighest }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: AmbColors.surfaceContainerHigh,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: AmbColors.onSurface,
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: AmbColors.secondary,
    marginTop: 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AmbColors.primaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: AmbColors.primary,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerHigh,
    borderRadius: AmbRadius.lg,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 50,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },

  // Chips
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: AmbRadius.pill,
    gap: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipActive: { backgroundColor: AmbColors.primary },
  chipInactive: { backgroundColor: AmbColors.surfaceContainerHighest },
  chipLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  chipLabelActive: { color: '#ffffff' },
  chipLabelInactive: { color: AmbColors.onSurfaceVariant },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.lg,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    ...AmbShadow.subtle,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: AmbColors.onSurface,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: AmbColors.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: AmbColors.surfaceContainerHigh,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: AmbColors.onSurface,
  },
  sectionCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: AmbColors.secondary,
  },

  // Driver card
  card: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: AmbRadius.md,
    backgroundColor: AmbColors.primaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: AmbColors.primary,
  },
  cardBody: { flex: 1, gap: 5 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: AmbColors.onSurface,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: AmbRadius.sm,
  },
  badgeOnline: { backgroundColor: `${AmbColors.tertiaryContainer}18` },
  badgeOffline: { backgroundColor: AmbColors.surfaceContainerHighest },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: AmbColors.onSurfaceVariant,
  },

  // Status bar accent on left
  statusBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: `${AmbColors.secondary}99`,
  },
});
