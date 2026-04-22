import React, { useEffect, useState ,useRef } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/src/shared/components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { Image, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";



type ErrorType = {
  qualification?: string;
  experience?: string;
  regNumber?: string;
  department?: string;
  regDate?: string;
  certificate?: string;
};

type FileType = {
  uri: string;
  name: string;
  type: string;
} | null;

export default function Professional() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const [departments, setDepartments] = useState<
    { id: number; depName: string }[]
  >([]);

  const [file, setFile] = useState<FileType>(null);

  const [showDepartment, setShowDepartment] = useState(false);
  const [showQualification, setShowQualification] = useState(false);

  const qualifications = [
  { label: "ANM", value: "1" },
  { label: "GNM", value: "2" },
  { label: "BSc Nursing", value: "3" },
];
const [viewer, setViewer] = useState<{
  visible: boolean;
  type: "image" | "pdf";
  data: string | null;
}>({
  visible: false,
  type: "image",
  data: null,
});

  const [formData, setFormData] = useState({
    qualification: "",
    experience: "",
    regNumber: "",
    department: 0,
    regDate: "",
  });

  const [originalData, setOriginalData] = useState(formData);
  const [errors, setErrors] = useState<ErrorType>({});
 const [licenseBase64, setLicenseBase64] = useState<string | null>(null);

 // Inside export default function Professional() { ...
const scrollRef = useRef<ScrollView>(null);
const [successMessage, setSuccessMessage] = useState("");

// Auto-hide success message
useEffect(() => {
  if (!successMessage) return;
  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 4000);
  return () => clearTimeout(timer);
}, [successMessage]);
const [showPicker, setShowPicker] = useState(false);

  // Function to handle date selection
  const onDateChange = (event: any, selectedDate?: Date) => {
    // Hide picker for Android immediately
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      // Format to YYYY-MM-DD for state and API consistency
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      handleChange("regDate", formattedDate);
    }
  };

  // Helper to get a Date object from current regDate string
  const getValidDate = () => {
    if (formData.regDate) {
      const d = new Date(formData.regDate);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  };
 
 
  /* INIT */
  useEffect(() => {
    const init = async () => {
        const user = await AsyncStorage.getItem("user");
const parsed = JSON.parse(user || "{}");

const id = parsed?.vendorId;
      if (!id) return;

      setVendorId(id);
      fetchData(id);
      fetchDepartments();
    };

    init();
  }, []);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurseById/${id}`
      );
      const data = await res.json();

      const formatted = {
        qualification: data.qualification || "",
        experience: data.exp ? String(data.exp) : "",
        regNumber: data.registrationNo || "",
        department: data.dep_id || 0,
        regDate: data.registrationDate || "",
      };

      setFormData(formatted);
      setOriginalData(formatted);
      setLicenseBase64(data?.nurseIMG?.[0]?.license || null);
      // console.log("LICENSE:", data?.nurseIMG?.[0]?.license);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurseDepartments"
      );
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleViewLicense = async () => {
  if (!licenseBase64) return;

  try {
    const cleanBase64 = licenseBase64.includes(",")
      ? licenseBase64.split(",")[1]
      : licenseBase64;

    const isPdf =
      cleanBase64.startsWith("JVBER") ||
      licenseBase64.includes("application/pdf");

    if (isPdf) {
      const fileUri =
        FileSystem.cacheDirectory + "license.pdf";

      await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
        encoding: "base64",
      });

      const contentUri = await FileSystem.getContentUriAsync(fileUri);

      await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        }
      );
    } else {
      const imageUri = licenseBase64.startsWith("data:")
        ? licenseBase64
        : `data:image/png;base64,${cleanBase64}`;

      setViewer({
        visible: true,
        type: "image",
        data: imageUri,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

  /* FILE PICK */
const pickFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    // ✅ Check for 200KB Limit
    const maxSize = 200 * 1024; 
    if (asset.size && asset.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        certificate: "File is too large (Max 200KB)",
      }));
      return; // Stop here, don't set the file
    }

    // ✅ Clear error if size is valid
    setErrors((prev) => ({ ...prev, certificate: "" }));

    setFile({
      uri: asset.uri,
      name: asset.name || "file",
      type: asset.mimeType || "application/octet-stream",
    });
  } catch (err) {
    console.log(err);
  }
};

  /* EDIT */
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
  setFormData(originalData);
  setErrors({});
  setFile(null); // Reset the "newly picked" file
  setIsEditing(false);
  // Do NOT clear licenseBase64 here, as it represents the data on the server
};

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /* VALIDATION */
  const validate = () => {
    const newErrors: ErrorType = {};

    if (!formData.qualification)
      newErrors.qualification = "Qualification required";

    if (!formData.experience || isNaN(Number(formData.experience)))
      newErrors.experience = "Valid experience required";

    if (!formData.regNumber)
      newErrors.regNumber = "Registration number required";

    if (!formData.department || formData.department === 0)
      newErrors.department = "Department required";

    if (!formData.regDate)
      newErrors.regDate = "Date required";

    // ✅ Keep the certificate size error if it exists
  if (errors.certificate) {
    newErrors.certificate = errors.certificate;
  }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    if (date.includes("-")) return date;

    const [d, m, y] = date.split("/");
    return `${y}-${m}-${d}`;
  };

  const handleSave = async () => {
  if (!validate()) return;

  try {
    if (!vendorId) return;
    setLoading(true);

    const form = new FormData();
    form.append("vendor_id", vendorId);
    form.append("digree", formData.qualification);
    form.append("exp", formData.experience);
    form.append("Dep_id", String(formData.department));
    form.append("registrationNo", formData.regNumber);
    form.append("registrationDate", formatDate(formData.regDate));

    if (file) {
      // Scenario A: User picked a BRAND NEW file
      form.append("license", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    } else if (licenseBase64) {
      // Scenario B: User did NOT change the file, so we send the OLD one back
      // We create a temporary file from the base64 string
      const cleanBase64 = licenseBase64.includes(",")
        ? licenseBase64.split(",")[1]
        : licenseBase64;

      const isPdf = cleanBase64.startsWith("JVBER") || licenseBase64.includes("pdf");
      const filename = isPdf ? "existing_license.pdf" : "existing_license.png";
      const mimeType = isPdf ? "application/pdf" : "image/png";
      
      const tempUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(tempUri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      form.append("license", {
        uri: tempUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    const res = await fetch(
      "https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/UpdateNurProfessionalInfo",
      {
        method: "PUT",
        body: form,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const json = await res.json();

    if (json?.status) {
      setSuccessMessage("Professional information updated successfully");
      setIsEditing(false);
      setFile(null); 
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      fetchData(vendorId);
    }
  } catch (err) {
    console.error("Save Error:", err);
    alert("Failed to save data. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
         <AppHeader
          title="Professional Information"
          subtitle="Manage your professional details"
          icon="briefcase-outline"
          actionText={isEditing ? "Cancel" : "Edit"}
          onActionPress={isEditing ? handleCancel : handleEdit}
        />
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
       
        {/* ✅ Success Message Banner */}
      {successMessage ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

        <View style={styles.card}>
          {/* Qualification */}
          <Text style={styles.label}>Qualification *</Text>
          <TouchableOpacity
            style={[styles.input, errors.qualification && styles.errorBorder]}
            onPress={() => isEditing && setShowQualification(!showQualification)}
          >
            <Text>
  {
    qualifications.find(q => q.value === formData.qualification)?.label
    || "Select"
  }
</Text>
            <Ionicons name="chevron-down" size={18} />
          </TouchableOpacity>
          {errors.qualification && (
            <Text style={styles.errorText}>{errors.qualification}</Text>
          )}

          {showQualification &&
           qualifications.map((q) => (
  <TouchableOpacity
    key={q.value}
    style={styles.dropdownItem}
    onPress={() => {
      handleChange("qualification", q.value); // ✅ send value
      setShowQualification(false);
    }}
  >
    <Text>{q.label}</Text>
  </TouchableOpacity>
))}

          {/* Experience */}
          <Text style={styles.label}>Experience *</Text>
          <TextInput
            style={[styles.input, errors.experience && styles.errorBorder]}
            value={formData.experience}
            editable={isEditing}
            keyboardType="numeric"
            onChangeText={(t) => handleChange("experience", t)}
          />
          {errors.experience && (
            <Text style={styles.errorText}>{errors.experience}</Text>
          )}

          {/* Registration Number */}
          <Text style={styles.label}>Registration Number *</Text>
          <TextInput
            style={[styles.input, errors.regNumber && styles.errorBorder]}
            value={formData.regNumber}
            editable={isEditing}
            onChangeText={(t) => handleChange("regNumber", t)}
          />
          {errors.regNumber && (
            <Text style={styles.errorText}>{errors.regNumber}</Text>
          )}

        {/* Registration Date Field */}
          <Text style={styles.label}>Registration Date *</Text>
          <TouchableOpacity
            style={[styles.input, errors.regDate && styles.errorBorder]}
            onPress={() => isEditing && setShowPicker(true)}
          >
            <Text style={{ color: formData.regDate ? "#000" : "#94A3B8" }}>
              {formData.regDate || "Select Date"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#64748B" />
          </TouchableOpacity>
          
          {errors.regDate && (
            <Text style={styles.errorText}>{errors.regDate}</Text>
          )}

          {/* The Date Picker Component */}
          {showPicker && (
            <DateTimePicker
              value={getValidDate()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()} // Prevents selecting future dates
            />
          )}

          {/* Department */}
          <Text style={styles.label}>Department *</Text>
          <TouchableOpacity
            style={[styles.input, errors.department && styles.errorBorder]}
            onPress={() => isEditing && setShowDepartment(!showDepartment)}
          >
            <Text>
              {departments.find(
                (d) => d.id === Number(formData.department)
              )?.depName || "Select"}
            </Text>
            <Ionicons name="chevron-down" size={18} />
          </TouchableOpacity>
          {errors.department && (
            <Text style={styles.errorText}>{errors.department}</Text>
          )}

          {showDepartment &&
            departments.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.dropdownItem}
                onPress={() => {
                  handleChange("department", d.id);
                  setShowDepartment(false);
                }}
              >
                <Text>{d.depName}</Text>
              </TouchableOpacity>
            ))}

   {/* CERTIFICATE */}
<Text style={styles.label}>Registration Certificate</Text>

<View style={[
  styles.docBox, 
  errors.certificate && styles.errorBorder // ✅ Highlight red on error
]}>
  {/* If a NEW file is picked, show it. Otherwise show the existing licenseBase64 */}
  {file ? (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name="document-attach" size={30} color="#0F766E" />
      <Text style={{ fontSize: 12, marginTop: 4 }}>{file.name}</Text>
    </View>
    
  ) : licenseBase64 ? (
    licenseBase64.includes("JVBER") ? (
      <View style={{ alignItems: 'center' }}>
        <Ionicons name="document-text" size={30} color="#0F766E" />
        <Text style={{ fontSize: 12 }}>Existing PDF</Text>
      </View>
    ) : (
      <Image
        source={{
          uri: licenseBase64.startsWith("data:")
            ? licenseBase64
            : `data:image/png;base64,${licenseBase64}`,
        }}
        style={{ width: 60, height: 60, borderRadius: 6 }}
      />
    )
  ) : (
    <Text style={{ color: "#94A3B8" }}>
      {isEditing ? "No file selected" : "No certificate uploaded"}
    </Text>
  )}

  {/* Show View button only if there is an existing license or a viewable local file */}
  {(licenseBase64 || file) && (
    <TouchableOpacity 
      onPress={handleViewLicense} 
      style={{ marginTop: 8 }}
    >
      <Text style={{ color: "#0F766E", fontWeight: "600" }}>View</Text>
    </TouchableOpacity>
  )}
</View>
{/* ✅ Show the Error Message */}
{errors.certificate && (
  <Text style={styles.errorText}>{errors.certificate}</Text>
)}

{isEditing && (
  <TouchableOpacity style={styles.uploadBtn} onPress={pickFile}>
    <Text style={styles.uploadText}>
      {file || licenseBase64 ? "Change Certificate" : "Upload Certificate"}
    </Text>
  </TouchableOpacity>
)}


        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Modal visible={viewer.visible} transparent>
  <View style={styles.modalOverlay}>
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
          setViewer({ visible: false, type: "image", data: null })
        }
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
  },
  headerWrapper: {
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 0,

  borderBottomWidth: 1,
  borderBottomColor: "#E2E8F0",

  // Shadow (iOS)
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },

  // Shadow (Android)
  elevation: 3,

  zIndex: 10,
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
  successContainer: {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 1,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'center',
},
successText: {
  color: "#065F46",
  fontWeight: "600",
  fontSize: 14,
},
  docBox: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  uploadBtn: {
  marginTop: 8,
  backgroundColor: "#E2E8F0",
  padding: 10,
  borderRadius: 8,
  alignItems: "center",
},
uploadText: {
  fontSize: 13,
  fontWeight: "600",
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.9)",
  justifyContent: "center",
  alignItems: "center",
},
imageContainer: {
  width: "100%",
  height: "80%",
  justifyContent: "center",
  alignItems: "center",
},
fullImage: {
  width: "100%",
  height: "80%",
},
closeBtn: {
  position: "absolute",
  top: 10,
  alignSelf: "center",
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: 20,
  padding: 8,
},
closeText: {
  color: "#fff",
  fontSize: 18,
},
});