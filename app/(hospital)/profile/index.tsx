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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow, ButtonSize } from '@/src/shared/constants/theme';
import { SERVICES_KEY } from '@/src/features/services/services/storage';

const AUTH_KEY = '@jhilmil/auth_token';

export default function ProfileScreen() {
  const router = useRouter();

  async function handleSignOut() {
    await AsyncStorage.multiRemove([SERVICES_KEY, AUTH_KEY]);
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Profile header card */}
        <View style={styles.headerCard}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>LC</Text>
            </View>
            <View style={styles.avatarEditBtn}>
              <MaterialIcons name="edit" size={12} color="#fff" />
            </View>
          </View>

          <Text style={styles.name}>LifeCare Specialty</Text>
          <Text style={styles.designation}>Partner Hospital</Text>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => router.push('/profile/personal-details')}
            activeOpacity={0.75}>
            <Text style={styles.detailsBtnText}>View personal details</Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Menu list */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/profile/bank-details')}
            activeOpacity={0.7}>
            <View style={styles.menuIconWrap}>
              <MaterialIcons name="account-balance" size={20} color={Colors.light.onSurfaceVariant} />
            </View>
            <Text style={styles.menuLabel}>Bank Details</Text>
            <MaterialIcons name="chevron-right" size={22} color={Colors.light.outline} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/profile/privacy-policy')}
            activeOpacity={0.7}>
            <View style={styles.menuIconWrap}>
              <MaterialIcons name="policy" size={20} color={Colors.light.onSurfaceVariant} />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={22} color={Colors.light.outline} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color={Colors.light.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>App Version 2.4.1 (Build 108)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  // Header card
  headerCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.card,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primaryFixed,
    borderWidth: 2.5,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineMedium,
    color: Colors.light.primary,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.surfaceContainerLowest,
  },
  name: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.onSurface,
    marginBottom: 4,
    textAlign: 'center',
  },
  designation: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  detailsBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  // Menu card
  menuCard: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.light.onSurface,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.light.surfaceContainerLow,
    marginLeft: 72,
  },

  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.errorContainer,
    borderRadius: Radius.xl,
    height: ButtonSize.minHeight,
  },
  signOutText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.error,
  },

  // Version
  version: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
