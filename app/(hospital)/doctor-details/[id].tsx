import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import api from "@/src/core/api/apiClient";
import {
  Colors,
  Spacing,
  Radius,
  Shadow,
  FontFamily,
  FontSize,
} from "@/src/shared/constants/theme";
import { useBase64ImageUri } from "@/hooks/use-base64-image-uri";

// ── Types ─────────────────────────────────────────────────────────────────────

type WorkDetail = {
  hospital_name?: string;
  hospital_id?: string;
  is_approved?: string;
  work_days?: string;
  start_time?: string;
  end_time?: string;
};

type BankAccount = {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  branch?: string;
  account_type?: string;
  ifsc?: string;
};

type DoctorDetail = {
  full_Name?: string;
  full_name?: string;
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
  registration_date?: string;
  summary?: string;
  online_opd?: string;
  home_visit?: string;
  is_approved?: string;
  online_consult_fee?: string | number;
  home_visit_fee?: string | number;
  workDetails?: WorkDetail[];
  bankAccounts?: BankAccount[];
  doctorDocs?: { photo?: string }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const val = (v: string | number | undefined | null) =>
  v !== undefined && v !== null && v !== "" ? String(v) : "—";

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Must be called unconditionally before any early returns (Rules of Hooks)
  const photoUri = useBase64ImageUri(doctor?.doctorDocs?.[0]?.photo);

  useEffect(() => {
    if (id) loadDoctor();
  }, [id]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/Doctor/GetDoctorById/${id}`);
      console.log("Doctor details response:", res.data);
      setDoctor(res.data || null);
    } catch {
      setError("Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !doctor) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <MaterialIcons
          name="error-outline"
          size={48}
          color={Colors.light.error}
        />
        <Text style={styles.errorText}>{error || "Doctor not found"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadDoctor}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const name = doctor.full_Name || doctor.full_name || "Unknown";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  const isApproved = doctor.is_approved === "Y";
  const hasOnlineOPD = doctor.online_opd === "Y";
  const hasHomeVisit = doctor.home_visit === "Y";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.appBarBtn}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={Colors.light.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Doctor Profile</Text>
        <TouchableOpacity style={styles.appBarBtn}>
          <MaterialIcons
            name="more-vert"
            size={22}
            color={Colors.light.onSurface}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Profile Header ─────────────────────────────────────────────────── */}
        <View style={styles.profileCard}>
          {photoUri ? (
            <Image
              source={photoUri}
              style={styles.profileImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{name}</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>Online</Text>
          </View>
          {/* Chips */}
          <View style={styles.chipsRow}>
            <View
              style={[
                styles.chip,
                hasOnlineOPD ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  hasOnlineOPD
                    ? styles.chipActiveText
                    : styles.chipInactiveText,
                ]}
              >
                Online OPD: {hasOnlineOPD ? "Yes" : "No"}
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                hasHomeVisit ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  hasHomeVisit
                    ? styles.chipActiveText
                    : styles.chipInactiveText,
                ]}
              >
                Home Visit: {hasHomeVisit ? "Yes" : "No"}
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                isApproved ? styles.chipApproved : styles.chipPending,
              ]}
            >
              <MaterialIcons
                name={isApproved ? "check-circle" : "cancel"}
                size={12}
                color={isApproved ? Colors.light.tertiary : Colors.light.error}
              />
              <Text
                style={[
                  styles.chipText,
                  isApproved ? styles.chipApprovedText : styles.chipPendingText,
                ]}
              >
                {isApproved ? "Approved" : "Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Personal Info ──────────────────────────────────────────────────── */}
        <SectionCard title="Personal Information" icon="person">
          <InfoRow label="Gender" value={val(doctor.gender)} />
          <InfoRow label="Date of Birth" value={val(doctor.dob)} />
          <InfoRow
            label="Blood Group"
            value={val(doctor.blood_group)}
            highlight
          />
          <InfoRow label="Mobile" value={val(doctor.mobile)} />
          <InfoRow label="Alt Mobile" value={val(doctor.alt_mobile)} />
          <InfoRow label="Email" value={val(doctor.email)} />
        </SectionCard>

        {/* ── Practice Address ───────────────────────────────────────────────── */}
        <SectionCard title="Practice Address" icon="location-on">
          <InfoRow label="Address Line 1" value={val(doctor.address_line1)} />
          <InfoRow label="Address Line 2" value={val(doctor.address_line2)} />
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{val(doctor.city)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.infoLabel}>State</Text>
              <Text style={styles.infoValue}>{val(doctor.state)}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.infoLabel}>Pin Code</Text>
              <Text style={styles.infoValue}>{val(doctor.pin_code)}</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Professional Credentials (dark bg) ────────────────────────────── */}
        <View style={styles.credentialsCard}>
          <View style={styles.credentialsHeader}>
            <MaterialIcons
              name="school"
              size={20}
              color={Colors.light.onPrimary}
            />
            <Text style={styles.credentialsTitle}>
              Professional Credentials
            </Text>
          </View>
          <View style={styles.credentialsGrid}>
            <CredRow label="Degree" value={val(doctor.qualification)} />
            <CredRow
              label="Experience"
              value={
                val(doctor.experience) !== "—"
                  ? `${doctor.experience} Years`
                  : "—"
              }
            />
            <CredRow label="Reg. Number" value={val(doctor.registration_no)} />
            <CredRow label="Reg. Date" value={val(doctor.registration_date)} />
          </View>
          {doctor.summary && (
            <View style={styles.credentialsSummary}>
              <Text style={styles.credentialsSummaryLabel}>Summary</Text>
              <Text style={styles.credentialsSummaryText}>
                {doctor.summary}
              </Text>
            </View>
          )}
        </View>

        {/* ── Charges ───────────────────────────────────────────────────────── */}
        <SectionCard title="Consultation Charges" icon="payments">
          <View style={styles.chargesRow}>
            <View style={styles.chargeCard}>
              <MaterialIcons
                name="computer"
                size={20}
                color={Colors.light.primary}
              />
              <Text style={styles.chargeLabel}>Online Consult</Text>
              <Text style={styles.chargeAmount}>
                {doctor.online_consult_fee !== undefined
                  ? `₹${doctor.online_consult_fee}`
                  : "—"}
              </Text>
            </View>
            <View style={styles.chargeCard}>
              <MaterialIcons
                name="home"
                size={20}
                color={Colors.light.primary}
              />
              <Text style={styles.chargeLabel}>Home Visit</Text>
              <Text style={styles.chargeAmount}>
                {doctor.home_visit_fee !== undefined
                  ? `₹${doctor.home_visit_fee}`
                  : "—"}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Linked Hospitals / Work Details ───────────────────────────────── */}
        {(doctor.workDetails?.length ?? 0) > 0 && (
          <SectionCard title="Linked Hospitals" icon="local-hospital">
            {doctor.workDetails!.map((w, i) => (
              <View key={i} style={styles.workCard}>
                <View style={styles.workCardTop}>
                  <Text style={styles.workHospital}>
                    {val(w.hospital_name)}
                  </Text>
                  <View
                    style={[
                      styles.chip,
                      w.is_approved === "Y"
                        ? styles.chipApproved
                        : styles.chipPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        w.is_approved === "Y"
                          ? styles.chipApprovedText
                          : styles.chipPendingText,
                      ]}
                    >
                      {w.is_approved === "Y" ? "Approved" : "Pending"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workSchedule}>
                  {val(w.work_days)}
                  {"  "}
                  {w.start_time && w.end_time
                    ? `${w.start_time} – ${w.end_time}`
                    : ""}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Bank / Payout ─────────────────────────────────────────────────── */}
        {(doctor.bankAccounts?.length ?? 0) > 0 && (
          <SectionCard title="Bank & Payout Settings" icon="account-balance">
            {doctor.bankAccounts!.map((b, i) => (
              <View key={i} style={i > 0 ? styles.bankDivider : undefined}>
                <InfoRow label="Bank Name" value={val(b.bank_name)} />
                <InfoRow label="Account Holder" value={val(b.account_holder)} />
                <InfoRow label="Account Number" value={val(b.account_number)} />
                <InfoRow label="Branch" value={val(b.branch)} />
                <InfoRow label="IFSC" value={val(b.ifsc)} />
                <InfoRow label="Account Type" value={val(b.account_type)} />
              </View>
            ))}
          </SectionCard>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
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

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value}
      </Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  loadingText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.error,
  },
  retryBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.lg,
  },
  retryText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onPrimary,
  },

  // App bar
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  appBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  appBarTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },

  content: { paddingBottom: Spacing.xl },

  // Profile header card
  profileCard: {
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingTop: Spacing.lg + Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.subtle,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.light.primary + "40",
  },
  profileAvatarText: {
    fontFamily: FontFamily.headline,
    fontSize: 32,
    color: Colors.light.primary,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: Colors.light.primary + "40",
  },
  profileName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineMedium,
    color: Colors.light.onSurface,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.light.tertiaryFixed + "50",
    borderRadius: Radius.full,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tertiary,
  },
  onlineBadgeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelLarge,
    color: Colors.light.tertiary,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  chipActive: { backgroundColor: Colors.light.tertiaryFixed + "50" },
  chipInactive: { backgroundColor: Colors.light.surfaceContainerHigh },
  chipApproved: { backgroundColor: Colors.light.tertiaryFixed + "50" },
  chipPending: { backgroundColor: Colors.light.errorContainer },
  chipText: { fontFamily: FontFamily.label, fontSize: FontSize.labelSmall },
  chipActiveText: { color: Colors.light.tertiary },
  chipInactiveText: { color: Colors.light.onSurfaceVariant },
  chipApprovedText: { color: Colors.light.tertiary },
  chipPendingText: { color: Colors.light.error },

  // Section card
  sectionCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.subtle,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onSurface,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant + "60",
  },
  infoLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    flex: 1,
  },
  infoValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurface,
    flex: 1,
    textAlign: "right",
  },
  infoValueHighlight: {
    color: Colors.light.error,
    fontFamily: FontFamily.bodySemiBold,
  },

  // Grid row for city/state/pin
  gridRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.xs },
  gridCell: { flex: 1, gap: 2 },

  // Credentials card (dark)
  credentialsCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  credentialsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 4,
  },
  credentialsTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleSmall,
    color: Colors.light.onPrimary,
  },
  credentialsGrid: { gap: 6 },
  credRow: { flexDirection: "row", justifyContent: "space-between" },
  credLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onPrimary + "CC",
  },
  credValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onPrimary,
  },
  credentialsSummary: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: Radius.lg,
  },
  credentialsSummaryLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onPrimary + "CC",
    marginBottom: 4,
  },
  credentialsSummaryText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onPrimary,
  },

  // Charges
  chargesRow: { flexDirection: "row", gap: Spacing.sm },
  chargeCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primaryFixed + "50",
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  chargeLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.labelMedium,
    color: Colors.light.onSurfaceVariant,
  },
  chargeAmount: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.primary,
  },

  // Work details
  workCard: {
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceContainerLow,
    marginBottom: Spacing.xs,
    gap: 4,
  },
  workCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workHospital: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
    flex: 1,
  },
  workSchedule: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
  },

  // Bank
  bankDivider: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
  },
});
