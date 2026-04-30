import React, { useEffect, useState ,useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
   Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/src/shared/components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Work() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [vendorId, setVendorId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    linkedType: "",
    hospital: "",
    hospitalName: "",
    doctor: "",
    doctorName: "",
    shift: "Morning",
    shiftDays: "0",
  });

  const [errors, setErrors] = useState({
  linkedType: "",
  hospital: "",
  doctor: "",
});



  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  const shifts = ["Morning", "Evening", "Night"];
    const scrollRef = useRef<ScrollView>(null); // Ref for scrolling to top
      const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
     setErrors((prev: any) => ({ ...prev, [key]: "" }));
  };

  


useEffect(() => {
  if (!successMessage) return;

  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 3000);

  return () => clearTimeout(timer);
}, [successMessage]);

  // ================= INIT =================
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
      const user = await AsyncStorage.getItem("user");
const parsed = JSON.parse(user || "{}");

const id = parsed?.vendorId;
    if (!id) return;

    setVendorId(id);
    await fetchWorkDetails(id);
  };

  // ================= FETCH WORK DETAILS =================
  const fetchWorkDetails = async (id: string) => {
  try {
    setLoading(true);

    const res = await fetch(
      `https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurseById/${id}`
    );

    const data = await res.json();
    if (!res.ok) throw new Error("Fetch failed");

    const linkedType =
      data?.nurseLinked?.linked_with === "H"
        ? "Hospital"
        : data?.nurseLinked?.linked_with === "D"
        ? "Doctor"
        : "";

    const linkedId = data?.nurseLinked?.linked_id || "";

    // ✅ FIRST set form properly
    setFormData((prev) => ({
      ...prev,
      linkedType,
      hospital: linkedType === "Hospital" ? linkedId : "",
      doctor: linkedType === "Doctor" ? linkedId : "",
      shift: data?.shift || "Morning",
      shiftDays: String(data?.shiftchange || "0"),
    }));

    // ✅ THEN fetch list with ID to map name
    if (linkedType === "Hospital") {
      await fetchHospitals(linkedId);
    }

    if (linkedType === "Doctor") {
      await fetchDoctors(linkedId);
    }

    setIsApproved(data?.nurseLinked?.is_approved === "Y");
  } catch (e) {
    console.log("Fetch error", e);
  } finally {
    setLoading(false);
  }
};

  // ================= FETCH LISTS =================
  const fetchHospitals = async (selectedId?: string) => {
  try {
    const res = await fetch(
      "https://coreapi-service-111763741518.asia-south1.run.app/api/Hospital/GetHospitalListForAdmin"
    );

    const json = await res.json();
    const list = Array.isArray(json) ? json : [];
  

    setHospitals(list);

    // ✅ use passed ID OR state ID
    const id = selectedId || formData.hospital;

    const selected = list.find(
      (h) => String(h.vendor_id) === String(id)
    );

    if (selected) {
      setFormData((prev) => ({
        ...prev,
       hospitalName: `${selected.full_name}, ${selected.city} - ${selected.state}`,
      }));
    }
  } catch (e) {
    console.log("Hospital error", e);
  }
};

  const fetchDoctors = async (selectedId?: string) => {
  try {
    const res = await fetch(
      "https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDoctorListForAdmin"
    );

    const json = await res.json();
    const list = Array.isArray(json) ? json : [];

    setDoctors(list);

    const id = selectedId || formData.doctor;

    const selected = list.find(
      (d) => String(d.vendor_id) === String(id)
    );

    if (selected) {
      setFormData((prev) => ({
        ...prev,
        doctorName: `${selected.full_name}, ${selected.city} - ${selected.state}`, 
      }));
    }
  } catch (e) {
    console.log("Doctor error", e);
  }
};

  useEffect(() => {
    if (formData.linkedType === "Hospital") fetchHospitals();
    if (formData.linkedType === "Doctor") fetchDoctors();
  }, [formData.linkedType]);

  // ================= VALIDATION =================
 const validate = () => {
  let newErrors: any = {};

  if (!formData.linkedType) {
    newErrors.linkedType = "Please select Hospital or Doctor";
  }

  if (formData.linkedType === "Hospital" && !formData.hospital) {
    newErrors.hospital = "Please select Hospital";
  }

  if (formData.linkedType === "Doctor" && !formData.doctor) {
    newErrors.doctor = "Please select Doctor";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  // ================= UPDATE =================
  const onUpdate = async () => {
    if (!vendorId) return;
    if (!validate()) return;

    try {
      setUpdating(true);

      const form = new FormData();

      form.append("Vendor_Id", String(vendorId));
      form.append("Shift", formData.shift);
      form.append(
        "Shift_Change",
        String(Number(formData.shiftDays) || 0)
      );

      form.append("is_linked_hospital", "Y");

      if (formData.linkedType === "Hospital") {
        form.append("Hosp_id", String(formData.hospital));
      }

      if (formData.linkedType === "Doctor") {
        form.append("Doc_id", String(formData.doctor));
      }

      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/Update_Nurse_Work_Details",
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) throw new Error("Update failed");

      setIsEditing(false);
setSuccessMessage("Work information updated successfully");
              // Scroll to top to show the message
    scrollRef.current?.scrollTo({ y: 0, animated: true });

      fetchWorkDetails(vendorId);
    } catch (e) {
      console.log("Update error", e);
    } finally {
      setUpdating(false);
    }
  };

  // ================= UI =================
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Work Information"
          subtitle="Manage your work details"
          icon="briefcase-outline"
          actionText={isEditing ? "Cancel" : "Edit"}
          onActionPress={() => setIsEditing(!isEditing)}
        />
      </View>
      <ScrollView 
       ref={scrollRef} // ✅ Added ref
      contentContainerStyle={styles.container}>
        

      

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <View style={styles.card}>
            {/* STATUS */}
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Current Status</Text>
              <Text
                style={{
                  color: isApproved ? "green" : "red",
                  fontWeight: "600",
                }}
              >
                ● {isApproved ? "Active" : "Inactive"}
              </Text>
            </View>

            {/* LINK TYPE */}
            <Text style={styles.label}>Linked Type</Text>
            <View style={styles.row}>
              {["Hospital", "Doctor"].map((type) => (
                <TouchableOpacity
                  key={type}
                  disabled={!isEditing}
                  style={[
                    styles.optionBtn,
                    formData.linkedType === type && styles.activeOption,
                  ]}
                  onPress={() => {
                    handleChange("linkedType", type);
                    handleChange("hospital", "");
                    handleChange("doctor", "");
                    handleChange("hospitalName", "");
                    handleChange("doctorName", "");
                  }}
                >
                  <Text
                    style={
                      formData.linkedType === type
                        ? styles.activeText
                        : styles.optionText
                    }
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.linkedType && (
  <Text style={styles.errorText}>{errors.linkedType}</Text>
)}

            {/* HOSPITAL */}
            {formData.linkedType === "Hospital" && (
              <>
                <Text style={styles.label}>Select Hospital</Text>

                <TouchableOpacity
                  style={styles.input}
                  disabled={!isEditing}
                  onPress={() =>
                    isEditing &&
                    setShowHospitalDropdown(!showHospitalDropdown)
                  }
                >
                  <Text>
                    {formData.hospitalName || "Select Hospital"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} />
                </TouchableOpacity>

                {showHospitalDropdown &&
                  hospitals.map((h) => (
                    <TouchableOpacity
                      key={h.vendor_id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleChange("hospital", h.vendor_id);
                        handleChange("hospitalName", h.full_name);
                        setShowHospitalDropdown(false);
                      }}
                    >
                      <Text>{h.full_name}, {h.city} - {h.state}</Text>
                    </TouchableOpacity>
                  ))}
              </>
            )}
            {errors.hospital && (
  <Text style={styles.errorText}>{errors.hospital}</Text>
)}

            {/* DOCTOR */}
            {formData.linkedType === "Doctor" && (
              <>
                <Text style={styles.label}>Select Doctor</Text>

                <TouchableOpacity
                  style={styles.input}
                  disabled={!isEditing}
                  onPress={() =>
                    isEditing &&
                    setShowDoctorDropdown(!showDoctorDropdown)
                  }
                >
                  <Text>
                    {formData.doctorName || "Select Doctor"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} />
                </TouchableOpacity>

                {showDoctorDropdown &&
                  doctors.map((d) => (
                    <TouchableOpacity
                      key={d.vendor_id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleChange("doctor", d.vendor_id);
                        handleChange("doctorName", d.full_name);
                        setShowDoctorDropdown(false);
                      }}
                    >
                      <Text>{d.full_name}, {d.city} - {d.state}</Text>
                    </TouchableOpacity>
                  ))}
              </>
            )}
            {errors.doctor && (
  <Text style={styles.errorText}>{errors.doctor}</Text>
)}

            {/* SHIFT */}
            <Text style={styles.label}>Shift</Text>
            <TouchableOpacity
              style={styles.input}
              disabled={!isEditing}
              onPress={() =>
                isEditing && setShowShiftDropdown(!showShiftDropdown)
              }
            >
              <Text>{formData.shift}</Text>
              <Ionicons name="chevron-down" size={18} />
            </TouchableOpacity>

            {showShiftDropdown &&
              shifts.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleChange("shift", s);
                    setShowShiftDropdown(false);
                  }}
                >
                  <Text>{s}</Text>
                </TouchableOpacity>
              ))}

            {/* SHIFT DAYS */}
            <Text style={styles.label}>Shift Change Days</Text>
            <TextInput
              style={styles.input}
              value={formData.shiftDays}
              editable={isEditing}
              keyboardType="numeric"
              onChangeText={(t) => handleChange("shiftDays", t)}
            />
          </View>
        )}

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={onUpdate}>
            <Text style={styles.saveText}>
              {updating ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Modal
  visible={!!successMessage}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Ionicons name="checkmark-circle" size={40} color="#10B981" />
      
      <Text style={styles.modalText}>
        {successMessage}
      </Text>

      <TouchableOpacity
        style={styles.modalBtn}
        onPress={() => setSuccessMessage("")}
      >
        <Text style={styles.modalBtnText}>OK</Text>
      </TouchableOpacity>
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
    padding: 16,
  },
  headerWrapper: {
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 1,
  paddingTop: 2,
  paddingBottom: 2,

  borderBottomWidth: 1,
  borderBottomColor: "#E2E8F0",

  // Shadow (iOS)
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },

  // Shadow (Android)
  elevation: 3,

  zIndex: 10,
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
  row: {
    flexDirection: "row",
    marginTop: 6,
  },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginRight: 10,
  },
  activeOption: {
    backgroundColor: "#0F766E",
  },
  optionText: {
    color: "#000",
  },
  activeText: {
    color: "#fff",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  successContainer: {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 1,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'center',
  justifyContent: 'center'
},
successText: {
  color: "#065F46",
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center"
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 20,
  alignItems: "center",
},

modalText: {
  fontSize: 14,
  color: "#0F172A",
  marginTop: 10,
  textAlign: "center",
  fontWeight: "500",
},

modalBtn: {
  marginTop: 16,
  backgroundColor: "#0F766E",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
},

modalBtnText: {
  color: "#fff",
  fontWeight: "600",
},
errorText: {
  color: "red",
  fontSize: 12,
  marginTop: 4,
},

errorBorder: {
  borderWidth: 1,
  borderColor: "red",
},
});