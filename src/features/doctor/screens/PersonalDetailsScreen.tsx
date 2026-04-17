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

export default function PersonalDetailsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <AppHeader
  title="Personal Information"
  subtitle="Manage your personal details"
  icon="person-outline"
  actionText="Edit"
  onActionPress={() => {}}
/>

        {/* PERSONAL DETAILS */}
        <View style={styles.card}>
          <Input label="Full Name *" value="Aman" />
          <Input label="Gender *" value="Male" />
          <Input label="Blood Group" value="A+" />
          <Input label="Date of Birth *" value="23-02-2026" />
          <Input label="Address Line 1 *" value="jh" />
          <Input label="Address Line 2" value="" />
          <Input label="City *" value="Purani Bajar" />
          <Input label="State *" value="Bihar" />
          <Input label="PIN Code *" value="811311" />
          <Input label="Aadhaar Number *" value="151848489494" />
          <Input label="PAN Number *" value="ABCDE3432D" />
          <Input label="Introduction *" value="jkfjrjrn" multiline />
        </View>

        {/* CONTACT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Input label="Email *" value="aman@gmail.com" />
          <Input label="Mobile Number *" value="9874845648" />
          <Input label="Alternate Mobile" value="" />
        </View>

        {/* DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents</Text>

          <DocButton label="View Profile Photo" />
          <DocButton label="View Aadhaar" />
          <DocButton label="View PAN" />
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

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  docBtn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
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
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
function Input({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        editable={false}
        multiline={multiline}
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