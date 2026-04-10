import AppHeader from "@/src/shared/components/AppHeader";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔥 NAVIGATION IMPORTS
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import { useCallback } from "react";

export default function ProfessionalDetailsScreen() {
  const router = useRouter();

  // 🔥 EXACT SAME BACK BEHAVIOR AS VIEWNURSE / PERSONAL
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(doctor)/profile"); // ✅ change if needed
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>

      {/* ✅ FIXED HEADER (OUTSIDE SCROLL) */}
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Professional Information"
          subtitle="Manage your professional details"
          icon="briefcase-outline"
          actionText="Edit"
        />
      </View>

      {/* ✅ SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

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

  // 🔥 SAME HEADER STYLE AS OTHER SCREENS
 headerWrapper: {
    backgroundColor: "#fff",

    paddingTop: StatusBar.currentHeight || 0, // ✅ THIS FIXES IT

    borderBottomWidth: 0.5,
    borderColor: "#E2E8F0",

    elevation: 3,
    zIndex: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
      <TextInput style={styles.input} value={value} editable={false} />
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