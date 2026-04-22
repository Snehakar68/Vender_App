
import React, { useEffect, useState ,useRef } from "react";
import AppHeader from "@/src/shared/components/AppHeader";
import { GoogleMapApiKey } from "@/src/utils/Apis";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "react-native";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system/legacy";

import * as IntentLauncher from "expo-intent-launcher";
import DateTimePicker from '@react-native-community/datetimepicker';


import { Platform } from "react-native";


/* ✅ TYPES */
type FormType = {
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  mobile: string;
  altMobile: string;
  bloodGroup: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  aadhaar: string;
  summary: string;

  photoUrl: string;
  panUrl: string;
  aadhaarUrl: string;
};

type ErrorType = Partial<Record<keyof FormType | "photoFile" | "panFile" | "aadhaarFile", string>>;

export default function Personal() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
 type FileType = {
  uri: string;
  name: string;
  type: string;
} | null;

const [files, setFiles] = useState<{
  photo: FileType;
  pan: FileType;
  aadhaar: FileType;
}>({
  photo: null,
  pan: null,
  aadhaar: null,
});

  const [formData, setFormData] = useState<FormType>({
    fullName: "",
    gender: "",
    dob: "",
    email: "",
    mobile: "",
    altMobile: "",
    bloodGroup: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    aadhaar: "",
    summary: "",

    photoUrl: "",
  panUrl: "",
  aadhaarUrl: "",
    
  });
  const [viewer, setViewer] = useState<{
  visible: boolean;
  uri: string;
  type: "image" | "pdf" | null;
}>({
  visible: false,
  uri: "",
  type: null,
});
const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);

const GENDER_MAP: Record<string, string> = {
  "M": "Male",
  "F": "Female",
  "O": "Other",
  "Male": "M",
  "Female": "F",
  "Other": "O"
};
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const [showDatePicker, setShowDatePicker] = useState(false);
const scrollRef = useRef<ScrollView>(null); // Ref for scrolling to top
  const [successMessage, setSuccessMessage] = useState("");
  const [cityQuery, setCityQuery] = useState("");
const [cityResults, setCityResults] = useState<any[]>([]);
const [citySelected, setCitySelected] = useState(false);
const [isCityFocused, setIsCityFocused] = useState(false);

useEffect(() => {
  setCityQuery(formData.city);
}, [formData.city]);

useEffect(() => {
  if (!isCityFocused) return;
  if (citySelected) return;
  if (!isEditing) return;
  if (cityQuery.length < 2) {
    setCityResults([]);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const res = await fetch(
  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(cityQuery)}&types=(cities)&components=country:in&key=${GoogleMapApiKey}`
);

      const data = await res.json();
      setCityResults(data.predictions || []);
    } catch (err) {
      console.log("Autocomplete error:", err);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [cityQuery, isEditing, isCityFocused]);

const fetchPlaceDetails = async (placeId: string) => {
  setCitySelected(true);
  setCityResults([]);

  try {
    const res = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GoogleMapApiKey}&fields=address_components`
);

    const data = await res.json();
    const details = data.result;

    let city = "";
    let state = "";
    let pin = "";

    details.address_components.forEach((comp: any) => {
      const types = comp.types;

      if (types.includes("locality")) city = comp.long_name;
      if (!city && types.includes("administrative_area_level_2"))
        city = comp.long_name;
      if (types.includes("administrative_area_level_1"))
        state = comp.long_name;
      if (types.includes("postal_code"))
        pin = comp.long_name;
    });

    setCityQuery(city);

    setFormData((prev) => ({
      ...prev,
      city,
      state,
      pincode: pin || prev.pincode,
    }));

  } catch (err) {
    console.log("Place details error:", err);
  }
};

// Helper function to format Date object to YYYY-MM-DD
const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const onDateChange = (event: any, selectedDate?: Date) => {
  setShowDatePicker(false); // Hide picker
  if (selectedDate) {
    const formattedDate = formatDateForApi(selectedDate);
    handleChange("dob", formattedDate);
  }
};

