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
  Dimensions,
  Alert,
  Image,
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

type AmbType = 'Basic' | 'Advanced' | '';

const UPLOAD_SLOTS = [
  { label: 'Registration', icon: 'description' as const },
  { label: 'Insurance', icon: 'shield' as const },
  { label: 'Fitness Cert.', icon: 'fact-check' as const },
  { label: 'Permit', icon: 'approval' as const },
];

const VALIDITY_LABELS = ['Insurance Expiry', 'Fitness Expiry', 'Permit Expiry'];
const VALIDITY_ICONS = ['shield', 'fact-check', 'approval'] as const;

export default function AddAmbulanceScreen() {
  const { mode = 'add', id } = useLocalSearchParams<{ mode?: string; id?: string }>();
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const { addAmbulance, updateAmbulance, getAmbulanceById } = useAmbulanceContext();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ambType, setAmbType] = useState<AmbType>('');
  const [ratePerKm, setRatePerKm] = useState('');
  const [minRate, setMinRate] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [docUris, setDocUris] = useState<(string | null)[]>([null, null, null, null]);
  const [validityDates, setValidityDates] = useState<string[]>(['', '', '']);
  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);

  // Prefill form when editing or viewing
  useEffect(() => {
    if ((isView || isEdit) && id) {
      const amb = getAmbulanceById(id);
      if (amb) {
        setVehicleNumber(amb.vehicleNumber);
        setAmbType(amb.type);
        setRatePerKm(String(amb.ratePerKm));
        if (amb.photoUri) setPhotoUri(amb.photoUri);
        setValidityDates([
          amb.insuranceExpiry ?? '',
          amb.fitnessExpiry ?? '',
          amb.permitExpiry ?? '',
        ]);
      }
    }
  }, [id, mode]);

  const pickPhoto = async () => {
    if (isView) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const pickDoc = async (index: number) => {
    if (isView) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      const updated = [...docUris];
      updated[index] = result.assets[0].uri;
      setDocUris(updated);
    }
  };

  const handleDateChange = (index: number, date?: Date) => {
    setShowDatePicker(null);
    if (date) {
      const iso = date.toISOString().split('T')[0];
      const updated = [...validityDates];
      updated[index] = iso;
      setValidityDates(updated);
    }
  };

  const handleSubmit = () => {
    if (!vehicleNumber.trim()) {
      Alert.alert('Validation', 'Please enter the vehicle number.');
      return;
    }
    if (!ambType) {
      Alert.alert('Validation', 'Please select an ambulance type.');
      return;
    }

    const payload = {
      vehicleNumber: vehicleNumber.trim(),
      type: ambType as 'Basic' | 'Advanced',
      ratePerKm: Number(ratePerKm) || 0,
      status: 'Active' as const,
      crewInitials: [],
      photoUri: photoUri ?? undefined,
      insuranceExpiry: validityDates[0] || undefined,
      fitnessExpiry: validityDates[1] || undefined,
      permitExpiry: validityDates[2] || undefined,
    };

    if (isEdit && id) {
      updateAmbulance(id, payload);
    } else {
      addAmbulance(payload);
    }
    router.back();
  };

  const headerTitle = isView ? 'View Ambulance' : isEdit ? 'Edit Ambulance' : 'Add Ambulance';

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
          {/* ── Hero photo card ──────────────────────────────────────── */}
          <TouchableOpacity style={styles.heroCard} onPress={pickPhoto} activeOpacity={isView ? 1 : 0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <View style={styles.heroPlaceholder}>
                <MaterialIcons name="add-a-photo" size={36} color={`${AmbColors.primary}60`} />
                <Text style={styles.heroPlaceholderText}>
                  {isView ? 'No photo added' : 'Tap to add vehicle photo'}
                </Text>
              </View>
            )}
            <View style={styles.heroLabel}>
              <Text style={styles.heroLabelSub}>
                {isView ? 'VIEW MODE' : isEdit ? 'EDIT ENTRY' : 'NEW ENTRY'}
              </Text>
              <Text style={styles.heroLabelTitle}>Fleet Management</Text>
            </View>
          </TouchableOpacity>

          {/* ── Vehicle info ─────────────────────────────────────────── */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Vehicle Information</Text>

            {/* Vehicle number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>VEHICLE NUMBER</Text>
              <View style={[styles.inputWrapper, isView && styles.inputDisabled]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. MH 12 AB 1234"
                  placeholderTextColor={`${AmbColors.outline}80`}
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  autoCapitalize="characters"
                  editable={!isView}
                />
              </View>
            </View>

            {/* Ambulance type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>AMBULANCE TYPE</Text>
              <View style={styles.typeSelector}>
                {(['Basic', 'Advanced'] as AmbType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, ambType === t && styles.typeBtnActive]}
                    onPress={() => !isView && setAmbType(t)}
                    activeOpacity={isView ? 1 : 0.8}
                    disabled={isView}
                  >
                    <Text style={[styles.typeBtnText, ambType === t && styles.typeBtnTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rate + Min rate */}
            <View style={styles.rateRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>RATE / KM</Text>
                <View style={[styles.prefixInputWrapper, isView && styles.inputDisabled]}>
                  <Text style={styles.prefix}>₹</Text>
                  <TextInput
                    style={styles.prefixInput}
                    placeholder="0"
                    placeholderTextColor={`${AmbColors.outline}80`}
                    value={ratePerKm}
                    onChangeText={setRatePerKm}
                    keyboardType="numeric"
                    editable={!isView}
                  />
                </View>
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>MINIMUM FARE</Text>
                <View style={[styles.prefixInputWrapper, isView && styles.inputDisabled]}>
                  <Text style={styles.prefix}>₹</Text>
                  <TextInput
                    style={styles.prefixInput}
                    placeholder="0"
                    placeholderTextColor={`${AmbColors.outline}80`}
                    value={minRate}
                    onChangeText={setMinRate}
                    keyboardType="numeric"
                    editable={!isView}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ── Document uploads ─────────────────────────────────────── */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Digital Compliance</Text>
            <Text style={styles.cardSectionSub}>
              {isView ? 'Uploaded documents' : 'Upload required documents'}
            </Text>
            <View style={styles.uploadGrid}>
              {UPLOAD_SLOTS.map((slot, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.uploadBox, docUris[i] && styles.uploadBoxDone]}
                  onPress={() => pickDoc(i)}
                  activeOpacity={isView ? 1 : 0.7}
                  disabled={isView}
                >
                  {docUris[i] ? (
                    <>
                      <MaterialIcons name="check-circle" size={24} color={AmbColors.tertiary} />
                      <Text style={[styles.uploadLabel, { color: AmbColors.tertiary }]} numberOfLines={1}>
                        {docUris[i]!.split('/').pop()}
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name={slot.icon} size={28} color={`${AmbColors.outline}60`} />
                      <Text style={styles.uploadLabel}>{slot.label}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Validity dates ───────────────────────────────────────── */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Validity Dates</Text>
            {VALIDITY_LABELS.map((label, i) => (
              <View key={i}>
                <TouchableOpacity
                  style={styles.validityRow}
                  onPress={() => !isView && setShowDatePicker(i)}
                  activeOpacity={isView ? 1 : 0.7}
                >
                  <View style={styles.validityLeft}>
                    <View style={styles.validityIconBox}>
                      <MaterialIcons name={VALIDITY_ICONS[i]} size={18} color={AmbColors.primary} />
                    </View>
                    <Text style={styles.validityLabel}>{label}</Text>
                  </View>
                  <View style={styles.validityRight}>
                    <Text style={[styles.validityDateText, !validityDates[i] && styles.validityPlaceholder]}>
                      {validityDates[i] || 'Select date'}
                    </Text>
                    {!isView && (
                      <MaterialIcons name="calendar-today" size={16} color={AmbColors.outline} />
                    )}
                  </View>
                </TouchableOpacity>

                {showDatePicker === i && (
                  <DateTimePicker
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    value={validityDates[i] ? new Date(validityDates[i]) : new Date()}
                    onChange={(_, date) => handleDateChange(i, date)}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Footer submit button (hidden in view mode) ────────────────── */}
      {!isView && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.submitBtnText}>
              {isEdit ? 'Save Changes' : 'Add to Fleet'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  // Hero card
  heroCard: {
    height: 160,
    borderRadius: AmbRadius.xl,
    backgroundColor: AmbColors.surfaceContainerHigh,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  heroPlaceholderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: `${AmbColors.primary}80`,
  },
  heroLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${AmbColors.primary}88`,
    padding: 14,
  },
  heroLabelSub: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  heroLabelTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },

  // Card sections
  cardSection: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 20,
    marginBottom: 14,
    gap: 16,
    ...AmbShadow.subtle,
  },
  cardSectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: AmbColors.onSurface,
  },
  cardSectionSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: AmbColors.secondary,
    marginTop: -10,
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
  inputWrapper: {
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  inputDisabled: {
    backgroundColor: AmbColors.surfaceContainerHighest,
    opacity: 0.7,
  },
  textInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },

  // Type selector
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: AmbRadius.md,
    borderWidth: 1.5,
    borderColor: AmbColors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
  },
  typeBtnActive: {
    backgroundColor: AmbColors.primary,
    borderColor: AmbColors.primary,
  },
  typeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: AmbColors.onSurfaceVariant,
  },
  typeBtnTextActive: { color: '#ffffff' },

  // Rate inputs
  rateRow: { flexDirection: 'row', gap: 12 },
  prefixInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    paddingHorizontal: 14,
    gap: 6,
  },
  prefix: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: AmbColors.secondary,
  },
  prefixInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },

  // Upload grid
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  uploadBox: {
    width: (SCREEN_WIDTH - 40 - 40 - 12) / 2,
    height: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AmbColors.surfaceContainerLow,
  },
  uploadBoxDone: {
    borderColor: AmbColors.tertiary,
    borderStyle: 'solid',
    backgroundColor: `${AmbColors.tertiary}08`,
  },
  uploadLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: `${AmbColors.outline}bb`,
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // Validity rows
  validityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    padding: 14,
  },
  validityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  validityIconBox: {
    width: 36,
    height: 36,
    borderRadius: AmbRadius.sm,
    backgroundColor: `${AmbColors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validityLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: AmbColors.onSurface,
  },
  validityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validityDateText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: AmbColors.secondary,
  },
  validityPlaceholder: {
    color: `${AmbColors.outline}80`,
    fontFamily: 'Inter_400Regular',
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
