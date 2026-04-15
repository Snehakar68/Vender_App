import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AmbColors, AmbRadius } from '../constants/ambulanceTheme';
import {
  Colors,
  Radius,
  Spacing,
  Shadow,
  FontFamily,
  FontSize,
} from "@/src/shared/constants/theme";
import { Image } from 'expo-image';
interface AmbulanceTopBarProps {
  showNotification?: boolean;
  avatarInitials?: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

export default function AmbulanceTopBar({
  showNotification = false,
  avatarInitials = 'JH',
  onNotificationPress,
  onAvatarPress,
}: AmbulanceTopBarProps) {
  return (
    <View style={styles.container}>
      {/* Brand Left */}
      {/* <View style={styles.brand}>
        <MaterialIcons name="healing" size={22} color="#0f766e" />
        <Text style={styles.brandText}>Jhilmil Homecare</Text>
      </View> */}
       <View style={styles.headerBrand}>
                  <View style={styles.headerIcon}>
                    <Image
                      source={require("@/src/assets/images/logo.png")}
                      style={{ width: 40, height: 40 }}
                    />
                  </View>
                  <Text style={styles.headerTitle}>Jhilmil Homecare</Text>
                </View>

      {/* Right Actions */}
      <View style={styles.rightRow}>
        {showNotification && (
          <TouchableOpacity style={styles.notifBtn} onPress={onNotificationPress}>
            <MaterialIcons name="notifications" size={22} color={AmbColors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.avatar} onPress={onAvatarPress}>
          <Text style={styles.avatarText}>{avatarInitials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
   headerBrand: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    headerIcon: {
      width: 32,
      height: 32,
      borderRadius: Radius.sm,
      backgroundColor: Colors.light.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: FontFamily.headlineSemiBold,
      fontSize: FontSize.titleSmall,
      color: Colors.light.onSurface,
      fontWeight:"600"
    },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0f766e',
    letterSpacing: -0.3,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: AmbRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${AmbColors.primary}15`,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AmbColors.primaryFixed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AmbColors.surfaceContainerLow,
  },
  avatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: AmbColors.primary,
  },
});
