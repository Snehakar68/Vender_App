import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';

export interface ActionModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor?: string;
}

export default function ActionModal({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  // onCancel,
  iconName = 'check-circle',
  iconColor,
}: ActionModalProps) {
  const resolvedIconColor = iconColor ?? AmbColors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: `${resolvedIconColor}18` }]}>
            <MaterialIcons name={iconName} size={32} color={resolvedIconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>{confirmText}</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.btn, styles.btnOutlined]}
            onPress={onCancel}
            activeOpacity={0.75}
          >
            <Text style={styles.btnOutlinedText}>{cancelText}</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: AmbRadius.xxl,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    ...AmbShadow.elevated,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: AmbColors.onSurface,
    textAlign: 'center',
    lineHeight: 26,
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: AmbRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: AmbColors.primary,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  btnOutlined: {
    borderWidth: 1,
    borderColor: AmbColors.outlineVariant,
    backgroundColor: '#ffffff',
  },
  btnOutlinedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: AmbColors.onSurface,
  },
});
