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
import api from "@/src/core/api/apiClient";
import { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";




export default function NurseListScreen() {
  const [open, setOpen] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [allNurses, setAllNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [adding, setAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;


  const getDegreeName = (id: number) => {
    const map: any = {
      1: "ANM",
      2: "GNM",
      3: "BSC Nursing",
    };

    return map[id] || "-";
  };
  const loadDepartments = async () => {
    try {
      const res = await api.get("/api/Nurse/GetNurseDepartments");
      setDepartments(res.data || []);
    } catch (e) {
      console.log("❌ Department fetch failed");
    }
  };
  const getDepartmentName = (id: number) => {
    return (
      departments.find((d: any) => d.id === Number(id))?.depName || "-"
    );
  };

  const loadAvailableNurses = async () => {
    try {
      const res = await api.get("/api/Nurse/GetNurseListForAdmin");

      const list = res.data?.nurses || [];

      const linkedIds = nurses.map((n: any) => n.id);

      const filtered = list
        .filter((n: any) => !n.workDetails || n.workDetails.length === 0)
        .map((n: any) => ({
          id: n.nurse_id || n.vendor_id,
          label: `${n.full_Name || n.full_name}, ${n.city}, ${n.state}`,
        }))
        .filter((n: any) => !linkedIds.includes(n.id));

      setAllNurses(filtered);
    } catch (e) {
      console.log("❌ Available nurse fetch failed");
    }
  };

  const handleAddNurse = async () => {
    setErrors({});

    if (!selectedNurse) {
      setErrors({ nurse: "Please select a nurse" });
      return;
    }

    try {
      setAdding(true);

      await api.post("/api/Doctor/add_Doctor_Nurse", {
        vendor_id: vendorId,
        nurse_id: selectedNurse.id,
      });

      // ✅ Success
      setOpen(false);
      setSelectedNurse(null);

      loadNurses(); // refresh list
    } catch (e: any) {
      console.log("❌ Add nurse error:", e?.response?.data);
      setErrors({ nurse: "Failed to add nurse" });
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAvailableNurses();
    }
  }, [open]);

  useEffect(() => {
    if (vendorId) {
      loadDepartments(); // 👈 ADD THIS
      loadNurses();
    }
  }, [vendorId]);

  const loadNurses = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/Doctor/get_Doctor_Nurse/${vendorId}`
      );

      const mappings = res.data?.data || [];

      const results = await Promise.all(
        mappings.map(async (m: any) => {
          try {
            const nurseRes = await api.get(`/api/Nurse/GetNurseById/${m.nurse_id}`);
            const n = nurseRes.data;

            return {
              id: n.nurse_id || n.vendor_id,
              name: n.full_Name || n.full_name,
              role: n.dep_id, // 👈 store raw id first
              degree: getDegreeName(n.qualification),
              mobile: n.mobile,
              email: n.email,
              status: m.is_approved === "Y" ? "ACTIVE" : "INACTIVE",
            };
          } catch {
            return null;
          }
        })
      );

      setNurses(results.filter(Boolean));

    } finally {
      setLoading(false);
    }
  };
  // const nurses = [
  //   {
  //     name: "ashwani sdf",
  //     role: "Intensive Care Unit (ICU)",
  //     status: "INACTIVE",
  //     degree: "ANM",
  //     mobile: "789837789",
  //     email: "amanu9442@gmail.com",
  //   },
  //   {
  //     name: "Last Test",
  //     role: "Inpatient Ward (IPD)",
  //     status: "INACTIVE",
  //     degree: "BSc Nursing",
  //     mobile: "5487398787",
  //     email: "bibhu@hp.com",
  //   },
  //   {
  //     name: "knknjnj",
  //     role: "Inpatient Ward (IPD)",
  //     status: "ACTIVE",
  //     degree: "BSc Nursing",
  //     mobile: "8789484748",
  //     email: "nb@nb.com",
  //   },
  //   {
  //     name: "Nr Test",
  //     role: "Outpatient Department (OPD)",
  //     status: "ACTIVE",
  //     degree: "GNM",
  //     mobile: "9874894150",
  //     email: "nbb@nbb.com",
  //   },
  // ];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading nurses...</Text>
      </SafeAreaView>
    );
  }
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

        {/* NURSE CARDS */}
        {nurses.map((nurse, index) => (
          <View key={nurse.id} style={styles.card}>

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
                <Text style={styles.role}>
                  {getDepartmentName(nurse.role)}
                </Text>
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
          <TouchableOpacity
  style={styles.selectBox}
  onPress={() => setShowDropdown(!showDropdown)}
>
  <Text style={{ color: selectedNurse ? "#000" : "#64748B" }}>
    {selectedNurse?.label || "Select Nurse"}
  </Text>
</TouchableOpacity>

            {/* OPTIONS LIST */}
         {showDropdown && (
  <View style={{ maxHeight: 150 }}>
    <ScrollView>
      {allNurses.map((nurse) => (
        <TouchableOpacity
          key={nurse.id}
          onPress={() => {
            setSelectedNurse(nurse);
            setShowDropdown(false);
            setErrors({});
          }}
          style={{
            padding: 10,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text>{nurse.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
)}

            {/* BUTTONS */}
            <View style={styles.modalActions}>
             <TouchableOpacity
  style={styles.cancelBtn}
  onPress={() => {
    setOpen(false);
    setSelectedNurse(null);
    setShowDropdown(false);
    setErrors({});
  }}
>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addBtnModal, adding && { opacity: 0.5 }]}
                onPress={handleAddNurse}
                disabled={adding}
              >
                <Text style={styles.addText}>
                  {adding ? "Adding..." : "Add"}
                </Text>
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