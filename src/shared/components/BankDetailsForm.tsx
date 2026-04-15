import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  ButtonSize,
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Shadow,
  Spacing,
} from '@/src/shared/constants/theme';
import {
  BankFormState,
  validateBankDetails,
  ValidationErrors,
} from '@/src/shared/utils/validation';

const BASE_URL = 'https://coreapi-service-111763741518.asia-south1.run.app';

const ACCOUNT_TYPES = ['Savings Account', 'Current Account', 'Salary Account'];

const EMPTY_FORM: BankFormState = {
  bankName: '',
  branch: '',
  ifsc: '',
  holderName: '',
  accountNumber: '',
  confirmAccount: '',
  accountType: 'Savings Account',
};

export interface BankDetailsFormProps {
  vendorId: string;
  token?: string;
  style?: ViewStyle;
  onSaved?: () => void;
}

export default function BankDetailsForm({
  vendorId,
  token,
  style,
  onSaved,
}: BankDetailsFormProps) {
  const [form, setForm] = useState<BankFormState>(EMPTY_FORM);
  const [backup, setBackup] = useState<BankFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors<BankFormState>>({});
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    if (!vendorId) { setLoading(false); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/Bank/GetBankDetailsById/${vendorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const d = await res.json();
      const loaded: BankFormState = {
        bankName:      d.BankName             ?? d.bank_name        ?? '',
        branch:        d.BranchName           ?? d.branch           ?? '',
        ifsc:          d.IFSCCode             ?? d.ifsc             ?? '',
        holderName:    d.Account_HolderName   ?? d.account_holder   ?? '',
        accountNumber: d.account_number       ?? '',
        confirmAccount: d.account_number      ?? '',
        accountType:   d.account_type         ?? 'Savings Account',
      };
      setForm(loaded);
      setBackup(loaded);
    } catch (e) {
      console.log('BankDetailsForm fetch error:', e);
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

  function update(key: keyof BankFormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function handleEdit() {
    setBackup(form);
    setErrors({});
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(backup);
    setErrors({});
    setShowTypeMenu(false);
    setIsEditing(false);
  }

  async function handleUpdate() {
    const errs = validateBankDetails(form);
    if (form.accountNumber !== form.confirmAccount) {
      errs.confirmAccount = 'Account numbers do not match';
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

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
      setStatus({ text: data?.message || 'Bank details saved successfully.', ok: true });
      onSaved?.();
    } catch (e: any) {
      setStatus({ text: e.message || 'Failed to save. Please try again.', ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingBox, style]}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading bank details…</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      {/* Info card + Edit/Cancel toggle */}
      <View style={styles.toolbar}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <MaterialIcons name="account-balance" size={22} color={Colors.light.onPrimary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Payout Account</Text>
            <Text style={styles.infoDesc}>
              Ensure settlement information is accurate for timely reimbursements.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editToggleBtn}
          onPress={isEditing ? handleCancel : handleEdit}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isEditing ? 'close' : 'edit'}
            size={16}
            color={isEditing ? Colors.light.error : Colors.light.primary}
          />
          <Text style={[styles.editToggleText, isEditing && styles.editToggleTextCancel]}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status banner */}
      {status && (
        <View style={[styles.banner, status.ok ? styles.bannerOk : styles.bannerErr]}>
          <MaterialIcons
            name={status.ok ? 'check-circle' : 'error-outline'}
            size={16}
            color={status.ok ? Colors.light.tertiary : Colors.light.error}
          />
          <Text style={[styles.bannerText, { color: status.ok ? Colors.light.tertiary : Colors.light.error }]}>
            {status.text}
          </Text>
        </View>
      )}

      <FieldRow label="Account Holder's Name" icon="person"
        value={form.holderName} placeholder="As per bank passbook"
        onChangeText={v => update('holderName', v)}
        editable={isEditing} required error={errors.holderName} />

      <FieldRow label="Bank Name" icon="business"
        value={form.bankName} placeholder="e.g. HealthFirst Trust Bank"
        onChangeText={v => update('bankName', v)}
        editable={isEditing} required error={errors.bankName} />

      <View style={styles.rowFields}>
        <View style={{ flex: 1 }}>
          <FieldRow label="Branch" icon="location-on"
            value={form.branch} placeholder="Branch location"
            onChangeText={v => update('branch', v)}
            editable={isEditing} required error={errors.branch} />
        </View>
        <View style={{ flex: 1 }}>
          <FieldRow label="IFSC Code" icon="qr-code-2"
            value={form.ifsc} placeholder="SBIN0001234"
            onChangeText={v => update('ifsc', v.toUpperCase())}
            autoCapitalize="characters"
            editable={isEditing} required error={errors.ifsc} />
        </View>
      </View>

      <FieldRow label="Account Number" icon="tag"
        value={form.accountNumber} placeholder="Enter account number"
        onChangeText={v => update('accountNumber', v)}
        keyboardType="numeric" secureTextEntry={!isEditing}
        editable={isEditing} required error={errors.accountNumber} />

      {isEditing && (
        <FieldRow label="Confirm Account Number" icon="verified-user"
          value={form.confirmAccount} placeholder="Re-enter account number"
          onChangeText={v => update('confirmAccount', v)}
          keyboardType="numeric" editable required error={errors.confirmAccount} />
      )}

      {/* Account Type */}
      <View style={styles.fieldWrap}>
        <View style={styles.labelRow}>
          <Text style={styles.fieldLabel}>Account Type</Text>
          <Text style={styles.requiredStar}> *</Text>
        </View>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.dropdownBtn, errors.accountType ? styles.inputError : null]}
              onPress={() => setShowTypeMenu(p => !p)}
              activeOpacity={0.75}
            >
              <MaterialIcons name="account-tree" size={18} color={Colors.light.onSurfaceVariant} style={styles.fieldIcon} />
              <Text style={styles.dropdownValue}>{form.accountType}</Text>
              <MaterialIcons name={showTypeMenu ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={22} color={Colors.light.outline} />
            </TouchableOpacity>
            {errors.accountType && <Text style={styles.errorText}>{errors.accountType}</Text>}
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
                      <MaterialIcons name="check" size={16} color={Colors.light.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.readOnlyRow}>
            <MaterialIcons name="account-tree" size={18} color={Colors.light.onSurfaceVariant} style={styles.fieldIcon} />
            <Text style={styles.readOnlyValue}>{form.accountType || '—'}</Text>
          </View>
        )}
      </View>

      {/* Security note */}
      <View style={styles.securityNote}>
        <MaterialIcons name="lock" size={12} color={Colors.light.outline} />
        <Text style={styles.securityText}>
          Payments are encrypted and processed through a secure vault
        </Text>
      </View>

      {/* Submit button — shown only in edit mode */}
      {isEditing && (
        <TouchableOpacity
          style={[styles.updateBtn, saving && styles.updateBtnDisabled]}
          onPress={handleUpdate}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.updateBtnText}>Update Details →</Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({
  label, icon, value, placeholder, onChangeText,
  keyboardType, autoCapitalize, secureTextEntry,
  editable = true, required = false, error,
}: {
  label: string; icon: string; value: string; placeholder: string;
  onChangeText: (v: string) => void; keyboardType?: any;
  autoCapitalize?: any; secureTextEntry?: boolean;
  editable?: boolean; required?: boolean; error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.requiredStar}> *</Text>}
      </View>
      {editable ? (
        <View style={[styles.inputRow, error ? styles.inputError : null]}>
          <MaterialIcons name={icon as any} size={18} color={Colors.light.onSurfaceVariant} style={styles.fieldIcon} />
          <TextInput
            style={styles.input}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.outline}
            onChangeText={onChangeText}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize={autoCapitalize ?? 'words'}
            secureTextEntry={secureTextEntry}
          />
        </View>
      ) : (
        <View style={styles.readOnlyRow}>
          <MaterialIcons name={icon as any} size={18} color={Colors.light.onSurfaceVariant} style={styles.fieldIcon} />
          <Text style={styles.readOnlyValue}>
            {secureTextEntry && value ? '••••••••' : value || '—'}
          </Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.lg,
  },
  loadingText: {
    fontFamily: FontFamily.body, fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
  },
  toolbar: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  infoCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg, padding: Spacing.sm, ...Shadow.subtle,
  },
  infoIconWrap: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontFamily: FontFamily.headline, fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface, marginBottom: 2,
  },
  infoDesc: {
    fontFamily: FontFamily.body, fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant, lineHeight: 17,
  },
  editToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignSelf: 'flex-start', marginTop: 4,
  },
  editToggleText: {
    fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodySmall,
    color: Colors.light.primary,
  },
  editToggleTextCancel: { color: Colors.light.error },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    padding: Spacing.sm, borderRadius: Radius.lg, marginBottom: Spacing.md,
  },
  bannerOk: { backgroundColor: Colors.light.tertiaryFixed + '40' },
  bannerErr: { backgroundColor: Colors.light.errorContainer },
  bannerText: {
    fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodySmall, flex: 1,
  },
  rowFields: { flexDirection: 'row', gap: Spacing.sm },
  fieldWrap: { marginBottom: Spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  fieldLabel: {
    fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelLarge,
    color: Colors.light.onSurface,
  },
  requiredStar: {
    color: Colors.light.error, fontSize: FontSize.labelMedium,
    fontFamily: FontFamily.bodyMedium,
  },
  errorText: {
    color: Colors.light.error, fontSize: FontSize.labelSmall,
    fontFamily: FontFamily.body, marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md,
  },
  inputError: { borderWidth: 1, borderColor: Colors.light.error },
  fieldIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1, paddingVertical: 14,
    fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  readOnlyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  readOnlyValue: {
    fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface, flex: 1,
  },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 14,
    marginBottom: Spacing.xs,
  },
  dropdownValue: {
    flex: 1, fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  dropdownMenu: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg, marginBottom: Spacing.md,
    overflow: 'hidden', ...Shadow.subtle,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  dropdownItemActive: { backgroundColor: Colors.light.surfaceContainerLow },
  dropdownItemText: {
    fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  dropdownItemTextActive: { fontFamily: FontFamily.bodyMedium, color: Colors.light.primary },
  securityNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: Spacing.xs, marginBottom: Spacing.md,
  },
  securityText: {
    fontFamily: FontFamily.label, fontSize: FontSize.labelSmall,
    color: Colors.light.outline, letterSpacing: 0.4,
  },
  updateBtn: {
    backgroundColor: Colors.light.primary, borderRadius: Radius.lg,
    height: ButtonSize.minHeight, alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.xs, ...Shadow.card,
  },
  updateBtnDisabled: { opacity: 0.6 },
  updateBtnText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.bodyMedium, color: '#fff',
  },
});
