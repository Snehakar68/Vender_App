import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow, ButtonSize } from '@/constants/theme';
import { DEPARTMENTS, Department } from '@/src/features/services/constants/departments';
import { loadSelectedServices } from '@/src/features/services/services/storage';
   
export default function YourServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadSelectedServices().then((ids) => {
        if (!active) return;
        if (ids.length === 0) {
          // router.replace('/(hospital)/services/select');
          router.replace('/services/select');
          return;
        }
        const depts = ids
          .map((id) => DEPARTMENTS.find((d) => d.id === id))
          .filter((d): d is Department => !!d);
        setServices(depts);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header row */}
        <Text style={styles.overviewLabel}>OVERVIEW</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Your Services</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(hospital)/services/select')}
            activeOpacity={0.75}>
            <MaterialIcons name="edit" size={14} color={Colors.light.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Service list */}
        <View style={styles.serviceList}>
          {services.map((dept, index) => (
            <React.Fragment key={dept.id}>
              <View style={styles.serviceRow}>
                <View style={styles.iconWrap}>
                  <MaterialIcons name={dept.icon as any} size={22} color={Colors.light.primary} />
                </View>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceName}>{dept.name}</Text>
                  <Text style={styles.serviceDesc}>{dept.description}</Text>
                </View>
                <MaterialIcons
                  name="north-east"
                  size={18}
                  color={Colors.light.onSurfaceVariant}
                  style={styles.arrowIcon}
                />
              </View>
              {index < services.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* General Care card */}
        <View style={styles.generalCareCard}>
          <TouchableOpacity style={styles.generalCarePlus} activeOpacity={0.7}>
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.generalCareIcon}>
            <MaterialIcons name="medical-services" size={24} color="#fff" />
          </View>
          <Text style={styles.generalCareTitle}>General Care</Text>
          <Text style={styles.generalCareDesc}>Routine checkups and medical consultations.</Text>
        </View>

        {/* Urgent consultation banner */}
        <View style={styles.urgentBanner}>
          <View style={styles.urgentText}>
            <Text style={styles.urgentTitle}>Need an urgent consultation?</Text>
            <Text style={styles.urgentDesc}>Connect with our top specialists in minutes.</Text>
          </View>
          <TouchableOpacity style={styles.bookNowBtn} activeOpacity={0.8}>
            <Text style={styles.bookNowText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.lg }} />
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
  },

  overviewLabel: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineLarge,
    color: Colors.light.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    ...Shadow.subtle,
  },
  editBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  serviceList: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  serviceText: {
    flex: 1,
  },
  serviceName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
    marginBottom: 2,
  },
  serviceDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 18,
  },
  arrowIcon: {
    marginLeft: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.outlineVariant,
    marginLeft: 64,
  },

  generalCareCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 110,
    justifyContent: 'flex-end',
    ...Shadow.card,
  },
  generalCarePlus: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalCareIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  generalCareTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: '#fff',
    marginBottom: 2,
  },
  generalCareDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },

  urgentBanner: {
    backgroundColor: Colors.light.inverseSurface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'column',
    gap: Spacing.md,
  },
  urgentText: {
    flex: 1,
  },
  urgentTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.inverseOnSurface,
    marginBottom: 4,
  },
  urgentDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: 'rgba(238,241,246,0.8)',
  },
  bookNowBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: Colors.light.inverseOnSurface,
    borderRadius: Radius.xl,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  bookNowText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.inverseOnSurface,
  },
});
