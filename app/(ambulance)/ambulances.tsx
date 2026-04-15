import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import { Ambulance } from '@/src/features/ambulance/data/mockData';
import { useAmbulanceContext } from '@/src/features/ambulance/context/AmbulanceContext';
import AmbulanceTopBar from '@/src/features/ambulance/components/AmbulanceTopBar';

type StatusFilter = 'All' | 'Active' | 'Inactive';
type TypeFilter = 'All' | 'Basic' | 'Advanced';

export default function AmbulancesScreen() {
  const { ambulances, deleteAmbulance } = useAmbulanceContext();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [search, setSearch] = useState('');

  const filtered = ambulances.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    const matchesSearch =
      search === '' ||
      a.vehicleNumber.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleDelete = (id: string, vehicleNumber: string) => {
    Alert.alert(
      'Delete Ambulance',
      `Remove ${vehicleNumber} from the fleet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAmbulance(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AmbulanceTopBar avatarInitials="JH" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={20} color={AmbColors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicle number..."
            placeholderTextColor={`${AmbColors.outline}99`}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Status filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(['All', 'Active', 'Inactive'] as StatusFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, statusFilter === f ? styles.chipActive : styles.chipInactive]}
              onPress={() => setStatusFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipLabel, statusFilter === f ? styles.chipLabelActive : styles.chipLabelInactive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipRow, { marginBottom: 4 }]}
        >
          {(['All', 'Basic', 'Advanced'] as TypeFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.chip,
                typeFilter === f ? styles.chipTypeActive : styles.chipTypeInactive,
              ]}
              onPress={() => setTypeFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.chipLabel,
                typeFilter === f ? styles.chipLabelActive : styles.chipLabelInactive,
              ]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fleet header */}
        <View style={styles.fleetHeader}>
          <View>
            <Text style={styles.fleetTitle}>Ambulance Fleet</Text>
            <Text style={styles.fleetSub}>{ambulances.length} Vehicles Managed</Text>
          </View>
          <View style={styles.operationalBadge}>
            <Text style={styles.operationalText}>OPERATIONAL</Text>
          </View>
        </View>

        {/* Cards */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={40} color={`${AmbColors.outline}50`} />
            <Text style={styles.emptyText}>No ambulances match the filter</Text>
          </View>
        ) : (
          filtered.map((amb) => (
            <AmbulanceCard
              key={amb.id}
              data={amb}
              onView={() => router.push(`/(ambulance)/add-ambulance?mode=view&id=${amb.id}`)}
              onEdit={() => router.push(`/(ambulance)/add-ambulance?mode=edit&id=${amb.id}`)}
              onDelete={() => handleDelete(amb.id, amb.vehicleNumber)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(ambulance)/add-ambulance')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Ambulance Card ───────────────────────────────────────────────────────────

function AmbulanceCard({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Ambulance;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isActive = data.status === 'Active';

  return (
    <View style={[styles.card, !isActive && styles.cardInactive, AmbShadow.card]}>
      {/* Row 1: icon + info + badge */}
      <View style={styles.cardRow}>
        <View style={[styles.typeIcon, { backgroundColor: isActive ? `${AmbColors.primary}15` : `${AmbColors.secondary}20` }]}>
          <MaterialIcons
            name={isActive ? 'emergency' : 'minor-crash'}
            size={24}
            color={isActive ? AmbColors.primary : AmbColors.secondary}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.vehicleNumber}>{data.vehicleNumber}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.vehicleType}>{data.type}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={[styles.statusText, { color: isActive ? AmbColors.tertiary : AmbColors.error }]}>
            {data.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Row 2: driver + location */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="person" size={14} color={AmbColors.outline} />
          <Text style={styles.metaText}>{data.driverName ?? 'Unassigned'}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="location-on" size={14} color={AmbColors.outline} />
          <Text style={styles.metaText}>{data.lastLocationTime ?? '—'}</Text>
        </View>
      </View>

      {/* Row 3: crew or maintenance + actions */}
      <View style={styles.cardFooter}>
        {isActive ? (
          <View style={styles.crewRow}>
            {data.crewInitials.map((init, i) => (
              <View key={i} style={[styles.crewAvatar, i > 0 && styles.crewAvatarOverlap]}>
                <Text style={styles.crewInitial}>{init}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.maintenanceNote}>{data.maintenanceNote}</Text>
        )}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onView} activeOpacity={0.7}>
            <MaterialIcons name="visibility" size={16} color={AmbColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
            <MaterialIcons name="edit" size={16} color={AmbColors.outline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
            <MaterialIcons name="delete" size={16} color={AmbColors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerHigh,
    borderRadius: AmbRadius.lg,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 52,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },

  // Chips
  chipRow: { gap: 8, paddingBottom: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: AmbRadius.pill,
  },
  chipActive: { backgroundColor: AmbColors.primary },
  chipTypeActive: { backgroundColor: AmbColors.primaryContainer },
  chipInactive: { backgroundColor: AmbColors.surfaceContainerHighest },
  chipTypeInactive: { backgroundColor: AmbColors.surfaceContainerHigh },
  chipLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  chipLabelActive: { color: '#ffffff' },
  chipLabelInactive: { color: AmbColors.onSurfaceVariant },

  // Fleet header
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  fleetTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: AmbColors.onSurface,
  },
  fleetSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: AmbColors.outline,
    marginTop: 2,
  },
  operationalBadge: {
    backgroundColor: `${AmbColors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: AmbRadius.sm,
  },
  operationalText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: AmbColors.primary,
    letterSpacing: 1,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: `${AmbColors.outline}80`,
  },

  // Card
  card: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 20,
    marginBottom: 14,
  },
  cardInactive: { opacity: 0.8 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: AmbRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  vehicleNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: AmbColors.onSurface,
    marginBottom: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleType: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: AmbColors.outline,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AmbRadius.pill,
  },
  statusActive: { backgroundColor: `${AmbColors.tertiaryContainer}18` },
  statusInactive: { backgroundColor: `${AmbColors.errorContainer}50` },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
  },

  // Meta row (driver + location)
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AmbColors.surfaceContainerHigh,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: AmbColors.onSurfaceVariant,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AmbColors.surfaceContainerHigh,
  },
  crewRow: { flexDirection: 'row' },
  crewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AmbColors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AmbColors.surfaceContainerLowest,
  },
  crewAvatarOverlap: { marginLeft: -8 },
  crewInitial: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: AmbColors.onSurfaceVariant,
  },
  maintenanceNote: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: AmbColors.error,
    fontStyle: 'italic',
  },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: AmbRadius.sm,
    backgroundColor: AmbColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: AmbRadius.lg,
    backgroundColor: AmbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...AmbShadow.elevated,
  },
});
