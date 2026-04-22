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

const BASE_URL = 'https://coreapi-service-111763741518.asia-south1.run.app';

const ACCOUNT_TYPES = ['Savings Account', 'Current Account', 'Salary Account'];

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
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    if (!vendorId) { setLoading(false); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/Bank/GetBankDetailsById/${vendorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const d = await res.json();
      const loaded: FormState = {
        bankName:      d.BankName           ?? d.bank_name      ?? '',
        branch:        d.BranchName         ?? d.branch         ?? '',
        ifsc:          d.IFSCCode           ?? d.ifsc           ?? '',
        holderName:    d.Account_HolderName ?? d.account_holder ?? '',
        accountNumber: d.account_number     ?? '',
        confirmAccount: d.account_number    ?? '',
        accountType:   d.account_type       ?? 'Savings Account',
      };
      setForm(loaded);
      setBackup(loaded);
    } catch (e) {
      console.log('Bank details fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [vendorId, token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(t);
  }, [status]);

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
    if (!form.bankName.trim()) err.bankName = 'Bank name is required';
    if (!form.branch.trim()) err.branch = 'Branch is required';
    if (!form.ifsc.trim()) err.ifsc = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)) err.ifsc = 'Invalid IFSC format (e.g. HDFC0001234)';
    if (!form.holderName.trim()) err.holderName = 'Account holder name is required';
    if (!form.accountNumber.trim()) err.accountNumber = 'Account number is required';
    if (form.accountNumber !== form.confirmAccount) err.confirmAccount = 'Account numbers do not match';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/Bank/UpdateBankDetails`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id:          vendorId,
          BankName:           form.bankName,
          BranchName:         form.branch,
          IFSCCode:           form.ifsc,
          Account_HolderName: form.holderName,
          account_number:     form.accountNumber,
          account_type:       form.accountType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Update failed');
      setBackup(form);
      setIsEditing(false);
      setShowTypeMenu(false);
      setStatus({ text: data?.message || 'Bank details saved successfully.', ok: true });
    } catch (e: any) {
      setStatus({ text: e.message || 'Failed to save. Please try again.', ok: false });
    } finally {
      setSaving(false);
    }
  }

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
            {/* <Text style={[styles.editBtnText, isEditing && styles.editBtnTextActive]}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text> */}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                Please ensure your bank information is accurate. This account will be used for your
                monthly service reimbursements and incentives.
              </Text>
            </View>
            <MaterialIcons
              name="account-balance"
              size={80}
              color={AmbColors.onPrimary}
              style={styles.infoBannerWatermark}
            />
          </View>

          {/* ── Status Banner ── */}
          {!!status && (
            <View style={[styles.statusBanner, status.ok ? styles.statusBannerOk : styles.statusBannerErr]}>
              <MaterialIcons
                name={status.ok ? 'check-circle' : 'error-outline'}
                size={16}
                color={status.ok ? AmbColors.tertiary : AmbColors.error}
              />
              <Text style={[styles.statusText, { color: status.ok ? AmbColors.tertiary : AmbColors.error }]}>
                {status.text}
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
              placeholder="HDFC0001234" editable={isEditing} autoCapitalize="characters"
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
              onChangeText={v => update('accountNumber', v)} error={errors.accountNumber}
            />

            {isEditing && (
              <Field
                label="Confirm Account Number" icon="verified-user" value={form.confirmAccount}
                placeholder="Re-enter account number" editable keyboardType="numeric"
                onChangeText={v => update('confirmAccount', v)} error={errors.confirmAccount}
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
                    <MaterialIcons name="account-tree" size={18} color={AmbColors.outline} style={styles.inputIcon} />
                    <Text style={styles.dropdownValue}>{form.accountType}</Text>
                    <MaterialIcons
                      name={showTypeMenu ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={22}
                      color={AmbColors.outline}
                    />
                  </TouchableOpacity>
                  {errors.accountType ? <Text style={styles.errorText}>{errors.accountType}</Text> : null}
                  {showTypeMenu && (
                    <View style={styles.dropdownMenu}>
                      {ACCOUNT_TYPES.map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[styles.dropdownItem, form.accountType === type && styles.dropdownItemActive]}
                          onPress={() => { update('accountType', type); setShowTypeMenu(false); }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.dropdownItemText, form.accountType === type && styles.dropdownItemTextActive]}>
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
                  <MaterialIcons name="account-tree" size={18} color={AmbColors.outline} style={styles.inputIcon} />
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
                    <Text style={styles.saveBtnText}>Save Bank Details</Text>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Security Note ── */}
          <Text style={styles.securityNote}>
            Your data is encrypted and stored securely according to Jhilmil Homecare privacy policies.
          </Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, icon, value, placeholder, onChangeText,
  keyboardType, autoCapitalize, masked, editable = true, error,
}: {
  label: string; icon: string; value: string; placeholder: string;
  onChangeText: (v: string) => void; keyboardType?: any;
  autoCapitalize?: any; masked?: boolean;
  editable?: boolean; error?: string;
}) {
  const displayValue = masked && value ? '••••••••••••' + value.slice(-4) : value;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={[styles.inputWrapper, !editable && styles.inputDisabled, error ? styles.inputError : null]}>
        <MaterialIcons name={icon as any} size={18} color={AmbColors.outline} style={styles.inputIcon} />
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.secondary },

  // ── Header edit button
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: AmbRadius.pill,
    backgroundColor: `${AmbColors.primary}15`,
  },
  editBtnActive: { backgroundColor: `${AmbColors.error}15` },
  editBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: AmbColors.primary },
  editBtnTextActive: { color: AmbColors.error },

  // ── Info banner
  infoBanner: {
    backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.xl,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...AmbShadow.card,
  },
  infoBannerContent: { flex: 1, paddingRight: 8 },
  infoBannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: AmbColors.onPrimary,
    marginBottom: 6,
  },
  infoBannerDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: `${AmbColors.onPrimary}BB`,
    lineHeight: 19,
  },
  infoBannerWatermark: {
    opacity: 0.12,
    position: 'absolute',
    right: -10,
    bottom: -10,
  },

  // ── Status
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: AmbRadius.md, marginBottom: 14,
  },
  statusBannerOk: { backgroundColor: `${AmbColors.tertiary}12` },
  statusBannerErr: { backgroundColor: AmbColors.errorContainer },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },

  // ── Section card
  section: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 20,
    marginBottom: 14,
    gap: 14,
    ...AmbShadow.subtle,
  },

  // ── Fields
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: AmbColors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  required: { color: AmbColors.error },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AmbColors.surfaceContainerLow,
    borderRadius: AmbRadius.md,
    height: 50,
    paddingHorizontal: 14,
  },
  inputDisabled: { backgroundColor: AmbColors.surfaceContainerHighest, opacity: 0.8 },
  inputError: { borderWidth: 1, borderColor: AmbColors.error },
  inputIcon: { marginRight: 10 },
  textInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  readValue: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: AmbColors.error },

  // ── Account type dropdown
  dropdownValue: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: AmbColors.onSurface,
  },
  dropdownMenu: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.md,
    overflow: 'hidden',
    ...AmbShadow.card,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownItemActive: { backgroundColor: AmbColors.surfaceContainerLow },
  dropdownItemText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: AmbColors.onSurface },
  dropdownItemTextActive: { fontFamily: 'Inter_600SemiBold', color: AmbColors.primary },

  // ── Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.md,
    marginTop: 4,
    ...AmbShadow.card,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },

  // ── Bottom note
  securityNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: AmbColors.outline,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
