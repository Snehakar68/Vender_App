// src/features/ambulance/screens/LiveTrackingScreen.jsx
// React Native (Expo) – mirrors the web "Live Ambulance Tracking" dashboard

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:      "#059669",   // emerald-600
  primaryLight: "#d1fae5",   // emerald-100
  primaryText:  "#065f46",
  orange:       "#f97316",
  orangeLight:  "#ffedd5",
  orangeText:   "#9a3412",
  gray:         "#9ca3af",
  grayLight:    "#f3f4f6",
  grayText:     "#374151",
  white:        "#ffffff",
  bg:           "#f9fafb",
  border:       "#e5e7eb",
  text:         "#111827",
  textMuted:    "#6b7280",
  shadow:       "#00000018",
};

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Demo data factory ────────────────────────────────────────────────────────
const STATUSES = ["Available", "On Trip", "Offline"];
const DRIVERS  = ["Rahul", "Amit", "Rohit", "Vikas", "Aman"];

function makeAmbulances() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    vehicleNo: `UP32XX${1000 + i}`,
    driver: DRIVERS[i % 5],
    lat: 26.82 + Math.random() * 0.15,
    lng: 80.88 + Math.random() * 0.15,
    speed: Math.floor(Math.random() * 70),
    status: STATUSES[i % 3],
    updatedAt: Date.now() - Math.floor(Math.random() * 20000),
  }));
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
function statusColor(s) {
  if (s === "Available") return C.primary;
  if (s === "On Trip")   return C.orange;
  return C.gray;
}
function statusBg(s) {
  if (s === "Available") return C.primaryLight;
  if (s === "On Trip")   return C.orangeLight;
  return C.grayLight;
}
function statusTextColor(s) {
  if (s === "Available") return C.primaryText;
  if (s === "On Trip")   return C.orangeText;
  return C.grayText;
}

