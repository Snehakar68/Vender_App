//  import AppHeader from "@/src/shared/components/AppHeader";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function ProfessionalDetailsScreen() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >

//         {/* HEADER */}
//        <AppHeader
//   title="Professional Information"
//   subtitle="Manage your professional details"
//   icon="briefcase-outline"
//   actionText="Edit"
//   onActionPress={() => {}}
// />

//         {/* DETAILS CARD */}
//         <View style={styles.card}>
//           <Input label="Qualification *" value="MBBS" />
//           <Input label="Experience (Years) *" value="7" />
//           <Input label="Department *" value="Infectious Diseases" />
//           <Input label="Registration No. *" value="15154" />
//           <Input label="Registration Date *" value="24-02-2026" />
//         </View>

//         {/* DOCUMENT CARD */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Documents</Text>

//           <DocButton label="View Registration Certificate" />
//         </View>

//         {/* SAVE */}
//         <TouchableOpacity style={styles.saveBtn}>
//           <Text style={styles.saveText}>Save Changes</Text>
//         </TouchableOpacity>

//       </ScrollView>
//     </SafeAreaView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: "#F1F5F9",
//     padding: 16,
//     paddingBottom: 40,
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//   },

//   edit: {
//     color: "#0F766E",
//     fontWeight: "600",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 14,
//   },

//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 10,
//   },

//   label: {
//     fontSize: 11,
//     color: "#64748B",
//     marginBottom: 4,
//   },

//   input: {
//     backgroundColor: "#F8FAFC",
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 14,
//   },

