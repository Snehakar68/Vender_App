import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  AmbColors,
  AmbRadius,
  AmbShadow,
} from "@/src/features/ambulance/constants/ambulanceTheme";
import { MOCK_TRIPS, Trip } from "@/src/features/ambulance/data/mockData";
import AmbulanceTopBar from "@/src/features/ambulance/components/AmbulanceTopBar";

type FilterTab = "All" | "Ongoing" | "Completed";

export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered = MOCK_TRIPS.filter(
    (t) => activeTab === "All" || t.status === activeTab,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Jhilmil Homecare</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#888" />
          <Text style={{ color: "#888", marginLeft: 10 }}>
            Search trips, patients or vehicles...
          </Text>
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.title}>Your Journeys</Text>
          <Text style={styles.subtitle}>
            Tracking 24 healthcare transfers this month
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.bigCard}>
            <Text style={styles.bigNumber}>18</Text>
            <Text style={styles.bigLabel}>Completed Trips</Text>
          </View>

          <View style={{ flex: 1, gap: 10 }}>
            <View style={styles.smallCard}>
              <Text style={styles.km}>1,240 KM</Text>
              <Text style={styles.label}>TOTAL DISTANCE</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.km}>₹12,450</Text>
              <Text style={styles.label}>TOTAL FARE</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["All", "Ongoing", "Completed"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as FilterTab)}
            >
              <Text
                style={
                  activeTab === tab
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cards */}
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {filtered.map((trip, index) => (
            <View key={`${trip.id}-${index}`} style={styles.card}>
              {/* Top Row → Vehicle + Badge */}
              <View style={styles.cardHeader}>
                <Text style={styles.vehicleText}>{trip.vehicleNumber}</Text>

                <View
                  style={[
                    styles.badge,
                    trip.status === "Ongoing"
                      ? styles.ongoing
                      : trip.status === "Completed"
                        ? styles.completed
                        : styles.cancelled,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {trip.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Driver */}
              <View style={styles.section}>
                <Text style={styles.label}>DRIVER</Text>
                <Text style={styles.value}>{trip.patientName}</Text>
              </View>

              {/* Row */}
              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>DATE</Text>
                  <Text style={styles.value}>{trip.date || "—"}</Text>
                </View>

                <View>
                  <Text style={styles.label}>REVENUE</Text>
                  <Text style={styles.value}>{trip.actualFare || "—"}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  if (trip.status === "Ongoing") {
    return (
      <View style={[styles.ongoingCard, AmbShadow.elevated]}>
        {/* Decorative bg circle */}
        <View style={styles.ongoingDecor} />
        <View style={styles.tripCardHeader}>
          <View>
            <Text style={styles.tripIdText}>Trip ID: {trip.tripId}</Text>
            <Text style={styles.tripTitle}>{trip.title}</Text>
          </View>
          <View style={styles.badgeOngoing}>
            <Text style={[styles.badgeText, { color: AmbColors.primary }]}>
              ONGOING
            </Text>
          </View>
        </View>
        <View style={styles.tripRows}>
          <TripRow icon="person" text={trip.patientName!} />
          <TripRow icon="local-taxi" text={trip.vehicleNumber!} />
          <TripRow icon="schedule" text={`Started: ${trip.startTime}`} />
        </View>
        <View style={styles.ongoingFooter}>
          <View>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareValue}>{trip.estimatedFare}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewMapBtn}
            onPress={() => router.push("/(ambulance)/live-tracking")}
            activeOpacity={0.85}
          >
            <Text style={styles.viewMapText}>View Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (trip.status === "Completed") {
    return (
      <View style={styles.completedCard}>
        <View style={styles.tripCardHeader}>
          <View>
            <Text style={styles.tripIdText}>Trip ID: {trip.tripId}</Text>
            <Text style={styles.tripTitle}>{trip.title}</Text>
          </View>
          <View style={styles.badgeCompleted}>
            <Text style={[styles.badgeText, { color: AmbColors.tertiary }]}>
              COMPLETED
            </Text>
          </View>
        </View>
        <View style={styles.completedGrid}>
          <View>
            <Text style={styles.completedFieldLabel}>PATIENT</Text>
            <Text style={styles.completedFieldValue}>{trip.patientName}</Text>
          </View>
          <View>
            <Text style={styles.completedFieldLabel}>DATE</Text>
            <Text style={styles.completedFieldValue}>{trip.date}</Text>
          </View>
        </View>
        <View style={styles.completedFooter}>
          <Text style={styles.completedVehicle}>
            Vehicle: {trip.vehicleNumber}
          </Text>
          <Text style={styles.completedFare}>{trip.actualFare}</Text>
        </View>
      </View>
    );
  }

  // Cancelled
  return (
    <View style={styles.cancelledCard}>
      <View style={styles.tripCardHeader}>
        <View>
          <Text style={styles.tripIdText}>Trip ID: {trip.tripId}</Text>
          <Text style={[styles.tripTitle, { opacity: 0.6 }]}>{trip.title}</Text>
        </View>
        <View style={styles.badgeCancelled}>
          <Text style={[styles.badgeText, { color: AmbColors.error }]}>
            CANCELLED
          </Text>
        </View>
      </View>
      <View style={styles.cancelledFooter}>
        <Text style={styles.cancelNote}>{trip.cancellationNote}</Text>
        <MaterialIcons
          name="info"
          size={20}
          color={AmbColors.onSurfaceVariant}
        />
      </View>
    </View>
  );
}

function TripRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.tripRow}>
      <MaterialIcons name={icon} size={17} color="#0f766e" />
      <Text style={styles.tripRowText}>{text}</Text>
    </View>
  );
}

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: AmbColors.surface },
//   scroll: { paddingBottom: 24 },

