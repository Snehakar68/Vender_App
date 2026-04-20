import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { decrypt } from "@/src/utils/crypto";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { router } from "expo-router";

const API =
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/Get_Ambulance_By_ambulance_id";

export default function ViewAmbulanceScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [viewer, setViewer] = useState<{
    visible: boolean;
    uri: string;
    type: "image" | "pdf" | null;
  }>({
    visible: false,
    uri: "",
    type: null,
  });

  const ambulanceId = id
    ? decrypt(decodeURIComponent(id as string))
    : null;

  /* ✅ Convert Base64 */
  const toFileSrc = (b64: string) => {
    if (!b64) return "";

    if (b64.startsWith("data:")) return b64;

    const isPdf = b64.startsWith("JVBER");

    return isPdf
      ? `data:application/pdf;base64,${b64}`
      : `data:image/jpeg;base64,${b64}`;
  };

  /* ✅ Convert base64 → file for PDF */
  const base64ToFile = async (base64: string, name: string) => {
    const path = FileSystem.cacheDirectory + name;

    await FileSystem.writeAsStringAsync(
      path,
      base64.replace(/^data:.*;base64,/, ""),
      { encoding: "base64" }
    );

    return path;
  };

  /* ✅ Open File */
 const openFile = async (uri: string) => {
  if (!uri) return;

  const isPdf =
    uri.includes("application/pdf") ||
    uri.startsWith("data:application/pdf");

  if (isPdf) {
    try {
      const filePath = await base64ToFile(uri, `doc_${Date.now()}.pdf`);

      // ✅ THIS FIXES YOUR ERROR
      await Sharing.shareAsync(filePath);

    } catch (err) {
      console.log("PDF OPEN ERROR:", err);
    }

    return;
  }

  // ✅ image viewer
  setViewer({
    visible: true,
    uri,
    type: "image",
  });
};
useFocusEffect(
  useCallback(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      }
    );

    return () => subscription.remove(); // ✅ correct cleanup
  }, [])
);

  useEffect(() => {
    if (!ambulanceId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/${ambulanceId}`);
        const json = await res.json();

        const item = json?.[0];
        const docs = item?.ambulanceDocs?.[0] || {};

        setData({
          ...item,
          rc: toFileSrc(docs.rc),
          fitness: toFileSrc(docs.fitness),
          insurance: toFileSrc(docs.insurence),
          permit: toFileSrc(docs.permit),

          insuence_expiry: docs.insurence_exp,
          fitness_expiry: docs.fitness_exp,
          permit_expiry: docs.permit_exp,
        });
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ambulanceId]);

  /* Viewer */
  const FileViewer = () => {
    if (!viewer.visible) return null;

    return (
      <View style={styles.modal}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() =>
            setViewer({ visible: false, uri: "", type: null })
          }
        >
          <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
        </TouchableOpacity>

        <Image
          source={{ uri: viewer.uri }}
          style={{ width: "90%", height: "80%", resizeMode: "contain" }}
        />
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!data) return <Text>No Data</Text>;

  return (
      <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ambulance Details</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Vehicle Number</Text>
          <Text style={styles.value}>{data.vehical_number}</Text>

          <Text style={styles.label}>Ambulance Type</Text>
          <Text style={styles.value}>{data.ambulance_type}</Text>

          <Text style={styles.label}>Rate Per KM</Text>
          <Text style={styles.value}>{data.rate_Km}</Text>

          <Text style={styles.label}>Minimum Rate</Text>
          <Text style={styles.value}>{data.min_Rate}</Text>

          <FileItem label="RC" uri={data.rc} onPress={openFile} />
          <FileItem label="Fitness" uri={data.fitness} onPress={openFile} />
          <FileItem label="Insurance" uri={data.insurance} onPress={openFile} />
          <FileItem label="Permit" uri={data.permit} onPress={openFile} />

          <Text style={styles.label}>Insurance Expiry</Text>
          <Text style={styles.value}>{data.insuence_expiry}</Text>

          <Text style={styles.label}>Fitness Expiry</Text>
          <Text style={styles.value}>{data.fitness_expiry}</Text>

          <Text style={styles.label}>Permit Expiry</Text>
          <Text style={styles.value}>{data.permit_expiry}</Text>
        </View>
      </ScrollView>

      <FileViewer />
    </SafeAreaView>
  );
}

/* File Item */
const FileItem = ({ label, uri, onPress }: any) => {
  if (!uri) return null;

  const isPdf =
    uri.includes("application/pdf") ||
    uri.startsWith("data:application/pdf");

  return (
    <TouchableOpacity
      style={styles.fileBox}
      onPress={() => onPress(uri)}
    >
      <Text style={{ fontWeight: "600", marginBottom: 6 }}>
        {label}
      </Text>

      {isPdf ? (
        <Text style={{ color: "#0F766E" }}>View PDF</Text>
      ) : (
        <Image source={{ uri }} style={styles.preview} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 10,
  },
  value: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  fileBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 16,
    marginTop: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  preview: {
    width: 100,
    height: 80,
    marginTop: 6,
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
  },
});