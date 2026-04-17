import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@/src/shared/components/AppHeader";

export default function ServicesScreen() {
  const [services, setServices] = useState({
    online: true,
    home: true,
  });

  const toggleStatus = (key: "online" | "home") => {
    setServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        
        {/* HEADER */}
        {/* <View style={styles.header}>
          <Text style={styles.tag}>CARE MANAGEMENT</Text>
          <Text style={styles.title}>Manage Your Reach</Text>
          <Text style={styles.subtitle}>
            Adjust how and where you provide care to Jhilmil Homecare clients.
          </Text>
        </View> */}
<AppHeader
  title="Manage Services"
  subtitle="Adjust how and where you provide care"
  icon="medkit-outline"
/>
        {/* ONLINE */}
        <ServiceCard
          title="Online Consultation"
          subtitle="Available for virtual sessions"
          value={services.online}
          onToggle={() => toggleStatus("online")}
        />

        {/* HOME */}
        <ServiceCard
          title="Home Visit"
          subtitle="Physical house call services"
          value={services.home}
          onToggle={() => toggleStatus("home")}
        />

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Changes will instantly update your visibility in the patient directory.
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity activeOpacity={0.8} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },

  header: {
    marginBottom: 20,
  },

  tag: {
    fontSize: 11,
    color: "#0F766E",
    fontWeight: "700",
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
  },

  serviceSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  statusText: {
    fontSize: 12,
    marginTop: 10,
    fontWeight: "500",
    color: "#334155",
  },

  /* TOGGLE */
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 20,
    justifyContent: "center",
    padding: 2,
  },

  toggleActive: {
    backgroundColor: "#0F766E",
  },

  toggleInactive: {
    backgroundColor: "#CBD5F5",
  },

  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  /* INFO */
  infoBox: {
    backgroundColor: "#E0F2FE",
    padding: 14,
    borderRadius: 12,
    marginVertical: 10,
  },

  infoText: {
    fontSize: 12,
    color: "#0369A1",
  },

  /* BUTTON */
  saveBtn: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
function ServiceCard({
  title,
  subtitle,
  value,
  onToggle,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.card}>
      
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceTitle}>{title}</Text>
          <Text style={styles.serviceSub}>{subtitle}</Text>
        </View>

        {/* TOGGLE */}
        <TouchableOpacity
          style={[
            styles.toggle,
            value ? styles.toggleActive : styles.toggleInactive,
          ]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.knob,
              value && { alignSelf: "flex-end" },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* STATUS TEXT */}
      <Text style={styles.statusText}>
        {value ? "Available" : "Unavailable"}
      </Text>
    </View>
  );
}