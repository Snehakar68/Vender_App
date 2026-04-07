import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function AddWorkDetailsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    hospital: "",
    fee: "",
    opdDays: "",
    opdFrom: "",
    opdTo: "",
    maxOpd: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* HEADER */}
            <View style={styles.header}>
              <Ionicons name="briefcase-outline" size={20} color="#0F172A" />
              <Text style={styles.title}>Add Work Details</Text>
            </View>

            {/* FORM */}
            <Field label="Hospital" required>
              <Input
                placeholder="Select Hospital"
                value={form.hospital}
                onChangeText={(v: string) => handleChange("hospital", v)}
              />
            </Field>

            <Field label="Consultation Fee (₹)" required>
              <Input
                placeholder="Enter fee"
                keyboardType="numeric"
                value={form.fee}
                onChangeText={(v: string) => handleChange("hospital", v)}
              />
            </Field>

            <Field label="OPD Days" required>
              <Input
                placeholder="Type & select days"
                value={form.opdDays}
                onChangeText={(v: string) => handleChange("hospital", v)}
              />
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="OPD From" required>
                  <Input
                    placeholder="--:--"
                    value={form.opdFrom}
                    onChangeText={(v: string) => handleChange("hospital", v)}
                  />
                </Field>
              </View>

              <View style={{ width: 10 }} />

              <View style={{ flex: 1 }}>
                <Field label="OPD To" required>
                  <Input
                    placeholder="--:--"
                    value={form.opdTo}
                    onChangeText={(v: string) => handleChange("hospital", v)}
                  />
                </Field>
              </View>
            </View>

            <Field label="Max OPD Accepted" required>
              <Input
                placeholder="Enter max OPD"
                keyboardType="numeric"
                value={form.maxOpd}
               onChangeText={(v: string) => handleChange("hospital", v)}
              />
            </Field>

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  // 🔥 integrate API here
                  onClose();
                }}
              >
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },

  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  star: {
    color: "#DC2626",
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    marginTop: 16,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F8FAFC",
  },

  addBtn: {
    flex: 1,
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#475569",
    fontWeight: "500",
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },
});
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: any;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.star}> *</Text>}
      </View>
      {children}
    </View>
  );
}

function Input(props: any) {
  return (
    <TextInput
      {...props}
      style={styles.input}
      placeholderTextColor="#94A3B8"
    />
  );
}