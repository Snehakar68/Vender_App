// src/shared/components/DispatchChart.tsx

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_CALLS = 68;
const EMERGENCY = 45;
const SCHEDULED = 23;

const EMERGENCY_COLOR = "#dc2626";
const SCHEDULED_COLOR = "#2563eb";
const TRACK_COLOR = "#f1f5f9";

const RADIUS = 60;
const STROKE_WIDTH = 18;
const SVG_SIZE = 180;
const CENTER = SVG_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const EMERGENCY_STROKE = CIRCUMFERENCE * (EMERGENCY / TOTAL_CALLS);
const SCHEDULED_STROKE = CIRCUMFERENCE * (SCHEDULED / TOTAL_CALLS);

type SegmentKey = "emergency" | "scheduled";

const SEGMENT_DATA = {
  emergency: {
    label: "Emergency",
    count: EMERGENCY,
    percent: Math.round((EMERGENCY / TOTAL_CALLS) * 100),
    color: EMERGENCY_COLOR,
    meta: "Avg response: 6.4 min",
  },
  scheduled: {
    label: "Scheduled",
    count: SCHEDULED,
    percent: Math.round((SCHEDULED / TOTAL_CALLS) * 100),
    color: SCHEDULED_COLOR,
    meta: "Pre-scheduled trips",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DispatchChart() {
  const [active, setActive] = useState<SegmentKey | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activateSegment = (key: SegmentKey) => {
    setActive(key);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const deactivateSegment = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setActive(null));
  };

  const seg = active ? SEGMENT_DATA[active] : null;

  // Slightly thicken the active arc for visual feedback
  const eStroke = active === "emergency" ? STROKE_WIDTH + 5 : STROKE_WIDTH;
  const sStroke = active === "scheduled" ? STROKE_WIDTH + 5 : STROKE_WIDTH;

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dispatch Intelligence</Text>
          <Text style={styles.subtitle}>Real-time Operational Overview</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <StatCard label="Total Calls" value={String(TOTAL_CALLS)} badge="+14%" />
        <StatCard label="Peak Hour" value="9" sub="AM" />
        <StatCard label="Avg Response" value="6.4" sub="min" highlight />
      </View>

      {/* ── Chart Row ───────────────────────────────────────────────────── */}
      <View style={styles.chartRow}>
        {/*
         * Key fix: SVG <G onPressIn> is unreliable on Android.
         * Instead, render transparent TouchableOpacity overlays ABOVE the SVG.
         * Emergency arc spans the top half of the donut (arc starts at -90°,
         * covers ~237° for 66%). Scheduled covers the remaining ~123°.
         * Simplest reliable split: top half = emergency, bottom half = scheduled.
         */}
        <View style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          {/* SVG donut (non-interactive, z=0) */}
          <Svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            style={StyleSheet.absoluteFillObject}
          >
            {/* Track */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={TRACK_COLOR}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Emergency arc */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={EMERGENCY_COLOR}
              strokeWidth={eStroke}
              strokeDasharray={`${EMERGENCY_STROKE} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CENTER},${CENTER}`}
              fill="none"
            />
            {/* Scheduled arc */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={SCHEDULED_COLOR}
              strokeWidth={sStroke}
              strokeDasharray={`${SCHEDULED_STROKE} ${CIRCUMFERENCE}`}
              strokeDashoffset={-EMERGENCY_STROKE}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CENTER},${CENTER}`}
              fill="none"
            />
          </Svg>

          {/* Center label (z=1, non-interactive) */}
          <View style={styles.centerOverlay} pointerEvents="none">
            {seg ? (
              <>
                <Text style={[styles.centerCount, { color: seg.color }]}>
                  {seg.count}
                </Text>
                <Text style={styles.centerLabel}>{seg.label}</Text>
              </>
            ) : (
              <>
                <Text style={styles.centerCount}>{TOTAL_CALLS}</Text>
                <Text style={styles.centerLabel}>Total</Text>
              </>
            )}
          </View>

          {/* Touch overlays (z=2, transparent) */}
          {/* Top half → Emergency */}
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => activateSegment("emergency")}
            onPressOut={deactivateSegment}
            style={[styles.hitArea, { top: 0, height: SVG_SIZE / 2 }]}
          />
          {/* Bottom half → Scheduled */}
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => activateSegment("scheduled")}
            onPressOut={deactivateSegment}
            style={[styles.hitArea, { bottom: 0, height: SVG_SIZE / 2 }]}
          />
        </View>

        {/* ── Right panel: tooltip + scheduled badge ── */}
        <View style={styles.sidePanel}>
          {seg ? (
            <Animated.View
              style={[
                styles.tooltipCard,
                { borderColor: seg.color, opacity: fadeAnim },
              ]}
            >
              <View
                style={[styles.tooltipAccent, { backgroundColor: seg.color }]}
              />
              <View style={styles.tooltipInner}>
                <Text style={styles.tooltipTypeLabel}>{seg.label}</Text>
                <Text style={[styles.tooltipCount, { color: seg.color }]}>
                  {seg.count} calls
                </Text>
                <Text style={styles.tooltipPct}>{seg.percent}% of total</Text>
                <View style={styles.tooltipDivider} />
                <Text style={styles.tooltipMeta}>{seg.meta}</Text>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.hintCard}>
              <Text style={styles.hintText}>
                Tap a segment{"\n"}for details
              </Text>
            </View>
          )}

          {/* Scheduled badge — always visible (matches screenshot) */}
          <View style={styles.scheduledBadge}>
            <Text style={styles.scheduledBadgeTop}>Scheduled</Text>
            <Text style={styles.scheduledBadgeCount}>{SCHEDULED} calls</Text>
          </View>
        </View>
      </View>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <View style={styles.legendRow}>
        <LegendChip
          color={EMERGENCY_COLOR}
          label={`Emergency (${SEGMENT_DATA.emergency.percent}%)`}
        />
        <LegendChip
          color={SCHEDULED_COLOR}
          label={`Scheduled (${SEGMENT_DATA.scheduled.percent}%)`}
        />
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  badge,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statCard, highlight && styles.statCardHL]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, highlight && styles.statValueHL]}>
          {value}
        </Text>
        {sub && <Text style={styles.statSub}>{sub}</Text>}
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  subtitle: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a" },
  liveText: { fontSize: 11, fontWeight: "600", color: "#16a34a" },

  // Stat cards
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statCardHL: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  statLabel: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "500",
    marginBottom: 4,
    lineHeight: 14,
  },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  statValueHL: { color: "#2563eb" },
  statSub: { fontSize: 10, color: "#9ca3af", fontWeight: "500" },
  badge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "600", color: "#16a34a" },

  // Chart row
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  // Center label overlay
  centerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  centerCount: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -1,
  },
  centerLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
    marginTop: 2,
  },

  // Touch hit areas
  hitArea: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 2,
    // transparent — no background
  },

  // Side panel
  sidePanel: { flex: 1, gap: 10 },

  tooltipCard: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  tooltipAccent: { width: 4 },
  tooltipInner: { flex: 1, padding: 12 },
  tooltipTypeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tooltipCount: { fontSize: 20, fontWeight: "700", letterSpacing: -0.5 },
  tooltipPct: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  tooltipDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  tooltipMeta: { fontSize: 11, color: "#6b7280", fontWeight: "500" },

  hintCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  hintText: {
    fontSize: 11,
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 17,
  },

  scheduledBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  scheduledBadgeTop: {
    fontSize: 10,
    color: "#93c5fd",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scheduledBadgeCount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 2,
  },

  // Legend
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  chip: { flexDirection: "row", alignItems: "center", gap: 6 },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { fontSize: 12, color: "#4b5563", fontWeight: "500" },
});
