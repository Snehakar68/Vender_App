import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect } from "expo-router";

import {
  AmbColors,
  AmbRadius,
  AmbShadow,
} from "@/src/features/ambulance/constants/ambulanceTheme";

import { AuthContext } from "@/src/core/context/AuthContext";

const API_BASE = "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance";

type FilterType = "All" | "Online" | "Offline";
type Driver = {
  id: string;
  name: string;
  phone?: string;
  licenseNumber: string;
  assignedAmbulance: string;
  status: "Online" | "Offline";
  initials: string;
  photoBase64?: string | null; // ✅ added
};

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");

  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? "";

  const fetchDrivers = useCallback(() => {
    if (!vendorId) return;
    setLoading(true);
    fetch(`${API_BASE}/Get_DriverList_By_Vendor_id/${vendorId}`)
      .then((res) => res.json())
      .then((data) => {
        const normalized: Driver[] = (data || []).map((r: any) => {
          const name = r.driver_name || "";
          return {
            id: r.driver_id?.toString(),
            name,
            phone: r.mobile,
            licenseNumber: r.license_no,
            assignedAmbulance: r.assign_Ambulance?.ambulance_No || "Not Assigned",
            status: r.isActive ? "Online" : "Offline",
            initials: name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            // ✅ photo from API response — adjust field name if different
            photoBase64: r.photo ?? r.driver_photo ?? null,
          };
        });
        setDrivers(normalized);
      })
      .catch((err) => console.log("Driver API Error:", err))
      .finally(() => setLoading(false));
  }, [vendorId]);

  useFocusEffect(fetchDrivers);

  const filtered = drivers.filter((d) => {
    const matchesFilter = filter === "All" || d.status === filter;
    const matchesSearch =
      search === "" ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber?.toLowerCase().includes(search.toLowerCase()); // ✅ fixed: was d.license
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Driver", `Remove ${name} from the fleet?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          console.log("Delete API call pending for:", id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver List</Text>
        <Text style={styles.headerSubtitle}>Browse and manage drivers</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <ActivityIndicator
            size="large"
            color={AmbColors.primary}
            style={{ marginTop: 40 }}
          />
        )}

        {/* Search */}
        <View style={styles.searchWrapper}>
          <MaterialIcons
            name="search"
            size={20}
            color={AmbColors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers or license..."
            placeholderTextColor={`${AmbColors.outline}99`}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(["All", "Online", "Offline"] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f ? styles.chipActive : styles.chipInactive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              {f !== "All" && (
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: f === "Online" ? AmbColors.tertiary : `${AmbColors.outline}66` },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.chipLabel,
                  filter === f ? styles.chipLabelActive : styles.chipLabelInactive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Fleet</Text>
          <Text style={styles.sectionCount}>{drivers.length} Drivers</Text>
        </View>

        {/* Driver cards */}
        {!loading && filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={40} color={`${AmbColors.outline}50`} />
            <Text style={styles.emptyText}>No drivers match the filter</Text>
          </View>
        ) : (
          filtered.map((driver) => (
            <DriverCard
              key={driver.id}
              data={driver}
              onView={() =>
                router.push(
                  `/(ambulance)/add-driver?mode=view&id=${driver.id}&driverName=${encodeURIComponent(driver.name)}&driverPhone=${encodeURIComponent(driver.phone ?? "")}&driverLicense=${encodeURIComponent(driver.licenseNumber)}&driverPhoto=${encodeURIComponent(driver.photoBase64 ?? "")}&driverAmbulance=${encodeURIComponent(driver.assignedAmbulance)}`
                )
              }
              onEdit={() =>
                router.push(
                  `/(ambulance)/add-driver?mode=edit&id=${driver.id}&driverName=${encodeURIComponent(driver.name)}&driverPhone=${encodeURIComponent(driver.phone ?? "")}&driverLicense=${encodeURIComponent(driver.licenseNumber)}&driverPhoto=${encodeURIComponent(driver.photoBase64 ?? "")}&driverAmbulance=${encodeURIComponent(driver.assignedAmbulance)}`
                )
              }
              onDelete={() => handleDelete(driver.id, driver.name)}
            />
          ))
        )}

        {/* Add new */}
        <TouchableOpacity
          style={styles.recruitCard}
          onPress={() => router.push("/(ambulance)/add-driver")}
          activeOpacity={0.7}
        >
          <MaterialIcons name="person-add" size={36} color={`${AmbColors.outline}50`} />
          <Text style={styles.recruitText}>New recruit registration</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(ambulance)/add-driver")}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Driver Card ──────────────────────────────────────────────────────────────

function DriverCard({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Driver;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOnline = data.status === "Online";

  // ✅ Build photo source: prefer base64 from API
  const photoSource = data.photoBase64
    ? { uri: `data:image/jpeg;base64,${data.photoBase64}` }
    : null;

  return (
    <View style={[styles.card, AmbShadow.card]}>
      {/* Left edge status accent */}
      <View
        style={[
          styles.statusAccent,
          { backgroundColor: isOnline ? AmbColors.tertiary : `${AmbColors.outline}50` },
        ]}
      />

      {/* ✅ Photo — shows image if available, falls back to initials */}
      <View style={styles.photo}>
        {photoSource ? (
          <Image source={photoSource} style={styles.photoImage} />
        ) : (
          <Text style={styles.photoInitials}>{data.initials}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.driverName}>{data.name}</Text>
            <Text style={styles.licenseNum}>{data.licenseNumber}</Text>
          </View>
          <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
            <Text style={[styles.statusText, { color: isOnline ? AmbColors.tertiary : AmbColors.secondary }]}>
              {data.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.assignedRow}>
          <MaterialIcons name="emergency" size={15} color={AmbColors.primary} />
          <Text style={styles.assignedText}>{data.assignedAmbulance}</Text>
        </View>

        {data.phone && (
          <View style={styles.assignedRow}>
            <MaterialIcons name="phone" size={15} color={AmbColors.outline} />
            <Text style={[styles.assignedText, { color: AmbColors.outline }]}>{data.phone}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onView} activeOpacity={0.7}>
            <MaterialIcons name="visibility" size={16} color={AmbColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
            <MaterialIcons name="edit" size={16} color={AmbColors.outline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
            <MaterialIcons name="delete" size={16} color={AmbColors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: AmbColors.onSurface },
  headerSubtitle: { color: AmbColors.secondary, marginTop: 4, fontSize: 13 },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AmbColors.surfaceContainerHigh,
    borderRadius: AmbRadius.lg,
    paddingHorizontal: 16,
    marginBottom: 12,
    height: 52,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: AmbColors.onSurface },

  chipRow: { gap: 8, paddingBottom: 4, paddingRight: 4 },
  chip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: AmbRadius.pill, gap: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipActive: { backgroundColor: AmbColors.primary },
  chipInactive: { backgroundColor: AmbColors.surfaceContainerLowest },
  chipLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  chipLabelActive: { color: "#ffffff" },
  chipLabelInactive: { color: AmbColors.onSurfaceVariant },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 20, marginBottom: 16,
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: AmbColors.onSurface },
  sectionCount: { fontFamily: "Inter_500Medium", fontSize: 13, color: AmbColors.outline },

  emptyState: { alignItems: "center", gap: 12, paddingVertical: 48 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14, color: `${AmbColors.outline}80` },

  card: {
    backgroundColor: AmbColors.surfaceContainerLowest,
    borderRadius: AmbRadius.xl,
    padding: 20, marginBottom: 12,
    flexDirection: "row", alignItems: "flex-start",
    gap: 14, overflow: "hidden",
  },
  statusAccent: {
    position: "absolute", left: 0, top: 14, bottom: 14,
    width: 3, borderRadius: 2,
  },

  // ✅ Photo styles
  photo: {
    width: 56, height: 56,
    borderRadius: AmbRadius.md,
    backgroundColor: AmbColors.surfaceContainer,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0, marginLeft: 8,
    overflow: "hidden", // ✅ needed to clip the image to borderRadius
  },
  photoImage: { width: 56, height: 56 },
  photoInitials: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: AmbColors.primary },

  cardContent: { flex: 1 },
  nameRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 4,
  },
  nameBlock: {},
  driverName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: AmbColors.onSurface },
  licenseNum: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: AmbColors.outline, letterSpacing: 1, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: AmbRadius.sm },
  statusOnline: { backgroundColor: `${AmbColors.tertiaryContainer}18` },
  statusOffline: { backgroundColor: AmbColors.surfaceContainerHighest },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 0.6 },
  assignedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  assignedText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: AmbColors.onSurfaceVariant },
  actionRow: { flexDirection: "row", gap: 6, justifyContent: "flex-end", marginTop: 10 },
  actionBtn: {
    width: 36, height: 36, borderRadius: AmbRadius.sm,
    backgroundColor: AmbColors.surfaceContainerLow,
    justifyContent: "center", alignItems: "center",
  },

  recruitCard: {
    borderWidth: 2, borderStyle: "dashed",
    borderColor: `${AmbColors.outlineVariant}80`,
    borderRadius: AmbRadius.lg, padding: 32,
    alignItems: "center", justifyContent: "center",
    gap: 10, marginTop: 4, marginBottom: 12,
  },
  recruitText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: `${AmbColors.outline}80` },

  fab: {
    position: "absolute", bottom: 84, right: 20,
    width: 56, height: 56, borderRadius: AmbRadius.lg,
    backgroundColor: AmbColors.primary,
    justifyContent: "center", alignItems: "center",
    ...AmbShadow.elevated,
  },
});
