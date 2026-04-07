 import AppHeader from "@/src/shared/components/AppHeader";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfessionalDetailsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
       <AppHeader
  title="Professional Information"
  subtitle="Manage your professional details"
  icon="briefcase-outline"
  actionText="Edit"
  onActionPress={() => {}}
/>

        {/* DETAILS CARD */}
        <View style={styles.card}>
          <Input label="Qualification *" value="MBBS" />
          <Input label="Experience (Years) *" value="7" />
          <Input label="Department *" value="Infectious Diseases" />
          <Input label="Registration No. *" value="15154" />
          <Input label="Registration Date *" value="24-02-2026" />
        </View>

        {/* DOCUMENT CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents</Text>

          <DocButton label="View Registration Certificate" />
        </View>

        {/* SAVE */}
        <TouchableOpacity style={styles.saveBtn}>
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
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  edit: {
    color: "#0F766E",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  label: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },

  docBtn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  docText: {
    color: "#fff",
    fontWeight: "600",
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
});
function Input({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        editable={false}
      />
    </View>
  );
}
function DocButton({ label }: { label: string }) {
  return (
    <TouchableOpacity style={styles.docBtn}>
      <Text style={styles.docText}>{label}</Text>
    </TouchableOpacity>
  );
}