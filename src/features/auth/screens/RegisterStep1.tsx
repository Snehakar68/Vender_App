import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { Modal } from "react-native";
import {
  checkUserIdApi,
  requestOtpApi,
} from "../services/authApi";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";    
import { SafeAreaView } from "react-native-safe-area-context";


export default function RegisterStep1() {
  const [form, setForm] = useState({
    usertype: "",
    userid: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);

  const getUserTypeLabel = (value: string) => {
    const map: any = {
      HOS: "Hospital",
      DOC: "Doctor",
      NUR: "Nurse",
      AMB: "Ambulance",
      CLN: "Cleaner",
    };
    return map[value] || "";
  };

  const set = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p: any) => ({ ...p, [key]: "" }));
    setGeneralError(""); // 🔥 clear top error
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,10}$/;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const err: any = {};

    if (!form.usertype) err.usertype = "Select user type";
    if (!form.userid) err.userid = "User ID required";
    if (!form.email) {
      err.email = "Email required";
    } else if (!emailRegex.test(form.email)) {
      err.email = "Invalid email format";
    }
    if (!form.phone) {
      err.phone = "Phone required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      err.phone = "Phone must be exactly 10 digits";
    }

    if (!form.password) err.password = "Password required";
    else if (!passwordRegex.test(form.password))
      err.password = "Weak password";

    if (form.password !== form.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await checkUserIdApi(form.userid);
      if (res.data.exists) {
        setErrors({ userid: "User ID already exists" });
        return;
      }

      await requestOtpApi(form.email);

      router.push({
        pathname: "/(auth)/register/otp",
        params: {
          userid: form.userid,
          email: form.email,
          phone: form.phone,
          usertype: form.usertype,
          password: form.password,
        },
      });
    } catch (e: any) {
      console.log(e);
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

return (
   <SafeAreaView style={{ flex: 1 }}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.card}>
        {/* HEADER */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Partner with Jhilmil Homecare to expand your services, manage requests, and deliver trusted healthcare solutions.
        </Text>

        {generalError ? (
          <Text style={styles.generalError}>{generalError}</Text>
        ) : null}
        {/* USER TYPE */}
        <Text style={styles.label}>USER TYPE  <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowUserTypeModal(true)}
        >
          <Text style={{ color: form.usertype ? "#111" : "#9CA3AF" }}>
            {form.usertype
              ? getUserTypeLabel(form.usertype)
              : "Select user type"}
          </Text>
        </TouchableOpacity>
        {errors.usertype && <Text style={styles.error}>{errors.usertype}</Text>}

        {/* USER ID */}
        <Text style={styles.label}>USER  <Text style={styles.required}>*</Text></Text>
        <TextInput
          placeholder="Enter your unique ID"
          style={styles.input}
          value={form.userid}
          onChangeText={(v) => set("userid", v)}
        />

        {errors.userid && <Text style={styles.error}>{errors.userid}</Text>}

        {/* EMAIL */}
        <Text style={styles.label}>EMAIL  <Text style={styles.required}>*</Text></Text>
        <TextInput
          placeholder="example@healthcare.com"
          style={styles.input}
          value={form.email}
          onChangeText={(v) => set("email", v)}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        {/* PHONE */}
        <Text style={styles.label}>PHONE NUMBER  <Text style={styles.required}>*</Text></Text>
        <TextInput
          placeholder="9876543210"
          style={styles.input}
          keyboardType="numeric"
          value={form.phone}
          maxLength={10} // 🔥 restrict length
          onChangeText={(v) => set("phone", v.replace(/[^0-9]/g, ""))} // 🔥 only digits
        />
        {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

        {/* PASSWORD */}
        <Text style={styles.label}>PASSWORD  <Text style={styles.required}>*</Text></Text>
        <TextInput
          placeholder="••••••••"
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={(v) => set("password", v)}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        {/* CONFIRM PASSWORD */}
        <Text style={styles.label}>CONFIRM PASSWORD  <Text style={styles.required}>*</Text></Text>
        <TextInput
          placeholder="••••••••"
          style={styles.input}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(v) => set("confirmPassword", v)}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.7}
          style={[
            styles.btn,
            loading && styles.btnDisabled
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Next →</Text>
          )}
        </TouchableOpacity>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text
            style={styles.login}
            onPress={() => router.push("/(auth)/login")}
          >
            Login
          </Text>
        </Text>

        <Modal visible={showUserTypeModal} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowUserTypeModal(false)}
          >
            <View style={styles.modalContainer}>
              {[
                { label: "Hospital", value: "HOS" },
                { label: "Doctor", value: "DOC" },
                { label: "Nurse", value: "NUR" },
                { label: "Ambulance", value: "AMB" },
                { label: "Cleaner", value: "CLN" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.modalItem}
                  onPress={() => {
                    set("usertype", item.value);
                    setShowUserTypeModal(false);
                  }}
                >
                  <Text style={styles.modalText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
        </ScrollView>
    </TouchableWithoutFeedback>
    
  </KeyboardAvoidingView>
    </SafeAreaView>
  
);
}

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  backgroundColor: "#F5F7FA",
  padding: 16,
  justifyContent: "center", // keep if you want center when no keyboard
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 8,
  },
  dropdown: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,                // ✅ fixed height like input
    justifyContent: "center",  // ✅ vertical alignment
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  error: {
    color: "#DC2626",
    fontSize: 11,
    marginTop: 4,
  },
  btn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 18,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  footer: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
    color: "#6B7280",
  },

  login: {
    color: "#0F766E",
    fontWeight: "600",
    fontSize: 12, // 🔥 match footer
  },
  generalError: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalText: {
    fontSize: 16,
    color: "#111",
  },
});