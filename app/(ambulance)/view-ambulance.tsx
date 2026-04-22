// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import { useLocalSearchParams } from "expo-router";
// import { decrypt } from "@/src/utils/crypto";
// import * as Sharing from "expo-sharing";
// import * as FileSystem from "expo-file-system/legacy";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { BackHandler } from "react-native";
// import { useFocusEffect } from "expo-router";
// import { useCallback } from "react";
// import { router } from "expo-router";

// const API =
//   "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/Get_Ambulance_By_ambulance_id";

// export default function ViewAmbulanceScreen() {
//   const { id } = useLocalSearchParams();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const [viewer, setViewer] = useState<{
//     visible: boolean;
//     uri: string;
//     type: "image" | "pdf" | null;
//   }>({
//     visible: false,
//     uri: "",
//     type: null,
//   });

//   const ambulanceId = id
//     ? decrypt(decodeURIComponent(id as string))
//     : null;

//   /* ✅ Convert Base64 */
//   const toFileSrc = (b64: string) => {
//     if (!b64) return "";

//     if (b64.startsWith("data:")) return b64;

//     const isPdf = b64.startsWith("JVBER");

//     return isPdf
//       ? `data:application/pdf;base64,${b64}`
//       : `data:image/jpeg;base64,${b64}`;
//   };

//   /* ✅ Convert base64 → file for PDF */
//   const base64ToFile = async (base64: string, name: string) => {
//     const path = FileSystem.cacheDirectory + name;

//     await FileSystem.writeAsStringAsync(
//       path,
//       base64.replace(/^data:.*;base64,/, ""),
//       { encoding: "base64" }
//     );

//     return path;
//   };

//   /* ✅ Open File */
//  const openFile = async (uri: string) => {
//   if (!uri) return;

//   const isPdf =
//     uri.includes("application/pdf") ||
//     uri.startsWith("data:application/pdf");

//   if (isPdf) {
//     try {
//       const filePath = await base64ToFile(uri, `doc_${Date.now()}.pdf`);

//       // ✅ THIS FIXES YOUR ERROR
//       await Sharing.shareAsync(filePath);

//     } catch (err) {
//       console.log("PDF OPEN ERROR:", err);
//     }

//     return;
//   }

//   // ✅ image viewer
//   setViewer({
//     visible: true,
//     uri,
//     type: "image",
//   });
// };
// useFocusEffect(
//   useCallback(() => {
//     const subscription = BackHandler.addEventListener(
//       "hardwareBackPress",
//       () => {
//         router.back();
//         return true;
//       }
//     );

//     return () => subscription.remove(); // ✅ correct cleanup
//   }, [])
// );

//   useEffect(() => {
//     if (!ambulanceId) return;

//     const fetchData = async () => {
//       try {
//         const res = await fetch(`${API}/${ambulanceId}`);
//         const json = await res.json();

//         const item = json?.[0];
//         const docs = item?.ambulanceDocs?.[0] || {};

//         setData({
//           ...item,
//           rc: toFileSrc(docs.rc),
//           fitness: toFileSrc(docs.fitness),
//           insurance: toFileSrc(docs.insurence),
//           permit: toFileSrc(docs.permit),

//           insuence_expiry: docs.insurence_exp,
//           fitness_expiry: docs.fitness_exp,
//           permit_expiry: docs.permit_exp,
//         });
//       } catch (e) {
//         console.log(e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [ambulanceId]);

//   /* Viewer */
//   const FileViewer = () => {
//     if (!viewer.visible) return null;

//     return (
//       <View style={styles.modal}>
//         <TouchableOpacity
//           style={styles.closeBtn}
//           onPress={() =>
//             setViewer({ visible: false, uri: "", type: null })
//           }
//         >
//           <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
//         </TouchableOpacity>

//         <Image
//           source={{ uri: viewer.uri }}
//           style={{ width: "90%", height: "80%", resizeMode: "contain" }}
//         />
//       </View>
//     );
//   };

//   if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
//   if (!data) return <Text>No Data</Text>;

//   return (
//       <SafeAreaView style={{ flex: 1 }}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.title}>Ambulance Details</Text>

//         <View style={styles.card}>
//           <Text style={styles.label}>Vehicle Number</Text>
//           <Text style={styles.value}>{data.vehical_number}</Text>

//           <Text style={styles.label}>Ambulance Type</Text>
//           <Text style={styles.value}>{data.ambulance_type}</Text>

//           <Text style={styles.label}>Rate Per KM</Text>
//           <Text style={styles.value}>{data.rate_Km}</Text>

//           <Text style={styles.label}>Minimum Rate</Text>
//           <Text style={styles.value}>{data.min_Rate}</Text>

