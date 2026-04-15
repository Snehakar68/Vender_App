import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AmbColors, AmbRadius } from '../constants/ambulanceTheme';

interface TransactionalHeaderProps {
  title: string;
  onBack: () => void;
  rightElement?: React.ReactNode;
}

export default function TransactionalHeader({
  title,
  onBack,
  rightElement,
}: TransactionalHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <MaterialIcons name="arrow-back" size={22} color={AmbColors.onSurface} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {rightElement ? (
        <View style={styles.rightSlot}>{rightElement}</View>
      ) : (
        <View style={styles.rightSlot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AmbColors.surfaceContainerLowest,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: AmbRadius.md,
    backgroundColor: AmbColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: AmbColors.onSurface,
    textAlign: 'center',
    marginRight: 8,
  },
  rightSlot: {
    width: 40,
  },
});
