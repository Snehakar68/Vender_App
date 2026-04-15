import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  AmbColors,
  AmbRadius,
  AmbShadow,
} from "@/src/features/ambulance/constants/ambulanceTheme";
import {
  MOCK_ACTIVITY,
  MOCK_PULSE_CARDS,
  MOCK_REVENUE_BARS,
} from "@/src/features/ambulance/data/mockData";
import AmbulanceTopBar from "@/src/features/ambulance/components/AmbulanceTopBar";
import DispatchChart from "@/src/store/components/DispatchChart";
import FleetLiveMap from "@/src/store/components/FleetLiveMap";

// ─── Dispatch grid data ───────────────────────────────────────────────────────
const DISPATCH_GRID = [
  {
    label: "Total Calls",
    value: "68",
    badge: "+14%",
    badgeColor: AmbColors.tertiary,
  },
  { label: "Peak Hour", value: "9:00", sub: "AM Transit" },
];

export default function AmbulanceHomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AmbulanceTopBar avatarInitials="JH" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Operational Pulse ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Pulse</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pulseRow}
          >
            {MOCK_PULSE_CARDS.map((card, i) => (
              <View
                key={i}
                style={[styles.pulseCard, { backgroundColor: card.bgColor }]}
              >
                <Text style={styles.pulseLabel}>{card.label}</Text>
                <Text style={[styles.pulseValue, { color: card.accent }]}>
                  {card.value}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Section 2: Dispatch Intelligence ─────────────────────────── */}

        <DispatchChart />

        {/* ── Section 3: Revenue Intelligence ──────────────────────────── */}
        <View style={[styles.revenueCard, AmbShadow.elevated]}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueSectionLabel}>
                Revenue Intelligence
              </Text>
              <Text style={styles.revenueTotal}>₹855,000</Text>
            </View>
            <View style={styles.revenueBadge}>
              <Text style={styles.revenueBadgeText}>+12%</Text>
            </View>
          </View>
          {MOCK_REVENUE_BARS.map((bar, i) => (
            <View key={i} style={styles.revenueRow}>
              <View style={styles.revenueRowHeader}>
                <Text style={styles.revenueBarLabel}>{bar.label}</Text>
                <Text style={styles.revenueBarAmount}>{bar.amount}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${bar.progress * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Section 4: Fleet Live Tracking ───────────────────────────── */}
        {/* Section 4: Fleet Live Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fleet Live Tracking</Text>
          <View style={{ height: 260, borderRadius: 16, overflow: "hidden" }}>
            <FleetLiveMap />
          </View>
        </View>

        {/* ── Section 5: Recent Activity ────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {MOCK_ACTIVITY.map((item) => (
            <View key={item.id} style={[styles.activityCard, AmbShadow.subtle]}>
              <View
                style={[styles.activityIcon, { backgroundColor: item.iconBg }]}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={20}
                  color={item.iconColor}
                />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activitySub}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendChip}>
      <View style={[styles.legendChipDot, { backgroundColor: color }]} />
      <Text style={styles.legendChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingBottom: 24 },

  // ── Sections
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: AmbColors.onSurfaceVariant,
    marginBottom: 12,
  },

  // ── Pulse cards
  pulseRow: { paddingLeft: 2, paddingRight: 16, gap: 12 },
  pulseCard: {
    width: 136,
    padding: 16,
    borderRadius: AmbRadius.lg,
    gap: 4,
    ...AmbShadow.card,
  },
  pulseLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: AmbColors.secondary,
  },
  pulseValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 30,
  },

  // ── Dispatch
  dispatchGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  dispatchCard: {
    flex: 1,
    backgroundColor: AmbColors.surfaceContainerLowest,
    padding: 20,
    borderRadius: AmbRadius.lg,
    ...AmbShadow.subtle,
  },
  dispatchLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: AmbColors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dispatchValueRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  dispatchValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    color: AmbColors.onSurface,
  },
  dispatchBadge: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  dispatchSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: AmbColors.secondary,
    marginTop: 2,
  },
  responseCard: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    padding: 20,
    borderRadius: AmbRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...AmbShadow.subtle,
  },
  responseLeft: {},
  responseLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: AmbColors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  responseValueRow: { flexDirection: "row", alignItems: "baseline" },
  responseValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 30,
    color: AmbColors.primary,
  },
  responseUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: AmbColors.secondary,
  },

  // Donut (CSS border trick)
  donutWrapper: { width: 88, height: 88, position: "relative" },
  donutRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 8,
    borderTopColor: AmbColors.primary,
    borderRightColor: AmbColors.primary,
    borderBottomColor: AmbColors.primary,
    borderLeftColor: AmbColors.surfaceContainerHighest,
    transform: [{ rotate: "-45deg" }],
  },
  donutCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
  },
  donutPct: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: AmbColors.onSurface,
  },
  donutSub: {
    fontFamily: "Inter_500Medium",
    fontSize: 8,
    color: AmbColors.secondary,
  },

  // Legend
  legend: { flexDirection: "row", gap: 16, marginTop: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: AmbColors.secondary,
  },

  // ── Revenue card
  revenueCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: AmbColors.primary,
    borderRadius: AmbRadius.xxl,
    padding: 24,
  },
  revenueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  revenueSectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  revenueTotal: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 32,
    color: "#ffffff",
  },
  revenueBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: AmbRadius.pill,
  },
  revenueBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#ffffff",
  },
  revenueRow: { marginBottom: 14 },
  revenueRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  revenueBarLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  revenueBarAmount: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#ffffff",
    borderRadius: 3,
  },

  // ── Fleet tracking
  trackingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expandBtn: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: AmbColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  mapPlaceholder: {
    height: 240,
    borderRadius: AmbRadius.xl,
    backgroundColor: "#d4e0d4",
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: AmbColors.surfaceContainerHigh,
  },
  gridLine: { position: "absolute", backgroundColor: "rgba(0,0,0,0.06)" },
  hLine: { left: 0, right: 0, height: 1 },
  vLine: { top: 0, bottom: 0, width: 1 },
  marker: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  markerBordered: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  mapLegend: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: AmbRadius.lg,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendChipDot: { width: 10, height: 10, borderRadius: 5 },
  legendChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: AmbColors.onSurface,
  },

  // ── Activity
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.lg,
    marginBottom: 10,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  activityText: { flex: 1 },
  activityTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: AmbColors.onSurface,
    marginBottom: 2,
  },
  activitySub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: AmbColors.secondary,
  },
});
