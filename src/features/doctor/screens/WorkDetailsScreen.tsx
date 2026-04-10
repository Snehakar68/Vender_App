import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@/src/shared/components/AppHeader";
import { useEffect, useState } from "react";
import AddWorkDetailsModal from "../modals/AddWorkDetailsModal";
import { useWorkDetails } from "../hooks/useWorkDetails";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function WorkDetailsScreen() {
  const [open, setOpen] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // 🔥 TODO: replace with actual doctorId from auth/storage
  const auth = useContext(AuthContext);
  const doctorId = auth?.user?.vendorId ?? "";

  const {
    data,
    loading,
    approve,
    remove,
    fetchData,
    approvingId,
  } = useWorkDetails(doctorId);

  useEffect(() => {
    const fetchHospitals = async () => {
      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Hospital/GetHospitalListForAdmin"
      );
      const data = await res.json();

      const unique = Array.from(
        new Map(data.map((h: any) => [h.vendor_id, h])).values()
      );

      setHospitals(
        unique.map((h: any) => ({
          id: h.vendor_id,
          name: h.full_name,
          city: h.city,
          state: h.state,
        }))
      );
    };

    fetchHospitals();
  }, []);

  const getHospitalName = (id: any) => {
    const hosp = hospitals.find((h) => h.id === id);
    return hosp
      ? `${hosp.name}, ${hosp.city}`
      : id;
  };
  // ✅ Loading state
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={{ marginTop: 8 }}>Loading work details...</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Work Details"
          subtitle="Manage schedule & fees"
          icon="briefcase-outline"
          actionText="+ Add"
          onActionPress={() => setOpen(true)}
        />
      </View>

      {/* MODAL */}
      <AddWorkDetailsModal
        open={open}
        editData={editData}
        doctorId={doctorId}
        onClose={() => {
          setOpen(false);
          setEditData(null); // 🔥 reset
        }}
        onSuccess={() => {
          setOpen(false);
          setEditData(null);
          fetchData();
        }}
      />
      {/* EMPTY STATE */}
      {!data.length ? (
        <View style={styles.empty}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="briefcase-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Work Details</Text>
            <Text style={styles.emptyText}>
              Start by adding your hospital schedule
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {data.map((item) => (
            <View key={item.hosp_Id} style={styles.card}>
              {/* TOP */}
              <View style={styles.topRow}>
                <Text style={styles.title}>
                  {getHospitalName(item.hosp_Id)}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    item.is_approved === "Y"
                      ? styles.activeBadge
                      : styles.inactiveBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.is_approved === "Y"
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </Text>
                </View>
              </View>

              {/* DETAILS */}
              <View style={styles.grid}>
                <Info label="OPD Days" value={item.opD_Days} />

                <Info
                  label="OPD Time"
                  value={`${item.slot_Start?.slice(0, 5)} to ${item.slot_End?.slice(0, 5)}`}
                />

                <Info
                  label="Fee"
                  value={`₹${item.cons_fee}`}
                />

                <Info
                  label="Max OPD"
                  value={`${item.max_OPD} patients`}
                />
              </View>

              {/* ACTIONS */}
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

                {/* LEFT: EDIT + DELETE */}
                <View style={{ flexDirection: "row", gap: 16 }}>

                  {/* EDIT */}
                  <View style={styles.actionGroup}>

                    {/* EDIT */}
                    <TouchableOpacity
                      style={styles.editBtnIcon}
                      onPress={() => {
                        setEditData(item);
                        setOpen(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={18} color="#2563EB" />
                    </TouchableOpacity>

                    {/* DELETE */}
                    <TouchableOpacity
                      style={styles.deleteBtnIcon}
                      onPress={() => setDeleteModal(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>

                  </View>

                </View>

                {/* RIGHT: APPROVE */}
                <View style={{ minWidth: 90, alignItems: "flex-end" }}>

                  {item.is_approved === "Y" ? (
                    <View style={styles.approvedBadge}>
                      <Text style={styles.approvedText}>Approved</Text>
                    </View>

                  ) : (
                    <TouchableOpacity
                      disabled={item.linked_by === "D" || approvingId === item.hosp_Id}
                      onPress={() => approve(item.hosp_Id)}
                      style={[
                        styles.approveButton,
                        (item.linked_by === "D") && styles.approveDisabled,
                      ]}
                    >
                      <Text style={styles.approveText}>
                        {approvingId === item.hosp_Id
                          ? "Approving..."
                          : "Approve"}
                      </Text>
                    </TouchableOpacity>
                  )}

                </View>



              </View>
            </View>
          ))}

        </ScrollView>

      )}
      {deleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
              Confirm Deletion
            </Text>

            <Text style={{ textAlign: "center", marginBottom: 20, color: "#475569" }}>
              Are you sure you want to delete work details for{" "}
              <Text style={{ fontWeight: "600", color: "#0F172A" }}>
                {getHospitalName(deleteModal.hosp_Id)}
              </Text>?
            </Text>

            <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteModal(null)}
              >
                <Text style={{ color: "#475569", fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirm}
                onPress={async () => {
                  try {
                    setDeleting(true);
                    await remove(deleteModal.hosp_Id);
                  } finally {
                    setDeleting(false);
                    setDeleteModal(null);
                  }
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      )}
     </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    paddingBottom: 40,
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC", // match app bg
  },

  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,

    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  infoBox: {
    width: "48%",
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    color: "#64748B",
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    color: "#0F172A",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  approveDisabled: {
    backgroundColor: "#E5E7EB",
  },

  approveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    color: "#0F172A",
  },
  approvedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  approvedText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },

  approveBtn: {
    color: "#16A34A",
    fontWeight: "600",
  },

  deleteBtn: {
    color: "#DC2626",
    fontWeight: "600",
  },

  approved: {
    color: "green",
    fontWeight: "600",
  },

  disabled: {
    color: "gray",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,

    // 🔥 better elevation
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,

    alignItems: "center", // center content
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteConfirm: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionGroup: {
    flexDirection: "row",
    gap: 10,
  },

  editBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF", // light blue

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  deleteBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF2F2", // light red

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
});

/* ================= COMPONENTS ================= */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}