//           <FileItem label="RC" uri={data.rc} onPress={openFile} />
//           <FileItem label="Fitness" uri={data.fitness} onPress={openFile} />
//           <FileItem label="Insurance" uri={data.insurance} onPress={openFile} />
//           <FileItem label="Permit" uri={data.permit} onPress={openFile} />

//           <Text style={styles.label}>Insurance Expiry</Text>
//           <Text style={styles.value}>{data.insuence_expiry}</Text>

//           <Text style={styles.label}>Fitness Expiry</Text>
//           <Text style={styles.value}>{data.fitness_expiry}</Text>

//           <Text style={styles.label}>Permit Expiry</Text>
//           <Text style={styles.value}>{data.permit_expiry}</Text>
//         </View>
//       </ScrollView>

//       <FileViewer />
//     </SafeAreaView>
//   );
// }

// /* File Item */
// const FileItem = ({ label, uri, onPress }: any) => {
//   if (!uri) return null;

//   const isPdf =
//     uri.includes("application/pdf") ||
//     uri.startsWith("data:application/pdf");

//   return (
//     <TouchableOpacity
//       style={styles.fileBox}
//       onPress={() => onPress(uri)}
//     >
//       <Text style={{ fontWeight: "600", marginBottom: 6 }}>
//         {label}
//       </Text>

//       {isPdf ? (
//         <Text style={{ color: "#0F766E" }}>View PDF</Text>
//       ) : (
//         <Image source={{ uri }} style={styles.preview} />
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: "#F1F5F9",
//     padding: 16,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 12,
//     color: "#64748B",
//     marginTop: 10,
//   },
//   value: {
//     backgroundColor: "#F8FAFC",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 4,
//   },
//   fileBox: {
//     borderWidth: 1,
//     borderStyle: "dashed",
//     padding: 16,
//     marginTop: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   preview: {
//     width: 100,
//     height: 80,
//     marginTop: 6,
//   },
//   modal: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closeBtn: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
// });
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { decrypt } from "@/src/utils/crypto";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";
import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

// --- Theme Constants (Matching Add Screen) ---
const AmbColors = {
  primary: "#0F766E",
  secondary: "#64748B",
  tertiary: "#10B981",
  surface: "#F8FAFC",
  surfaceContainerLowest: "#FFFFFF",
  onSurface: "#1E293B",
  outline: "#CBD5E1",
  error: "#EF4444",
};

const AmbRadius = { md: 8, xl: 16, xxl: 24 };

const API = "https://coreapi-service-111763741518.asia-south1.run.app/api/Ambulance/Get_Ambulance_By_ambulance_id";

export default function ViewAmbulanceScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<{ visible: boolean; uri: string; type: "image" | "pdf" | null }>({
    visible: false,
    uri: "",
    type: null,
  });

  const ambulanceId = id ? decrypt(decodeURIComponent(id as string)) : null;


  const handleBack = () => router.replace("/(ambulance)/ambulances");

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [])
  );

 const fetchData = useCallback(async () => {
  if (!ambulanceId) return;

  // Optional: only show loading if we don't have data yet to prevent flickering
  if (!data) setLoading(true);

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
    console.error("Fetch Error:", e);
  } finally {
    setLoading(false);
  }
}, [ambulanceId]);
useFocusEffect(
  useCallback(() => {
    // TRIGGER THE FETCH HERE
    fetchData();

    // BACK BUTTON LOGIC
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [fetchData]) // Depends on the fetchData function above
);

  const toFileSrc = (b64: string) => {
    if (!b64) return "";
    if (b64.startsWith("data:")) return b64;
    const isPdf = b64.startsWith("JVBER");
    return isPdf ? `data:application/pdf;base64,${b64}` : `data:image/jpeg;base64,${b64}`;
  };

  const openFile = async (uri: string) => {
    if (!uri) return;
    const isPdf = uri.includes("application/pdf") || uri.includes("JVBER");

    if (isPdf) {
      try {
        const cleanBase64 = uri.includes(",") ? uri.split(",")[1] : uri;
        const fileUri = FileSystem.cacheDirectory + `temp_doc_${Date.now()}.pdf`;
        await FileSystem.writeAsStringAsync(fileUri, cleanBase64, { encoding: FileSystem.EncodingType.Base64 });

        if (Platform.OS === "android") {
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
            data: contentUri,
            flags: 1,
            type: "application/pdf",
          });
        } else {
          Linking.openURL(fileUri);
        }
      } catch (error) {
        alert("No PDF viewer app found.");
      }
      return;
    }
    setViewer({ visible: true, uri, type: "image" });
  };

  if (loading) return (
    <View style={[styles.safe, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={AmbColors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={AmbColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Ambulance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Section 1: Details */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumberBadge}><Text style={styles.sectionNumberText}>1</Text></View>
          <Text style={styles.sectionTitle}>Ambulance Details</Text>
        </View>

        <View style={styles.formCard}>
          <ReadOnlyField label="VEHICLE NUMBER" icon="directions-car" value={data.vehical_number} />
          <ReadOnlyField label="AMBULANCE TYPE" icon="emergency" value={data.ambulance_type} />
          <ReadOnlyField label="RATE / KM" icon="currency-rupee" value={data.rate_Km} />
          <ReadOnlyField label="MIN RATE" icon="payments" value={data.min_Rate} />
        </View>

        {/* Section 2: Documents */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumberBadge}><Text style={styles.sectionNumberText}>2</Text></View>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.fullWidthDocStack}>
            <ViewDocItem label="RC Copy" uri={data.rc} onPress={openFile} />
            <ViewDocItem label="Fitness Certificate" uri={data.fitness} onPress={openFile} />
            <ViewDocItem label="Insurance Policy" uri={data.insurance} onPress={openFile} />
            <ViewDocItem label="Vehicle Permit" uri={data.permit} onPress={openFile} />
          </View>
        </View>

        {/* Section 3: Expiry */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionNumberBadge}><Text style={styles.sectionNumberText}>3</Text></View>
          <Text style={styles.sectionTitle}>Validity Details</Text>
        </View>

        <View style={[styles.formCard, { marginBottom: 40 }]}>
          <ReadOnlyField label="INSURANCE EXPIRY" icon="calendar-today" value={data.insuence_expiry} />
          <ReadOnlyField label="FITNESS EXPIRY" icon="calendar-today" value={data.fitness_expiry} />
          <ReadOnlyField label="PERMIT EXPIRY" icon="calendar-today" value={data.permit_expiry} />
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal visible={viewer.visible} transparent animationType="fade">
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setViewer({ visible: false, uri: "", type: null })}>
            <Ionicons name="close-circle" size={48} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: viewer.uri }} style={styles.fullImage} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Internal Components ---

