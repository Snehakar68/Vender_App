import { View, Text, StyleSheet, Image } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";

export default function Splash() {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/(auth)/login"); // redirect after splash
    }, 2500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo Circle */}
      <View style={styles.logoContainer}>
  <Image 
  source={require("../src/assets/images/logo.png")} 
  style={{ width: 50, height: 50, resizeMode: "contain" }} 
/>
      </View>

      {/* App Name */}
      <Text style={styles.title}>Jhilmil Homecare</Text>
      <Text style={styles.subtitle}>Care with Precision & Empathy</Text>

      {/* Bottom Loader */}
      <View style={styles.loaderContainer}>
        <Text style={styles.loader}>● ● ●</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6",
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 2,
    backgroundColor: "#0F766E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  logoIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F766E",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: 1,
    marginTop: 5,
  },

  loaderContainer: {
    position: "absolute",
    bottom: 60,
  },

  loader: {
    color: "#0F766E",
    fontSize: 10,
    letterSpacing: 3,
  },
});