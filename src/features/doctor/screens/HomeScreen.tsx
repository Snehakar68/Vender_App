import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Morning, Jhilmil Homecare</Text>
          <Text style={styles.subText}>
            Your care queue is ready for the day.
          </Text>
        </View>

        {/* ALERT */}
        <TouchableOpacity style={styles.alertBox}>
          <Ionicons name="warning-outline" size={18} color="#B91C1C" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.alertTitle}>Critical Alert</Text>
            <Text style={styles.alertText}>System Update Pending</Text>
          </View>
        </TouchableOpacity>

        {/* STATS */}
        <View style={styles.row}>
          <StatCard number="8" label="Upcoming" />
          <StatCard number="3" label="My Patients" />
        </View>

        {/* TASKS */}
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>Daily Clinical Tasks</Text>
          <Text style={styles.taskCount}>5 Tasks Left</Text>
        </View>

        {/* UPCOMING CARE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Care</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {["Martin Peterson", "Dorothy Chambers", "Sarah Mitchell"].map(
          (name, i) => (
            <View key={i} style={styles.careCard}>
              <Text style={styles.time}>10:00 AM</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{name}</Text>
                <Text style={styles.patientSub}>Follow-up</Text>
              </View>

              <TouchableOpacity style={styles.detailsBtn}>
                <Text style={styles.detailsText}>Details</Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {/* PRESCRIPTION */}
        <View style={styles.prescriptionCard}>
          <Text style={styles.prescriptionTitle}>42 Refills Pending</Text>
        </View>

        {/* PORTFOLIO */}
        <Text style={styles.sectionTitle}>Patient Portfolio</Text>
        <View style={styles.row}>
          {["Sarah Mitchell", "Martin Peterson"].map((name, i) => (
            <View key={i} style={styles.patientCard}>
              <Text style={styles.patientName}>{name}</Text>
              <Text style={styles.patientSub}>Age: 65</Text>

              <TouchableOpacity style={styles.recordBtn}>
                <Text style={styles.recordText}>View Record</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* EVENING */}
        <Text style={styles.sectionTitle}>Evening Schedule</Text>
        {["Adam Parker", "Karen Green"].map((name, i) => (
          <View key={i} style={styles.scheduleItem}>
            <View style={styles.dot} />
            <Text style={{ flex: 1 }}>{name}</Text>
            <Text style={styles.timeRight}>3:30 PM</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 16,
  },

  greeting: {
    fontSize: 20,
    fontWeight: "700",
  },

  subText: {
    color: "#64748B",
    marginTop: 4,
  },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  alertTitle: {
    fontSize: 11,
    color: "#B91C1C",
    fontWeight: "700",
  },

  alertText: {
    fontSize: 14,
    color: "#7F1D1D",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  taskCard: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  taskTitle: {
    color: "#D1FAE5",
    fontSize: 12,
  },

  taskCount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },

  viewAll: {
    color: "#0F766E",
    fontSize: 12,
  },

  careCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  time: {
    fontSize: 11,
    color: "#64748B",
    width: 70,
  },

  patientName: {
    fontWeight: "600",
  },

  patientSub: {
    fontSize: 12,
    color: "#64748B",
  },

  detailsBtn: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  detailsText: {
    fontSize: 12,
  },

  prescriptionCard: {
    backgroundColor: "#064E3B",
    padding: 16,
    borderRadius: 14,
    marginVertical: 14,
  },

  prescriptionTitle: {
    color: "#fff",
    fontWeight: "700",
  },

  patientCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    width: "48%",
  },

  recordBtn: {
    marginTop: 8,
    backgroundColor: "#D1FAE5",
    padding: 8,
    borderRadius: 8,
  },

  recordText: {
    fontSize: 11,
    color: "#065F46",
    textAlign: "center",
  },

  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0F766E",
    marginRight: 8,
  },

  timeRight: {
    color: "#64748B",
    fontSize: 12,
  },
});
function StatCard({ number, label }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}