import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { router } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const onSubmit = async () => {
    setError("");
    setStatus("idle");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/auth/forgot-password",
        { email }
      );

      setStatus("ok");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* Header */}
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email to receive a password reset link.
        </Text>

        {/* Input */}
        <TextInput
          placeholder="you@example.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Button */}
       <TouchableOpacity
  onPress={onSubmit}
  disabled={loading}
  activeOpacity={0.7}
  style={[
    styles.loginBtn,
    loading && styles.loginBtnDisabled
  ]}
>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Request new password →</Text>
          )}
        </TouchableOpacity>

        {/* Success */}
        {status === "ok" && (
          <Text style={styles.success}>
            If an account exists for {email}, a reset link has been sent.
          </Text>
        )}

        {/* Links */}
        <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push("/login")}>
  <Text style={styles.link}>Back to Login</Text>
</TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")}>
  <Text style={styles.link}>Create Account</Text>
</TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
loginBtn: {
  backgroundColor: "#0F766E",
  borderRadius: 14,
  padding: 16,
  alignItems: "center",
  marginTop: 24,
  shadowColor: "#0F766E",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,
},
loginBtnDisabled: {
  opacity: 0.6,
},
loginText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 15,
},
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginTop: 5,
  },
  success: {
    color: "green",
    marginTop: 15,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  link: {
    color: "#14b8a6",
    fontWeight: "500",
  },
});