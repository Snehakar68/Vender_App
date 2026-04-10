import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@/src/shared/components/AppHeader";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";



export default function ServicesScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [edit, setEdit] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState({
    onlineAvailable: false,
    onlineFee: "",
    homeAvailable: false,
    homeFee: "",
  });

  const [backupServices, setBackupServices] = useState({
    onlineAvailable: false,
    onlineFee: "",
    homeAvailable: false,
    homeFee: "",
  });

  const isView = !edit;

  const validate = () => {
    if (services.onlineAvailable && !services.onlineFee) {
      alert("Enter online consultation fee");
      return false;
    }

    if (services.homeAvailable && !services.homeFee) {
      alert("Enter home visit fee");
      return false;
    }

    return true;
  };
  const toggleService = (key: "onlineAvailable" | "homeAvailable") => {
    setServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const updateFee = (key: "onlineFee" | "homeFee", value: string) => {
    setServices((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditToggle = () => {
    if (edit) {
      // CANCEL → restore old data
      setServices(backupServices);
    }
    setEdit((prev) => !prev);
  };

  const updateServices = async () => {
    if (!validate()) return;

    if (!vendorId) {
      alert("Vendor not found");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("vendor_id", vendorId);

      formData.append(
        "Is_ONline_OPD",
        services.onlineAvailable ? "yes" : "no"
      );

      formData.append(
        "online_charges",
        services.onlineAvailable ? services.onlineFee : "0"
      );


      formData.append(
        "Is_home_visit",
        services.homeAvailable ? "yes" : "no"
      );
      formData.append(
        "home_charges",
        services.homeAvailable ? services.homeFee : "0"
      );

      const token = (auth as any)?.token;

      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/Update_Doctor_Consultation_Details",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // ❌ DO NOT add Content-Type
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Update failed");

      setSuccessVisible(true);
      setBackupServices(services);
      setEdit(false);
    } catch (e) {
      console.log("❌ ERROR:", e);

      const error = e as any;

      setErrorMessage(
        error?.message || "Unable to update services. Please try again."
      );

      setErrorVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (successVisible) {
      const timer = setTimeout(() => {
        setSuccessVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successVisible]);


  useEffect(() => {
    if (errorVisible) {
      const timer = setTimeout(() => {
        setErrorVisible(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [errorVisible]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(
          `https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDoctorById/${vendorId}`
        );

        const data = await res.json();
        const mapped = {
          onlineAvailable: data.is_ONline_OPD === "Y",
          onlineFee: data.online_charges?.toString() || "",
          homeAvailable: data.is_home_visit === "Y",
          homeFee: data.home_charges?.toString() || "",
        };

        setServices(mapped);
        setBackupServices(mapped); // ✅ IMPORTANT

      } catch (e) {
        console.log("Fetch error", e);
      } finally {
        setLoading(false); // 🔥 IMPORTANT
      }
    };

    if (vendorId) fetchDoctor();
  }, [vendorId]);
  useEffect(() => {
    if (!services.onlineAvailable) {
      updateFee("onlineFee", "");
    }
    if (!services.homeAvailable) {
      updateFee("homeFee", "");
    }
  }, [services.onlineAvailable, services.homeAvailable]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loaderText}>
          Loading services...
        </Text>
      </View>
    );
  }
  return (

 <View style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Services"
          subtitle={
            edit
              ? "Editing consultation services"
              : "Manage consultation availability & fees"
          }
          icon="medkit-outline"
          actionText={edit ? "Cancel" : "Edit"}
          onActionPress={handleEditToggle}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.card}>
          {/* ONLINE SERVICE */}
          <View style={styles.serviceBlock}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Online Consultation</Text>
                <Text style={styles.subLabel}>Allow patients to consult online</Text>
              </View>

              <TouchableOpacity
                disabled={isView}
                style={[
                  styles.toggle,
                  services.onlineAvailable && styles.toggleActive,
                  isView && { opacity: 0.5 }
                ]}
                onPress={() => toggleService("onlineAvailable")}
              >
                <View
                  style={[
                    styles.knob,
                    services.onlineAvailable && styles.knobActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {services.onlineAvailable && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Consultation Fee</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currency}>₹</Text>
                  <TextInput
                    editable={!isView}
                    placeholder="Enter fee"
                    keyboardType="numeric"
                    value={services.onlineFee}
                    onChangeText={(val) =>
                      updateFee("onlineFee", val.replace(/\D/g, ""))
                    }
                    style={[
                      styles.input,
                      isView && {
                        backgroundColor: "#E2E8F0",
                        color: "#64748B"
                      }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* HOME VISIT */}
          <View style={styles.serviceBlock}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Home Visit</Text>
                <Text style={styles.subLabel}>Visit patient at home</Text>
              </View>
              <TouchableOpacity
                disabled={isView}
                activeOpacity={0.8}
                style={[
                  styles.toggle,
                  services.homeAvailable && styles.toggleActive,
                  isView && { opacity: 0.5 }
                ]}
                onPress={() => toggleService("homeAvailable")}
              >
                <View
                  style={[
                    styles.knob,
                    services.homeAvailable && styles.knobActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            {services.homeAvailable && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Consultation Fee</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currency}>₹</Text>
                  <TextInput
                    editable={!isView}
                    placeholderTextColor="#94A3B8"
                    placeholder="Enter fee"
                    keyboardType="numeric"
                    value={services.homeFee}
                    onChangeText={(val) =>
                      updateFee("homeFee", val.replace(/\D/g, ""))
                    }
                    style={[
                      styles.input,
                      isView && {
                        backgroundColor: "#E2E8F0",
                        color: "#64748B"
                      }
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        {/* BUTTON */}
        {edit && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.saveBtn,
              submitting && { opacity: 0.6 }
            ]}
            onPress={updateServices}
            disabled={submitting}
          >
            <Text style={styles.saveText}>
              {submitting ? "Updating..." : "Update Changes"}
            </Text>
          </TouchableOpacity>
        )}

        {successVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>

              <View style={styles.iconWrapper}>
                <Ionicons name="checkmark" size={28} color="#fff" />
              </View>

              <Text style={styles.modalTitle}>
                Updated Successfully
              </Text>

              <Text style={styles.modalSubtitle}>
                Your services have been updated.
              </Text>

              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setSuccessVisible(false)}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {errorVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>

              <View style={styles.errorIconWrapper}>
                <Ionicons name="close" size={28} color="#fff" />
              </View>

              <Text style={styles.errorTitle}>
                Update Failed
              </Text>

              <Text style={styles.modalSubtitle}>
                {errorMessage}
              </Text>

              <TouchableOpacity
                style={styles.errorBtn}
                onPress={() => setErrorVisible(false)}
              >
                <Text style={styles.modalBtnText}>Try Again</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
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

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0F172A",
  },

  serviceBlock: {
    marginBottom: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  subLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  /* INPUT */
  inputWrapper: {
    marginTop: 14,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  inputLabel: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "500",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },

  currency: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
    color: "#0F766E",
  },

  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: "#0F172A",
  },

  /* TOGGLE */
  toggle: {
    width: 56,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#CBD5E1",
    padding: 3,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  errorIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DC2626", // red
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,

    shadowColor: "#DC2626",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7F1D1D", // dark red
  },

  errorBtn: {
    marginTop: 16,
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  subTitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#16A34A", // success green
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,

    shadowColor: "#16A34A",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  editBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
  },

  toggleActive: {
    backgroundColor: "#0F766E",
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  knobActive: {
    alignSelf: "flex-end",
  },

  /* BUTTON */
  saveBtn: {
    backgroundColor: "#0F766E",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#0F766E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
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
    zIndex: 100,
  },

  modalCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },

  modalIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },

  modalBtn: {
    marginTop: 16,
    backgroundColor: "#0F766E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
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
});