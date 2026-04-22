import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AuthContext } from "@/src/core/context/AuthContext";
import { router } from "expo-router";

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:        "#059669",
  primaryLight:   "#d1fae5",
  primaryText:    "#065f46",
  danger:         "#dc2626",
  dangerLight:    "#fee2e2",
  dangerText:     "#991b1b",
  blue:           "#2563eb",
  blueLight:      "#dbeafe",
  blueText:       "#1e40af",
  white:          "#ffffff",
  bg:             "#f3f4f6",
  surface:        "#ffffff",
  border:         "#e5e7eb",
  text:           "#111827",
  textMuted:      "#6b7280",
  textLight:      "#9ca3af",
  selectedRow:    "#eff6ff",
  selectedBorder: "#bfdbfe",
  shadow:         "#00000014",
};

const { height: SH } = Dimensions.get("window");

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, variant }) {
  const map = {
    active:    { bg: C.primaryLight, text: C.primaryText },
    free:      { bg: "#f3f4f6",      text: "#6b7280" },
    available: { bg: C.primaryLight, text: C.primaryText },
    assigned:  { bg: C.dangerLight,  text: C.dangerText },
    completed: { bg: C.blueLight,    text: C.blueText },
    current:   { bg: C.primaryLight, text: C.primaryText },
  };
  const t = map[variant] || map.free;
  return (
    <View style={[bs.badge, { backgroundColor: t.bg }]}>
      <Text style={[bs.badgeText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

// ─── Assignment History ───────────────────────────────────────────────────────
function AssignmentHistory({ history, loading }) {
  if (loading) {
    return (
      <View style={bs.historySection}>
        <Text style={bs.historyTitle}>Assignment History</Text>
        <ActivityIndicator size="small" color={C.primary} style={{ marginTop: 8 }} />
      </View>
    );
  }
  return (
    <View style={bs.historySection}>
      <Text style={bs.historyTitle}>Assignment History</Text>
      {!history || history.length === 0 ? (
        <View style={bs.historyEmpty}>
          <Text style={bs.historyEmptyText}>No previous assignments</Text>
        </View>
      ) : (
        history.map((h, i) => (
          <View key={i} style={bs.historyCard}>
            <View style={bs.historyCardLeft}>
              {/* API may return driver_name or driverName */}
              <Text style={bs.historyDriverName}>{h.driver_name ?? h.driverName}</Text>
              <Text style={bs.historyDates}>
                {h.from_date ?? h.fromDate} —{" "}
                {h.to_date ?? h.toDate ? (h.to_date ?? h.toDate) : "Present"}
              </Text>
            </View>
            <Badge
              label={(h.to_date ?? h.toDate) ? "Completed" : "Current"}
              variant={(h.to_date ?? h.toDate) ? "completed" : "current"}
            />
          </View>
        ))
      )}
    </View>
  );
}

// ─── Assign Panel ─────────────────────────────────────────────────────────────
function AssignPanel({
  ambulance,
  drivers,
  history,
  historyLoading,
  onAssign,
  onCancel,
  assigning,
}) {
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Reset selection when panel opens for a new ambulance
  useEffect(() => {
    setSelectedDriver(null);
    setDriverSearch("");
  }, [ambulance?.ambulance_id]);

  const filtered = useMemo(
    () =>
      drivers.filter((d) =>
        (d.driver_name ?? "").toLowerCase().includes(driverSearch.toLowerCase())
      ),
    [drivers, driverSearch]
  );

  return (
    <Modal
      visible={!!ambulance}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
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
                <Text style={bs.panelAmbNo}>{ambulance?.vehical_number}</Text>
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
              const isAssigned = !!(d.assign_Ambulance?.ambulance_No); // Check actual vehicle assignment
              const isSelected = selectedDriver?.driver_id === d.driver_id;
              return (
                <TouchableOpacity
                  key={d.driver_id}
                  style={[
                    bs.driverCard,
                    isAssigned && bs.driverCardDisabled,
                    isSelected && bs.driverCardSelected,
                  ]}
                  onPress={() => !isAssigned && setSelectedDriver(d)}
                  activeOpacity={isAssigned ? 1 : 0.8}
                >
                  <View style={bs.driverRadioArea}>
                    <View
                      style={[
                        bs.radio,
                        isSelected && bs.radioActive,
                        isAssigned && bs.radioDisabled,
                      ]}
                    >
                      {isSelected && <View style={bs.radioDot} />}
                    </View>
                  </View>
                  <View style={bs.driverInfo}>
                    <Text style={[bs.driverName, isAssigned && { color: C.textMuted }]}>
                      {d.driver_name}
                    </Text>
                    <Text style={bs.driverLicense}>DL: {d.license_number ?? "—"}</Text>
                  </View>
                  {isAssigned ? (
                    <View style={bs.assignedToWrap}>
                      <Text style={bs.assignedToLabel}>Assigned to</Text>
                      <Text style={bs.assignedToVehicle}>
                        {d.assign_Ambulance?.ambulance_No ?? "—"}
                      </Text>
                    </View>
                  ) : (
                    <Badge label="Available" variant="available" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={bs.panelActions}>
            <TouchableOpacity style={bs.cancelBtn} onPress={onCancel} disabled={assigning}>
              <Text style={bs.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[bs.assignBtn, (!selectedDriver || assigning) && bs.assignBtnDisabled]}
              onPress={() => selectedDriver && onAssign(selectedDriver)}
              activeOpacity={selectedDriver && !assigning ? 0.85 : 1}
            >
              {assigning ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text
                  style={[
                    bs.assignBtnText,
                    !selectedDriver && { color: C.textLight },
                  ]}
                >
                  Assign Driver
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* History */}
          <AssignmentHistory history={history} loading={historyLoading} />

          <View style={{ height: 20 }} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DriverAssignmentScreen() {
const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? '';

  const [ambulances, setAmbulances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [history, setHistory] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  // Loading states
  const [loadingAmbulances, setLoadingAmbulances] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [unassigningId, setUnassigningId] = useState(null);

  // Fetch once vendorId is available
  useEffect(() => {
    if (!vendorId) return;
    fetchAmbulances();
    fetchDrivers();
  }, [vendorId]);

  // ── API calls ───────────────────────────────────────────────────────────────

  const fetchAmbulances = useCallback(async () => {
    if (!vendorId) return;
    setLoadingAmbulances(true);
    try {
      const res = await fetch(`${API_BASE}/Get_AmbulanceList_By_Vendor_id/${vendorId}`);
      const data = await res.json();
      setAmbulances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ambulance fetch error:", err);
    } finally {
      setLoadingAmbulances(false);
    }
  }, [vendorId]);

  const fetchDrivers = useCallback(async () => {
    if (!vendorId) return;
    setLoadingDrivers(true);
    try {
      const res = await fetch(`${API_BASE}/Get_DriverList_By_Vendor_id/${vendorId}`);
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Driver fetch error:", err);
    } finally {
      setLoadingDrivers(false);
    }
  }, [vendorId]);

  const fetchHistory = useCallback(async (ambulanceId) => {
    // Guard: don't fetch if ambulanceId is invalid
    if (!ambulanceId) {
      setHistory([]);
      return;
    }
    
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Get_AssignmentHistory/${ambulanceId}`);
      if (!res.ok) {
        console.warn(`History fetch failed with status ${res.status}`);
        setHistory([]);
        return;
      }
      const text = await res.text();
      if (!text) {
        setHistory([]);
        return;
      }
      const data = JSON.parse(text);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("History fetch error:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleSelectAmbulance = useCallback(
    (amb) => {
      if (!amb?.ambulance_id) {
        console.error("Invalid ambulance selected");
        return;
      }
      setSelectedAmbulance(amb);
      setHistory([]);
      fetchHistory(amb.ambulance_id);
    },
    [fetchHistory]
  );

  const handleAssign = useCallback(
    async (driver) => {
      if (!selectedAmbulance || !driver) return;
      setAssigning(true);
      try {
        const formData = new FormData();
        formData.append("vendor_id", vendorId);
        formData.append("ambulanceId", selectedAmbulance.ambulance_id);
        formData.append("DriverId", driver.driver_id);

        const res = await fetch(`${API_BASE}/Add_Assignment`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Assignment failed");

        await fetchAmbulances();
        await fetchDrivers();
        await fetchHistory(selectedAmbulance.ambulance_id);
        setSelectedAmbulance(null);
      } catch (err) {
        Alert.alert("Error", "Failed to assign driver. Please try again.");
        console.error("Assign error:", err);
      } finally {
        setAssigning(false);
      }
    },
    [selectedAmbulance, vendorId, fetchAmbulances, fetchDrivers, fetchHistory]
  );

  const handleUnassign = useCallback(
    async (ambulance) => {
      Alert.alert(
        "Unassign Driver",
        `Remove ${ambulance.assign_driver?.driver_name ?? "driver"} from ${ambulance.vehical_number}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unassign",
            style: "destructive",
            onPress: async () => {
              setUnassigningId(ambulance.ambulance_id);
              try {
                const res = await fetch(
                  `${API_BASE}/UnAssign_driver_From_Ambulance`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ambulance.ambulance_id),
                  }
                );
                if (!res.ok) throw new Error("Unassign failed");
                await fetchAmbulances();
                await fetchDrivers();
                if (selectedAmbulance?.ambulance_id === ambulance.ambulance_id) {
                  await fetchHistory(ambulance.ambulance_id);
                }
              } catch (err) {
                Alert.alert("Error", "Failed to unassign driver. Please try again.");
                console.error("Unassign error:", err);
              } finally {
                setUnassigningId(null);
              }
            },
          },
        ]
      );
    },
    [fetchAmbulances, fetchDrivers, fetchHistory, selectedAmbulance]
  );

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = globalSearch.toLowerCase();
    return ambulances.filter((a) => {
      const vehicleMatch = (a.vehical_number ?? "").toLowerCase().includes(q);
      const driverMatch = (a.assign_driver?.driver_name ?? "").toLowerCase().includes(q);
      return vehicleMatch || driverMatch;
    });
  }, [ambulances, globalSearch]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const isLoading = loadingAmbulances || loadingDrivers;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle} numberOfLines={1}>Driver Assignment</Text>
            <Text style={s.headerSub}>Manage and assign drivers to ambulances</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Global search */}
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

        {/* Current Assignments card */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle}>Current Assignments</Text>
            {isLoading && <ActivityIndicator size="small" color={C.primary} />}
          </View>

          {/* Table header */}
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 1.2 }]}>Vehicle No</Text>
            <Text style={[s.th, { flex: 0.9 }]}>Type</Text>
            <Text style={[s.th, { flex: 1 }]}>Driver</Text>
            <Text style={[s.th, { flex: 0.85 }]}>Status</Text>
            <Text style={[s.th, { flex: 1, textAlign: "center" }]}>Action</Text>
          </View>

          {/* Table rows */}
          {filtered.length === 0 && !isLoading ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyText}>No ambulances found</Text>
            </View>
          ) : (
            filtered.map((amb, idx) => {
              const isSelected = selectedAmbulance?.ambulance_id === amb.ambulance_id;
              const isLast = idx === filtered.length - 1;
              const driverName = amb.assign_driver?.driver_name ?? null;
              const isUnassigning = unassigningId === amb.ambulance_id;

              return (
                <View
                  key={amb.ambulance_id}
                  style={[
                    s.tableRow,
                    isSelected && s.tableRowSelected,
                    isLast && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[s.td, s.tdBold, { flex: 1.2 }]}>
                    {amb.vehical_number}
                  </Text>
                  <Text style={[s.td, { flex: 0.9 }]}>
                    {amb.ambulance_type ?? "—"}
                  </Text>
                  <Text
                    style={[
                      s.td,
                      { flex: 1, color: driverName ? C.text : C.textLight },
                    ]}
                  >
                    {driverName ?? "—"}
                  </Text>
                  <View style={{ flex: 0.85 }}>
                    <Badge
                      label={driverName ? "Active" : "Free"}
                      variant={driverName ? "active" : "free"}
                    />
                  </View>
                  <View style={{ flex: 1, alignItems: "center" }}>
                    {isUnassigning ? (
                      <ActivityIndicator size="small" color={C.danger} />
                    ) : driverName ? (
                      <TouchableOpacity onPress={() => handleUnassign(amb)}>
                        <Text style={s.actionUnassign}>Unassign</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={s.assignPill}
                        onPress={() => handleSelectAmbulance(amb)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.assignPillText}>Assign</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Assign Panel */}
      <AssignPanel
        ambulance={selectedAmbulance}
        drivers={drivers}
        history={history}
        historyLoading={historyLoading}
        onAssign={handleAssign}
        onCancel={() => setSelectedAmbulance(null)}
        assigning={assigning}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
  headerSub:   { fontSize: 12, color: C.textMuted, marginTop: 2 },

  scroll: { padding: 16, paddingBottom: 32 },

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.text },

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

  emptyRow: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 13, color: C.textMuted },

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

const bs = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

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
  panelTitle:    { fontSize: 18, fontWeight: "700", color: C.text },
  panelSubtitle: { fontSize: 13, color: C.textMuted, marginTop: 3 },
  panelAmbNo:    { fontWeight: "700", color: C.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center", alignItems: "center",
  },

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

  panelActions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  assignBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
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

  assignedToWrap: { alignItems: "flex-end" },
  assignedToLabel: { fontSize: 10, color: C.danger, fontWeight: "500" },
  assignedToVehicle: { fontSize: 11, fontWeight: "700", color: C.danger, marginTop: 1 },
});
