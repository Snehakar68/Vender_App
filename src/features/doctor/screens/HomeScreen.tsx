import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUserData } from "@/src/utils/tokenStorage";
import { useEffect, useState } from "react";
import { Image } from "react-native";

export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getIcon = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "sunny-outline";
    if (hour < 17) return "partly-sunny-outline";
    return "moon-outline";
  };
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        const user = await getUserData();
        setUserName(user?.name || "User");

      } catch (e) {
        console.log("User load error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.topHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/src/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.companyName}>JHILMIL Homecare</Text>
          </View>
        </View>

        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0F766E" />
          <Text style={styles.loaderText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/src/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.companyName}>Jhilmil Homecare</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.greetingCard}>
          <View>
            <Text style={styles.greetingSmall}>{getGreeting()}</Text>
            <Text style={styles.greetingName}>{userName}</Text>
          </View>

          <Ionicons name={getIcon()} size={28} color="#0F766E" />
        </View>

        <TouchableOpacity style={styles.alertBox}>
          <Ionicons name="warning-outline" size={18} color="#B91C1C" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.alertTitle}>Critical Alert</Text>
            <Text style={styles.alertText}>System Update Pending</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.row}>
          <StatCard number="8" label="Upcoming" icon="calendar-outline" />
          <StatCard number="3" label="Patients" icon="people-outline" />
        </View>

        <View style={styles.taskCardNew}>
          <View>
            <Text style={styles.taskTitleNew}>Today's Tasks</Text>
            <Text style={styles.taskCountNew}>5 Pending Tasks</Text>
          </View>

          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Care</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {["Martin Peterson", "Dorothy Chambers", "Sarah Mitchell"].map(
          (name, i) => (
            <View key={i} style={styles.careCardNew}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>10:00</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{name}</Text>
                <Text style={styles.patientSub}>Follow-up Visit</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          )
        )}

        <View style={styles.prescriptionCard}>
          <Text style={styles.prescriptionTitle}>42 Refills Pending</Text>
        </View>

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

        <Text style={styles.sectionTitle}>Evening Schedule</Text>
        {["Adam Parker", "Karen Green"].map((name, i) => (
          <View key={i} style={styles.scheduleItem}>
            <View style={styles.dot} />
            <Text style={{ flex: 1 }}>{name}</Text>
            <Text style={styles.timeRight}>3:30 PM</Text>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    paddingBottom: 40,
  },
  greetingCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  greetingSmall: {
    fontSize: 12,
    color: "#64748B",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  greetingName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    gap: 6,
  },

  taskCardNew: {
    backgroundColor: "#0F766E",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  taskTitleNew: {
    color: "#D1FAE5",
    fontSize: 12,
  },

  taskCountNew: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  careCardNew: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },

  timeBadge: {
    backgroundColor: "#E0F2FE",
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },

  timeText: {
    fontSize: 11,
    color: "#0284C7",
    fontWeight: "600",
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
  topHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },

  companyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F766E",
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
function StatCard({ number, label, icon }: any) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color="#0F766E" />
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}