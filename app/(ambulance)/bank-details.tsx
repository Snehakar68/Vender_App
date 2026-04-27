import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AmbColors, AmbRadius, AmbShadow } from '@/src/features/ambulance/constants/ambulanceTheme';
import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';
import { AuthContext } from '@/src/core/context/AuthContext';
import ActionModal from '@/src/shared/components/ActionModal';

const BASE_URL = 'https://coreapi-service-111763741518.asia-south1.run.app';

const ACCOUNT_TYPES = ['Savings Account', 'Current Account', 'Salary Account'];

// GET returns abbreviated type codes — map them to display labels
const ACCOUNT_TYPE_MAP: Record<string, string> = {
  S:  'Savings Account',
  C:  'Current Account',
  SA: 'Salary Account',
  // full strings pass through unchanged
  'Savings Account':  'Savings Account',
  'Current Account':  'Current Account',
  'Salary Account':   'Salary Account',
};

// Map display label → abbreviated code for the save payload
const ACCOUNT_TYPE_CODE: Record<string, string> = {
  'Savings Account': 'S',
  'Current Account': 'C',
  'Salary Account':  'SA',
};

type FormState = {
  bankName: string;
  branch: string;
  ifsc: string;
  holderName: string;
  accountNumber: string;
  confirmAccount: string;
  accountType: string;
};

const EMPTY_FORM: FormState = {
  bankName: '',
  branch: '',
  ifsc: '',
  holderName: '',
  accountNumber: '',
  confirmAccount: '',
  accountType: 'Savings Account',
};

export default function AmbulanceBankDetailsScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? '';
  const token = auth?.user?.token;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [backup, setBackup] = useState<FormState>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ─── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!vendorId) { setLoading(false); return; }
    try {
      const res = await fetch(
        `${BASE_URL}/api/Bank/GetBankDetailsById/${vendorId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      const d = await res.json();
      console.log('Bank details fetched:', d);

      // ── FIX: use the actual field names returned by GET ─────────────────
      // Response shape:
      // { vendorId, bankName, branchName, ifscCode,
      //   accountHolderName, accountNumber, accountType }
      const hasData =
        d &&
        typeof d === 'object' &&
        !Array.isArray(d) &&
        (d.bankName || d.accountNumber);

      if (hasData) {
        // accountType may come back as a short code ("S", "C", "SA")
        // — resolve it to the full display label used in the dropdown.
        const resolvedType =
          ACCOUNT_TYPE_MAP[d.accountType] ?? 'Savings Account';

        const loaded: FormState = {
          bankName:       d.bankName            ?? '',
          branch:         d.branchName          ?? '',
          ifsc:           d.ifscCode            ?? '',
          holderName:     d.accountHolderName   ?? '',
          accountNumber:  d.accountNumber       ?? '',
          confirmAccount: d.accountNumber       ?? '',
          accountType:    resolvedType,
        };
        setForm(loaded);
        setBackup(loaded);
        setIsNew(false);
      } else {
        setIsNew(true);
      }
    } catch (e) {
      console.log('Bank details fetch error:', e);
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  }, [vendorId, token]);

  useEffect(() => { load(); }, [load]);

  // ─── Form helpers ────────────────────────────────────────────────────────

  function update(key: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function handleEdit() {
    setBackup(form);
    setErrors({});
    setShowTypeMenu(false);
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(backup);
    setErrors({});
    setShowTypeMenu(false);
    setIsEditing(false);
  }

  function validate(): boolean {
    const err: Partial<Record<keyof FormState, string>> = {};
    if (!form.bankName.trim())        err.bankName       = 'Bank name is required';
    if (!form.branch.trim())          err.branch         = 'Branch is required';
    if (!form.ifsc.trim())            err.ifsc           = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc))
                                      err.ifsc           = 'Invalid IFSC format (e.g. HDFC0001234)';
    if (!form.holderName.trim())      err.holderName     = 'Account holder name is required';
    if (!form.accountNumber.trim())   err.accountNumber  = 'Account number is required';
    if (form.accountNumber !== form.confirmAccount)
                                      err.confirmAccount = 'Account numbers do not match';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // ─── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      // Send the abbreviated code so the API accepts it consistently
      const accountTypeCode = ACCOUNT_TYPE_CODE[form.accountType] ?? form.accountType;

      const payload = {
        vendor_id:          vendorId,
        BankName:           form.bankName,
        BranchName:         form.branch,
        IFSCCode:           form.ifsc,
        Account_HolderName: form.holderName,
        account_number:     form.accountNumber,
        account_type:       accountTypeCode,
      };

      const endpoint = isNew
        ? `${BASE_URL}/api/Bank/CreateBankDetails`
        : `${BASE_URL}/api/Bank/UpdateBankDetails`;

      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Save failed');

      if (isNew) setIsNew(false);

      setBackup(form);
      setIsEditing(false);
      setShowTypeMenu(false);

      setSuccessMessage(
        data?.message ||
        (isNew ? 'Bank details created successfully.' : 'Bank details updated successfully.'),
      );
      setShowSuccessModal(true);

    } catch (e: any) {
      setErrors(prev => ({
        ...prev,
        bankName: e.message || 'Failed to save. Please try again.',
      }));
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TransactionalHeader title="Bank Details" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AmbColors.primary} />
          <Text style={styles.loadingText}>Loading bank details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TransactionalHeader
        title="Bank Details"
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={isEditing ? handleCancel : handleEdit}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isEditing ? 'close' : 'edit'}
              size={14}
              color={isEditing ? AmbColors.error : AmbColors.primary}
            />
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
          {/* ── Info Banner ── */}
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Secure Payments</Text>
              <Text style={styles.infoBannerDesc}>
                Please ensure your bank information is accurate. This account will be
                used for your monthly service reimbursements and incentives.
              </Text>
            </View>
            <MaterialIcons
              name="account-balance"
              size={80}
              color={AmbColors.onPrimary}
              style={styles.infoBannerWatermark}
            />
          </View>

          {/* ── "No record yet" notice (view mode only) ── */}
          {isNew && !isEditing && (
            <View style={styles.emptyNotice}>
              <MaterialIcons name="info-outline" size={16} color={AmbColors.primary} />
              <Text style={styles.emptyNoticeText}>
                No bank details saved yet. Tap{' '}
                <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Edit</Text> to add your account.
              </Text>
            </View>
          )}

          {/* ── Form Card ── */}
          <View style={styles.section}>
            <Field
              label="Bank Name" icon="business" value={form.bankName}
              placeholder="e.g. HDFC Bank" editable={isEditing}
              onChangeText={v => update('bankName', v)} error={errors.bankName}
            />
            <Field
              label="Branch Name" icon="location-on" value={form.branch}
              placeholder="e.g. South Extension II" editable={isEditing}
              onChangeText={v => update('branch', v)} error={errors.branch}
            />
            <Field
              label="IFSC Code" icon="tag" value={form.ifsc}
              placeholder="HDFC0001234" editable={isEditing}
              autoCapitalize="characters"
              onChangeText={v => update('ifsc', v.toUpperCase())} error={errors.ifsc}
            />
            <Field
              label="Account Holder Name" icon="person" value={form.holderName}
              placeholder="As per bank records" editable={isEditing}
              onChangeText={v => update('holderName', v)} error={errors.holderName}
            />
            <Field
              label="Account Number" icon="numbers" value={form.accountNumber}
              placeholder="Enter account number" editable={isEditing}
              keyboardType="numeric" masked={!isEditing}
              onChangeText={v => update('accountNumber', v)}
              error={errors.accountNumber}
            />

            {/* Confirm field only visible while editing */}
            {isEditing && (
              <Field
                label="Confirm Account Number" icon="verified-user"
                value={form.confirmAccount}
                placeholder="Re-enter account number"
                editable keyboardType="numeric"
                onChangeText={v => update('confirmAccount', v)}
                error={errors.confirmAccount}
              />
            )}

            {/* ── Account Type ── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Account Type <Text style={styles.required}>*</Text>
              </Text>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.inputWrapper, errors.accountType ? styles.inputError : null]}
                    onPress={() => setShowTypeMenu(p => !p)}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="account-tree"
                      size={18}
                      color={AmbColors.outline}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.dropdownValue}>{form.accountType}</Text>
                    <MaterialIcons
                      name={showTypeMenu ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={22}
                      color={AmbColors.outline}
                    />
                  </TouchableOpacity>
                  {errors.accountType
                    ? <Text style={styles.errorText}>{errors.accountType}</Text>
                    : null}
                  {showTypeMenu && (
                    <View style={styles.dropdownMenu}>
                      {ACCOUNT_TYPES.map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.dropdownItem,
                            form.accountType === type && styles.dropdownItemActive,
                          ]}
                          onPress={() => { update('accountType', type); setShowTypeMenu(false); }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            form.accountType === type && styles.dropdownItemTextActive,
                          ]}>
                            {type}
                          </Text>
                          {form.accountType === type && (
                            <MaterialIcons name="check" size={16} color={AmbColors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.inputWrapper, styles.inputDisabled]}>
                  <MaterialIcons
                    name="account-tree"
                    size={18}
                    color={AmbColors.outline}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.readValue}>{form.accountType || '—'}</Text>
                </View>
              )}
            </View>

            {/* ── Save Button (edit mode only) ── */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.saveBtnText}>
                      {isNew ? 'Create Bank Details' : 'Save Bank Details'}
                    </Text>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.securityNote}>
            Your data is encrypted and stored securely according to Jhilmil Homecare
            privacy policies.
          </Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionModal
        visible={showSuccessModal}
        title={isNew ? 'Bank Details Saved' : 'Bank Details Updated'}
        message={successMessage}
        confirmText="OK"
        iconName="check-circle"
        onConfirm={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, icon, value, placeholder, onChangeText,
  keyboardType, autoCapitalize, masked, editable = true, error,
}: {
  label: string; icon: string; value: string; placeholder: string;
  onChangeText: (v: string) => void; keyboardType?: any;
  autoCapitalize?: any; masked?: boolean;
  editable?: boolean; error?: string;
}) {
  const displayValue =
    masked && value ? '••••••••••••' + value.slice(-4) : value;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={[
        styles.inputWrapper,
        !editable && styles.inputDisabled,
        error ? styles.inputError : null,
      ]}>
        <MaterialIcons
          name={icon as any}
          size={18}
          color={AmbColors.outline}
          style={styles.inputIcon}
        />
        {editable ? (
          <TextInput
            style={styles.textInput}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={`${AmbColors.outline}70`}
            onChangeText={onChangeText}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize={autoCapitalize ?? 'words'}
          />
        ) : (
          <Text style={styles.readValue}>{displayValue || '—'}</Text>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Styles (unchanged from original) ────────────────────────────────────────

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: AmbColors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:      { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.outline },
  scroll:           { padding: 16, gap: 16 },
  infoBanner: {
    borderRadius: AmbRadius.lg,
    backgroundColor: AmbColors.primary,
    padding: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBannerContent:   { flex: 1, gap: 6 },
  infoBannerTitle:     { fontFamily: 'Inter_700Bold',    fontSize: 16, color: AmbColors.onPrimary },
  infoBannerDesc:      { fontFamily: 'Inter_400Regular', fontSize: 12, color: `${AmbColors.onPrimary}CC`, lineHeight: 18 },
  infoBannerWatermark: { position: 'absolute', right: -10, bottom: -10, opacity: 0.15 },
  emptyNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${AmbColors.primary}12`,
    borderRadius: AmbRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: `${AmbColors.primary}30`,
  },
  emptyNoticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: AmbColors.primary },
  section: {
    backgroundColor: AmbColors.surface,
    borderRadius: AmbRadius.lg,
    padding: 16,
    gap: 16,
    ...AmbShadow.sm,
  },
  fieldGroup:    { gap: 6 },
  fieldLabel:    { fontFamily: 'Inter_500Medium', fontSize: 13, color: AmbColors.onSurfaceVariant },
  required:      { color: AmbColors.error },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: AmbColors.surface,
    gap: 8,
  },
  inputDisabled: { backgroundColor: `${AmbColors.outline}0A` },
  inputError:    { borderColor: AmbColors.error },
  inputIcon:     { width: 22 },
  textInput:     { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface, padding: 0 },
  readValue:     { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  errorText:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: AmbColors.error },
  dropdownValue: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: AmbColors.outlineVariant,
    borderRadius: AmbRadius.md,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: AmbColors.surface },
  dropdownItemActive:   { backgroundColor: `${AmbColors.primary}12` },
  dropdownItemText:     { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  dropdownItemTextActive: { fontFamily: 'Inter_600SemiBold', color: AmbColors.primary },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.md, paddingVertical: 14,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },
  editBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: AmbColors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: AmbColors.surface,
  },
  editBtnActive: { borderColor: `${AmbColors.error}40`, backgroundColor: `${AmbColors.error}0D` },
  securityNote:  { fontFamily: 'Inter_400Regular', fontSize: 11, color: AmbColors.outline, textAlign: 'center', paddingHorizontal: 16 },
});
