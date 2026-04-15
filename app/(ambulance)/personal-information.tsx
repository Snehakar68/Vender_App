import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';
import { AuthContext } from '@/src/core/context/AuthContext';

const BASE_URL = 'https://coreapi-service-111763741518.asia-south1.run.app';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Other', value: 'O' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DEFAULT_FORM = {
  name: '', gender: '', dob: '', email: '',
  phone: '', altPhone: '', bloodGroup: '',
  addr1: '', addr2: '', city: '', state: '', pin: '',
  adhaarNo: '', panNo: '',
};

// Convert base64 string to a temporary file URI for FormData submission
async function base64ToTempUri(base64: string, filename: string): Promise<string> {
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

export default function PersonalInformationScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? '';

  const [form, setForm] = useState(DEFAULT_FORM);
  const [backupForm, setBackupForm] = useState(DEFAULT_FORM);

  // Photo state
  const [photoUri, setPhotoUri] = useState<string | null>(null);       // newly picked
  const [photoBase64, setPhotoBase64] = useState<string | null>(null); // from API
  // PAN doc state
  const [panUri, setPanUri] = useState<string | null>(null);
  const [panBase64, setPanBase64] = useState<string | null>(null);
  const [panIsPdf, setPanIsPdf] = useState(false);
  // Aadhaar doc state
  const [adhaarUri, setAdhaarUri] = useState<string | null>(null);
  const [adhaarBase64, setAdhaarBase64] = useState<string | null>(null);
  const [adhaarIsPdf, setAdhaarIsPdf] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);

  // ── Fetch data on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/Ambulance/GetAmbulance_Owner_ById/${vendorId}`)
      .then(r => r.json())
      .then(data => {
        const d = data || {};
        const isPdfB64 = (b64 = '') => b64.startsWith('JVBER');
        const docs = d.ambulanceDocs ?? {};

        const mapped = {
          name: d.full_Name ?? '',
          gender: d.gender ?? '',
          dob: d.dob?.split('T')[0] ?? '',
          email: d.email ?? '',
          phone: d.mobile ?? '',
          altPhone: d.mobile_1 ?? '',
          bloodGroup: d.bloodG ?? '',
          addr1: d.adrs_1 ?? '',
          addr2: d.adrs_2 ?? '',
          city: d.city ?? '',
          state: d.state ?? '',
          pin: d.pin_code ?? '',
          adhaarNo: d.adhaarNo ?? '',
          panNo: d.panNo ?? '',
        };
        setForm(mapped);
        setBackupForm(mapped);

        if (docs.photo) setPhotoBase64(docs.photo);
        if (docs.pan) {
          if (isPdfB64(docs.pan)) setPanIsPdf(true);
          else setPanBase64(docs.pan);
        }
        if (docs.adhaar) {
          if (isPdfB64(docs.adhaar)) setAdhaarIsPdf(true);
          else setAdhaarBase64(docs.adhaar);
        }
      })
      .catch(e => console.error('Fetch personal info:', e))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // ── Success message auto-dismiss ─────────────────────────────────────────
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // ── Field setter ─────────────────────────────────────────────────────────
  const setField = (key: keyof typeof DEFAULT_FORM, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ── Edit toggle ──────────────────────────────────────────────────────────
  const handleEditToggle = () => {
    if (isEditing) {
      setForm(backupForm);
      setErrors({});
      setSuccessMsg('');
      setIsEditing(false);
    } else {
      setBackupForm(form);
      setErrors({});
      setSuccessMsg('');
      setIsEditing(true);
    }
  };

  // ── Image pickers ────────────────────────────────────────────────────────
  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(null);
    }
  };

  const pickPanDoc = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, quality: 0.8,
    });
    if (!result.canceled) {
      setPanUri(result.assets[0].uri);
      setPanBase64(null);
      setPanIsPdf(false);
    }
  };

  const pickAdhaarDoc = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, quality: 0.8,
    });
    if (!result.canceled) {
      setAdhaarUri(result.assets[0].uri);
      setAdhaarBase64(null);
      setAdhaarIsPdf(false);
    }
  };

  // ── DOB picker handler ───────────────────────────────────────────────────
  const handleDobChange = (_: any, date?: Date) => {
    setShowDobPicker(false);
    if (date) setField('dob', date.toISOString().split('T')[0]);
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Full Name is required';
    else if (!/^[A-Za-z\s]+$/.test(form.name)) err.name = 'Only alphabets allowed';
    if (!form.gender) err.gender = 'Gender is required';
    if (!form.dob) err.dob = 'Date of Birth is required';
    if (!form.email) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email format';
    if (!form.phone) err.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) err.phone = 'Phone must be 10 digits';
    if (form.altPhone && !/^\d{10}$/.test(form.altPhone)) err.altPhone = 'Alt phone must be 10 digits';
    if (!form.addr1.trim()) err.addr1 = 'Address Line 1 is required';
    if (!form.city.trim()) err.city = 'City is required';
    if (!form.state.trim()) err.state = 'State is required';
    if (!form.pin) err.pin = 'PIN code is required';
    else if (!/^\d{6}$/.test(form.pin)) err.pin = 'PIN must be 6 digits';
    if (!form.adhaarNo) err.adhaarNo = 'Aadhaar number required';
    else if (!/^\d{12}$/.test(form.adhaarNo)) err.adhaarNo = 'Aadhaar must be 12 digits';
    if (!form.panNo) err.panNo = 'PAN number required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo)) err.panNo = 'Invalid PAN format (e.g. ABCDE1234F)';
    if (!photoUri && !photoBase64) err.photo = 'Profile photo is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!vendorId) { Alert.alert('Error', 'Vendor ID not found. Please log in again.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('vendor_id', vendorId);
      fd.append('full_name', form.name.trim());
      fd.append('Gender', form.gender);
      fd.append('dob', form.dob);
      fd.append('email', form.email.trim());
      fd.append('mobile', form.phone);
      fd.append('mobile_1', form.altPhone || form.phone);
      fd.append('BloodG', form.bloodGroup || 'O+');
      fd.append('adrs_1', form.addr1.trim());
      fd.append('adrs_2', form.addr2.trim() || 'NA');
      fd.append('City', form.city.trim());
      fd.append('State', form.state.trim());
      fd.append('pin_code', form.pin);
      fd.append('adhaarNo', form.adhaarNo);
      fd.append('panNo', form.panNo);

      // Photo
      if (photoUri) {
        fd.append('photo', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' } as any);
      } else if (photoBase64) {
        const tmpUri = await base64ToTempUri(photoBase64, 'photo.jpg');
        fd.append('photo', { uri: tmpUri, name: 'photo.jpg', type: 'image/jpeg' } as any);
      }

      // Aadhaar doc
      if (adhaarUri) {
        fd.append('adhaar', { uri: adhaarUri, name: 'adhaar.jpg', type: 'image/jpeg' } as any);
      } else if (adhaarBase64) {
        const tmpUri = await base64ToTempUri(adhaarBase64, 'adhaar.jpg');
        fd.append('adhaar', { uri: tmpUri, name: 'adhaar.jpg', type: 'image/jpeg' } as any);
      }

      // PAN doc
      if (panUri) {
        fd.append('pan', { uri: panUri, name: 'pan.jpg', type: 'image/jpeg' } as any);
      } else if (panBase64) {
        const tmpUri = await base64ToTempUri(panBase64, 'pan.jpg');
        fd.append('pan', { uri: tmpUri, name: 'pan.jpg', type: 'image/jpeg' } as any);
      }

      const res = await fetch(`${BASE_URL}/api/Ambulance/UpdateAmbulance_Owner_Info`, {
        method: 'POST',
        body: fd,
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data?.error || data?.message || 'Update failed');

      setSuccessMsg(data?.message || 'Personal information updated successfully');
      setBackupForm(form);
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Photo source ─────────────────────────────────────────────────────────
  const photoSource = photoUri
    ? { uri: photoUri }
    : photoBase64
      ? { uri: `data:image/jpeg;base64,${photoBase64}` }
      : null;

  const initials = form.name.trim()
    ? form.name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'PI';

  // ── Helpers ──────────────────────────────────────────────────────────────
  const InputField = ({
    label, field, placeholder, keyboardType, maxLength, autoCapitalize, required,
  }: {
    label: string; field: keyof typeof DEFAULT_FORM; placeholder?: string;
    keyboardType?: any; maxLength?: number; autoCapitalize?: any; required?: boolean;
  }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder || label}
          placeholderTextColor={`${AmbColors.outline}70`}
          value={form[field]}
          onChangeText={v => setField(field, v)}
          editable={isEditing}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || 'sentences'}
        />
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TransactionalHeader title="Personal Information" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AmbColors.primary} />
          <Text style={styles.loadingText}>Loading information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TransactionalHeader
        title="Personal Information"
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={handleEditToggle}
            activeOpacity={0.8}
          >
            <Text style={[styles.editBtnText, isEditing && styles.editBtnTextActive]}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success banner */}
          {!!successMsg && (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={16} color={AmbColors.tertiary} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* ── Profile Hero ─────────────────────────────────────────────── */}
          <View style={styles.heroCard}>
            <TouchableOpacity
              style={styles.photoCircle}
              onPress={isEditing ? pickPhoto : undefined}
              activeOpacity={isEditing ? 0.8 : 1}
            >
              {photoSource ? (
                <Image source={photoSource} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoInitials}>{initials}</Text>
              )}
              {isEditing && (
                <View style={styles.photoBadge}>
                  <MaterialIcons name="camera-alt" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {errors.photo ? <Text style={[styles.errorText, { marginTop: 4 }]}>{errors.photo}</Text> : null}
            <Text style={styles.heroName}>{form.name || 'Ambulance Owner'}</Text>
            <Text style={styles.heroId}>ID: {vendorId || '—'}</Text>
          </View>

          {/* ── Basic Details ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Basic Details</Text>
            </View>

            <InputField label="Full Name" field="name" placeholder="Alex Thompson" required />

            {/* Gender chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>GENDER <Text style={styles.required}>*</Text></Text>
              <View style={styles.chipRow}>
                {GENDER_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optChip, form.gender === opt.value && styles.optChipActive]}
                    onPress={() => isEditing && setField('gender', opt.value)}
                    activeOpacity={isEditing ? 0.8 : 1}
                    disabled={!isEditing}
                  >
                    <Text style={[styles.optChipText, form.gender === opt.value && styles.optChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DATE OF BIRTH <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.dateRow, !isEditing && styles.inputDisabled]}
                onPress={() => isEditing && setShowDobPicker(true)}
                activeOpacity={isEditing ? 0.8 : 1}
              >
                <MaterialIcons name="cake" size={18} color={AmbColors.outline} />
                <Text style={[styles.dateText, !form.dob && styles.datePlaceholder]}>
                  {form.dob || 'Select date'}
                </Text>
                {isEditing && <MaterialIcons name="calendar-today" size={16} color={AmbColors.outline} />}
              </TouchableOpacity>
              {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
              {showDobPicker && (
                <DateTimePicker
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  value={form.dob ? new Date(form.dob) : new Date()}
                  onChange={handleDobChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Blood Group chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>BLOOD GROUP</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {BLOOD_GROUPS.map(bg => (
                    <TouchableOpacity
                      key={bg}
                      style={[styles.bloodChip, form.bloodGroup === bg && styles.bloodChipActive]}
                      onPress={() => isEditing && setField('bloodGroup', bg)}
                      activeOpacity={isEditing ? 0.8 : 1}
                      disabled={!isEditing}
                    >
                      <Text style={[styles.bloodChipText, form.bloodGroup === bg && styles.bloodChipTextActive]}>
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* ── Contact Information ──────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-phone" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <InputField label="Email Address" field="email" placeholder="alex@example.com"
              keyboardType="email-address" autoCapitalize="none" required />
            <InputField label="Phone Number" field="phone" placeholder="+91 88765 43210"
              keyboardType="phone-pad" maxLength={10} required />
            <InputField label="Alt Phone Number" field="altPhone" placeholder="+91 88765 43211"
              keyboardType="phone-pad" maxLength={10} />
          </View>

          {/* ── Residential Address ──────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Residential Address</Text>
            </View>
            <InputField label="Address Line 1" field="addr1" placeholder="42, Emerald Heights Residency" required />
            <InputField label="Address Line 2" field="addr2" placeholder="Near Central Park, Sector 15" />

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CITY <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Gurgaon"
                    placeholderTextColor={`${AmbColors.outline}70`}
                    value={form.city}
                    onChangeText={v => setField('city', v)}
                    editable={isEditing}
                  />
                </View>
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>STATE <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Haryana"
                    placeholderTextColor={`${AmbColors.outline}70`}
                    value={form.state}
                    onChangeText={v => setField('state', v)}
                    editable={isEditing}
                  />
                </View>
                {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
              </View>
            </View>

            <InputField label="PIN Code" field="pin" placeholder="122001"
              keyboardType="numeric" maxLength={6} required />
          </View>

          {/* ── Identity Documents ───────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="badge" size={16} color={AmbColors.primary} />
              <Text style={styles.sectionTitle}>Identity Documents</Text>
            </View>

            {/* Aadhaar */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>AADHAAR NUMBER <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="XXXX XXXX XXXX"
                  placeholderTextColor={`${AmbColors.outline}70`}
                  value={form.adhaarNo}
                  onChangeText={v => setField('adhaarNo', v.replace(/\D/g, '').slice(0, 12))}
                  editable={isEditing}
                  keyboardType="numeric"
                  maxLength={12}
                />
              </View>
              {errors.adhaarNo ? <Text style={styles.errorText}>{errors.adhaarNo}</Text> : null}
            </View>

            {/* Aadhaar doc */}
            <DocUploadBox
              label="Aadhaar Document"
              uri={adhaarUri}
              base64={adhaarBase64}
              isPdf={adhaarIsPdf}
              isEditing={isEditing}
              onPick={pickAdhaarDoc}
            />

            {/* PAN */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PAN NUMBER <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="ABCDE 1234 F"
                  placeholderTextColor={`${AmbColors.outline}70`}
                  value={form.panNo}
                  onChangeText={v => setField('panNo', v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  editable={isEditing}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
              {errors.panNo ? <Text style={styles.errorText}>{errors.panNo}</Text> : null}
            </View>

            {/* PAN doc */}
            <DocUploadBox
              label="PAN Document"
              uri={panUri}
              base64={panBase64}
              isPdf={panIsPdf}
              isEditing={isEditing}
              onPick={pickPanDoc}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Sticky Footer (edit mode only) ──────────────────────────────────── */}
      {isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="check-circle" size={20} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Doc Upload Box ───────────────────────────────────────────────────────────

function DocUploadBox({
  label, uri, base64, isPdf, isEditing, onPick,
}: {
  label: string;
  uri: string | null;
  base64: string | null;
  isPdf: boolean;
  isEditing: boolean;
  onPick: () => void;
}) {
  const hasDoc = !!(uri || base64 || isPdf);
  const imageSource = uri
    ? { uri }
    : base64 ? { uri: `data:image/jpeg;base64,${base64}` } : null;

  return (
    <TouchableOpacity
      style={[styles.docBox, hasDoc && styles.docBoxDone]}
      onPress={isEditing ? onPick : undefined}
      activeOpacity={isEditing ? 0.8 : 1}
      disabled={!isEditing}
    >
      {hasDoc ? (
        imageSource ? (
          <Image source={imageSource} style={styles.docThumb} resizeMode="cover" />
        ) : (
          <View style={styles.docPdfBadge}>
            <MaterialIcons name="picture-as-pdf" size={28} color={AmbColors.error} />
            <Text style={styles.docPdfText}>PDF Uploaded</Text>
          </View>
        )
      ) : (
        <View style={styles.docPlaceholder}>
          <MaterialIcons name="upload-file" size={28} color={`${AmbColors.outline}60`} />
          <Text style={styles.docPlaceholderText}>{isEditing ? `Upload ${label}` : `No ${label}`}</Text>
        </View>
      )}
      <View style={styles.docLabelRow}>
        <Text style={styles.docLabel}>{label}</Text>
        {hasDoc && <MaterialIcons name="check-circle" size={14} color={AmbColors.tertiary} />}
        {isEditing && !hasDoc && <MaterialIcons name="add" size={14} color={AmbColors.outline} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.secondary },

  // Success banner
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${AmbColors.tertiary}12`,
    borderWidth: 1, borderColor: `${AmbColors.tertiary}30`,
    borderRadius: AmbRadius.md, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14,
  },
  successText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: AmbColors.tertiary, flex: 1 },

  // Edit button in header
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: AmbRadius.pill,
    backgroundColor: `${AmbColors.primary}15`,
  },
  editBtnActive: { backgroundColor: `${AmbColors.error}15` },
  editBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: AmbColors.primary },
  editBtnTextActive: { color: AmbColors.error },

  // Hero card
  heroCard: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 24,
    marginBottom: 14,
    alignItems: 'center',
    gap: 6,
    ...AmbShadow.subtle,
  },
  photoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: AmbColors.primaryFixed,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
    borderWidth: 3, borderColor: AmbColors.surfaceContainerLow,
    ...AmbShadow.card,
  },
  photoImage: { width: 100, height: 100 },
  photoInitials: { fontFamily: 'Inter_600SemiBold', fontSize: 32, color: AmbColors.primary },
  photoBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: AmbColors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  heroName: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: AmbColors.onSurface },
  heroId: { fontFamily: 'Inter_400Regular', fontSize: 12, color: AmbColors.secondary },

  // Sections
  section: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl, padding: 20,
    marginBottom: 14, gap: 14,
    ...AmbShadow.subtle,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: AmbColors.onSurface },

  // Field
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 10,
    color: AmbColors.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase',
  },
  required: { color: AmbColors.error },
  inputWrapper: {
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md, height: 50,
    justifyContent: 'center', paddingHorizontal: 14,
  },
  inputDisabled: { backgroundColor: AmbColors.surfaceContainerHighest, opacity: 0.75 },
  textInput: { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: AmbColors.error },

  // Date row
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md, height: 50, paddingHorizontal: 14,
  },
  dateText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  datePlaceholder: { color: `${AmbColors.outline}70` },

  // Row fields (city + state)
  rowFields: { flexDirection: 'row', gap: 10 },

  // Gender / option chips
  chipRow: { flexDirection: 'row', gap: 8 },
  optChip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: AmbRadius.pill,
    backgroundColor: AmbColors.surfaceContainerLow,
    borderWidth: 1, borderColor: AmbColors.outlineVariant,
  },
  optChipActive: { backgroundColor: AmbColors.primary, borderColor: AmbColors.primary },
  optChipText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: AmbColors.onSurfaceVariant },
  optChipTextActive: { color: '#fff' },

  // Blood group chips
  bloodChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: AmbRadius.pill,
    backgroundColor: AmbColors.surfaceContainerLow,
    borderWidth: 1, borderColor: AmbColors.outlineVariant,
  },
  bloodChipActive: { backgroundColor: AmbColors.primaryContainer, borderColor: AmbColors.primaryContainer },
  bloodChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: AmbColors.onSurfaceVariant },
  bloodChipTextActive: { color: '#fff' },

  // Doc upload box
  docBox: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md, overflow: 'hidden',
    backgroundColor: AmbColors.surfaceContainerLow, minHeight: 120,
  },
  docBoxDone: { borderStyle: 'solid', borderColor: AmbColors.tertiary, backgroundColor: `${AmbColors.tertiary}08` },
  docThumb: { width: '100%', height: 100 },
  docPdfBadge: { height: 90, justifyContent: 'center', alignItems: 'center', gap: 6 },
  docPdfText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: AmbColors.error },
  docPlaceholder: { height: 90, justifyContent: 'center', alignItems: 'center', gap: 6 },
  docPlaceholderText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: `${AmbColors.outline}80` },
  docLabelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: AmbColors.surfaceContainerHigh,
  },
  docLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: AmbColors.onSurfaceVariant },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: AmbColors.surfaceContainerLowest,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    ...AmbShadow.elevated,
  },
  submitBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    height: 54, backgroundColor: AmbColors.primary, borderRadius: AmbRadius.md,
    ...AmbShadow.card,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#ffffff' },
});
