// src/features/ambulance/screens/DriverAssignmentScreen.jsx
// React Native (Expo) — mirrors the web "Driver Assignment" dashboard exactly

import React, { useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:      "#059669",
  primaryLight: "#d1fae5",
  primaryText:  "#065f46",
  danger:       "#dc2626",
  dangerLight:  "#fee2e2",
  dangerText:   "#991b1b",
  blue:         "#2563eb",
  blueLight:    "#dbeafe",
  blueText:     "#1e40af",
  white:        "#ffffff",
  bg:           "#f3f4f6",
  surface:      "#ffffff",
  border:       "#e5e7eb",
  text:         "#111827",
  textMuted:    "#6b7280",
  textLight:    "#9ca3af",
  selectedRow:  "#eff6ff",
  selectedBorder: "#bfdbfe",
  shadow:       "#00000014",
};

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Demo data ────────────────────────────────────────────────────────────────
const INIT_AMBULANCES = [
  { id: "1", vehicleNo: "758689",   type: "basic",   driver: "jhji",  driverId: "d1" },
  { id: "2", vehicleNo: "79879870", type: "basic",   driver: "rahul", driverId: "d3" },
  { id: "3", vehicleNo: "78998798", type: "advance", driver: null,    driverId: null },
];

const INIT_DRIVERS = [
  { id: "d1", name: "jhji",  license: "hkhijh",  assignedTo: "758689" },
  { id: "d2", name: "rohit", license: "7979877",  assignedTo: null },
  { id: "d3", name: "rahul", license: "66865868", assignedTo: "79879870" },
  { id: "d4", name: "78678", license: "9869869",  assignedTo: null },
  { id: "d5", name: "Vikas", license: "3312456",  assignedTo: null },
];

