// src/shared/components/FleetLiveMap.tsx

import React, { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Callout, CalloutSubview } from "react-native-maps";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ambulances = [
  {
    id: "UP32AB1234",
    lat: 26.8467,
    lng: 80.9462,
    status: "available",
    label: "Ambulance Unit",
    lastUpdated: "Just now",
  },
  {
    id: "DL10XY5678",
    lat: 28.6139,
    lng: 77.209,
    status: "ontrip",
    label: "Ambulance Unit",
    lastUpdated: "Just now",
  },
  {
    id: "MH12ZZ0001",
    lat: 18.5204,
    lng: 73.8567,
    status: "offline",
    label: "Ambulance Unit",
    lastUpdated: "5 min ago",
  },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { dot: string; bg: string; text: string; label: string }
> = {
  available: {
    dot: "#16a34a",
    bg: "#dcfce7",
    text: "#16a34a",
    label: "AVAILABLE",
  },
  ontrip: {
    dot: "#dc2626",
    bg: "#fee2e2",
    text: "#dc2626",
    label: "ONTRIP",
  },
  offline: {
    dot: "#9ca3af",
    bg: "#f3f4f6",
    text: "#6b7280",
    label: "OFFLINE",
  },
};

const MARKER_COLOR: Record<string, string> = {
  available: "#22c55e",
  ontrip: "#ef4444",
  offline: "#9ca3af",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function FleetLiveMap() {
  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fleet Live Tracking</Text>
        <Text style={styles.expandBtn}>EXPAND ↗</Text>
      </View>

      {/* Map container — explicit height prevents revenue card overlap */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 22.5937,
            longitude: 78.9629,
            latitudeDelta: 18,
            longitudeDelta: 18,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {ambulances.map((amb) => {
            const cfg = STATUS_CONFIG[amb.status] ?? STATUS_CONFIG.offline;

            return (
              <Marker
                key={amb.id}
                coordinate={{ latitude: amb.lat, longitude: amb.lng }}
                // Custom marker view
                // Callout is ALWAYS mounted — never conditionally render it
              >
                {/* ── Custom pin ── */}
                <View style={styles.pinOuter}>
                  <View
                    style={[
                      styles.pinInner,
                      { backgroundColor: MARKER_COLOR[amb.status] ?? "#9ca3af" },
                    ]}
                  />
                </View>

                {/* ── Callout tooltip — always mounted, matches screenshot ── */}
                <Callout tooltip style={styles.calloutWrapper}>
                  <View style={styles.callout}>
                    {/* Close hint row */}
                    <View style={styles.calloutHeader}>
                      {/* Ambulance icon circle */}
                      <View style={styles.calloutIconWrap}>
                        <MaterialIcons
                          name="local-hospital"
                          size={16}
                          color="#2563eb"
                        />
                      </View>
                      <View style={styles.calloutTitleWrap}>
                        <Text style={styles.calloutId}>{amb.id}</Text>
                        <Text style={styles.calloutLabel}>{amb.label}</Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.calloutDivider} />

                    {/* Status badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: cfg.bg },
                      ]}
                    >
                      <View
                        style={[styles.statusDot, { backgroundColor: cfg.dot }]}
                      />
                      <Text style={[styles.statusText, { color: cfg.text }]}>
                        {cfg.label}
                      </Text>
                    </View>

                    {/* Last updated */}
                    <Text style={styles.lastUpdated}>
                      Last Updated: {amb.lastUpdated}
                    </Text>
                  </View>

                  {/* Callout arrow */}
                  <View style={styles.calloutArrow} />
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* Fleet status legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Fleet Status</Text>
          <LegendRow color="#22c55e" label="Available" />
          <LegendRow color="#ef4444" label="On Trip" />
          <LegendRow color="#9ca3af" label="Offline" />
        </View>
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  expandBtn: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
    letterSpacing: 0.6,
  },

  // ── Map ──
  mapContainer: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // ── Custom pin marker ──
  pinOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // ── Callout (tooltip) ──
  // IMPORTANT: calloutWrapper must have a defined width for iOS
  calloutWrapper: {
    width: 200,
    alignItems: "center",
  },
  callout: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    width: 200,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  calloutIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  calloutTitleWrap: {
    flex: 1,
  },
  calloutId: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  calloutLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 1,
  },
  calloutDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  lastUpdated: {
    fontSize: 10,
    color: "#9ca3af",
  },

  // Callout downward arrow
  calloutArrow: {
    width: 14,
    height: 7,
    backgroundColor: "transparent",
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffffff",
    marginTop: -1,
  },

  // ── Legend ──
  legend: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginVertical: 3,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "500",
  },
});