//   // Title hero
//   titleBlock: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
//   pageTitle: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 24,
//     color: AmbColors.onSurface,
//     marginBottom: 4,
//   },
//   pageSubtitle: {
//     fontFamily: 'Inter_500Medium',
//     fontSize: 13,
//     color: AmbColors.onSurfaceVariant,
//     marginBottom: 20,
//   },

//   statsGrid: { flexDirection: 'row', gap: 12 },
//   statsCardLarge: {
//     flex: 1.1,
//     backgroundColor: AmbColors.primaryContainer,
//     borderRadius: AmbRadius.xxl,
//     padding: 18,
//     justifyContent: 'space-between',
//     minHeight: 128,
//   },
//   statsLargeNum: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 34,
//     color: AmbColors.onPrimaryContainer,
//     marginTop: 4,
//   },
//   statsLargeLabel: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 11,
//     color: `${AmbColors.onPrimaryContainer}cc`,
//   },

//   statsRightCol: { flex: 1, gap: 10 },
//   statsActiveCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     backgroundColor: `${AmbColors.tertiaryContainer}18`,
//     borderRadius: AmbRadius.lg,
//     padding: 12,
//   },
//   statsActiveDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: AmbColors.tertiaryContainer,
//   },
//   statsActiveText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 12,
//     color: AmbColors.tertiary,
//   },
//   statsFareCard: {
//     flex: 1,
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     borderRadius: AmbRadius.lg,
//     padding: 12,
//     justifyContent: 'center',
//     ...AmbShadow.subtle,
//   },
//   statsFareValue: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 17,
//     color: AmbColors.onSurface,
//   },
//   statsFareLabel: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 9,
//     color: AmbColors.onSurfaceVariant,
//     letterSpacing: 1,
//     marginTop: 2,
//   },

//   // Filter tabs
//   filterBar: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
//     marginVertical: 20,
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: AmbRadius.xxl,
//     padding: 6,
//     gap: 4,
//   },
//   filterTab: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: AmbRadius.lg,
//     alignItems: 'center',
//   },
//   filterTabActive: {
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     ...AmbShadow.subtle,
//   },
//   filterTabText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
//   filterTabTextActive: { color: AmbColors.primary },
//   filterTabTextInactive: { color: AmbColors.onSurfaceVariant },

//   // Trip list
//   tripList: { paddingHorizontal: 20, gap: 14 },

//   // Trip card header shared
//   tripCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 16,
//   },
//   tripIdText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 9,
//     color: AmbColors.onSurfaceVariant,
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//     marginBottom: 4,
//   },
//   tripTitle: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 17,
//     color: AmbColors.onSurface,
//   },
//   badgeText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 9,
//     letterSpacing: 0.6,
//     textTransform: 'uppercase',
//   },