const ReadOnlyField = ({ label, icon, value }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.viewRow}>
      <MaterialIcons name={icon} size={18} color={AmbColors.primary} style={{ marginRight: 12 }} />
      <Text style={styles.viewText}>{value || "Not Provided"}</Text>
    </View>
  </View>
);

const ViewDocItem = ({ label, uri, onPress }: any) => {
  if (!uri) return null;
  const isPdf = uri.includes("application/pdf") || uri.includes("JVBER");

  return (
    <TouchableOpacity style={styles.docBox} onPress={() => onPress(uri)} activeOpacity={0.8}>
      {isPdf ? (
        <View style={styles.pdfBadge}>
          <MaterialIcons name="picture-as-pdf" size={32} color={AmbColors.primary} />
          <Text style={styles.pdfText}>VIEW PDF</Text>
        </View>
      ) : (
        <Image source={{ uri }} style={styles.docPreview} />
      )}
      <Text style={styles.docLabel}>{label}</Text>
      <View style={styles.viewBadge}>
        <MaterialIcons name="visibility" size={14} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  stickyHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 4,
    zIndex: 1000,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '400', color: AmbColors.onSurface },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 24 },
  sectionNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: AmbColors.primary, justifyContent: 'center', alignItems: 'center' },
  sectionNumberText: { fontSize: 13, color: '#fff', fontWeight: '800' },
  sectionTitle: { fontSize: 17, fontWeight: '400', color: AmbColors.onSurface, letterSpacing: -0.3 },
  formCard: { 
    backgroundColor: AmbColors.surfaceContainerLowest, 
    borderRadius: AmbRadius.xl, 
    padding: 18, 
    elevation: 3, 
    shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 
  },
  fieldGroup: { marginBottom: 16, width: '100%' },
  fieldLabel: { fontSize: 11, fontWeight: '300', color: AmbColors.secondary, marginBottom: 6, letterSpacing: 0.5 },
  viewRow: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', 
    padding: 14, borderRadius: AmbRadius.md, borderWidth: 1, borderColor: AmbColors.outline 
  },
  viewText: { fontSize: 15, color: AmbColors.onSurface, fontWeight: '600' },
  fullWidthDocStack: { gap: 16 },
  docBox: { 
    width: '100%', height: 130, backgroundColor: '#F8FAFC', borderRadius: AmbRadius.md, 
    borderWidth: 1, borderColor: AmbColors.outline, justifyContent: 'center', alignItems: 'center', padding: 12 
  },
  docPreview: { width: '50%', height: 75, borderRadius: 6, marginBottom: 8, resizeMode: 'cover' },
  docLabel: { fontSize: 12, fontWeight: '700', color: AmbColors.onSurface },
  pdfBadge: { alignItems: 'center', marginBottom: 8 },
  pdfText: { fontSize: 12, fontWeight: '800', color: AmbColors.primary, marginTop: 4 },
  viewBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: AmbColors.primary, borderRadius: 12, padding: 5 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: '95%', height: '80%', resizeMode: 'contain' },
});