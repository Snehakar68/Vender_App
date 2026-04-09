import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { AuthContext } from "@/src/core/context/AuthContext";
import api from "@/src/core/api/apiClient";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
  ButtonSize,
} from "@/src/shared/constants/theme";

const ACCOUNT_TYPES = ["Savings Account", "Current Account", "Salary Account"];

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
  bankName: "",
  branch: "",
  ifsc: "",
  holderName: "",
  accountNumber: "",
  confirmAccount: "",
  accountType: "Savings Account",
};

export default function BankDetailsScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (vendorId) loadBankDetails();
  }, [vendorId]);

  const loadBankDetails = async () => {
    try {
      const res = await api.get(`/api/Bank/GetBankDetailsById/${vendorId}`);
      const d = res.data;
      setForm({
        bankName: d.bank_name ?? "",
        branch: d.branch ?? "",
        ifsc: d.ifsc ?? "",
        holderName: d.account_holder ?? "",
        accountNumber: d.account_number ?? "",
        confirmAccount: d.account_number ?? "",
        accountType: d.account_type ?? "Savings Account",
      });
    } catch (e) {
      console.log("Bank details fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  function update(key: keyof FormState, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function showStatus(text: string, ok: boolean) {
    setStatusMsg({ text, ok });
    setTimeout(() => setStatusMsg(null), 3000);
  }

  const handleEditSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (form.accountNumber !== form.confirmAccount) {
      showStatus("Account numbers do not match.", false);
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/Bank/UpdateBankDetails", {
        vendorId,
        bank_name: form.bankName,
        branch: form.branch,
        ifsc: form.ifsc,
        account_holder: form.holderName,
        account_number: form.accountNumber,
        account_type: form.accountType,
      });
      setIsEditing(false);
      showStatus("Bank details saved successfully.", true);
    } catch (e) {
      console.log("Bank save failed:", e);
      showStatus("Failed to save. Please try again.", false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        <TouchableOpacity
          onPress={handleEditSave}
          disabled={saving}
          style={styles.editBtn}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <MaterialIcons name="account-balance" size={24} color={Colors.light.onPrimary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Payout Account</Text>
              <Text style={styles.infoDesc}>
                Please provide accurate bank details to receive payments.
              </Text>
            </View>
          </View>

          <Field
            label="Bank Name"
            icon="business"
            value={form.bankName}
            placeholder="e.g. State Bank of India"
            onChangeText={(v) => update("bankName", v)}
            editable={isEditing}
          />
          <Field
            label="Branch"
            icon="location-on"
            value={form.branch}
            placeholder="e.g. Connaught Place"
            onChangeText={(v) => update("branch", v)}
            editable={isEditing}
          />
          <Field
            label="IFSC Code"
            icon="qr-code-2"
            value={form.ifsc}
            placeholder="E.G. SBIN0001234"
            onChangeText={(v) => update("ifsc", v.toUpperCase())}
            autoCapitalize="characters"
            editable={isEditing}
          />
          <Field
            label="Account Holder's Name"
            icon="person"
            value={form.holderName}
            placeholder="As per bank passbook"
            onChangeText={(v) => update("holderName", v)}
            editable={isEditing}
          />
          <Field
            label="Account Number"
            icon="tag"
            value={form.accountNumber}
            placeholder="Enter account number"
            onChangeText={(v) => update("accountNumber", v)}
            keyboardType="numeric"
            editable={isEditing}
          />
          {isEditing && (
            <Field
              label="Confirm Account Number"
              icon="verified-user"
              value={form.confirmAccount}
              placeholder="Re-enter account number"
              onChangeText={(v) => update("confirmAccount", v)}
              keyboardType="numeric"
              editable
            />
          )}

          {/* Account Type */}
          <Text style={styles.fieldLabel}>Account Type</Text>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowTypeMenu((p) => !p)}
                activeOpacity={0.75}
              >
                <MaterialIcons
                  name="account-tree"
                  size={18}
                  color={Colors.light.onSurfaceVariant}
                  style={styles.fieldIcon}
                />
                <Text style={styles.dropdownValue}>{form.accountType}</Text>
                <MaterialIcons
                  name={showTypeMenu ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={22}
                  color={Colors.light.outline}
                />
              </TouchableOpacity>
              {showTypeMenu && (
                <View style={styles.dropdownMenu}>
                  {ACCOUNT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.dropdownItem,
                        form.accountType === type && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        update("accountType", type);
                        setShowTypeMenu(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          form.accountType === type && styles.dropdownItemTextActive,
                        ]}
                      >
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
              <MaterialIcons
                name="account-tree"
                size={18}
                color={Colors.light.onSurfaceVariant}
                style={styles.fieldIcon}
              />
              <Text style={styles.readOnlyValue}>{form.accountType || "—"}</Text>
            </View>
          )}

          {/* Status banner */}
          {statusMsg && (
            <View style={[styles.banner, statusMsg.ok ? styles.bannerOk : styles.bannerErr]}>
              <MaterialIcons
                name={statusMsg.ok ? "check-circle" : "error-outline"}
                size={16}
                color={statusMsg.ok ? Colors.light.tertiary : Colors.light.error}
              />
              <Text
                style={[
                  styles.bannerText,
                  { color: statusMsg.ok ? Colors.light.tertiary : Colors.light.error },
                ]}
              >
                {statusMsg.text}
              </Text>
            </View>
          )}

          {/* Security note */}
          <View style={styles.securityNote}>
            <MaterialIcons name="lock" size={12} color={Colors.light.outline} />
            <Text style={styles.securityText}>END-TO-END ENCRYPTED SECURE VAULT</Text>
          </View>

          <View style={{ height: Spacing.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  autoCapitalize,
  editable = true,
}: {
  label: string;
  icon: string;
  value: string;
  placeholder: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable ? (
        <View style={styles.inputRow}>
          <MaterialIcons
            name={icon as any}
            size={18}
            color={Colors.light.onSurfaceVariant}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.input}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.outline}
            onChangeText={onChangeText}
            keyboardType={keyboardType ?? "default"}
            autoCapitalize={autoCapitalize ?? "words"}
          />
        </View>
      ) : (
        <View style={styles.readOnlyRow}>
          <MaterialIcons
            name={icon as any}
            size={18}
            color={Colors.light.onSurfaceVariant}
            style={styles.fieldIcon}
          />
          <Text style={styles.readOnlyValue}>{value || "—"}</Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  headerTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },
  editBtn: {
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  editBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  infoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
    marginBottom: 2,
  },
  infoDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 18,
  },

  fieldWrap: { marginBottom: Spacing.md },
  fieldLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.onSurface,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  fieldIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  readOnlyValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    flex: 1,
  },

  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
  },
  dropdownValue: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  dropdownMenu: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadow.subtle,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  dropdownItemActive: { backgroundColor: Colors.light.surfaceContainerLow },
  dropdownItemText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  dropdownItemTextActive: {
    fontFamily: FontFamily.bodyMedium,
    color: Colors.light.primary,
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
  },
  bannerOk: { backgroundColor: Colors.light.tertiaryFixed + "40" },
  bannerErr: { backgroundColor: Colors.light.errorContainer },
  bannerText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    flex: 1,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: Spacing.md,
  },
  securityText: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
    letterSpacing: 0.8,
  },
});
