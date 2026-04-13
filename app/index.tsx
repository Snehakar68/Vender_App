import { View, Text, StyleSheet, Image } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { getAccessToken } from "@/src/utils/tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Splash() {
  useEffect(() => {
    const init = async () => {
      await new Promise((res) => setTimeout(res, 1000));

      const token = await getAccessToken();
      const user = await AsyncStorage.getItem("user");
      if (!token || !user) {
        router.replace("/(auth)/login");
        return;
      }

      const parsed = JSON.parse(user);

      const roleMap: any = {
        ADM: "/(admin)/home",
        HOS: "/(hospital)/home",
        DOC: "/(doctor)/home",
        NUR: "/(nurse)/home",
        CLN: "/(cleaner)/home",
        AMB: "/(ambulance)/home",
      };

      const route = roleMap[parsed.role];

      if (!route) {
        router.replace("/(auth)/login");
        return;
      }

      router.replace(route);
    };

    init();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../src/assets/images/logo.png")}
          style={{ width: 50, height: 50, resizeMode: "contain" }}
        />
      </View>

      <Text style={styles.title}>Jhilmil Homecare</Text>
      <Text style={styles.subtitle}>Care with Precision & Empathy</Text>
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