//   // Ongoing
//   ongoingCard: {
//     backgroundColor: AmbColors.surfaceContainerLowest,
//     borderRadius: 24,
//     padding: 20,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   ongoingDecor: {
//     position: 'absolute',
//     top: -12,
//     right: -12,
//     width: 96,
//     height: 96,
//     borderRadius: 48,
//     backgroundColor: `${AmbColors.primary}08`,
//   },
//   badgeOngoing: {
//     backgroundColor: `${AmbColors.primary}15`,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: AmbRadius.pill,
//   },
//   tripRows: { gap: 10, marginBottom: 18 },
//   tripRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   tripRowText: {
//     fontFamily: 'Inter_500Medium',
//     fontSize: 13,
//     color: AmbColors.onSurface,
//     flex: 1,
//   },
//   ongoingFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: AmbColors.surfaceContainerHigh,
//   },
//   fareLabel: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 9,
//     color: AmbColors.onSurfaceVariant,
//     letterSpacing: 0.8,
//     textTransform: 'uppercase',
//     marginBottom: 3,
//   },
//   fareValue: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 22,
//     color: AmbColors.primary,
//   },
//   viewMapBtn: {
//     backgroundColor: AmbColors.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: AmbRadius.lg,
//     ...AmbShadow.card,
//   },
//   viewMapText: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 13,
//     color: '#ffffff',
//   },

//   // Completed
//   completedCard: {
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: 24,
//     padding: 20,
//   },
//   badgeCompleted: {
//     backgroundColor: `${AmbColors.tertiary}15`,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: AmbRadius.pill,
//   },
//   completedGrid: {
//     flexDirection: 'row',
//     gap: 24,
//     marginBottom: 14,
//   },
//   completedFieldLabel: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 9,
//     color: AmbColors.onSurfaceVariant,
//     letterSpacing: 0.8,
//     textTransform: 'uppercase',
//     marginBottom: 4,
//   },
//   completedFieldValue: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 13,
//     color: AmbColors.onSurface,
//   },
//   completedFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//   },
//   completedVehicle: {
//     fontFamily: 'Inter_500Medium',
//     fontSize: 12,
//     color: AmbColors.onSurfaceVariant,
//   },
//   completedFare: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 18,
//     color: AmbColors.onSurface,
//   },

//   // Cancelled
//   cancelledCard: {
//     backgroundColor: AmbColors.surfaceContainerLow,
//     borderRadius: 24,
//     padding: 20,
//     opacity: 0.8,
//     borderWidth: 1,
//     borderColor: `${AmbColors.error}10`,
//   },
//   badgeCancelled: {
//     backgroundColor: `${AmbColors.error}15`,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: AmbRadius.pill,
//   },
//   cancelledFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   cancelNote: {
//     fontFamily: 'Inter_600SemiBold',
//     fontSize: 12,
//     color: AmbColors.error,
//   },
// });
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6F8" },

  header: {
    padding: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f766e",
  },

  searchBox: {
    marginHorizontal: 20,
    backgroundColor: "#eee",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#777",
    marginBottom: 15,
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 15,
  },

  bigCard: {
    flex: 1,
    backgroundColor: "#0f766e",
    borderRadius: 16,
    padding: 20,
  },
  bigNumber: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },
  bigLabel: {
    color: "#fff",
    marginTop: 5,
  },

  smallCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  km: {
    fontWeight: "700",
    fontSize: 16,
  },
  label: {
    fontSize: 10,
    color: "#888",
  },

  tabs: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "#eee",
    borderRadius: 12,
    padding: 5,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  inactiveTabText: {
    color: "#888",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  // 🚀 MAIN FIX → prevents overflow
  vehicleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111",

    flexWrap: "wrap", // ✅ wrap text
    marginRight: 10, // space before badge
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  ongoing: {
    backgroundColor: "#E3F2FD",
  },
  completed: {
    backgroundColor: "#E8F5E9",
  },
  cancelled: {
    backgroundColor: "#FDECEA",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  section: {
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 10,
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },

  statusGreen: {
    color: "green",
    fontWeight: "600",
  },

  cancelText: {
    color: "red",
    marginTop: 10,
  },
});
