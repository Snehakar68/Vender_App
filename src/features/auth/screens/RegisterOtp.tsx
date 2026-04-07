import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { verifyOtpApi, registerApi } from "../services/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function RegisterOtp() {
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Enter valid 6 digit OTP");
      return;
    }

    setLoading(true);
    try {
      const otpRes = await verifyOtpApi(
        params.email as string,
        otpValue
      );

      const isOtpValid = otpRes.data.verified === true;

      if (!params.userid || !params.password) {
        throw new Error("Missing registration data. Please restart.");
      }

      if (!isOtpValid) {
        throw new Error(otpRes.data.message || "Invalid OTP");
      }

      const regRes = await registerApi({
        user_ID: params.userid,
        email: params.email,
        mobile: params.phone,
        user_Type: params.usertype,
        password: params.password,
      });

      if (!regRes.data.success) {
        throw new Error(regRes.data.message || "Registration failed");
      }

      const vendorId = regRes.data.data.vendor_id;

      await AsyncStorage.setItem("vendorId", vendorId);

      router.replace({
        pathname: "/(auth)/register/profile",
        params: {
          usertype: params.usertype,
          email: params.email,
          phone: params.phone,
        },
      });

    } catch (e: any) {
      console.log(e);
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Header */}
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={styles.email}>{params.email}</Text>
        </Text>

        {/* OTP INPUT */}
        <Text style={styles.label}>
          OTP <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                inputs.current[index]?.isFocused() && {
                  borderWidth: 2,
                  borderColor: "#0F766E"
                }
              ]}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => {
                if (!/^\d?$/.test(value)) return;

                const newOtp = [...otp];
                newOtp[index] = value;
                setOtp(newOtp);
                setError("");

                // Move forward
                if (value && index < 5) {
                  inputs.current[index + 1]?.focus();
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  if (otp[index] === "" && index > 0) {
                    inputs.current[index - 1]?.focus();
                  }
                }
              }}
            />
          ))}
        </View>

        {/* ERROR */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* BUTTON */}
    <TouchableOpacity
  onPress={handleVerify}
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
    <Text style={styles.btnText}>Verify & Continue</Text>
  )}
</TouchableOpacity>

        {/* LOGIN LINK */}
        <Text style={styles.footer}>
          Already have an account?{" "}
          <Text
            style={styles.login}
            onPress={() => router.push("/(auth)/login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 18,
  },

  email: {
    color: "#111827",
    fontWeight: "600",
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },

  required: {
    color: "#DC2626",
  },

  input: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 6,
  },

  error: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  footer: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
    color: "#6B7280",
  },

  login: {
    color: "#0F766E",
    fontWeight: "600",
    fontSize: 12,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  otpBox: {
    width: 45,
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  btnDisabled: {
  opacity: 0.6,
}
});