const toFileSrc = (b64: string) => {
  if (!b64) return "";

  // if already has prefix → return as-is
  if (b64.startsWith("data:")) return b64;

  // detect PDF (same like your old code)
  const isPdf = b64.startsWith("JVBER");

  return isPdf
    ? `data:application/pdf;base64,${b64}`
    : `data:image/jpeg;base64,${b64}`;
};

useEffect(() => {
  if (!successMessage) return;
  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 4000);
  return () => clearTimeout(timer);
}, [successMessage]);

const openFile = async (uri: string) => {
  if (!uri) return;

  const isPdf = uri.includes("application/pdf") || uri.startsWith("data:application/pdf") || uri.includes("JVBER");

  if (isPdf) {
    try {
      // 1. Clean the base64 string
      const cleanBase64 = uri.includes(",") ? uri.split(",")[1] : uri;

      // 2. Create a local path
      const fileUri = FileSystem.cacheDirectory + `temp_doc_${Date.now()}.pdf`;

      // 3. Write file to storage
      await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "android") {
        // 4. Get Content URI (Required for Android 10+)
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        
        // 5. Launch the Intent
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1, // Read permission
          type: "application/pdf",
        });
      } else {
        // iOS can open file URIs directly in Linking or a WebView
        Linking.openURL(fileUri);
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      alert("Could not open PDF viewer.");
    }
    return;
  }

  // If it's an image, use your existing state-based viewer
  setViewer({
    visible: true,
    uri,
    type: "image",
  });
};

const FileViewer = () => {
  if (!viewer.visible || viewer.type !== "image") return null;

  return (
    <Modal visible={viewer.visible} transparent={true} animationType="fade">
      <View style={styles.modal}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setViewer({ visible: false, uri: "", type: null })}
        >
          <Ionicons name="close-circle" size={40} color="white" />
        </TouchableOpacity>

        <Image
          source={{ uri: viewer.uri }}
          style={{ width: "95%", height: "80%", resizeMode: "contain" }}
        />
      </View>
    </Modal>
  );
};

  const [errors, setErrors] = useState<ErrorType>({});
  const [docs, setDocs] = useState({
  photo: "",
  pan: "",
  aadhaar: "",
});

 const pickFile = async (type: "photo" | "pan" | "aadhaar") => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset || !asset.uri) return;

    // ✅ 200KB Size Validation
    const maxSize = 200 * 1024; // 204,800 bytes
    if (asset.size && asset.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [`${type}File`]: "File size must be less than 200KB",
      }));
      return; // Stop execution
    }

    // Clear error if size is valid
    setErrors((prev) => ({ ...prev, [`${type}File`]: "" }));

    const file = {
      uri: asset.uri,
      name: asset.name || `file_${Date.now()}`,
      type: asset.mimeType || "application/octet-stream",
    };

    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
    
    // Update preview if it's an image
    if (file.type.includes("image")) {
       setFormData(prev => ({...prev, [`${type}Url`]: file.uri}));
    }

  } catch (err) {
    console.log("FILE PICK ERROR:", err);
  }
};
  /* 🔥 API CALL */
