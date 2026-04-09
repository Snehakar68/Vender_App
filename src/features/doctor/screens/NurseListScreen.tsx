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
import { useRouter } from "expo-router";


type Nurse = {
  id: number;
  name: string;
  department: number;
  qualification: number;
  mobile?: string;
  email?: string;
  is_approved?: string;
  linked_by?: number;
};

type Department = {
  id: number;
  depName: string;
};

type NurseOption = {
  id: number;
  label: string;
};



export default function NurseListScreen() {
  const [open, setOpen] = useState(false);
 const [nurses, setNurses] = useState<Nurse[]>([]);
const [departments, setDepartments] = useState<Department[]>([]);
const [allNurses, setAllNurses] = useState<NurseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [adding, setAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [justApproved, setJustApproved] = useState<number | null>(null);
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;
  const router = useRouter();

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
    if (!id || departments.length === 0) return "-";

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

  const handleDeleteNurse = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await api.delete(
        `/api/Nurse/Delete_Nurse_Linking?vendor_id=${deleteTarget.id}&hosp_Id=${vendorId}`
      );

      // ✅ remove from UI instantly
      setNurses((prev: any) =>
        prev.filter((n: any) => n.id !== deleteTarget.id)
      );

      setDeleteTarget(null);
      setDeleteSuccess(true);

      setTimeout(() => setDeleteSuccess(false), 2000);
    } catch (e) {
      console.log("❌ Delete failed", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleApproveNurse = async (nurseId: number) => {
    if (approvingId) return;

    try {
      setApprovingId(nurseId);

      await api.post(
        `/api/Doctor/Approve_Doctor_Nurse/${vendorId}/${nurseId}`
      );

      // ✅ update UI instantly (same as web)
      setNurses((prev: any) =>
        prev.map((n: any) =>
          n.id === nurseId
            ? { ...n, is_approved: "Y" }
            : n
        )
      );

      setJustApproved(nurseId);
      setTimeout(() => setJustApproved(null), 3000);

    } catch (e) {
      console.log("❌ Approve failed", e);
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    if (open) {
      loadAvailableNurses();
    }
  }, [open]);

  useEffect(() => {
    if (vendorId) {
      const init = async () => {
        await loadDepartments();  // ✅ wait first
        await loadNurses();       // ✅ then map correctly
      };
      init();
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
              name:
                n.full_Name ??
                n.full_name ??
                n.name ??
                n.nurse_name ??
                "N",
              department: n.dep_id,
              qualification: n.qualification,
              mobile: n.mobile,
              email: n.email,

              // 🔥 ADD THESE (IMPORTANT)
              is_approved: m.is_approved,
              linked_by: m.linked_by,
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading nurses...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

      {/* ✅ FIXED HEADER (same as WorkDetails) */}
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Nurses"
          subtitle="Manage your staff"
          icon="people-outline"
          actionText="+ Add"
          onActionPress={() => setOpen(true)}
        />
      </View>

      {/* ✅ SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* NURSE CARDS */}
        {nurses.map((nurse, index) => (
          <View key={nurse.id} style={styles.card}>

            {/* TOP */}
           <View style={styles.topRow}>

  {/* LEFT SIDE */}
  <View style={styles.leftContent}>
    
    {/* AVATAR */}
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        {(nurse.name || "N").trim().charAt(0).toUpperCase()}
      </Text>
    </View>

    {/* TEXT */}
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{nurse.name}</Text>

      <View style={styles.departmentBadge}>
        <Text style={styles.departmentText}>
          {getDepartmentName(nurse.department)}
        </Text>
      </View>

      <View style={styles.degreeBadge}>
        <Ionicons name="school-outline" size={12} color="#475569" />
        <Text style={styles.degreeText}>
          {getDegreeName(nurse.qualification)}
        </Text>
      </View>
    </View>

  </View>

  {/* 🔥 STATUS (TOP RIGHT) */}
  <View style={styles.statusWrapper}>
    <View style={styles.statusBadgeNew}>
      <Text style={styles.statusTextNew}>
        {nurse.is_approved === "Y" ? "Active" : "Inactive"}
      </Text>
    </View>
  </View>

</View>

            {/* ACTION ROW */}
            <View style={styles.actionRow}>

              {/* VIEW PROFILE */}
              <TouchableOpacity
                style={styles.viewBtnNew}
                onPress={() =>
                  router.push({
                    pathname: "/(doctor)/view-nurse",
                    params: { nurseId: nurse.id },
                  })
                }
              >
                <Ionicons name="eye-outline" size={16} color="#fff" />
                <Text style={styles.viewTextNew}>View Profile</Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.deleteBtnNew}
                onPress={() => setDeleteTarget(nurse)}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </TouchableOpacity>

            </View>
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
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={{ marginBottom: 15 }}>
              Are you sure you want to delete{" "}
              <Text style={{ fontWeight: "600" }}>
                {deleteTarget?.name}
              </Text>?
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteTarget(null)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addBtnModal, deleting && { opacity: 0.5 }]}
                onPress={handleDeleteNurse}
                disabled={deleting}
              >
                <Text style={{ color: "#fff" }}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
      <Modal visible={deleteSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ color: "green", textAlign: "center" }}>
              Nurse deleted successfully
            </Text>
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
    paddingTop: 12,   // 🔥 reduced (header already separate)
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20, // more spacing
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start", // 🔥 aligns top
  marginBottom: 12,
},

leftContent: {
  flexDirection: "row",
  flex: 1,
},

statusWrapper: {
  justifyContent: "flex-start",
  alignItems: "flex-end",
},

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  degree: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  /* 🔥 DEPARTMENT BADGE */
  departmentBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },

  departmentText: {
    color: "#0369A1",
    fontSize: 11,
    fontWeight: "600",
  },

  /* 🔥 STATUS */
  statusBadgeNew: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusTextNew: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "600",
  },

  /* 🔥 ACTION ROW */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* 🔥 VIEW BUTTON (PRIMARY CTA) */
  viewBtnNew: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,

  backgroundColor: "#2cc7ff", // 🔥 Indigo (premium SaaS color)
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 10,

  shadowColor: "#4F46E5",
  shadowOpacity: 0.7,
  shadowRadius: 6,
  elevation: 4,
},

viewTextNew: {
  color: "#fff",
  fontSize: 13,
  fontWeight: "700", // 🔥 slightly stronger CTA
},

  /* 🔥 DELETE BUTTON */
  deleteBtnNew: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 10,
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


  iconBtn: {
    backgroundColor: "#F1F5F9",
    padding: 6,
    borderRadius: 8,
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
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  deleteText: {
    fontSize: 12,
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
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 110, // 🔥 stabilizes layout
  },

  statusTextFixed: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    color: "#475569",
  },

  iconRowFixed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  approveWrapper: {
    minWidth: 80, // 🔥 VERY IMPORTANT (fixes jumping)
    alignItems: "center",
  },

  approveBtn: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  approveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  approvedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  approvedText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "600",
  },

  disabledApprove: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  disabledText: {
    color: "#6B7280",
    fontSize: 11,
  },

  deleteBtnFixed: {
    backgroundColor: "#FEE2E2",
    padding: 6,
    borderRadius: 6,
  },
  headerWrapper: {
    backgroundColor: "#fff",

    borderBottomWidth: 0.5,
    borderColor: "#E2E8F0",

    elevation: 3,
    zIndex: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  degreeBadge: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,

  alignSelf: "flex-start",

  backgroundColor: "#F1F5F9",  // subtle gray
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 8,

  marginTop: 6,
},

degreeText: {
  fontSize: 11,
  fontWeight: "500",
  color: "#475569",
},
});