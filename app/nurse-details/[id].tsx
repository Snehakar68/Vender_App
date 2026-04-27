import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/src/core/api/apiClient';
import { Colors, Spacing, Radius, Shadow, FontFamily, FontSize } from '@/src/shared/constants/theme';

// ── Types ─────────────────────────────────────────────────────────────────────

type NurseLinked = {
  linked_id?: string;
  doctor_name?: string;
  is_approved?: string;
};

type BankDetail = {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  branch?: string;
  account_type?: string;
  ifsc?: string;
};

type NurseDetail = {
  full_Name?: string;
  full_name?: string;
  nurse_license_no?: string;
  specialization?: string;
  shift_type?: string;
  gender?: string;
  dob?: string;
  blood_group?: string;
  mobile?: string;
  alt_mobile?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  qualification?: string;
  experience?: string | number;
  registration_no?: string;
  summary?: string;
  is_approved?: string;
  nurseIMG?: { photo?: string }[];
  nurseLinked?: NurseLinked[];
  bankDetails?: BankDetail[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const val = (v: string | number | undefined | null) =>
  v !== undefined && v !== null && v !== '' ? String(v) : '—';

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NurseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [nurse, setNurse] = useState<NurseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadNurse();
  }, [id]);

  const loadNurse = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/Nurse/GetNurseById/${id}`);
      console.log('Nurse details response:', res.data);
      setNurse(res.data || null);
    } catch {
      setError('Failed to load nurse details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !nurse) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <MaterialIcons name="error-outline" size={48} color={Colors.light.error} />
        <Text style={styles.errorText}>{error || 'Nurse not found'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadNurse}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(hospital)/nurses');
    }
  };

  const name = nurse.full_Name || nurse.full_name || 'Unknown';
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
  const photo = nurse.nurseIMG?.[0]?.photo;
  const linked = nurse.nurseLinked?.[0];
  const bank = nurse.bankDetails?.[0];
  const isApproved = nurse.is_approved === 'Y';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.appBarBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.light.onSurface} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Nurse Profile</Text>
        <TouchableOpacity style={styles.appBarBtn}>
          <MaterialIcons name="more-vert" size={22} color={Colors.light.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Profile Header ─────────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          {photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${photo}` }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{name}</Text>
          {nurse.nurse_license_no && (
            <View style={styles.licenseBadge}>
              <MaterialIcons name="verified" size={14} color={Colors.light.primary} />
              <Text style={styles.licenseBadgeText}>{nurse.nurse_license_no}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            {nurse.specialization && (
              <Text style={styles.metaText}>{nurse.specialization}</Text>
            )}
            {nurse.shift_type && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <MaterialIcons name="bedtime" size={13} color={Colors.light.onSurfaceVariant} />
                <Text style={styles.metaText}>{nurse.shift_type}</Text>
              </>
            )}
          </View>
          <View style={[styles.chip, isApproved ? styles.chipApproved : styles.chipPending]}>
            <MaterialIcons
              name={isApproved ? 'check-circle' : 'cancel'}
              size={12}
              color={isApproved ? Colors.light.tertiary : Colors.light.error}
            />
            <Text style={[styles.chipText, isApproved ? styles.chipApprovedText : styles.chipPendingText]}>
              {isApproved ? 'Approved' : 'Pending Approval'}
            </Text>
          </View>
        </View>

        {/* ── Personal Info ──────────────────────────────────────────────────── */}
        <SectionCard title="Personal Information" icon="person">
          <InfoRow label="Gender" value={val(nurse.gender)} />
          <InfoRow label="Date of Birth" value={val(nurse.dob)} />
          <InfoRow label="Blood Group" value={val(nurse.blood_group)} highlight />
          <InfoRow label="Mobile" value={val(nurse.mobile)} />
          <InfoRow label="Alt Mobile" value={val(nurse.alt_mobile)} />
          <InfoRow label="Email" value={val(nurse.email)} />
        </SectionCard>

        {/* ── Address ───────────────────────────────────────────────────────── */}
        <SectionCard title="Address" icon="location-on">
          <InfoRow label="Address Line 1" value={val(nurse.address_line1)} />
          <InfoRow label="Address Line 2" value={val(nurse.address_line2)} />
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{val(nurse.city)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.infoLabel}>State</Text>
              <Text style={styles.infoValue}>{val(nurse.state)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.infoLabel}>Pin Code</Text>
              <Text style={styles.infoValue}>{val(nurse.pin_code)}</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Professional Details ───────────────────────────────────────────── */}
        <View style={styles.credentialsCard}>
          <View style={styles.credentialsHeader}>
            <MaterialIcons name="school" size={20} color={Colors.light.onPrimary} />
            <Text style={styles.credentialsTitle}>Professional Details</Text>
          </View>
          <View style={styles.credentialsGrid}>
            <CredRow label="Qualification" value={val(nurse.qualification)} />
            <CredRow
              label="Experience"
              value={val(nurse.experience) !== '—' ? `${nurse.experience} Years` : '—'}
            />
            <CredRow label="Reg. Number" value={val(nurse.registration_no)} />
          </View>
          {nurse.summary && (
            <View style={styles.credentialsSummary}>
              <Text style={styles.credentialsSummaryLabel}>Summary</Text>
              <Text style={styles.credentialsSummaryText}>{nurse.summary}</Text>
            </View>
          )}
        </View>

        {/* ── Linking Details ───────────────────────────────────────────────── */}
        {linked && (
          <SectionCard title="Linking Details" icon="link">
            <InfoRow label="Linked ID" value={val(linked.linked_id)} />
            <InfoRow label="Linked Doctor" value={val(linked.doctor_name)} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Approval Status</Text>
              <View style={[styles.chip, linked.is_approved === 'Y' ? styles.chipApproved : styles.chipPending]}>
                <MaterialIcons
                  name={linked.is_approved === 'Y' ? 'check-circle' : 'cancel'}
                  size={12}
                  color={linked.is_approved === 'Y' ? Colors.light.tertiary : Colors.light.error}
                />
                <Text style={[styles.chipText, linked.is_approved === 'Y' ? styles.chipApprovedText : styles.chipPendingText]}>
                  {linked.is_approved === 'Y' ? 'Approved' : 'Pending'}
                </Text>
              </View>
            </View>
          </SectionCard>
        )}

        {/* ── Bank Details ──────────────────────────────────────────────────── */}
        {bank && (
          <View style={[styles.credentialsCard, { marginBottom: 0 }]}>
            <View style={styles.credentialsHeader}>
              <MaterialIcons name="account-balance" size={20} color={Colors.light.onPrimary} />
              <Text style={styles.credentialsTitle}>Bank Details</Text>
            </View>
            <View style={styles.credentialsGrid}>
              <CredRow label="Bank Name" value={val(bank.bank_name)} />
              <CredRow label="Account Holder" value={val(bank.account_holder)} />
              <CredRow label="Account Number" value={val(bank.account_number)} />
              <CredRow label="Branch" value={val(bank.branch)} />
              <CredRow label="IFSC" value={val(bank.ifsc)} />
              <CredRow label="Account Type" value={val(bank.account_type)} />
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title, icon, children,
}: {
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={18} color={Colors.light.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
    </View>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.credRow}>
      <Text style={styles.credLabel}>{label}</Text>
      <Text style={styles.credValue}>{value}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  loadingText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.onSurfaceVariant },
  errorText: { fontFamily: FontFamily.body, fontSize: FontSize.bodyMedium, color: Colors.light.error },
  retryBtn: {
    marginTop: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.primary, borderRadius: Radius.lg,
  },
  retryText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodyMedium, color: Colors.light.onPrimary },

  appBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface, borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  appBarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.titleLarge, color: Colors.light.onSurface },

  content: { paddingBottom: Spacing.xl },

  profileCard: {
    alignItems: 'center', backgroundColor: Colors.light.surface,
    paddingTop: Spacing.lg + Spacing.sm, paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg, gap: Spacing.sm, ...Shadow.subtle,
  },
  profileAvatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.light.primary + '40',
  },
  profileAvatarText: { fontFamily: FontFamily.headline, fontSize: 32, color: Colors.light.primary },
  profileImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: Colors.light.primary + '40' },
  profileName: { fontFamily: FontFamily.headline, fontSize: FontSize.headlineMedium, color: Colors.light.onSurface },
  licenseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: Colors.light.primaryFixed + '70', borderRadius: Radius.full,
  },
  licenseBadgeText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelMedium, color: Colors.light.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant },
  metaDot: { color: Colors.light.onSurfaceVariant, fontSize: 14 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  chipApproved: { backgroundColor: Colors.light.tertiaryFixed + '50' },
  chipPending: { backgroundColor: Colors.light.errorContainer },
  chipText: { fontFamily: FontFamily.label, fontSize: FontSize.labelSmall },
  chipApprovedText: { color: Colors.light.tertiary },
  chipPendingText: { color: Colors.light.error },

  sectionCard: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.light.surface, borderRadius: Radius.xl,
    padding: Spacing.md, gap: Spacing.sm, ...Shadow.subtle,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  sectionTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.titleSmall, color: Colors.light.onSurface },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.light.outlineVariant + '60',
  },
  infoLabel: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onSurfaceVariant, flex: 1 },
  infoValue: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodySmall, color: Colors.light.onSurface, flex: 1, textAlign: 'right' },
  infoValueHighlight: { color: Colors.light.error, fontFamily: FontFamily.bodySemiBold },

  gridRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  gridCell: { flex: 1, gap: 2 },

  credentialsCard: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    backgroundColor: Colors.light.primary, borderRadius: Radius.xl,
    padding: Spacing.md, gap: Spacing.sm,
  },
  credentialsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  credentialsTitle: { fontFamily: FontFamily.headline, fontSize: FontSize.titleSmall, color: Colors.light.onPrimary },
  credentialsGrid: { gap: 6 },
  credRow: { flexDirection: 'row', justifyContent: 'space-between' },
  credLabel: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onPrimary + 'CC' },
  credValue: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.bodySmall, color: Colors.light.onPrimary },
  credentialsSummary: {
    marginTop: Spacing.xs, padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.lg,
  },
  credentialsSummaryLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.labelSmall, color: Colors.light.onPrimary + 'CC', marginBottom: 4 },
  credentialsSummaryText: { fontFamily: FontFamily.body, fontSize: FontSize.bodySmall, color: Colors.light.onPrimary },
});