useEffect(() => {
  const init = async () => {
    try {
      
       const user = await AsyncStorage.getItem("user");
const parsed = JSON.parse(user || "{}");

const id = parsed?.vendorId;
      console.log(id,"id of nurse");
      if (!id) return;

      setVendorId(id);
      fetchData(id);
    } catch (e) {
      console.log(e);
    }
  };

  init();
}, []);
const fetchData = async (id: string) => {
  try {
    setLoading(true);

    const res = await fetch(
      `https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurseById/${id}`
    );

    const json = await res.json();

    if (!res.ok) throw new Error("Failed to fetch data");

    const imgObj = json?.nurseIMG?.[0] || {};

    const photoBase64 = imgObj?.photo || "";
    const panBase64 = imgObj?.pan || "";

// ✅ IMPORTANT: handle both backend spellings
    const aadhaarBase64 = imgObj?.aadhaar || imgObj?.adhaar || "";

  const toImage = (b64: string) => {
  if (!b64) return "";

  if (b64.startsWith("data:")) return b64;

  const isPdf = b64.startsWith("JVBER");

  return isPdf
    ? `data:application/pdf;base64,${b64}`
    : `data:image/jpeg;base64,${b64}`;
};

    setFormData((prev) => ({
      ...prev,
      fullName: json.full_name || "",
      gender: GENDER_MAP[json.gender] || json.gender || "",
      dob: json.dob || "",
      email: json.email || "",
      mobile: json.mobile || "",
      altMobile: json.mobile_1 || "",
      bloodGroup: json.bloodG || "",
      address1: json.adrs_1 || "",
      address2: json.adrs_2 || "",
      city: json.city || "",
      state: json.state || "",
      pincode: json.pin_code || "",
      pan: json.panNo || "",
      aadhaar: json.adhaarNo || "",
      summary: json.summary || "",

     photoUrl: photoBase64
  ? toFileSrc(photoBase64)
  : prev.photoUrl,

panUrl: panBase64
  ? toFileSrc(panBase64)
  : prev.panUrl,

aadhaarUrl: aadhaarBase64
  ? toFileSrc(aadhaarBase64)
  : prev.aadhaarUrl, // ✅ KEEP OLD
    }));

   
  } catch (err) {
    console.log("API ERROR:", err);
  } finally {
    setLoading(false);
  }
};

