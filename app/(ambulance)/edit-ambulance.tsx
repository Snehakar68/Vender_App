import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { decrypt } from "@/src/utils/crypto";
import AddAmbulanceScreen from "./add-ambulance";

const API =
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/Get_Ambulance_By_ambulance_id";

export default function EditAmbulanceScreen() {
  const { id } = useLocalSearchParams();

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ambulanceId = id
    ? decrypt(decodeURIComponent(id as string))
    : null;

  const getPreview = (value: string) => {
    if (!value) return null;
    if (value.startsWith("data:")) return value;

    if (value.startsWith("JVBER")) {
      return `data:application/pdf;base64,${value}`;
    }
    if (value.startsWith("iVBOR")) {
      return `data:image/png;base64,${value}`;
    }

    return `data:image/jpeg;base64,${value}`;
  };

  useEffect(() => {
    if (!ambulanceId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/${ambulanceId}`);
        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        console.log("data of ambulance edit", data);
        const item = data?.[0];

        if (!item) throw new Error("No data");

       const docs = Array.isArray(item.ambulanceDocs)
  ? item.ambulanceDocs[0]
  : item.ambulanceDocs || {};

const mapped = {
  ambulance_id: item.ambulance_id,
  vehical_number: item.vehical_number || "",
  ambulance_type: item.ambulance_type || "",
  rate_Km: item.rate_Km || "",
  Min_Rate: item.min_Rate || "",

  // ✅ IMPORTANT (ADD THIS)
  ambulanceDocs: item.ambulanceDocs || [],

  // expiry
  insuence_expiry: docs.insurence_exp || "",
  fitness_expiry: docs.fitness_exp || "",
  permit_expiry: docs.permit_exp || "",

  // ✅ RAW FILES (IMPORTANT)
  rc: docs.rc,
  fitness: docs.fitness,
  insurance: docs.insurence,
  permit: docs.permit,
};

        setInitialData(mapped);
      } catch (e) {
        console.log(e);
        Alert.alert("Error", "Failed to load ambulance");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ambulanceId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!initialData) return <Text>Ambulance not found</Text>;

  return (
    <AddAmbulanceScreen
      route={{
        params: {
          mode: "edit",
          data: initialData,
        },
      }}
    />
  );
}