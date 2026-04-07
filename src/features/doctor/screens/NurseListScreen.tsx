import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@/src/shared/components/AppHeader";
import { Modal } from "react-native";
import { useState } from "react";



export default function NurseListScreen() {
  const [open, setOpen] = useState(false);
const [selectedNurse, setSelectedNurse] = useState(null);

  const nurses = [
    {
      name: "ashwani sdf",
      role: "Intensive Care Unit (ICU)",
      status: "INACTIVE",
      degree: "ANM",
      mobile: "789837789",
      email: "amanu9442@gmail.com",
    },
    {
      name: "Last Test",
      role: "Inpatient Ward (IPD)",
      status: "INACTIVE",
      degree: "BSc Nursing",
      mobile: "5487398787",
      email: "bibhu@hp.com",
    },
    {
      name: "knknjnj",
      role: "Inpatient Ward (IPD)",
      status: "ACTIVE",
      degree: "BSc Nursing",
      mobile: "8789484748",
      email: "nb@nb.com",
    },
    {
      name: "Nr Test",
      role: "Outpatient Department (OPD)",
      status: "ACTIVE",
      degree: "GNM",
      mobile: "9874894150",
      email: "nbb@nbb.com",
    },
  ];

return (
  <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      
      {/* HEADER */} 
      {/* <View style={styles.header}> */}
    <AppHeader
  title="Nurses"
  subtitle="Manage your staff"
  icon="people-outline"
  actionText="+ Add"
  onActionPress={() => setOpen(true)} // 🔥 OPEN MODAL
/>
        {/* <View>
          <Text style={styles.brand}>Jhilmil Homecare</Text>
          <Text style={styles.title}>Nurses</Text>
        </View> */}

        {/* <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add New</Text>
        </TouchableOpacity> */}
      {/* </View> */}

      {/* NURSE CARDS */}
 {nurses.map((nurse, index) => (
  <View key={index} style={styles.card}>
    
    {/* TOP ROW */}
    <View style={styles.topRow}>
      
      {/* AVATAR */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {nurse.name?.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* INFO */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{nurse.name}</Text>
        <Text style={styles.role}>{nurse.role}</Text>
        <Text style={styles.degree}>{nurse.degree}</Text>
      </View>

      {/* RIGHT SIDE */}
      <View style={{ alignItems: "flex-end" }}>
        
        {/* STATUS */}
        <View
          style={[
            styles.statusBadge,
            nurse.status === "ACTIVE"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text style={styles.statusText}>{nurse.status}</Text>
        </View>

        {/* ICONS */}
         <View style={styles.iconRow}>
  <TouchableOpacity style={styles.iconBtn}>
    <Ionicons name="checkmark" size={16} color="#16A34A" />
  </TouchableOpacity>

  <TouchableOpacity style={styles.iconBtn}>
    <Ionicons name="trash" size={16} color="#DC2626" />
  </TouchableOpacity>
</View>
      </View>
    </View>

    {/* BUTTON */}
    <TouchableOpacity style={styles.viewProfileBtn}>
      <Text style={styles.viewProfileText}>View Profile</Text>
    </TouchableOpacity>

  </View>
))}
        </ScrollView>
        <Modal visible={open} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      
      {/* LABEL */}
   <View style={styles.labelRow}>
  <Text style={styles.label}>Select Nurse</Text>
  <Text style={styles.required}> *</Text>
</View>

      {/* SELECT (Simple version) */}
      <TouchableOpacity style={styles.selectBox}>
        <Text style={{ color: "#64748B" }}>
          {selectedNurse || "Select Nurse"}
        </Text>
      </TouchableOpacity>

      {/* BUTTONS */}
      <View style={styles.modalActions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setOpen(false)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtnModal}
          onPress={() => {
            // 🔥 call your API here (handleAddNurse)
            setOpen(false);
          }}
        >
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
  </SafeAreaView>
);
}
const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  backgroundColor: "#F1F5F9",
  paddingHorizontal: 16,
  paddingTop: 10,
  paddingBottom: 80, // 🔥 prevents bottom overlap
},
header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20, // more spacing
},

  brand: {
    fontSize: 12,
    color: "#0F766E",
    fontWeight: "600",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  addBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

 card: {
  backgroundColor: "#fff",
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 3,
},

  topRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
iconBtn: {
  backgroundColor: "#F1F5F9",
  padding: 6,
  borderRadius: 8,
},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  name: {
    fontWeight: "600",
    fontSize: 14,
  },

  role: {
    fontSize: 12,
    color: "#64748B",
  },

  status: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },

  active: {
    color: "#16A34A",
  },

  inactive: {
    color: "#DC2626",
  },

  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  value: {
    fontSize: 12,
    fontWeight: "500",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  viewBtn: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },

  viewText: {
    fontSize: 12,
  },

  approveBtn: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },

  approveText: {
    color: "#166534",
    fontSize: 12,
  },

  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  }, 

  deleteText: {
    fontSize: 12,
  },
  avatarText: {
  color: "#fff",
  fontWeight: "700",
},

degree: {
  fontSize: 12,
  color: "#475569",
  marginTop: 2,
},

statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
  marginBottom: 8,
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
  textTransform: "uppercase",
},

iconRow: {
  flexDirection: "row",
  gap: 10,
},

approveIcon: {
  color: "#16A34A",
  fontSize: 16,
},

deleteIcon: {
  color: "#DC2626",
  fontSize: 16,
},

viewProfileBtn: {
  borderWidth: 1,
  borderColor: "#0F766E",
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center",
  marginTop: 12,
},

viewProfileText: {
  color: "#0F766E",
  fontWeight: "600",
  fontSize: 13,
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

modalContainer: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 20,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
},

selectBox: {
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 10,
  padding: 12,
  marginBottom: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

modalActions: {
  flexDirection: "row",
  justifyContent: "space-between",
},

cancelBtn: {
  flex: 1,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  marginRight: 10,
  backgroundColor: "#F8FAFC", // 🔥 subtle fill
},

addBtnModal: {
  flex: 1,
  backgroundColor: "#16A34A",
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  elevation: 2, // 🔥 android shadow
},
cancelText: {
  color: "#475569",
  fontWeight: "500",
},

addText: {
  color: "#fff",
  fontWeight: "600",
},
labelRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
},

label: {
  fontSize: 14,
  fontWeight: "600",
  color: "#0F172A",
},

required: {
  color: "#DC2626",
  fontSize: 14,
  fontWeight: "700",
},
});