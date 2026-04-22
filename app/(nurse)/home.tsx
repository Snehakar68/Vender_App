import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet, // ✅ FIXED (missing import)
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ added

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      <ScrollView contentContainerStyle={{ }}>
        
       
        {/* HEADER */}
<View style={styles.topHeader}>
  <View style={styles.headerContent}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={require("../../src/assets/images/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.appName}>Jhilmil Homecare</Text>
    </View>

   
  </View>
</View>
   <View style={{ padding: 15 }}>
        {/* APPOINTMENTS CARD */}
        <View style={styles.appointmentCard}>
          <Text style={{ color: "white" }}>Appointments</Text>
          <Text style={styles.appointmentCount}>20</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#d1fae5", marginRight: 10 }]}>
            <Text>Patient Care</Text>
            <Text style={styles.statNumber}>5</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
            <Text>Late Alerts</Text>
            <Text style={[styles.statNumber, { color: "red" }]}>2</Text>
          </View>
        </View>

        {/* CLINICAL TOOLS */}
        <View>
          <Text style={styles.sectionTitle}>CLINICAL TOOLS</Text>

          <View style={styles.toolsRow}>
            {["Notes", "Vitals", "Medications", "Labs"].map((item, index) => (
              <View key={index} style={styles.toolItem}>
                <View style={styles.toolIcon}>
                  <Ionicons name="document-text" size={24} color="#0f766e" />
                </View>
                <Text style={{ marginTop: 5 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* PATIENT LIST */}
        <View style={{ marginTop: 15 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Patient List</Text>
            <Text style={{ color: "#0f766e" }}>View All</Text>
          </View>

          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.patientCard}>
              <View style={styles.avatar}>
                <Text>AJ</Text>
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: "600" }}>Alice Johnson</Text>
                <Text style={{ color: "gray" }}>Room 201 - 12:30 PM</Text>
              </View>

              <TouchableOpacity style={styles.detailsBtn}>
                <Text style={{ color: "#0284c7" }}>Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* SHIFT SCHEDULE */}
        <View style={{ marginTop: 15 }}>
          <Text style={styles.sectionTitle}>Shift Schedule</Text>

          <View style={styles.shiftCard}>
            <Text style={{ color: "gray" }}>UPCOMING SHIFT</Text>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Tomorrow</Text>

            {["Emma Nurse", "Jessica Smith"].map((name, index) => (
              <View key={index} style={styles.rowBetween}>
                <Text>{name}</Text>
                <Text style={{ color: "#0f766e" }}>View</Text>
              </View>
            ))}
          </View>
        </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 topHeader: {
    width: "100%",              // ✅ full width
    backgroundColor: "#fff",
    borderBottomWidth: 1,      // ✅ bottom border
    borderBottomColor: "#E2E8F0",
    marginBottom:5
  },

  headerContent: {
    paddingHorizontal: 16,     // ✅ inner padding only
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
    resizeMode: "contain",
  },

  appName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F766E",
  },

  appointmentCard: {
    backgroundColor: "#14b8a6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },

  appointmentCount: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },

  toolsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  toolItem: {
    alignItems: "center",
  },

  toolIcon: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  detailsBtn: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  shiftCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});