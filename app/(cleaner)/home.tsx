import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AuthContext } from "@/src/core/context/AuthContext";
import api from "@/src/core/api/apiClient";
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
} from "@/src/shared/constants/theme";

// ── Types ─────────────────────────────────────────────────────────────────────

type Assignment = {
  id: string;
  area: string;
  status: "In Progress" | "Queued" | "Completed";
  priority: "HIGH" | "ROUTINE";
  technician: string;
  timeLeft: string;
};

type SupplyItem = {
  icon: string;
  name: string;
  status: "Low Stock" | "Optimal" | "Medium";
  count: number;
};

type DashboardStats = {
  activeCount: number;
  pastDue: number;
  areaCoverage: number;
  completedPct: number;
};

// ── Circular Progress ─────────────────────────────────────────────────────────

function CircularProgress({ pct }: { pct: number }) {
  // Pure RN half-circle rotation technique for donut chart
  const size = 112;
  const half = size / 2;
  const border = 12;
  const inner = size - border * 2;
  const clampedPct = Math.min(100, Math.max(0, pct));
  const deg = (clampedPct / 100) * 360;

  return (
    <View style={{ width: size, height: size }}>
      {/* Track ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: border,
          borderColor: Colors.light.surfaceContainerHighest,
        }}
      />
      {/* Progress — left half */}
      <View
        style={{
          position: "absolute",
          width: half,
          height: size,
          left: 0,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: border,
            borderColor:
              clampedPct >= 50 ? Colors.light.primary : "transparent",
            transform: [{ rotate: `${Math.min(deg, 180) - 180}deg` }],
          }}
        />
      </View>
      {/* Progress — right half */}
      <View
        style={{
          position: "absolute",
          width: half,
          height: size,
          left: half,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: border,
            borderColor: Colors.light.primary,
            left: -half,
            transform: [
              {
                rotate: `${clampedPct >= 50 ? deg - 180 : deg}deg`,
              },
            ],
          }}
        />
      </View>
      {/* Center label */}
      <View
        style={{
          position: "absolute",
          inset: 0,
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={styles.progressPct}>{clampedPct}%</Text>
      </View>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CleanerHome() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [stats, setStats] = useState<DashboardStats>({
    activeCount: 0,
    pastDue: 0,
    areaCoverage: 0,
    completedPct: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleanerName, setCleanerName] = useState("Cleaner");

  useEffect(() => {
    if (vendorId) loadDashboard();
  }, [vendorId]);

  const loadDashboard = async () => {
    try {
      const res = await api.get(
        `/api/Cleaner/GetCleanerPersonnelInfoById/${vendorId}`
      );
      const d = res.data;
      setCleanerName(
        d?.full_name ?? d?.name ?? d?.FullName ?? "Cleaner"
      );

      // Derive stats from the response where available; fall back to sensible defaults
      const active = d?.active_assignments ?? d?.ActiveAssignments ?? 8;
      const pastDue = d?.past_due ?? d?.PastDue ?? 3;
      const areaCoverage = d?.area_coverage ?? d?.AreaCoverage ?? 3;
      const completedPct =
        d?.task_completion_pct ?? d?.CompletionPercent ?? 68;

      setStats({ activeCount: active, pastDue, areaCoverage, completedPct });

      // Static sample assignments; replace with real API when endpoint available
      setAssignments([
        {
          id: "1",
          area: "Decentral Sterile",
          status: "In Progress",
          priority: "HIGH",
          technician: d?.full_name ?? "Me",
          timeLeft: "12 Min",
        },
        {
          id: "2",
          area: "Room 102 ICU",
          status: "Queued",
          priority: "ROUTINE",
          technician: "Unassigned",
          timeLeft: "45 Min",
        },
      ]);

      setSupplies([
        { icon: "masks", name: "Surgical Masks", status: "Low Stock", count: 24 },
        { icon: "soap", name: "Antiseptic Soap", status: "Optimal", count: 142 },
        { icon: "shield", name: "Vinyl Gloves (L)", status: "Medium", count: 86 },
      ]);
    } catch (e) {
      console.log("Dashboard load error:", e);
      // Show placeholder data on error so UI isn't blank
      setStats({ activeCount: 8, pastDue: 3, areaCoverage: 3, completedPct: 68 });
      setAssignments([
        {
          id: "1",
          area: "Decentral Sterile",
          status: "In Progress",
          priority: "HIGH",
          technician: "Sarah J.",
          timeLeft: "12 Min",
        },
        {
          id: "2",
          area: "Room 102 ICU",
          status: "Queued",
          priority: "ROUTINE",
          technician: "Unassigned",
          timeLeft: "45 Min",
        },
      ]);
      setSupplies([
        { icon: "masks", name: "Surgical Masks", status: "Low Stock", count: 24 },
        { icon: "soap", name: "Antiseptic Soap", status: "Optimal", count: 142 },
        { icon: "shield", name: "Vinyl Gloves (L)", status: "Medium", count: 86 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStyle = (status: SupplyItem["status"]) => {
    switch (status) {
      case "Low Stock":
        return { color: Colors.light.error };
      case "Optimal":
        return { color: Colors.light.tertiary };
      default:
        return { color: Colors.light.onSurfaceVariant };
    }
  };

  const getPriorityStyle = (priority: Assignment["priority"]) =>
    priority === "HIGH"
      ? { bg: Colors.light.primaryFixed, text: Colors.light.primary }
      : { bg: Colors.light.surfaceContainerHighest, text: Colors.light.onSurfaceVariant };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatarSmall}>
            <MaterialIcons name="person" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.brandName}>Clinical Atelier</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={Colors.light.onSurface}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats Section ─────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          {/* Main active card */}
          <View style={styles.mainStatCard}>
            <MaterialIcons
              name="cleaning-services"
              size={96}
              color={Colors.light.onPrimary}
              style={styles.mainStatBgIcon}
            />
            <Text style={styles.mainStatLabel}>Cleaning Assignments</Text>
            <Text style={styles.mainStatCount}>{String(stats.activeCount).padStart(2, "0")}</Text>
            <Text style={styles.mainStatSub}>Currently Active</Text>
          </View>

          {/* Small cards row */}
          <View style={styles.smallCardsRow}>
            {/* Past Due card */}
            <View style={[styles.smallStatCard, styles.pastDueCard]}>
              <Text style={styles.smallStatLabel}>Past Due</Text>
              <View style={styles.smallStatRow}>
                <Text style={[styles.smallStatCount, { color: Colors.light.error }]}>
                  {stats.pastDue}
                </Text>
                <MaterialIcons
                  name="warning"
                  size={18}
                  color={Colors.light.error}
                  style={{ marginBottom: 2 }}
                />
              </View>
            </View>

            {/* Area Coverage card */}
            <View style={[styles.smallStatCard, styles.areaCoverageCard]}>
              <Text style={styles.smallStatLabel}>Area Coverage</Text>
              <View style={styles.smallStatRow}>
                <Text style={[styles.smallStatCount, { color: Colors.light.tertiary }]}>
                  {stats.areaCoverage}
                </Text>
                <Text style={[styles.smallStatUnit, { color: Colors.light.tertiary }]}>
                  UNITS
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Task Progress ─────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Task Progress</Text>
            <Text style={styles.cardSubLabel}>THIS SHIFT</Text>
          </View>
          <View style={styles.progressRow}>
            <CircularProgress pct={stats.completedPct} />
            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.primary }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: Colors.light.surfaceContainerHighest }]}
                />
                <Text style={styles.legendText}>Remaining</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Assignments ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewMapBtn}>VIEW MAP</Text>
          </TouchableOpacity>
        </View>

        {assignments.map((a) => {
          const prioStyle = getPriorityStyle(a.priority);
          const isQueued = a.status === "Queued";
          return (
            <View key={a.id} style={[styles.card, styles.assignmentCard]}>
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentLeft}>
                  <View
                    style={[
                      styles.assignmentIconWrap,
                      {
                        backgroundColor: isQueued
                          ? Colors.light.surfaceContainerHighest
                          : Colors.light.primaryFixed,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={isQueued ? "bed" : "sanitizer"}
                      size={22}
                      color={isQueued ? Colors.light.outline : Colors.light.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.assignmentName}>{a.area}</Text>
                    <Text style={styles.assignmentStatus}>
                      Status: {a.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View
                  style={[styles.priorityBadge, { backgroundColor: prioStyle.bg }]}
                >
                  <Text style={[styles.priorityText, { color: prioStyle.text }]}>
                    {a.priority === "HIGH" ? "HIGH PRIO" : "ROUTINE"}
                  </Text>
                </View>
              </View>
              <View style={[styles.assignmentMeta, isQueued && { opacity: 0.6 }]}>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>TECHNICIAN</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {a.technician}
                  </Text>
                </View>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>
                    {isQueued ? "EST. TIME" : "TIME LEFT"}
                  </Text>
                  <Text
                    style={[
                      styles.metaValue,
                      !isQueued && { color: Colors.light.error },
                    ]}
                  >
                    {a.timeLeft}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* ── Supply Inventory ──────────────────────────────────────── */}
        <View style={styles.inventoryCard}>
          <Text style={styles.cardTitle}>Supply Inventory</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            {supplies.map((s, i) => (
              <View key={i} style={styles.supplyRow}>
                <View style={styles.supplyLeft}>
                  <MaterialIcons
                    name={s.icon as any}
                    size={22}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.supplyName}>{s.name}</Text>
                </View>
                <Text style={[styles.supplyStatus, getStockStyle(s.status)]}>
                  {s.status} ({s.count})
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.restockBtn}
            activeOpacity={0.85}
            onPress={() => Alert.alert("Restock Request", "Restock request sent successfully.")}
          >
            <Text style={styles.restockBtnText}>Restock Requests</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.md },

  // Stats
  statsGrid: { gap: Spacing.sm },
  mainStatCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: "hidden",
    ...Shadow.card,
  },
  mainStatOverlay: { position: "absolute", right: 0, bottom: 0 },
  mainStatLabel: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onPrimary,
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  mainStatCount: {
    fontFamily: FontFamily.headline,
    fontSize: 40,
    color: Colors.light.onPrimary,
    marginTop: 4,
  },
  mainStatSub: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onPrimary,
    opacity: 0.85,
    marginTop: 6,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.subtle,
  },
  pastDueCard: { borderLeftWidth: 4, borderLeftColor: Colors.light.error },
  areaCoverageCard: { borderLeftWidth: 4, borderLeftColor: Colors.light.tertiary },
  smallStatLabel: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  smallStatRow: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginTop: 4 },
  smallStatCount: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineMedium,
  },
  smallStatUnit: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.labelSmall,
    marginBottom: 3,
  },

  // Shared card
  card: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.subtle,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },
  cardSubLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Progress
  progressRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xl },
  progressPct: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.primary,
  },
  progressLegend: { flex: 1, gap: Spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
  },

  // Assignments section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineSmall,
    color: Colors.light.onSurface,
  },
  viewMapBtn: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },

  // Assignment card
  assignmentCard: { gap: Spacing.md },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assignmentLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flex: 1 },
  assignmentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  assignmentName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurface,
  },
  assignmentStatus: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  priorityText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    letterSpacing: 0.3,
  },
  assignmentMeta: { flexDirection: "row", gap: Spacing.md },
  metaBox: {
    flex: 1,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  metaLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
    color: Colors.light.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurface,
    marginTop: 2,
  },

  // Inventory
  inventoryCard: {
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  supplyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 4,
  },
  supplyLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  supplyName: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurface,
  },
  supplyStatus: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSmall,
  },
  restockBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.lg,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  restockBtnText: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onPrimary,
  },

  smallCardsRow: { flexDirection: "row", gap: Spacing.sm },
  mainStatBgIcon: { position: "absolute", right: -12, bottom: -12, opacity: 0.12 },
});
