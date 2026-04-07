import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Professional() {
  return (
    <ScrollView style={styles.container}>

      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Professional Profile</Text>
        <Text style={styles.headerSubtitle}>
          Verify and manage your credentials
        </Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>

        {/* QUALIFICATION */}
        <Text style={styles.label}>QUALIFICATION</Text>
        <View style={styles.inputBox}>
          <Text>ANM</Text>
          <Ionicons name="chevron-down" size={18} />
        </View>

        {/* EXPERIENCE */}
        <Text style={styles.label}>EXPERIENCE (YEAR)</Text>
        <View style={styles.inputBox}>
          <Text>99</Text>
        </View>

        {/* REGISTRATION NUMBER */}
        <Text style={styles.label}>REGISTRATION NUMBER</Text>
        <View style={styles.inputBox}>
          <Text>3234324sdfsd</Text>
        </View>

        {/* DEPARTMENT */}
        <Text style={styles.label}>DEPARTMENT</Text>
        <View style={styles.inputBox}>
          <Text>Palliative Care / Hospice</Text>
          <Ionicons name="chevron-down" size={18} />
        </View>

        {/* REGISTRATION DATE */}
        <Text style={styles.label}>REGISTRATION DATE</Text>
        <View style={styles.inputBox}>
          <Text>03/10/2026</Text>
          <Ionicons name="calendar-outline" size={18} />
        </View>

        {/* CERTIFICATE */}
        <Text style={styles.label}>REGISTRATION CERTIFICATE</Text>
        <View style={styles.certificateBox}>
          <Ionicons name="document-text" size={30} color="#0f766e" />
          <Text style={styles.certificateText}>
            Verified Certificate Attached
          </Text>

          <TouchableOpacity>
            <Text style={styles.linkText}>
              View Registration Certificate
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* SAVE BUTTON */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  headerCard: {
    backgroundColor: "#0f766e",
    margin: 15,
    borderRadius: 20,
    padding: 20,
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#ccfbf1",
    marginTop: 5,
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
  },

  label: {
    fontSize: 12,
    color: "gray",
    marginTop: 15,
    marginBottom: 5,
  },

  inputBox: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  certificateBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 5,
  },

  certificateText: {
    marginTop: 5,
    color: "gray",
  },

  linkText: {
    color: "#0f766e",
    marginTop: 10,
    fontWeight: "600",
  },

  buttonContainer: {
    padding: 15,
  },

  saveButton: {
    backgroundColor: "#0f766e",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontWeight: "600",
  },
});