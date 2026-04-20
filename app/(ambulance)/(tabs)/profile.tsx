import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import AmbulanceTopBar from '@/src/features/ambulance/components/AmbulanceTopBar';
import { AuthContext } from "@/src/core/context/AuthContext";
const STATS = [
  { value: '128', label: 'TRIPS', color: AmbColors.primary },
  { value: '4.9', label: 'RATING', color: AmbColors.tertiary },
  { value: '5y', label: 'EXP.', color: AmbColors.primaryContainer },
];

const NAV_ITEMS = [
  {
    label: 'Personal Details',
    sub: 'Contact, address, and bio',
    icon: 'person' as const,
    iconBg: `${AmbColors.primary}15`,
    iconColor: AmbColors.primary,
    route: '/(ambulance)/personal-information',
  },
  {
    label: 'Equipment & Facilities',
    sub: 'Advanced life support tools',
    icon: 'medical-services' as const,
    iconBg: `${AmbColors.primary}15`,
    iconColor: AmbColors.primary,
    route: '/(ambulance)/equipment-facilities',
  },
  {
    label: 'Bank Details',
    sub: 'Payouts and tax records',
    icon: 'account-balance' as const,
    iconBg: `${AmbColors.primary}15`,
    iconColor: AmbColors.primary,
    route: '/(ambulance)/bank-details',
  },
  {
    label: 'Live Tracking',
    sub: 'Real-time status updates',
    icon: 'near-me' as const,
    iconBg: `${AmbColors.tertiary}15`,
    iconColor: AmbColors.tertiary,
    route: '/(ambulance)/live-tracking',
  },
  {
    label: 'Trips and Bookings',
    sub: 'View past and future service',
    icon: 'history' as const,
    iconBg: `${AmbColors.primary}15`,
    iconColor: AmbColors.primary,
    route: '/(ambulance)/trips',
  },
  {
    label: 'Driver Assignment',
    sub: 'Linked ambulance personnel',
    icon: 'badge' as const,
    iconBg: `${AmbColors.primary}15`,
    iconColor: AmbColors.primary,
    route: '/(ambulance)/driver-assignment',
  },
];

export default function ProfileScreen() {
  const auth = useContext(AuthContext);
  const handleNavPress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert('Coming Soon', 'This section will be available soon.');
    }
  };
 const handleSignOut = async () => {
    await auth?.logout();
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AmbulanceTopBar showNotification avatarInitials="AS" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile hero ─────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Avatar with edit button */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>AS</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Dr. Aranya Sen</Text>
          <Text style={styles.profileRole}>Senior Emergency Lead</Text>

          {/* Stats grid */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Navigation hub ────────────────────────────────────────────── */}
        <View style={styles.navList}>
          {NAV_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.navItem, AmbShadow.card]}
              onPress={() => handleNavPress(item.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconBox, { backgroundColor: item.iconBg }]}>
                <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <View style={styles.navTextBlock}>
                <Text style={styles.navLabel}>{item.label}</Text>
                <Text style={styles.navSub}>{item.sub}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={`${AmbColors.secondary}66`}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ───────────────────────────────────────────────────── */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={16} color={AmbColors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>APP VERSION 2.4.0 (BUILD 501)</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingBottom: 24 },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AmbColors.primaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: AmbColors.surfaceContainerLow,
    ...AmbShadow.elevated,
  },
  avatarInitials: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 36,
    color: AmbColors.primary,
  },
  editBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AmbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: AmbColors.onSurface,
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: AmbColors.secondary,
    letterSpacing: 0.3,
    marginBottom: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: AmbColors.surfaceContainerLow,
    padding: 14,
    borderRadius: AmbRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
  },
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: AmbColors.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Nav hub
  navList: { paddingHorizontal: 20, gap: 12 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xxl,
    gap: 14,
  },
  navIconBox: {
    width: 48,
    height: 48,
    borderRadius: AmbRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  navTextBlock: { flex: 1 },
  navLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: AmbColors.onSurface,
    marginBottom: 2,
  },
  navSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: AmbColors.secondary,
  },

  // Logout
  dangerZone: { alignItems: 'center', marginTop: 40, paddingHorizontal: 24 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: AmbRadius.pill,
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: AmbColors.error,
  },
  versionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: `${AmbColors.secondary}80`,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
  },
});
