import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow, ButtonSize } from '@/constants/theme';
import { DEPARTMENTS, Department } from '@/src/features/services/constants/departments';
import { loadSelectedServices, saveSelectedServices } from '@/src/features/services/services/storage';

export default function SelectServicesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSelectedServices().then((ids) => {
      setSelected(new Set(ids));
    });
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleUpdate() {
    await saveSelectedServices([...selected]);
     router.replace('/(hospital)/services/your-services');
  }

  function renderItem({ item }: ListRenderItemInfo<Department>) {
    const isSelected = selected.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggle(item.id)}
        activeOpacity={0.75}>
        {/* Check indicator */}
        <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
          {isSelected && <MaterialIcons name="check" size={14} color="#fff" />}
        </View>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <MaterialIcons
            name={item.icon as any}
            size={22}
            color={isSelected ? Colors.light.primary : Colors.light.onSurfaceVariant}
          />
        </View>

        {/* Text */}
        <Text style={[styles.cardName, isSelected && styles.cardNameSelected]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardSpecialty} numberOfLines={1}>
          {item.specialty}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Services</Text>
        <Text style={styles.subtitle}>
          Choose the departments you wish to subscribe to for homecare assistance.
        </Text>
      </View>

      <FlatList
        data={DEPARTMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Update button */}
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} activeOpacity={0.85}>
          <Text style={styles.updateBtnText}>Update Services</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineLarge,
    color: Colors.light.onSurface,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 20,
  },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.card,
  },
  cardSelected: {
    borderColor: Colors.light.primary,
  },

  checkCircle: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkCircleSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  cardName: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
    marginBottom: 2,
  },
  cardNameSelected: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.light.primary,
  },
  cardSpecialty: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
  },

  btnContainer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    height: ButtonSize.minHeight,
    ...Shadow.elevated,
  },
  updateBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: '#fff',
  },
});
