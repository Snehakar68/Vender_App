import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

export default function Login() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        
        {/* Header */}
        <Text style={styles.brand}>Jhilmil Homecare</Text>

        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Enter your credentials to access Jhilmil Homecare
        </Text>

        {/* Email */}
        <Text style={styles.label}>EMAIL / USER / MOBILE NUMBER</Text>
        <TextInput
          placeholder="e.g. user@jhilmil.com"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        {/* Password */}
        <View style={styles.passwordRow}>
          <Text style={styles.label}>PASSWORD</Text>
          <Text style={styles.forgot}>Forgot?</Text>
        </View>

        <TextInput
          placeholder="********"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(hospital)/home' as any)}>
          <Text style={styles.loginText}>Login →</Text>
        </TouchableOpacity>

        {/* OTP */}
        <TouchableOpacity>
          <Text style={styles.otp}>Login with OTP</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          New to Jhilmil Homecare?{" "}
          <Text style={styles.create}>Create an account</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // softer grey like design
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  brand: {
    fontSize: 14,
    color: "#0F766E",
    fontWeight: "600",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
  },

  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgot: {
    fontSize: 11,
    color: "#0F766E",
  },

  loginBtn: {
    backgroundColor: "#0F766E",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  otp: {
    textAlign: "center",
    marginTop: 14,
    color: "#0F766E",
    fontSize: 13,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  or: {
    marginHorizontal: 10,
    fontSize: 10,
    color: "#9CA3AF",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
  },

  create: {
    color: "#0F766E",
    fontWeight: "600",
  },
});