const INIT_HISTORY = {
  "1": [
    { driverName: "jhji",  fromDate: "2024-01-10", toDate: "2024-03-15" },
    { driverName: "Vikas", fromDate: "2023-06-01", toDate: "2024-01-09" },
  ],
  "2": [
    { driverName: "rahul", fromDate: "2024-02-01", toDate: null },
  ],
  "3": [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Badge({ label, variant }) {
  const styles = {
    active:    { bg: C.primaryLight, text: C.primaryText },
    free:      { bg: "#f3f4f6",      text: "#6b7280" },
    available: { bg: C.primaryLight, text: C.primaryText },
    assigned:  { bg: C.dangerLight,  text: C.dangerText },
    completed: { bg: C.blueLight,    text: C.blueText },
    current:   { bg: C.primaryLight, text: C.primaryText },
  };
  const t = styles[variant] || styles.free;
  return (
    <View style={[bs.badge, { backgroundColor: t.bg }]}>
      <Text style={[bs.badgeText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

// ─── Assignment History ───────────────────────────────────────────────────────
function AssignmentHistory({ history }) {
  return (
    <View style={bs.historySection}>
      <Text style={bs.historyTitle}>Assignment History</Text>
      {history.length === 0 ? (
        <View style={bs.historyEmpty}>
          <Text style={bs.historyEmptyText}>No previous assignments</Text>
        </View>
      ) : (
        history.map((h, i) => (
          <View key={i} style={bs.historyCard}>
            <View style={bs.historyCardLeft}>
              <Text style={bs.historyDriverName}>{h.driverName}</Text>
              <Text style={bs.historyDates}>
                {h.fromDate} — {h.toDate || "Present"}
              </Text>
            </View>
            <Badge label={h.toDate ? "Completed" : "Current"} variant={h.toDate ? "completed" : "current"} />
          </View>
        ))
      )}
    </View>
  );
}

// ─── Assign Panel (modal bottom sheet) ───────────────────────────────────────
function AssignPanel({ ambulance, drivers, history, onAssign, onCancel }) {
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  const filtered = useMemo(
    () => drivers.filter((d) => d.name.toLowerCase().includes(driverSearch.toLowerCase())),
    [drivers, driverSearch]
  );

  return (
    <Modal visible={!!ambulance} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={bs.modalOverlay}>
        <View style={bs.panelSheet}>
          {/* Handle */}
          <View style={bs.dragHandle} />

          {/* Header */}
          <View style={bs.panelHeader}>
            <View>
              <Text style={bs.panelTitle}>Assign Driver</Text>
              <Text style={bs.panelSubtitle}>
                Ambulance:{" "}
                <Text style={bs.panelAmbNo}>{ambulance?.vehicleNo}</Text>
              </Text>
            </View>
            <TouchableOpacity style={bs.closeBtn} onPress={onCancel}>
              <MaterialIcons name="close" size={18} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Driver search */}
          <View style={bs.searchRow}>
            <MaterialIcons name="search" size={16} color={C.textLight} />
            <TextInput
              style={bs.searchInput}
              placeholder="Search driver..."
              placeholderTextColor={C.textLight}
              value={driverSearch}
              onChangeText={setDriverSearch}
            />
            {driverSearch.length > 0 && (
              <TouchableOpacity onPress={() => setDriverSearch("")}>
                <MaterialIcons name="close" size={14} color={C.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Driver list */}
          <ScrollView style={bs.driverList} showsVerticalScrollIndicator={false}>
            {filtered.map((d) => {
              const isAssigned = !!d.assignedTo;
              const isSelected = selectedDriver?.id === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[
                    bs.driverCard,
                    isAssigned && bs.driverCardDisabled,
                    isSelected && bs.driverCardSelected,
                  ]}
                  onPress={() => !isAssigned && setSelectedDriver(d)}
                  activeOpacity={isAssigned ? 1 : 0.8}
                >
                  <View style={bs.driverRadioArea}>
                    <View style={[bs.radio, isSelected && bs.radioActive, isAssigned && bs.radioDisabled]}>
                      {isSelected && <View style={bs.radioDot} />}
                    </View>
                  </View>
                  <View style={bs.driverInfo}>
                    <Text style={[bs.driverName, isAssigned && { color: C.textMuted }]}>{d.name}</Text>
                    <Text style={bs.driverLicense}>DL: {d.license}</Text>
                  </View>
                  {isAssigned ? (
                    <Badge label={`Assigned to ${d.assignedTo}`} variant="assigned" />
                  ) : (
                    <Badge label="Available" variant="available" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={bs.panelActions}>
            <TouchableOpacity style={bs.cancelBtn} onPress={onCancel}>
              <Text style={bs.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bs.assignBtn, !selectedDriver && bs.assignBtnDisabled]}
              onPress={() => selectedDriver && onAssign(selectedDriver)}
              activeOpacity={selectedDriver ? 0.85 : 1}
            >
              <Text style={[bs.assignBtnText, !selectedDriver && { color: C.textLight }]}>
                Assign Driver
              </Text>
            </TouchableOpacity>
          </View>

          {/* History */}
          <AssignmentHistory history={history || []} />

          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DriverAssignmentScreen() {
  const [ambulances, setAmbulances] = useState(INIT_AMBULANCES);
  const [drivers, setDrivers] = useState(INIT_DRIVERS);
  const [history] = useState(INIT_HISTORY);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  const filtered = useMemo(
    () =>
      ambulances.filter((a) => {
        const q = globalSearch.toLowerCase();
        return (
          a.vehicleNo.toLowerCase().includes(q) ||
          (a.driver || "").toLowerCase().includes(q)
        );
      }),
    [ambulances, globalSearch]
  );

  const handleAssign = (driver) => {
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === selectedAmbulance.id
          ? { ...a, driver: driver.name, driverId: driver.id }
          : a
      )
    );
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driver.id
          ? { ...d, assignedTo: selectedAmbulance.vehicleNo }
          : d
      )
    );
    setSelectedAmbulance(null);
  };

  const handleUnassign = (ambulance) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === ambulance.driverId ? { ...d, assignedTo: null } : d
      )
    );
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === ambulance.id ? { ...a, driver: null, driverId: null } : a
      )
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Driver Assignment</Text>
        <Text style={s.headerSub}>Manage and assign drivers to ambulances</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Global search ──────────────────────────────────────────── */}
        <View style={s.searchBox}>
          <MaterialIcons name="search" size={18} color={C.textLight} />
          <TextInput
            style={s.searchInput}
            placeholder="Search driver or vehicle..."
            placeholderTextColor={C.textLight}
            value={globalSearch}
            onChangeText={setGlobalSearch}
          />
          {globalSearch.length > 0 && (
            <TouchableOpacity onPress={() => setGlobalSearch("")}>
              <MaterialIcons name="close" size={16} color={C.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Current Assignments card ───────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Current Assignments</Text>

          {/* Table header */}
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 1.2 }]}>Vehicle No</Text>
            <Text style={[s.th, { flex: 1 }]}>Type</Text>
            <Text style={[s.th, { flex: 1 }]}>Driver</Text>
            <Text style={[s.th, { flex: 1 }]}>Status</Text>
            <Text style={[s.th, { flex: 1, textAlign: "center" }]}>Action</Text>
          </View>

          {/* Table rows */}
          {filtered.map((amb, idx) => {
            const isSelected = selectedAmbulance?.id === amb.id;
            const isLast = idx === filtered.length - 1;
            return (
              <View
                key={amb.id}
                style={[
                  s.tableRow,
                  isSelected && s.tableRowSelected,
                  isLast && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={[s.td, s.tdBold, { flex: 1.2 }]}>{amb.vehicleNo}</Text>
                <Text style={[s.td, { flex: 1 }]}>{amb.type}</Text>
                <Text style={[s.td, { flex: 1, color: amb.driver ? C.text : C.textLight }]}>
                  {amb.driver || "—"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Badge label={amb.driver ? "Active" : "Free"} variant={amb.driver ? "active" : "free"} />
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  {amb.driver ? (
                    <TouchableOpacity onPress={() => handleUnassign(amb)}>
                      <Text style={s.actionUnassign}>Unassign</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={s.assignPill}
                      onPress={() => setSelectedAmbulance(amb)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.assignPillText}>Assign</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Assign Panel ───────────────────────────────────────────────── */}
      <AssignPanel
        ambulance={selectedAmbulance}
        drivers={drivers}
        history={history[selectedAmbulance?.id] || []}
        onAssign={handleAssign}
        onCancel={() => setSelectedAmbulance(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.white,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
  headerSub:   { fontSize: 12, color: C.textMuted, marginTop: 3 },

  scroll: { padding: 16, paddingBottom: 32 },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 16,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  // Table
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  th: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowSelected: {
    backgroundColor: C.selectedRow,
    borderLeftWidth: 3,
    borderLeftColor: C.blue,
  },
  td:     { fontSize: 13, color: C.text },
  tdBold: { fontWeight: "600" },

  actionUnassign: { fontSize: 13, fontWeight: "600", color: C.danger },
  assignPill: {
    borderWidth: 1.5,
    borderColor: C.blue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  assignPillText: { fontSize: 12, fontWeight: "600", color: C.blue },
});

// Badge styles (separate sheet)
const bs = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  panelSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SH * 0.88,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 12, marginBottom: 8,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingTop: 4,
  },
  panelTitle:   { fontSize: 18, fontWeight: "700", color: C.text },
  panelSubtitle:{ fontSize: 13, color: C.textMuted, marginTop: 3 },
  panelAmbNo:   { fontWeight: "700", color: C.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center", alignItems: "center",
  },

  // Search inside panel
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text },

  // Driver list
  driverList: { maxHeight: SH * 0.28 },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: C.white,
    gap: 10,
  },
  driverCardDisabled: { backgroundColor: "#f9fafb", opacity: 0.75 },
  driverCardSelected: {
    borderColor: C.blue,
    backgroundColor: C.blueLight + "33",
  },
  driverRadioArea: { width: 22, alignItems: "center" },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: C.textLight,
    justifyContent: "center", alignItems: "center",
  },
  radioActive:   { borderColor: C.primary },
  radioDisabled: { borderColor: "#d1d5db" },
  radioDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.primary,
  },
  driverInfo: { flex: 1 },
  driverName:    { fontSize: 13, fontWeight: "600", color: C.text },
  driverLicense: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  // Panel action buttons
  panelActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    marginBottom: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: C.grayText || "#374151" },
  assignBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  assignBtnDisabled: { backgroundColor: "#e5e7eb", shadowOpacity: 0, elevation: 0 },
  assignBtnText: { fontSize: 14, fontWeight: "700", color: C.white },

  // History
  historySection: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 14,
    marginTop: 8,
  },
  historyTitle: { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 10 },
  historyEmpty: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
  },
  historyEmptyText: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyCardLeft: { flex: 1 },
  historyDriverName: { fontSize: 13, fontWeight: "600", color: C.text },
  historyDates:      { fontSize: 11, color: C.textMuted, marginTop: 2 },
});
