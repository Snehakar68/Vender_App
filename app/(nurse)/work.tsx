import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/src/shared/components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Work() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    linkedType: "", // "Hospital" | "Doctor"
    hospital: "",
    doctor: "",
    shift: "Morning",
    shiftDays: "0",
  });

  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  const hospitals = ["Apollo Hospital", "Fortis Hospital", "Manipal Hospital"];
  const doctors = ["Dr. Sharma", "Dr. Reddy", "Dr. Mehta"];
  const shifts = ["Morning", "Evening", "Night"];

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader
          title="Work Information"
          subtitle="Manage your work details"
          icon="briefcase-outline"
          actionText={isEditing ? "Cancel" : "Edit"}
          onActionPress={() => setIsEditing(!isEditing)}
        />

        <View style={styles.card}>
          {/* STATUS */}
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Current Status</Text>
            <Text style={{ color: "red", fontWeight: "600" }}>● Inactive</Text>
          </View>

          {/* LINK TYPE */}
          <Text style={styles.label}>Linked Type</Text>
          <View style={styles.row}>
            {["Hospital", "Doctor"].map((type) => (
              <TouchableOpacity
                key={type}
                disabled={!isEditing}
                style={[
                  styles.optionBtn,
                  formData.linkedType === type && styles.activeOption,
                ]}
                onPress={() => {
                  handleChange("linkedType", type);

                  // reset other field
                  if (type === "Hospital") {
                    handleChange("doctor", "");
                  } else {
                    handleChange("hospital", "");
                  }
                }}
              >
                <Text
                  style={
                    formData.linkedType === type
                      ? styles.activeText
                      : styles.optionText
                  }
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* HOSPITAL */}
          {formData.linkedType === "Hospital" && (
            <>
              <Text style={styles.label}>Select Hospital</Text>
              <TouchableOpacity
                style={styles.input}
                disabled={!isEditing}
                onPress={() =>
                  isEditing && setShowHospitalDropdown(!showHospitalDropdown)
                }
              >
                <Text>{formData.hospital || "Select Hospital"}</Text>
                <Ionicons name="chevron-down" size={18} />
              </TouchableOpacity>

              {showHospitalDropdown &&
                hospitals.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange("hospital", h);
                      setShowHospitalDropdown(false);
                    }}
                  >
                    <Text>{h}</Text>
                  </TouchableOpacity>
                ))}
            </>
          )}

          {/* DOCTOR */}
          {formData.linkedType === "Doctor" && (
            <>
              <Text style={styles.label}>Select Doctor</Text>
              <TouchableOpacity
                style={styles.input}
                disabled={!isEditing}
                onPress={() =>
                  isEditing && setShowDoctorDropdown(!showDoctorDropdown)
                }
              >
                <Text>{formData.doctor || "Select Doctor"}</Text>
                <Ionicons name="chevron-down" size={18} />
              </TouchableOpacity>

              {showDoctorDropdown &&
                doctors.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange("doctor", d);
                      setShowDoctorDropdown(false);
                    }}
                  >
                    <Text>{d}</Text>
                  </TouchableOpacity>
                ))}
            </>
          )}

          {/* SHIFT */}
          <Text style={styles.label}>Shift</Text>
          <TouchableOpacity
            style={styles.input}
            disabled={!isEditing}
            onPress={() =>
              isEditing && setShowShiftDropdown(!showShiftDropdown)
            }
          >
            <Text>{formData.shift}</Text>
            <Ionicons name="chevron-down" size={18} />
          </TouchableOpacity>

          {showShiftDropdown &&
            shifts.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.dropdownItem}
                onPress={() => {
                  handleChange("shift", s);
                  setShowShiftDropdown(false);
                }}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}

          {/* SHIFT DAYS */}
          <Text style={styles.label}>Shift Change Days</Text>
          <TextInput
            style={styles.input}
            value={formData.shiftDays}
            editable={isEditing}
            keyboardType="numeric"
            onChangeText={(t) => handleChange("shiftDays", t)}
          />
        </View>

        {/* SAVE */}
        {isEditing && (
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
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
  },
  row: {
    flexDirection: "row",
    marginTop: 6,
  },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginRight: 10,
  },
  activeOption: {
    backgroundColor: "#0F766E",
  },
  optionText: {
    color: "#000",
  },
  activeText: {
    color: "#fff",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});