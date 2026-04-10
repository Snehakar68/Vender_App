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
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import { useCallback } from "react";

export default function BankDetailsScreen() {
  const router = useRouter();
  useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      router.replace("/(doctor)/profile"); // 🔥 change if needed
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

      {/* ✅ FIXED HEADER */}
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Bank Details"
          subtitle="Manage your bank information"
          icon="card-outline"
          actionText="Edit"
          onActionPress={() => { }}
        />
      </View>

      {/* ✅ SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* CARD */}
        <View style={styles.card}>
          <Input label="Bank Name *" value="HDFC Bank" />
          <Input label="Branch *" value="Patna Main Branch" />
          <Input label="IFSC Code *" value="HDFC0001234" />
          <Input label="Account Holder Name *" value="Aman Upadhyay" />
          <Input label="Account Number *" value="XXXXXX1234" secure />
          <Input label="Confirm Account Number *" value="XXXXXX1234" secure />
          <Input label="Account Type *" value="Savings" />
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
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
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

function Input({
  label,
  value,
  secure = false,
}: {
  label: string;
  value: string;
  secure?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={secure ? "••••••••••" : value}
        editable={false}
      />
    </View>
  );
}
