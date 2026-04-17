import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import apiClient from "@/src/core/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import CityStatePin from "@/src/shared/components/CityAutocomplete";
import GoogleMapPicker from "@/src/shared/components/GoogleMapPicker";
import { Modal } from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

type Role = "DOC" | "NUR" | "HOS" | "CLN" | "AMB";

const USER_API_MAP: Record<Role, string> = {
  DOC: "https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/CreateDoctorInfo",
  NUR: "https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/CreateNurseInfo",
  HOS: "https://coreapi-service-111763741518.asia-south1.run.app/api/Hospital/CreateHospitalInfo",
  CLN: "https://coreapi-service-111763741518.asia-south1.run.app/api/Cleaner/CreateCleaner_Info",
  AMB: "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/CreateAmbulance_Owner_Info",
};

export default function RegisterProfile() {
  const [vendorId, setVendorId] = useState("");

  const [form, setForm] = useState({
    fullname: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    altPhone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pin: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const isHospital = params.usertype === "HOS";
  const [successMsg, setSuccessMsg] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p: any) => ({ ...p, [key]: "" }));
  };
  useEffect(() => {
    const loadVendorId = async () => {
      const id = await AsyncStorage.getItem("vendorId");
      if (id) setVendorId(id);
    };

    loadVendorId();
  }, []);
  const validate = () => {
    const err: any = {};

    if (!form.fullname.trim()) {
      err.fullname = isHospital
        ? "Hospital name is required"
        : "Full name is required";
    }

    if (!form.address1.trim()) err.address1 = "Address is required";

    if (!form.city.trim()) err.city = "City is required";

    if (!form.state.trim()) err.state = "State is required";

    if (!form.pin.trim()) err.pin = "PIN is required";

    // ❗ Phone validation (only if filled)
    if (form.altPhone && form.altPhone.length !== 10) {
      err.altPhone = "Phone must be 10 digits";
    }

    if (!isHospital) {
      if (!form.gender) err.gender = "Select gender";
      if (!form.dob) err.dob = "Select date of birth";
      if (!form.bloodGroup) err.bloodGroup = "Select blood group";
    }

    if (isHospital && (!form.latitude || !form.longitude)) {
      err.location = "Location required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    if (!vendorId) {
      alert("Vendor ID missing. Please restart registration.");
      return;
    }
    console.log("VENDOR ID:", vendorId);
    try {
      const role = params.usertype as Role;
      const apiPath = USER_API_MAP[role];

      const formData = new FormData();

      formData.append("vendor_id", vendorId);
      formData.append("full_name", form.fullname);
      const email = Array.isArray(params.email)
        ? params.email[0]
        : params.email || "";

      const phone = Array.isArray(params.phone)
        ? params.phone[0]
        : params.phone || "";

      formData.append("email", email);
      formData.append("mobile", phone);
      formData.append("mobile_1", form.altPhone || "");
      formData.append("adrs_1", form.address1);
      formData.append("adrs_2", form.address2 || "");
      formData.append("City", form.city);
      formData.append("State", form.state);
      formData.append("pin_code", form.pin);

      if (!isHospital) {
        formData.append("Gender", form.gender);
        formData.append("dob", form.dob);
        formData.append("BloodG", form.bloodGroup);
      }
      if (isHospital) {
        formData.append("Latitude", form.latitude);
        formData.append("Longitude", form.longitude);
      }
      console.log("FORM DATA:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // 🔥 USE FETCH (NOT AXIOS)
      const res = await fetch(apiPath, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("RESPONSE:", data);

      if (res.ok) {
        console.log("✅ SUCCESS:", data);
      } else {
        throw new Error(data.message || "Failed");
      }
      if (res.ok) {
        const userData = {
          fullName: form.fullname,
          gender: form.gender,
          dob: form.dob,
          bloodGroup: form.bloodGroup,
          altPhone: form.altPhone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          pin: form.pin,
          latitude: form.latitude,
          longitude: form.longitude,
          email,
          mobile: phone,
        };
        console.log("USER DATA TO STORE:", userData);
        await AsyncStorage.setItem("userProfile", JSON.stringify(userData));

        setSuccessMsg(data.message || "Registration successful");

        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2500);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <View style={styles.successWrapper}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={styles.successBox}>
            <Text style={styles.successText}>🎉 {successMsg}</Text>
            <Text style={styles.successSubText}>Redirecting to login...</Text>
          </View>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text
              style={styles.loginLink}
              onPress={() => router.replace("/(auth)/login")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.fixedHeader}>
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.subHeader}>Set up your credentials</Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              ...styles.container,
              flexGrow: 1,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false} // ✅ REMOVE bounce
            overScrollMode="never" // ✅ ANDROID FIX
          >
            {/* HEADER */}

            {/* FULL NAME */}
            <Text style={styles.label}>
              {isHospital ? "Hospital Name" : "Full Name"}{" "}
              <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              placeholder={
                isHospital ? "Enter hospital name" : "Enter your full name"
              }
              style={styles.input}
              value={form.fullname}
              onChangeText={(v) => set("fullname", v)}
            />
            {errors.fullname && (
              <Text style={styles.errorText}>{errors.fullname}</Text>
            )}

            {!isHospital && (
              <>
                {/* ROW (GENDER + BLOOD GROUP) */}
                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>
                      Gender <Text style={styles.star}>*</Text>
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={form.gender}
                        onValueChange={(value) => set("gender", value)}
                        style={{ height: 50, color: "#111" }} // 🔥 IMPORTANT
                        dropdownIconColor="#111" // 🔥 Android fix
                        mode="dropdown" // 🔥 Android fix
                      >
                        <Picker.Item label="Select" value="" color="#9CA3AF" />
                        <Picker.Item label="Male" value="M" />
                        <Picker.Item label="Female" value="F" />
                        <Picker.Item label="Other" value="O" />
                      </Picker>
                    </View>
                    {errors.gender && (
                      <Text style={styles.errorText}>{errors.gender}</Text>
                    )}
                  </View>

                  <View style={styles.half}>
                    <Text style={styles.label}>
                      Blood Group <Text style={styles.star}>*</Text>
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={form.bloodGroup}
                        onValueChange={(value) => set("bloodGroup", value)}
                        style={{ height: 50, color: "#111" }} // 🔥 IMPORTANT
                        dropdownIconColor="#111" // 🔥 Android fix
                        mode="dropdown"
                      >
                        <Picker.Item label="Select" value="" />
                        <Picker.Item label="A+" value="A+" />
                        <Picker.Item label="B+" value="B+" />
                        <Picker.Item label="O+" value="O+" />
                        <Picker.Item label="AB+" value="AB+" />
                      </Picker>
                    </View>
                    {errors.bloodGroup && (
                      <Text style={styles.errorText}>{errors.bloodGroup}</Text>
                    )}
                  </View>
                </View>

                {/* DOB */}
                <Text style={styles.label}>
                  Date of Birth <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: "center" }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={{
                      color: form.dob ? "#111827" : "#6B7280", // 🔥 darker
                      fontSize: 14,
                    }}
                  >
                    {form.dob || "mm/dd/yyyy"}
                  </Text>
                </TouchableOpacity>
                {errors.dob && (
                  <Text style={styles.errorText}>{errors.dob}</Text>
                )}

                <Modal
                  visible={showDatePicker}
                  transparent
                  animationType="slide"
                >
                  <TouchableOpacity
                    // style={styles.modalOverlay}
                    // activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      style={styles.dateModalContainer}
                    >
                      <DateTimePicker
                        value={form.dob ? new Date(form.dob) : new Date()}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          if (event.type === "set" && selectedDate) {
                            const formatted = selectedDate
                              .toISOString()
                              .split("T")[0];
                            set("dob", formatted);
                            setShowDatePicker(false);
                          } else {
                            setShowDatePicker(false);
                          }
                        }}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              </>
            )}

            {/* PHONE */}
            <Text style={styles.label}>Alternate Phone</Text>
            <TextInput
              placeholder="9876543210"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10} // 🔥 HARD LIMIT
              value={form.altPhone}
              onChangeText={(v) => {
                const cleaned = v.replace(/[^0-9]/g, ""); // 🔥 only digits
                set("altPhone", cleaned);
              }}
            />

            {/* ADDRESS */}
            <Text style={styles.label}>
              Address Line 1 <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              placeholder="House no, Street name"
              style={styles.input}
              value={form.address1}
              onChangeText={(v) => set("address1", v)}
            />
            {errors.address1 && (
              <Text style={styles.errorText}>{errors.address1}</Text>
            )}

            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              placeholder="Locality, Landmark"
              style={styles.input}
              value={form.address2}
              onChangeText={(v) => set("address2", v)}
            />

            {/* CITY + STATE */}
            <CityStatePin
              form={form}
              setForm={setForm}
              setErrors={setErrors}
              errors={errors}
              mode="add"
            />

            {/* 🔥 HOSPITAL ONLY SECTION */}
            {isHospital && (
              <>
                {/* LOCATION LABEL */}
                <Text style={styles.label}>
                  Location <Text style={styles.star}>*</Text>
                </Text>

                {/* MAP */}
                <View style={styles.mapContainer}>
                  <GoogleMapPicker
                    city={form.city}
                    state={form.state}
                    pin={form.pin}
                    address1={form.address1}
                    onLocationSelect={(lat, lng, pin) => {
                      console.log("LAT LNG UPDATED:", lat, lng);

                      setForm((prev) => ({
                        ...prev,
                        latitude: String(lat),
                        longitude: String(lng),
                        ...(pin ? { pin } : {}),
                      }));

                      setErrors((prev: any) => {
                        const { location, ...rest } = prev;
                        return rest;
                      });
                    }}
                  />
                </View>

                {/* ERROR */}
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}

                {/* LAT / LONG */}
                <View style={[styles.row, { marginTop: 15 }]}>
                  <View style={styles.half}>
                    <Text style={styles.label}>
                      Latitude <Text style={styles.star}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={form.latitude}
                      editable={false}
                    />
                  </View>

                  <View style={styles.half}>
                    <Text style={styles.label}>
                      Longitude <Text style={styles.star}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={form.longitude}
                      editable={false}
                    />
                  </View>
                </View>
              </>
            )}
            {/* BUTTON */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit →</Text>
              )}
            </TouchableOpacity>

            {/* LOGIN */}
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => router.replace("/(auth)/login")}
              >
                Login
              </Text>
            </Text>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 20, // 🔥 pushes content down properly
    backgroundColor: "#F8FAFC",
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },

  subHeader: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
  },

  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  half: {
    width: "48%",
  },

  button: {
    backgroundColor: "#0F766E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#0F766E",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#64748B",
  },

  loginLink: {
    color: "#0F766E",
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
  },
  successWrapper: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40, // 🔥 IMPORTANT (fix bottom cut)
  },

  successBox: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    shadowColor: "#000", // 🔥 add depth
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  successText: {
    color: "#166534", // green-700
    fontSize: 16,
    fontWeight: "500",
  },

  successSubText: {
    marginTop: 6,
    fontSize: 14,
    color: "#166534",
  },

  loginContainer: {
    marginTop: 20,
  },
  pickerContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    justifyContent: "center",
    height: 50, // 🔥 REQUIRED
    overflow: "hidden",
  },
  star: {
    color: "#DC2626",
    fontWeight: "700",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  fixedHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dateModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
});
