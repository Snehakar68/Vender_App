
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import { loginApi } from "../services/authApi";
import { router } from "expo-router";
import { useState } from "react";
import { getRefreshToken } from "@/src/utils/tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";
import { ScrollView } from "react-native";

import {
  setAuthData,
  getAccessToken,
  getUserData
} from "@/src/utils/tokenStorage";

type AuthType = {
  user: any;
  login: (data: any) => void;
  logout: () => void;
};

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  type Role = "ADM" | "HOS" | "DOC" | "NUR" | "CLN" | "AMB";
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const roleMap: Record<Role, string> = {
    ADM: "admin",
    HOS: "hospital",
    DOC: "doctor",
    NUR: "nurse",
    CLN: "cleaner",
    AMB: "ambulance",
  };
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext not provided");
  }

  const validate = () => {
    const err: any = {};

    if (!userId.trim()) {
      err.userId = "User ID / Email / Mobile is required";
    }

    if (!password) {
      err.password = "Password is required";
    } else if (password.length < 8) {
      err.password = "Password must be at least 8 characters";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const { login } = auth;

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true); // 👈 start loading

    try {
      const data = await loginApi(userId, password);
      console.log("🔐 LOGIN API RESPONSE:", data);
      console.log("🆔 VENDOR ID FROM API:", data.vendorId);
      await setAuthData({
        token: data.token,
        refreshToken: data.refreshToken,
        role: data.role,
        vendorId: data.vendorId,
        email: data.email,
        phone: data.phone,
        name: data.name,
      });
      const token = await getAccessToken();
      const user = await getUserData();

      console.log("✅ STORED TOKEN:", token);
      console.log("✅ STORED USER:", user);

      const userData = {
        token: data.token,
        refreshToken: data.refreshToken,
        role: data.role,
        vendorId: data.vendorId,
      };
      console.log("💾 USER DATA TO STORE:", userData);

      login(userData);

      if (data.role === "CUS") {
        throw new Error("Invalid login");
      }

      const roleMap: any = {
        HOS: "/(hospital)/home",
        DOC: "/(doctor)/home",
        NUR: "/(nurse)/home",
        CLN: "/(cleaner)/home",
        AMB: "/(ambulance)/home",
      };

      const route = roleMap[data.role];
      if (!route) throw new Error("Invalid role");


      router.replace(route);

    } catch (e: any) {
      console.log(e);
      setErrors({ general: "Invalid credentials" });
    } finally {
      setLoading(false); // 👈 stop loading
    }
  };
  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
>
  <ScrollView
    contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled"
  >
      <View style={styles.logoSection}>
        <Image
          source={require("@/src/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.companyTitle}>Jhilmil Homecare</Text>
      </View>
      <View style={styles.card}>

        {/* Header */}
<View style={styles.headerBlock}>
  <Text style={styles.greetingTop}>Welcome back</Text>

  <Text style={styles.greetingMain}>
     Sign in to continue
  </Text>

  {/* <Text style={styles.greetingSub}>
    Sign in to continue
  </Text> */}
</View>
        {errors.general && (
          <Text style={styles.error}>{errors.general}</Text>
        )}

        {/* Email */}
        <Text style={styles.label}>EMAIL / USER / MOBILE NUMBER</Text>
        <TextInput
          placeholder="e.g. user@jhilmil.com"
          value={userId}
          onChangeText={(v) => {
            setUserId(v);
            setErrors((p: any) => ({ ...p, userId: "" }));
          }}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        {errors.userId && (
          <Text style={styles.error}>{errors.userId}</Text>
        )}

        {/* Password */}
        <View style={styles.passwordRow}>
          <Text style={styles.label}>PASSWORD</Text>
          <TouchableOpacity onPress={() => router.push("/forgot-password" as any)}>
            <Text style={styles.forgot}>Forgot?</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="********"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setErrors((p: any) => ({ ...p, password: "" }));
          }}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        {errors.password && (
          <Text style={styles.error}>{errors.password}</Text>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.7} // 👈 press dim effect
          style={[
            styles.loginBtn,
            loading && styles.loginBtnDisabled
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login →</Text>
          )}
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
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Text style={styles.footer}>New to Jhilmil Homecare?</Text>

          <TouchableOpacity
            onPress={() => router.push("/register" as any)}
          >
            <Text style={styles.create}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
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

  innerContainer: {
    flex: 1,
    justifyContent: "center",
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 14,
    marginTop: -40, // pull up the logo a bit
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },

  companyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F766E",
  },
headerBlock: {
  marginBottom: 11,
  alignItems: "center",
},

greetingTop: {
  fontFamily: "Inter-Medium",
  fontSize: 11,
  color: "#0F766E", // 🔥 brand color
  letterSpacing: 1,
  textTransform: "uppercase",
  marginBottom: 6,
},

greetingMain: {
  fontFamily: "Inter-Bold",
  fontSize: 22,
  color: "#0F172A",
  letterSpacing: 0.2,
  marginBottom: 4,
},

greetingSub: {
  fontFamily: "Inter-Regular",
  fontSize: 13,
  color: "#64748B",
},
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 18,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  loginBtn: {
    backgroundColor: "#0F766E",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 24,

    shadowColor: "#0F766E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },


  brand: {
    fontSize: 14,
    color: "#0F766E",
    fontWeight: "600",
    marginBottom: 12, // increase
  },


  label: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 12,
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
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  }
});