// const getImage = (b64: string) => {
//   if (!b64) return "";
//   return `data:image/jpeg;base64,${b64}`;
// };
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (vendorId) {
    fetchData(vendorId);
  }// reset to API data
  };

  const handleChange = (key: keyof FormType, value: string) => {
  setFormData((prev) => ({
    ...prev,
    [key]: key === "pan" ? value.toUpperCase() : value,
  }));

  // ✅ CLEAR ERROR WHEN USER TYPES (IMPORTANT)
  setErrors((prev) => ({
    ...prev,
    [key]: "",
  }));
};

  /* 🔥 VALIDATION */
 const validate = () => {
  const newErrors: ErrorType = {};

  if (!formData.fullName || formData.fullName.trim() === "")
    newErrors.fullName = "Full name required";

  if (!formData.gender || formData.gender.trim() === "")
    newErrors.gender = "Gender required";

  if (!formData.dob || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
  newErrors.dob = "Valid DOB (YYYY-MM-DD) required";
}

  if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))
    newErrors.email = "Invalid email";

  if (!/^\d{10}$/.test(formData.mobile))
    newErrors.mobile = "Mobile must be 10 digits";

  if (formData.altMobile && !/^\d{10}$/.test(formData.altMobile))
    newErrors.altMobile = "Alt mobile must be 10 digits";

  if (!formData.bloodGroup || formData.bloodGroup.trim() === "")
    newErrors.bloodGroup = "Blood group required";

  if (!formData.address1 || formData.address1.trim() === "")
    newErrors.address1 = "Address required";

  if (!formData.city || formData.city.trim() === ""){
    console.log("city is requied")
    newErrors.city = "City required";
  }
    

  if (!formData.state || formData.state.trim() === "")
    newErrors.state = "State required";

  if (!/^\d{6}$/.test(formData.pincode))
    newErrors.pincode = "Pincode must be 6 digits";

  if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan) || formData.pan.trim() === "")
    newErrors.pan = "Invalid PAN";

  if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar) ||  formData.aadhaar.trim() === "")
    newErrors.aadhaar = "Aadhaar must be 12 digits";

   if (!formData.summary || formData.summary.trim() === ""){
   
    newErrors.summary = "Summary required";
  }

  if (errors.photoFile) newErrors.photoFile = errors.photoFile;
  if (errors.panFile) newErrors.panFile = errors.panFile;
  if (errors.aadhaarFile) newErrors.aadhaarFile = errors.aadhaarFile;

  setErrors(newErrors);
  console.log(newErrors,"errrr");
  return Object.keys(newErrors).length === 0;
};


  
 const base64ToFile = async (base64: string, name: string) => {
        const path = FileSystem.cacheDirectory + name;

        await FileSystem.writeAsStringAsync(
            path,
            base64.replace(/^data:.*;base64,/, ""),
            { encoding: "base64" }
        );

        return {
            uri: path,
            name,
            type: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
        } as any;
    };
    

  const handleSave = async () => {
  if (!validate()) return;

  try {
    if (!vendorId) return;

    setLoading(true);

    const form = new FormData();

    // ✅ REQUIRED FIELD
    form.append("vendor_id", vendorId);

    // ✅ TEXT FIELDS
    form.append("full_name", formData.fullName);
    form.append("Gender", GENDER_MAP[formData.gender] || formData.gender);
    form.append("dob", formData.dob);
    form.append("email", formData.email);
    form.append("mobile", formData.mobile);
    form.append("mobile_1", formData.altMobile);
    form.append("BloodG", formData.bloodGroup);
    form.append("adrs_1", formData.address1);
    form.append("adrs_2", formData.address2);
    form.append("City", formData.city);
    form.append("State", formData.state);
    form.append("pin_code", formData.pincode);
    form.append("Summary", formData.summary);
    form.append("adhaarNo", formData.aadhaar);
    form.append("panNo", formData.pan);

    // ❌ FILES (leave empty as you said)
    // form.append("Photo", null);
    // form.append("license", null);
    // form.append("adhaar", null);
    // form.append("pan", null);
// ✅ PHOTO (only if changed)
// ✅ PHOTO
if (files.photo) {
  form.append("Photo", {
    uri: files.photo.uri,
    name: files.photo.name,
    type: files.photo.type,
  } as any);
} else if (formData.photoUrl) {
  const file = await base64ToFile(formData.photoUrl, "photo.jpg");
  if (file) form.append("Photo", file as any);
}

// ✅ PAN (🔥 THIS FIXES YOUR ISSUE)
if (files.pan) {
  form.append("pan", {
    uri: files.pan.uri,
    name: files.pan.name,
    type: files.pan.type,
  } as any);
} else if (formData.panUrl) {
  const file = await base64ToFile(formData.panUrl, "pan.pdf");
  if (file) form.append("pan", file as any);
}

// ✅ AADHAAR
if (files.aadhaar) {
  form.append("adhaar", {
    uri: files.aadhaar.uri,
    name: files.aadhaar.name,
    type: files.aadhaar.type,
  } as any);
} else if (formData.aadhaarUrl) {
  const file = await base64ToFile(formData.aadhaarUrl, "aadhaar.pdf");
  if (file) form.append("adhaar", file as any);
}

    

   const res = await fetch(
  "https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/UpdateNurPersonnelInfo",
  {
    method: "PUT",
    body: form,
  }
);

    const json = await res.json();

    console.log("UPDATE RESPONSE:", json);

    if (json?.status) {
      setSuccessMessage("Information updated successfully");
      setIsEditing(false);

      scrollRef.current?.scrollTo({ y: 0, animated: true });

      // 🔁 Refresh latest data
      fetchData(vendorId);
    } else {
      console.log("❌ Update failed");
    }
  } catch (err) {
    console.log("UPDATE ERROR:", err);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    
  <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.headerWrapper}>
  <AppHeader
    title="Personal Information"
    subtitle="Manage your personal details"
    icon="person-outline"
    actionText={!isEditing ? "Edit" : "Cancel"}
    onActionPress={!isEditing ? handleEdit : handleCancel}
  />
</View>
    <ScrollView
      ref={scrollRef} // ✅ Attach Ref here
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      
      {/* ✅ Success Message UI */}
      {successMessage ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* PERSONAL DETAILS */}
      <View style={styles.card}>
        <InputItem label="Full Name *" value={formData.fullName} error={errors.fullName} editable={isEditing} onChange={(v:any)=>handleChange("fullName",v)} />
        {/* <InputItem label="Gender *" value={formData.gender} error={errors.gender} editable={isEditing} onChange={(v:any)=>handleChange("gender",v)} /> */}
       {/* Replace the Gender InputItem with this logic */}
<View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Gender *</Text>
  
  {isEditing ? (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
      {["Male", "Female", "Other"].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => handleChange("gender", option)}
          style={[
            styles.genderOption,
            formData.gender === option && styles.genderOptionSelected
          ]}
        >
          <Text style={[
            styles.genderText,
            formData.gender === option && styles.genderTextSelected
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  ) : (
    /* When not editing, show a read-only box that looks like your other inputs */
    <View style={[styles.input, { marginTop: 4 }]}>
      <Text style={{ fontSize: 14, color: "#1e293b" }}>
        {formData.gender || "Not Specified"}
      </Text>
    </View>
  )}

  {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
</View>
{errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        {/* <InputItem label="Blood Group" value={formData.bloodGroup} editable={isEditing} onChange={(v:any)=>handleChange("bloodGroup",v)} /> */}
      <View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Blood Group *</Text>
  
  {isEditing ? (
    <TouchableOpacity 
      style={styles.input} 
      onPress={() => setIsBloodModalOpen(true)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: formData.bloodGroup ? "#1e293b" : "#94a3b8" }}>
          {formData.bloodGroup || "Select Blood Group"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </View>
    </TouchableOpacity>
  ) : (
    <View style={styles.input}>
      <Text style={{ fontSize: 14, color: "#1e293b" }}>
        {formData.bloodGroup || "Not Specified"}
      </Text>
    </View>
  )}
</View>
{/* BLOOD GROUP SELECTOR MODAL */}
<Modal
  visible={isBloodModalOpen}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setIsBloodModalOpen(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay} 
    activeOpacity={1} 
    onPress={() => setIsBloodModalOpen(false)}
  >
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Select Blood Group</Text>
      </View>
      
      <ScrollView>
        {BLOOD_GROUPS.map((group) => (
          <TouchableOpacity
            key={group}
            style={styles.sheetOption}
            onPress={() => {
              handleChange("bloodGroup", group);
              setIsBloodModalOpen(false);
            }}
          >
            <Text style={[
              styles.sheetOptionText,
              formData.bloodGroup === group && styles.sheetOptionSelectedText
            ]}>
              {group}
            </Text>
            {formData.bloodGroup === group && (
              <Ionicons name="checkmark" size={20} color="#0F766E" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </TouchableOpacity>
</Modal>
       {/* <InputItem label="Date of Birth *" value={formData.dob} error={errors.dob} editable={isEditing} onChange={(v:any)=>handleChange("dob",v)} /> */}
       <View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Date of Birth *</Text>
  
  {isEditing ? (
    <>
      <TouchableOpacity 
        style={[styles.input, errors.dob && styles.errorBorder]} 
        onPress={() => setShowDatePicker(true)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: formData.dob ? "#1e293b" : "#94a3b8" }}>
            {formData.dob || "Select Date"}
          </Text>
          <Ionicons name="calendar-outline" size={18} color="#64748B" />
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dob ? new Date(formData.dob) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Prevents selecting future dates
        />
      )}
    </>
  ) : (
    <View style={styles.input}>
      <Text style={{ fontSize: 14, color: "#1e293b" }}>
        {formData.dob || "Not Specified"}
      </Text>
    </View>
  )}
  {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
</View>
        <InputItem label="Address Line 1 *" value={formData.address1} error={errors.address1} editable={isEditing} onChange={(v:any)=>handleChange("address1",v)} />
        <InputItem label="Address Line 2" value={formData.address2} editable={isEditing} onChange={(v:any)=>handleChange("address2",v)} />
        {/* <InputItem label="City *" value={formData.city} error={errors.city} editable={isEditing} onChange={(v:any)=>handleChange("city",v)} /> */}
        <View style={{ marginBottom: 14, zIndex: 999 }}>
  <Text style={styles.label}>City *</Text>

  {isEditing ? (
    <>
      <TextInput
        style={[styles.input, errors.city && styles.errorBorder]}
        value={cityQuery}
        placeholder="Type city"
        onFocus={() => setIsCityFocused(true)}   // ✅ open only on click
  onBlur={() => {
    setTimeout(() => setIsCityFocused(false), 200); // delay so click works
  }}
        onChangeText={(text) => {
          setCitySelected(false);
          setCityQuery(text);
          setFormData((prev) => ({ ...prev, city: text }));
        }}
      />

      {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

      {cityResults.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }}>
            {cityResults.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.dropdownItem}
                onPress={() => fetchPlaceDetails(item.place_id)}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  ) : (
    <View style={styles.input}>
      <Text>{formData.city || "—"}</Text>
    </View>
  )}
</View>
        <InputItem label="State *" value={formData.state} error={errors.state}  editable={false}  onChange={(v:any)=>handleChange("state",v)} />
        <InputItem label="PIN Code *" value={formData.pincode} error={errors.pincode} editable={isEditing} onChange={(v:any)=>handleChange("pincode",v)} />
       
        <InputItem label="Aadhaar Number *" value={formData.aadhaar} error={errors.aadhaar} editable={isEditing} onChange={(v:any)=>handleChange("aadhaar",v)} />
        <InputItem label="PAN Number *" value={formData.pan} error={errors.pan} editable={isEditing} onChange={(v:any)=>handleChange("pan",v)} />
        <InputItem label="Introduction *" value={formData.summary} error={errors.summary} editable={isEditing} multiline onChange={(v:any)=>handleChange("summary",v)} />
      </View>

      {/* CONTACT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <InputItem label="Email *" value={formData.email} error={errors.email} editable={isEditing} onChange={(v:any)=>handleChange("email",v)} />
        <InputItem label="Mobile Number *" value={formData.mobile} error={errors.mobile} editable={isEditing} onChange={(v:any)=>handleChange("mobile",v)} />
        <InputItem label="Alternate Mobile" value={formData.altMobile} error={errors.altMobile} editable={isEditing} onChange={(v:any)=>handleChange("altMobile",v)} />
      </View>

 {/* DOCUMENTS */}
<View style={styles.card}>
  <Text style={styles.sectionTitle}>Documents</Text>

  {/* PHOTO */}
  <TouchableOpacity
    onPress={() => isEditing ? pickFile("photo") : openFile(formData.photoUrl)}
    style={[styles.docBox, !isEditing && styles.docBoxPrimary, errors.photoFile && styles.errorBorder]}
  >
    <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
      {isEditing ? (files.photo ? "Photo Selected" : "Change Photo") : "View Photo"}
    </Text>

    {/* Check files state first (newly picked), then fallback to existing URL */}
    {isEditing && (files.photo || formData.photoUrl) && (
      (files.photo?.type.includes("pdf") || formData.photoUrl?.includes("pdf") || formData.photoUrl?.includes("JVBER")) ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text" size={24} color="#0F766E" />
          <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
        </View>
      ) : (
        <Image source={{ uri: files.photo?.uri || formData.photoUrl }} style={styles.preview} />
      )
    )}
  </TouchableOpacity>
  {errors.photoFile && <Text style={styles.errorText}>{errors.photoFile}</Text>}

  {/* PAN */}
  <TouchableOpacity
    onPress={() => isEditing ? pickFile("pan") : openFile(formData.panUrl)}
    style={[styles.docBox, !isEditing && styles.docBoxPrimary, errors.panFile && styles.errorBorder]}
  >
    <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
      {isEditing ? (files.pan ? "PAN Selected" : "Change PAN") : "View PAN Card"}
    </Text>

    {/* Logic: Check if the NEWLY picked file is a PDF OR if the EXISTING URL is a PDF */}
    {isEditing && (files.pan || formData.panUrl) && (
      (files.pan?.type.includes("pdf") || formData.panUrl?.includes("pdf") || formData.panUrl?.includes("JVBER")) ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text" size={24} color="#0F766E" />
          <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
        </View>
      ) : (
        <Image source={{ uri: files.pan?.uri || formData.panUrl }} style={styles.preview} />
      )
    )}
  </TouchableOpacity>
  {errors.panFile && <Text style={styles.errorText}>{errors.panFile}</Text>}

  {/* AADHAAR */}
  <TouchableOpacity
    onPress={() => isEditing ? pickFile("aadhaar") : openFile(formData.aadhaarUrl)}
    style={[styles.docBox, !isEditing && styles.docBoxPrimary, errors.aadhaarFile && styles.errorBorder]}
  >
    <Text style={[styles.docText, !isEditing && styles.docTextPrimary]}>
      {isEditing ? (files.aadhaar ? "Aadhaar Selected" : "Change Aadhaar") : "View Aadhaar Card"}
    </Text>

    {isEditing && (files.aadhaar || formData.aadhaarUrl) && (
      (files.aadhaar?.type.includes("pdf") || formData.aadhaarUrl?.includes("pdf") || formData.aadhaarUrl?.includes("JVBER")) ? (
        <View style={styles.pdfPlaceholder}>
          <Ionicons name="document-text" size={24} color="#0F766E" />
          <Text style={styles.pdfPlaceholderText}>PDF Uploaded</Text>
        </View>
      ) : (
        <Image source={{ uri: files.aadhaar?.uri || formData.aadhaarUrl }} style={styles.preview} />
      )
    )}
  </TouchableOpacity>
  {errors.aadhaarFile && <Text style={styles.errorText}>{errors.aadhaarFile}</Text>}
</View>

      {isEditing && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>

    {/* ✅ THIS FIXES YOUR ISSUE */}
    <FileViewer />
  </SafeAreaView>
);
  
}

/* INPUT */
function InputItem({
  label,
  value,
  editable,
  onChange,
  error,
  multiline = false,
}: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.textArea,
          error && styles.errorBorder,
        ]}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

/* DOC ITEM */
function DocButton({ label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.docBtn} onPress={onPress}>
      <Text style={styles.docText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 10,
    paddingBottom: 40,
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
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
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

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  errorText: {
    color: "red",
    fontSize: 12,
  },

  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },

  docBtn: {
    backgroundColor: "#0F766E",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  // docText: {
  //   color: "#fff",
  //   fontWeight: "600",
  // },

  saveBtn: {
    backgroundColor: "#0F766E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
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
  zIndex: 999,
},

closeBtn: {
  position: "absolute",
  top: 50,
  right: 20,
  zIndex: 1000,
},

docBox: {
  padding: 12,
  backgroundColor: "#fff",
  marginBottom: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  // ✅ These two lines handle the centering
  alignItems: "center", 
  justifyContent: "center",
},

docBoxPrimary: {
  backgroundColor: "#0F766E",
  borderColor: "#0F766E",
  paddingVertical: 14, // Slightly more padding for a better button look
},

docText: {
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center", // Ensure text internally centers
  color: "#1e293b",
},

docTextPrimary: {
  color: "#FFFFFF",
},
dropdown: {
  position: "absolute",
  top: 55,
  left: 0,
  right: 0,
  backgroundColor: "#fff",
  borderRadius: 10,
  elevation: 5,
  zIndex: 9999,
},

dropdownItem: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

preview: {
  width: 100,
  height: 70,
  borderRadius: 8,
  marginTop: 8,
},

genderOption: {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  alignItems: "center",
},
genderOptionSelected: {
  backgroundColor: "#0F766E",
  borderColor: "#0F766E",
},
genderText: {
  color: "#64748B",
  fontSize: 14,
  fontWeight: "500",
},
genderTextSelected: {
  color: "#FFFFFF",
},
modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: 20,
  },
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  sheetOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
  },
  sheetOptionText: {
    fontSize: 16,
    color: "#475569",
  },
  sheetOptionSelectedText: {
    color: "#0F766E",
    fontWeight: "700",
  },
  successContainer: {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 1,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'center', // Centers text horizontally
  justifyContent: 'center'
},
successText: {
  color: "#065F46",
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center"
},
pdfPlaceholder: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pdfPlaceholderText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },
});