//   docBtn: {
//     backgroundColor: "#0F766E",
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   docText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   saveBtn: {
//     backgroundColor: "#0F766E",
//     padding: 16,
//     borderRadius: 14,
//     alignItems: "center",
//     marginTop: 10,
//   },

//   saveText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });
// function Input({ label, value }: { label: string; value: string }) {
//   return (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput
//         style={styles.input}
//         value={value}
//         editable={false}
//       />
//     </View>
//   );
// }
// function DocButton({ label }: { label: string }) {
//   return (
//     <TouchableOpacity style={styles.docBtn}>
//       <Text style={styles.docText}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

//src/features/doctor/screens/ProfessionalDetailsScreen.tsx
import AppHeader from "@/src/shared/components/AppHeader";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ProfessionalDetailsScreen() {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const [degrees, setDegrees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [file, setFile] = useState<{
    uri: string | null;
    type: "pdf" | "image" | null;
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;
  const token = auth?.user?.token;
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [successModal, setSuccessModal] = useState(false);
  const MAX_FILE_SIZE = 200 * 1024;
  const [viewer, setViewer] = useState<{
    visible: boolean;
    type: "image" | "pdf";
    data: string | null;
  }>({
    visible: false,
    type: "image",
    data: null,
  });

  const validate = () => {
    const e: any = {};

    if (!form.registrationNo?.trim()) {
      e.registrationNo = "Registration number required";
    }

    if (!form.registrationDate) {
      e.registrationDate = "Registration date required";
    }

    if (!form.departmentId) {
      e.departmentId = "Department required";
    }

    if (!form.qualificationId) {
      e.qualificationId = "Qualification required";
    }

    if (!form.experienceYears) {
      e.experienceYears = "Experience required";
    }

    if (!form.licenseFile?.uri) {
      e.license = "Registration Certificate required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(doctor)/profile");
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    fetchDoctor();
    fetchMeta();
  }, []);

  useEffect(() => {
    if (successModal) {
      const timer = setTimeout(() => {
        setSuccessModal(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [successModal]);

  const base64ToLocalFile = async (base64: string, filename: string) => {
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: "base64",
    });

    return fileUri;
  };

  const fetchDoctor = async () => {
    try {
      setLoading(true);

      if (!vendorId) return;

      const res = await fetch(
        `https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDoctorById/${vendorId}`
      );

      const data = await res.json();
      const docs = data.doctorDocs?.[0] || {};

      const isPdf = docs.license?.startsWith("JVBER");

      const licenseUri = docs.license
        ? await base64ToLocalFile(
          docs.license,
          isPdf ? "license.pdf" : "license.jpg"
        )
        : null;

      setForm({
        vendor_id: vendorId,
        experienceYears: data.exp,
        qualificationId: data.degree,
        departmentId: data.dep_id,
        registrationNo: data.registrationNo,
        registrationDate: data.registrationDate,

        licenseFile: {
          uri: licenseUri,
          type: isPdf ? "pdf" : "image"
        }
      });

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  const fetchMeta = async () => {
    const [degRes, depRes] = await Promise.all([
      fetch("https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDegree"),
      fetch("https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDeprt_Doc"),
    ]);

    const deg = await degRes.json();
    const dep = await depRes.json();

    setDegrees(deg);
    setDepartments(dep);
  };
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });

    if (result.canceled) return;

    const picked = result.assets[0];

    if (picked.size && picked.size > MAX_FILE_SIZE) {
      setErrors((prev: any) => ({
        ...prev,
        license: "File must be under 200KB",
      }));
      return;
    }

    const isPdf = picked.mimeType === "application/pdf";
 
    const fileData: {
      uri: string;
      type: "pdf" | "image";
    } = {
      uri: picked.uri,
      type: isPdf ? "pdf" : "image"
    };
    setFile(fileData);

    setForm((prev: any) => ({
      ...prev,
      licenseFile: fileData
    }));

    setErrors((prev: any) => {
      const copy = { ...prev };
      delete copy.license;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (!vendorId || !token) {
        Alert.alert("Session expired", "Please login again");
        return;
      }
      const fd = new FormData();

      fd.append("vendor_id", String(vendorId));
      fd.append("exp", String(form.experienceYears));
      fd.append("degree", String(form.qualificationId));
      fd.append("dep_id", String(form.departmentId));
      fd.append("registrationNo", form.registrationNo);
      fd.append("registrationDate", form.registrationDate);

      const license = form.licenseFile;

      if (license?.uri) {
        const isPdf = license.type === "pdf";

        fd.append("license", {
          uri: license.uri,
          name: isPdf ? "license.pdf" : "license.jpg",
          type: isPdf ? "application/pdf" : "image/jpeg",
        } as any);
      }
      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/UpdateDocProfessionalInfo",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      );

      const text = await res.text();
      console.log("API RESPONSE:", text);

      if (!res.ok) throw new Error(text);

      setSuccessModal(true);
      setEdit(false);
      fetchDoctor();

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Update failed");
    }
  };
  const setValue = (k: string, v: any) => {
    setForm((p: any) => ({ ...p, [k]: v }));

    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[k];
      return newErrors;
    });
  };

  useEffect(() => {
    if (vendorId) {
      fetchDoctor();
      fetchMeta();
    }
  }, [vendorId]);

  const handleEdit = () => {
    if (loading || successModal) return;

    setEdit(prev => !prev);
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0F766E" />
          <Text style={styles.loaderText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
        <AppHeader
          title="Professional Information"
          subtitle={edit ? "Edit details" : "View details"}
          icon="briefcase-outline"
          actionText={edit ? "Cancel" : "Edit"}
          onActionPress={handleEdit}
          disabled={loading}

        />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>

          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Qualification *</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.qualificationId}
                onValueChange={(value) => setValue("qualificationId", value)}
                enabled={edit}
              >
                <Picker.Item label="Select Degree" value="" />
                {degrees.map((deg: any) => (
                  <Picker.Item
                    key={deg.id}
                    label={deg.degree_Name}
                    value={deg.id}
                  />
                ))}
              </Picker>
            </View>
            {errors.qualificationId && (
              <Text style={styles.errorText}>{errors.qualificationId}</Text>
            )}
          </View>


          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Department *</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.departmentId}
                onValueChange={(value) => setValue("departmentId", value)}
                enabled={edit}
              >
                <Picker.Item label="Select Department" value="" />
                {departments.map((dep: any) => (
                  <Picker.Item
                    key={dep.id}
                    label={dep.dep_Name}
                    value={dep.id}
                  />
                ))}
              </Picker>
            </View>
            {errors.departmentId && (
              <Text style={styles.errorText}>{errors.departmentId}</Text>
            )}
          </View>

          <Input
            label="Experience (Years) *"
            value={form.experienceYears}
            editable={edit}
            onChange={(v: string) => setValue("experienceYears", v)}
            error={errors.experienceYears}
          />

          <Input
            label="Registration No *"
            value={form.registrationNo}
            editable={edit}
            onChange={(v: string) => setValue("registrationNo", v)}
            error={errors.registrationNo}
          />

          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Registration Date *</Text>

            <TouchableOpacity
              style={[
                styles.input,
                { justifyContent: "center" },
                !edit && { opacity: 0.6 },
              ]}
              onPress={() => edit && setShowDatePicker(true)}
              activeOpacity={edit ? 0.7 : 1}
              disabled={!edit}

            >
              <Text
                style={{
                  color: form.registrationDate ? "#111827" : "#6B7280",
                  fontSize: 14,
                }}
              >
                {form.registrationDate || "Select date"}
              </Text>
            </TouchableOpacity>

          </View>
          {errors.registrationDate && (
            <Text style={styles.errorText}>
              {errors.registrationDate}
            </Text>
          )}

        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Documents *</Text>

          <DocumentField
            label="Registration Certificate"
            file={form.licenseFile}
            edit={edit}
            setViewer={setViewer}
            onPick={pickFile}
          />
          {errors.license && (
            <Text style={styles.errorText}>{errors.license}</Text>
          )}
        </View>
        <Modal visible={viewer.visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            {viewer.type === "image" && (
              <View style={styles.imageContainer}>
                {viewer.data && (
                  <Image
                    source={{ uri: viewer.data }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                )}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() =>
                    setViewer({ visible: false, type: "image", data: null, })
                  }
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
        <Modal visible={showDatePicker} transparent animationType="slide">
          <TouchableOpacity
            style={{ flex: 1, justifyContent: "flex-end" }}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.dateModalContainer}>
              <DateTimePicker
                value={
                  form.registrationDate
                    ? new Date(form.registrationDate)
                    : new Date()
                }
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    const formatted = selectedDate
                      .toISOString()
                      .split("T")[0];

                    setValue("registrationDate", formatted);

                    setShowDatePicker(false);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={successModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successBox}>

              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>

              <Text style={styles.successTitle}>Success</Text>

              <Text style={styles.successText}>
                Profile updated successfully
              </Text>

              <TouchableOpacity
                style={styles.successBtn}
                onPress={() => setSuccessModal(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>OK</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
        {edit && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

    </View>

  );
}

function Input({ label, value, editable, onChange, error }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          error && { borderWidth: 1, borderColor: "red" },
        ]}
        value={String(value || "")}
        editable={editable}
        onChangeText={onChange}
      />

      {error && (
        <Text style={{ color: "red", fontSize: 11, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    paddingBottom: 40,
  },

  headerWrapper: {
    backgroundColor: "#fff",

    paddingTop: StatusBar.currentHeight || 0,

    borderBottomWidth: 0.5,
    borderColor: "#E2E8F0",

    elevation: 3,
    zIndex: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  successBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 10,
  },

  successIconText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 11,
    marginTop: 4,
  },
  dateModalContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  pickerContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    justifyContent: "center",
    height: 50,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },


  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  successText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },

  successBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  imageContainer: {
    width: "100%",
    height: "85%",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "85%",
  },
  closeBtn: {
    position: "absolute",
    top: 15,
    alignSelf: "center",

    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },

  closeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },

  docBtn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  docText: {
    color: "#fff",
    fontWeight: "600",
  },

  saveBtn: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  docBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  docTextField: {
    color: "#64748B",
    fontSize: 13,
  },

  viewBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  viewText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  uploadBtn: {
    marginTop: 8,
    backgroundColor: "#E2E8F0",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
});

function DocumentField({
  label,
  file,
  edit,
  setViewer,
  onPick,
}: any) {

  // ✅ normalize
  const fileUri = file?.uri;
  const isPdf = file?.type === "pdf";

  const handleView = async () => {
    if (!fileUri) return;

    try {
      // ✅ IMAGE VIEW (internal modal)
      if (!isPdf) {
        setViewer({
          visible: true,
          type: "image",
          data: fileUri,
        });
        return;
      }

      // ✅ PDF VIEW (external app)
      let contentUri = fileUri;

      // convert only if needed
      if (fileUri.startsWith("file://")) {
        contentUri = await FileSystem.getContentUriAsync(fileUri);
      }

      await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        }
      );

    } catch (e) {
      console.log("View failed", e);
      Alert.alert("Error", "Unable to open file");
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.docBox}>

        {fileUri ? (
          isPdf ? (
            <Text style={styles.docTextField}>PDF Uploaded</Text>
          ) : (
            <Image
              source={{ uri: fileUri }}
              style={{ width: 40, height: 40, borderRadius: 6 }}
            />
          )
        ) : (
          <Text style={styles.docTextField}>
            {edit ? "Select file..." : "No document available"}
          </Text>
        )}

        {fileUri && (
          <TouchableOpacity style={styles.viewBtn} onPress={handleView}>
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        )}
      </View>

      {edit && (
        <TouchableOpacity style={styles.uploadBtn} onPress={onPick}>
          <Text style={styles.uploadText}>
            {fileUri ? "Replace File" : "Upload File"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}