// ─── Tiny components ──────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  return (
    <View style={s.statChip}>
      <Text style={[s.statValue, { color: color || C.text }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Legend({ color, label }) {
  return (
    <View style={s.legendRow}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value, valueStyle }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      {typeof value === "string" ? (
        <Text style={[s.infoValue, valueStyle]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

// ─── Animated pulse dot for "Live" badge ─────────────────────────────────────
function LiveDot() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[s.liveDot, { opacity }]} />;
}

// ─── Filter dropdown (simple modal picker) ───────────────────────────────────
const FILTER_OPTIONS = ["All", "Available", "On Trip", "Offline"];

function FilterPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={s.filterBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={s.filterBtnText}>{value}</Text>
        <MaterialIcons name="arrow-drop-down" size={18} color={C.textMuted} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.pickerSheet}>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.pickerItem, opt === value && s.pickerItemActive]}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text style={[s.pickerItemText, opt === value && s.pickerItemTextActive]}>
                  {opt}
                </Text>
                {opt === value && <MaterialIcons name="check" size={16} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
function AmbulanceSheet({ selected, now, onClose }) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (selected) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [selected]);

  if (!selected) return null;

  const secAgo = Math.max(0, Math.floor((now - selected.updatedAt) / 1000));

  return (
    <Animated.View style={[s.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
      {/* Drag handle */}
      <View style={s.dragHandle} />

      {/* Header row */}
      <View style={s.sheetHeader}>
        <View style={s.sheetHeaderLeft}>
          <Text style={s.sheetTitle}>Selected Ambulance</Text>
          {selected.status === "On Trip" && (
            <View style={s.liveBadge}>
              <LiveDot />
              <Text style={s.liveBadgeText}>Live</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <MaterialIcons name="close" size={18} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Info rows */}
      <View style={s.infoBlock}>
        <InfoRow label="Vehicle" value={selected.vehicleNo} />
        <InfoRow label="Driver"  value={selected.driver} />
        <InfoRow
          label="Status"
          value={
            <View style={[s.statusBadge, { backgroundColor: statusBg(selected.status) }]}>
              <Text style={[s.statusBadgeText, { color: statusTextColor(selected.status) }]}>
                {selected.status}
              </Text>
            </View>
          }
        />
        <InfoRow label="Speed"       value={`${selected.speed} km/h`} />
        <InfoRow label="Last Update" value={`${secAgo} sec ago`} />
      </View>

      {/* CTA */}
      <TouchableOpacity style={s.viewBtn} activeOpacity={0.85}>
        <Text style={s.viewBtnText}>View Details</Text>
        <MaterialIcons name="chevron-right" size={22} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function LiveTrackingScreen() {
  const [ambulances, setAmbulances] = useState(makeAmbulances);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");
  const [now, setNow]               = useState(Date.now());
  const mapRef = useRef(null);

  // Tick clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate "On Trip" movement
  useEffect(() => {
    const t = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((a) => {
          if (a.status !== "On Trip") return a;
          return {
            ...a,
            lat: a.lat + (Math.random() - 0.5) * 0.002,
            lng: a.lng + (Math.random() - 0.5) * 0.002,
            speed: Math.floor(30 + Math.random() * 40),
            updatedAt: Date.now() - a.updatedAt > 5000 ? Date.now() : a.updatedAt,
          };
        })
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const selected = useMemo(
    () => ambulances.find((a) => a.id === selectedId) || null,
    [ambulances, selectedId]
  );

  // Pan map to selected
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: selected.lat, longitude: selected.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 },
        600
      );
    }
  }, [selected?.lat, selected?.lng]);

  const filtered = useMemo(
    () =>
      ambulances.filter(
        (a) =>
          (filter === "All" || a.status === filter) &&
          a.vehicleNo.toLowerCase().includes(search.toLowerCase())
      ),
    [ambulances, filter, search]
  );

  const counts = useMemo(() => ({
    total:     ambulances.length,
    onTrip:    ambulances.filter((a) => a.status === "On Trip").length,
    available: ambulances.filter((a) => a.status === "Available").length,
  }), [ambulances]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* ── Header card ─────────────────────────────────────────────── */}
      <View style={s.headerCard}>
        {/* Title row */}
        <View style={s.titleRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={s.titleEmoji}>🚑</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Live Ambulance Tracking</Text>
            <Text style={s.subtitle}>Monitor real-time ambulance movement and operational status</Text>
          </View>
        </View>

        {/* Stats + controls row */}
        <View style={s.statsRow}>
          <StatChip label="Total"     value={counts.total} />
          <View style={s.divider} />
          <StatChip label="On Trip"   value={counts.onTrip}    color={C.orange} />
          <View style={s.divider} />
          <StatChip label="Available" value={counts.available} color={C.primary} />
        </View>

        {/* Filter + search */}
        <View style={s.controlsRow}>
          <FilterPicker value={filter} onChange={setFilter} />
          <View style={s.searchBox}>
            <MaterialIcons name="search" size={16} color={C.textMuted} style={{ marginRight: 4 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Search Vehicle"
              placeholderTextColor={C.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Legend */}
        <View style={s.legendRow2}>
          <Legend color={C.primary} label="Available" />
          <Legend color={C.orange}  label="On Trip" />
          <Legend color={C.gray}    label="Offline" />
        </View>
      </View>

      {/* ── Map ─────────────────────────────────────────────────────── */}
      <View style={s.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude:       26.8467,
            longitude:      80.9462,
            latitudeDelta:  0.18,
            longitudeDelta: 0.18,
          }}
        >
          {filtered.map((amb) => (
            <Marker
              key={amb.id}
              coordinate={{ latitude: amb.lat, longitude: amb.lng }}
              onPress={() => setSelectedId(amb.id)}
            >
              <View
                style={[
                  s.markerCircle,
                  { backgroundColor: statusColor(amb.status) },
                  amb.id === selectedId && s.markerSelected,
                ]}
              />
            </Marker>
          ))}
        </MapView>

        {/* Map action buttons (top-right) */}
        <View style={s.mapActions}>
          <TouchableOpacity style={s.mapActionBtn} activeOpacity={0.8}>
            <MaterialIcons name="my-location" size={20} color={C.grayText} />
          </TouchableOpacity>
          <TouchableOpacity style={s.mapActionBtn} activeOpacity={0.8}>
            <MaterialIcons name="layers" size={20} color={C.grayText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Bottom sheet ─────────────────────────────────────────────── */}
      <AmbulanceSheet
        selected={selected}
        now={now}
        onClose={() => setSelectedId(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  headerCard: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  titleEmoji: { fontSize: 26 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 12, color: C.textMuted, marginTop: 2, maxWidth: SW - 80 },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  statChip: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 10, color: C.textMuted, marginTop: 1, textTransform: "uppercase", letterSpacing: 0.5 },
  divider: { width: 1, height: 28, backgroundColor: C.border },

  controlsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: C.white,
    gap: 4,
    minWidth: 90,
  },
  filterBtnText: { fontSize: 13, color: C.grayText, fontWeight: "500" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: C.white,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text, paddingVertical: 7 },

  legendRow2: { flexDirection: "row", gap: 16 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: C.grayText },

  // Modal picker
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center", alignItems: "center",
  },
  pickerSheet: {
    backgroundColor: C.white, borderRadius: 14, width: 220,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  pickerItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pickerItemActive: { backgroundColor: C.primaryLight },
  pickerItemText: { fontSize: 14, color: C.grayText },
  pickerItemTextActive: { color: C.primary, fontWeight: "600" },

  // Map
  mapContainer: {
    flex: 1,
    backgroundColor: "#d4e0d4",
  },
  markerCircle: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5, borderColor: C.white,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3, elevation: 4,
  },
  markerSelected: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 3,
  },
  mapActions: {
    position: "absolute", top: 14, right: 14, gap: 10,
  },
  mapActionBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
    marginBottom: 8,
  },

  // Bottom sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 28,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: "center",
    marginTop: 12, marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sheetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  sheetTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#d1fae5", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
  liveBadgeText: { fontSize: 11, fontWeight: "700", color: C.primary, letterSpacing: 0.3 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.grayLight, justifyContent: "center", alignItems: "center",
  },

  // Info rows
  infoBlock: {
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
    overflow: "hidden", marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  infoLabel: { fontSize: 13, color: C.textMuted },
  infoValue: { fontSize: 13, fontWeight: "600", color: C.text },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },

  // CTA
  viewBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 4, height: 52, backgroundColor: C.primary, borderRadius: 14,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  viewBtnText: { fontSize: 16, fontWeight: "700", color: C.white },
});
