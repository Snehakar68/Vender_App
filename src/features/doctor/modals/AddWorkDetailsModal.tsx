import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddWorkDetailsModal({
  open,
  onClose,
  onSuccess,
  editData,
  doctorId,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
  doctorId: string;
}) {
  const OPD_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [form, setForm] = useState({
    hosp_Id: "",
    consFee: "",
    opdDays: [] as string[],
    slotStart: "",
    opD_To: "",
    max_OPD: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const handleChange = (key: string, value: any) => {
  setForm((prev) => ({
    ...prev,
    [key]: value,
  }));

  // 🔥 REMOVE ERROR WHEN USER TYPES
  setErrors((prev: any) => ({
    ...prev,
    [key]: "",
  }));
};

  const validate = () => {
    const e: any = {};

    if (!form.hosp_Id) e.hosp_Id = "Hospital required";

    if (!form.consFee) e.consFee = "Fee required";
    else if (isNaN(Number(form.consFee)))
      e.consFee = "Must be number";

    if (!form.opdDays.length) e.opdDays = "OPD Days required";

    if (!form.slotStart) e.slotStart = "Start time required";

    if (!form.opD_To) e.opD_To = "End time required";

    if (!form.max_OPD) e.max_OPD = "Max OPD required";
    else if (isNaN(Number(form.max_OPD)))
      e.max_OPD = "Must be number";

    setErrors(e);
    return Object.keys(e).length === 0;
  };


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

  useEffect(() => {
    if (editData) {
      setForm({
        hosp_Id: editData.hosp_Id,
        consFee: String(editData.cons_fee),
        opdDays: editData.opD_Days
          ? editData.opD_Days.split(",")
          : [],
        slotStart: editData.slot_Start?.slice(0, 5),
        opD_To: editData.slot_End?.slice(0, 5),
        max_OPD: String(editData.max_OPD),
      });
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();

     if (editData?.hosp_Id) {
  formData.append("work_Id", editData.hosp_Id);
}


      formData.append("vendor_id", doctorId);
      formData.append("Hosp_Id", form.hosp_Id);
      formData.append("ConsFee", form.consFee);
      formData.append("SlotStart", form.slotStart);
      formData.append("OPD_To", form.opD_To);
      formData.append("Max_OPD", form.max_OPD);

      // opdDays → string → split
      form.opdDays.forEach((day: string) => {
        formData.append("OPDDays", day);
      });

      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/Update_Doctor_Work_Details",
        {
          method: "POST",
          headers: { accept: "*/*" },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed");

      onSuccess?.();

    } catch (err) {
      console.log("Submit error", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (!open) {
    setForm({
      hosp_Id: "",
      consFee: "",
      opdDays: [],
      slotStart: "",
      opD_To: "",
      max_OPD: "",
    });
    setErrors({});
  }
}, [open]);
  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
      <ScrollView
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="always"
  contentContainerStyle={{ paddingBottom: 20 }}
  scrollEnabled={!hospitalOpen && !daysOpen}   // 🔥 CRITICAL FIX
>

            {/* HEADER */}
            <View style={styles.header}>
              <Ionicons name="briefcase-outline" size={20} color="#0F172A" />
              <Text style={styles.title}>Add Work Details</Text>
            </View>

            {/* FORM */}
            <Field label="Hospital" required>

              {/* SELECT BOX */}
     <TouchableOpacity
  disabled={!!editData}
  onPress={() => {
    if (!editData) setHospitalOpen(!hospitalOpen);
  }}
             style={{
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 10,
  padding: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: editData ? "#F1F5F9" : "#fff",   // ✅ add this
  opacity: editData ? 0.7 : 1,                     // ✅ add this
}}
              >
                <Text style={{ fontSize: 13 }}>
                  {form.hosp_Id
                    ? hospitals.find(h => h.id === form.hosp_Id)?.name
                    : "Select Hospital"}
                </Text>

                <Ionicons
                  name={hospitalOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>

              {/* DROPDOWN LIST */}
        <View>
                {hospitalOpen && (
                <View
  style={styles.dropdown}
><ScrollView
  style={{ maxHeight: 200 }}
  nestedScrollEnabled
  keyboardShouldPersistTaps="always"
  showsVerticalScrollIndicator
>
                      {hospitals.map((h) => (
                        <TouchableOpacity
                          key={h.id}
                          disabled={!!editData}
                          onPress={() => {
                            handleChange("hosp_Id", h.id);
                            setTimeout(() => setHospitalOpen(false), 100);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text style={{ fontSize: 13 }}>
                            {h.name}, {h.city}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {errors.hosp_Id && <Text style={styles.error}>{errors.hosp_Id}</Text>}
            </Field>

            <Field label="Consultation Fee (₹)" required>
              <Input
                value={form.consFee}
                keyboardType="numeric"
          onChangeText={(v: string) => handleChange("consFee", v)}
              />
              {errors.consFee && <Text style={{ color: "red" }}>{errors.consFee}</Text>}
            </Field>

            <Field label="OPD Days" required>

              {/* SELECT BOX */}
              <TouchableOpacity
                onPress={() => setDaysOpen(!daysOpen)}
                style={styles.input}
              >
                <Text style={{ fontSize: 13 }}>
                  {form.opdDays.length
                    ? form.opdDays.join(", ")
                    : "Select OPD Days"}
                </Text>
              </TouchableOpacity>
              <View style={{ position: "relative", zIndex: daysOpen ? 2000 : 1 }}>
                {/* DROPDOWN */}
                {daysOpen && (
                  <View style={styles.dropdown}>
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      style={{ maxHeight: 180 }}
                    >
                      {OPD_DAYS.map((day) => {
                        const selected = form.opdDays.includes(day);

                        return (
                          <TouchableOpacity
                            key={day}
                            onPress={() => {
                              if (selected) {
                                handleChange(
                                  "opdDays",
                                  form.opdDays.filter((d) => d !== day)
                                );
                              } else {
                                handleChange("opdDays", [...form.opdDays, day]);
                              }
                            }}
                            style={styles.dropdownItem}
                          >
                            <Text style={{ color: selected ? "#16A34A" : "#000" }}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {errors.opdDays && <Text style={styles.error}>{errors.opdDays}</Text>}
            </Field>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="OPD From" required>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowFrom(true)}
                  >
                    <Text>
                      {form.slotStart || "Select time"}
                    </Text>
                  </TouchableOpacity>

                  {showFrom && (
                    <DateTimePicker
                      mode="time"
                      value={new Date()}
                      is24Hour={true}
                      onChange={(e, date) => {
                        setShowFrom(false);
                        if (date) {
                          const time = date.toTimeString().slice(0, 5);
                          handleChange("slotStart", time);
                        }
                      }}
                    />
                  )}
                    {errors.slotStart && <Text style={styles.error}>{errors.slotStart}</Text>}
                </Field>
              
              </View>

              <View style={{ width: 10 }} />

              <View style={{ flex: 1 }}>
                <Field label="OPD To" required>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowTo(true)}
                  >
                    <Text>
                      {form.opD_To || "Select time"}
                    </Text>
                  </TouchableOpacity>

                  {showTo && (
                    <DateTimePicker
                      mode="time"
                      value={new Date()}
                      is24Hour={true}
                      onChange={(e, date) => {
                        setShowTo(false);
                        if (date) {
                          const time = date.toTimeString().slice(0, 5);
                          handleChange("opD_To", time);
                        }
                      }}
                    />
                  )}
                         {errors.opD_To && <Text style={styles.error}>{errors.opD_To}</Text>}
                </Field>
         
              </View>
            </View>

            <Field label="Max OPD Accepted" required>
              <Input
                value={form.max_OPD}
                keyboardType="numeric"
                onChangeText={(v: string) => handleChange("max_OPD", v)}
              />
                  {errors.max_OPD && <Text style={styles.error}>{errors.max_OPD}</Text>}
            </Field>
        

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.addText}>
                  {loading ? "Saving..." : editData ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },

  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "90%",
    overflow: "visible",   // 🔥 ADD THIS
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  star: {
    color: "#DC2626",
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    marginTop: 16,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F8FAFC",
  },

  addBtn: {
    flex: 1,
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#475569",
    fontWeight: "500",
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },
dropdown: {
  marginTop: 6,
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  elevation: 5,
},
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#E2E8F0",
  },

  error: {
    color: "#DC2626",
    fontSize: 11,
    marginTop: 4,
  },
});
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: any;
}) {
  return (
    <View style={{ marginBottom: 14, position: "relative" }}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.star}> *</Text>}
      </View>
      {children}
    </View>
  );
}

function Input(props: any) {
  return (
    <TextInput
      {...props}
      style={styles.input}
      placeholderTextColor="#94A3B8"
    />
  );
}