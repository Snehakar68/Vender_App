import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import { useAmbulanceContext } from '@/src/features/ambulance/context/AmbulanceContext';
import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddDriverScreen() {
  const { mode = 'add', id } = useLocalSearchParams<{ mode?: string; id?: string }>();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const { addDriver, updateDriver, getDriverById } = useAmbulanceContext();

  // Personal Information
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // License Information
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [licenseDocUri, setLicenseDocUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Prefill when viewing or editing
  useEffect(() => {
    if ((isView || isEdit) && id) {
      const driver = getDriverById(id);
      if (driver) {
        setName(driver.name);
        setPhone(driver.phone ?? '');
        setLicenseNumber(driver.licenseNumber);
        setLicenseExpiry(driver.licenseExpiry ?? '');
        if (driver.photoUri) setPhotoUri(driver.photoUri);
        if (driver.licenseDocUri) setLicenseDocUri(driver.licenseDocUri);
      }
    }
  }, [id, mode]);

  const pickPhoto = async () => {
    if (isView) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const pickLicenseDoc = async () => {
    if (isView) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) setLicenseDocUri(result.assets[0].uri);
  };

  const handleDateChange = (_: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setLicenseExpiry(date.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter the driver name.');
      return;
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Validation', 'Please enter the license number.');
      return;
    }

    if (isEdit && id) {
      updateDriver(id, {
        name: name.trim(),
        initials: buildInitials(name),
        phone: phone.trim() || undefined,
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: licenseExpiry || undefined,
        photoUri: photoUri ?? undefined,
        licenseDocUri: licenseDocUri ?? undefined,
      });
    } else {
      addDriver({
        name: name.trim(),
        initials: buildInitials(name),
        phone: phone.trim() || undefined,
        licenseNumber: licenseNumber.trim(),
        licenseExpiry: licenseExpiry || undefined,
        photoUri: photoUri ?? undefined,
        licenseDocUri: licenseDocUri ?? undefined,
        status: 'Offline',
        assignedAmbulance: 'Unassigned',
      });
    }
    router.back();
  };

  const headerTitle = isView ? 'View Driver' : isEdit ? 'Edit Driver' : 'Add Driver';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TransactionalHeader title={headerTitle} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Mode badge ───────────────────────────────────────────── */}
          {isView && (
            <View style={styles.viewModeBanner}>
              <MaterialIcons name="visibility" size={16} color={AmbColors.primary} />
              <Text style={styles.viewModeBannerText}>Read-only view</Text>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* SECTION 1: Personal Information                            */}
          {/* ══════════════════════════════════════════════════════════ */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.formCard}>
            {/* Profile photo */}
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={styles.photoCircle}
                onPress={pickPhoto}
                activeOpacity={isView ? 1 : 0.7}
                disabled={isView}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImage} />
                ) : (
                  <MaterialIcons name="camera-alt" size={28} color={`${AmbColors.primary}80`} />
                )}
              </TouchableOpacity>
              <Text style={styles.photoHint}>
                {isView ? (photoUri ? 'Profile photo' : 'No photo') : 'Tap to add photo'}
              </Text>
            </View>

            {/* Driver Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="person" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rahul Singh"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isView}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="phone" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isView}
                />
              </View>
            </View>
          </View>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* SECTION 2: License Information                             */}
          {/* ══════════════════════════════════════════════════════════ */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumberBadge}>
              <Text style={styles.sectionNumberText}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>License Information</Text>
          </View>

          <View style={styles.formCard}>
            {/* License Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>LICENSE NUMBER</Text>
              <View style={[styles.inputRow, isView && styles.inputDisabled]}>
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="badge" size={18} color={AmbColors.primary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. DL-12345"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  autoCapitalize="characters"
                  editable={!isView}
                />
              </View>
            </View>

            {/* License Expiry */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>LICENSE EXPIRY DATE</Text>
              <TouchableOpacity
                style={[styles.dateRow, isView && styles.inputDisabled]}
                onPress={() => !isView && setShowDatePicker(true)}
                activeOpacity={isView ? 1 : 0.7}
              >
                <View style={styles.inputIconBox}>
                  <MaterialIcons name="calendar-today" size={18} color={AmbColors.primary} />
                </View>
                <Text style={[styles.dateText, !licenseExpiry && styles.datePlaceholder]}>
                  {licenseExpiry || 'Select expiry date'}
                </Text>
                {!isView && (
                  <MaterialIcons name="expand-more" size={20} color={AmbColors.outline} style={styles.dateChevron} />
                )}
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  value={licenseExpiry ? new Date(licenseExpiry) : new Date()}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* License Document Upload */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>LICENSE DOCUMENT</Text>
              <TouchableOpacity
                style={[styles.docUploadBox, licenseDocUri && styles.docUploadBoxDone]}
                onPress={pickLicenseDoc}
                activeOpacity={isView ? 1 : 0.7}
                disabled={isView}
              >
                {licenseDocUri ? (
                  <View style={styles.docUploadedRow}>
                    <MaterialIcons name="check-circle" size={22} color={AmbColors.tertiary} />
                    <Text style={styles.docUploadedName} numberOfLines={1}>
                      {licenseDocUri.split('/').pop()}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.docUploadPlaceholder}>
                    <MaterialIcons name="upload-file" size={28} color={`${AmbColors.outline}60`} />
                    <Text style={styles.docUploadLabel}>
                      {isView ? 'No document uploaded' : 'Tap to upload license copy'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Availability info ────────────────────────────────────── */}
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityLeft}>
              <MaterialIcons name="schedule" size={20} color={AmbColors.tertiary} />
              <View>
                <Text style={styles.availabilityTitle}>Availability</Text>
                <Text style={styles.availabilitySub}>
                  {isView ? 'Schedule not configured' : 'Set working hours after adding driver'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={`${AmbColors.secondary}66`} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Footer submit (hidden in view mode) ─────────────────────── */}
      {!isView && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <MaterialIcons name={isEdit ? 'save' : 'person-add'} size={20} color="#fff" />
            <Text style={styles.submitBtnText}>
              {isEdit ? 'Save Changes' : 'Add Driver'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  // View mode banner
  viewModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${AmbColors.primary}10`,
    borderRadius: AmbRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  viewModeBannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: AmbColors.primary,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AmbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumberText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: AmbColors.onSurface,
  },

  // Form card
  formCard: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 20,
    gap: 18,
    marginBottom: 20,
    ...AmbShadow.subtle,
  },

  // Photo
  photoSection: { alignItems: 'center', gap: 10 },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AmbColors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    overflow: 'hidden',
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: `${AmbColors.outline}aa`,
  },

  // Field
  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: AmbColors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    paddingRight: 14,
    overflow: 'hidden',
  },
  inputDisabled: {
    backgroundColor: AmbColors.surfaceContainerHighest,
    opacity: 0.7,
  },
  inputIconBox: {
    width: 46,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${AmbColors.primary}10`,
  },
  textInput: {
    flex: 1,
    paddingLeft: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },

  // Date picker row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    overflow: 'hidden',
  },
  dateText: {
    flex: 1,
    paddingLeft: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  datePlaceholder: {
    color: `${AmbColors.outline}80`,
  },
  dateChevron: { marginRight: 12 },

  // Document upload
  docUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
  },
  docUploadBoxDone: {
    borderColor: AmbColors.tertiary,
    borderStyle: 'solid',
    backgroundColor: `${AmbColors.tertiary}08`,
  },
  docUploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  docUploadedName: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: AmbColors.tertiary,
  },
  docUploadPlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  docUploadLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: `${AmbColors.outline}bb`,
  },

  // Availability card
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 18,
    ...AmbShadow.subtle,
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  availabilitySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: AmbColors.secondary,
    marginTop: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AmbColors.surfaceContainerLowest,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...AmbShadow.elevated,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 54,
    backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.md,
    ...AmbShadow.card,
  },
  submitBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});
