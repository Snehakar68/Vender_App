import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/src/shared/components/AppHeader";
import { useState } from "react";
import AddWorkDetailsModal from "./modals/AddWorkDetailsModal";

export default function WorkDetailsScreen() {
  const [open, setOpen] = useState(false);
  const data = [
    {
      name: "nknnk, Puranigudam - Assam",
      status: "INACTIVE",
      days: "Monday",
      time: "13:58 to 15:58",
      fee: "₹548",
      patients: "8 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
    {
      name: "City Medical Center - Guwahati",
      status: "ACTIVE",
      days: "Tue, Thu, Sat",
      time: "09:00 to 12:00",
      fee: "₹800",
      patients: "15 patients",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        {/* <View style={styles.header}> */}
       <AppHeader
  title="Work Details"
  subtitle="Manage schedule & fees"
  icon="briefcase-outline"
  actionText="+ Add"
  onActionPress={() => setOpen(true)}
/>
<AddWorkDetailsModal open={open} onClose={() => setOpen(false)} />

        {/* CARDS */}
        {data.map((item, index) => (
          <View key={index} style={styles.card}>
            
            {/* TOP */}
            <View style={styles.topRow}>
              <Text style={styles.title}>{item.name}</Text>

              <View
                style={[
                  styles.statusBadge,
                  item.status === "ACTIVE"
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            {/* DETAILS */}
            <View style={styles.grid}>
              <Info label="OPD Days" value={item.days} />
              <Info label="OPD Time" value={item.time} />
              <Info label="Fee" value={item.fee} />
              <Info label="Max OPD" value={item.patients} />
            </View>

            {/* ACTIONS */}
            <View style={styles.actions}>
              <Action icon="create-outline" label="Edit" />
              <Action icon="checkmark-done-outline" label="Approve" color="#16A34A" />
              <Action icon="trash-outline" label="Delete" color="#DC2626" />
            </View>
          </View>
        ))}

     
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

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  headerSub: {
    fontSize: 12,
    color: "#64748B",
  },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#0F766E",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },

  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  infoBox: {
    width: "48%",
    marginBottom: 8,
  },

  label: {
    fontSize: 10,
    color: "#64748B",
  },

  value: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  /* ACTIONS */
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },

 
});
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
} 

function Action({
  icon,
  label,
  color = "#475569",
}: {
  icon: any;
  label: string;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}