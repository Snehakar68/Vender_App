import React, { useEffect, useState } from "react";
import AppHeader from "@/src/shared/components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "react-native";


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

type ErrorType = Partial<Record<keyof FormType, string>>;

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

    if (!asset || !asset.uri) {
      console.log("❌ URI missing", asset);
      return;
    }

    const file = {
      uri: asset.uri,
      name: asset.name || `file_${Date.now()}`,
      type: asset.mimeType || "application/octet-stream",
    };

    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    console.log("✅ FILE:", file);
  } catch (err) {
    console.log("FILE PICK ERROR:", err);
  }
};

  /* 🔥 API CALL */
useEffect(() => {
  const init = async () => {
    try {
      const id = await AsyncStorage.getItem("vendorId");
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
console.log("id in personal info is ", id);

      const res = await fetch(
  `https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurPersonnelInfoById/${id}`
);

      const json = await res.json();

      if (json?.status && json?.data?.nurse) {
        const n = json.data.nurse;

        setFormData({
          fullName: n.full_name || "",
          gender: n.gender || "",
          dob: n.dob || "",
          email: n.email || "",
          mobile: n.mobile || "",
          altMobile: n.mobile_1 || "",
          bloodGroup: n.bloodG || "",
          address1: n.adrs_1 || "",
          address2: n.adrs_2 || "",
          city: n.city || "",
          state: n.state || "",
          pincode: n.pin_code || "",
          pan: n.panNo || "",
          aadhaar: n.adhaarNo || "",
          summary: n.summary || "",

          photoUrl: n.images?.photo
  ? `data:image/jpeg;base64,${n.images.photo}`
  : "",

panUrl: n.images?.pan
  ? `data:image/jpeg;base64,${n.images.pan}`
  : "",

aadhaarUrl: n.images?.aadhaar
  ? `data:application/pdf;base64,${n.images.aadhaar}`
  : "",
         

          
        });
        
      }
      
    } catch (err) {
      console.log("API ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

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

  if (!formData.dob || formData.dob.trim() === "")
    newErrors.dob = "DOB required";

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

  setErrors(newErrors);
  console.log(newErrors,"errrr");
  return Object.keys(newErrors).length === 0;
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
    form.append("Gender", formData.gender);
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
   if (files.photo) {
  form.append("Photo", {
    uri: files.photo.uri,
    name: files.photo.name,
    type: files.photo.type,
  } as any);
}

if (files.pan) {
  form.append("pan", {
    uri: files.pan.uri,
    name: files.pan.name,
    type: files.pan.type,
  } as any);
}

if (files.aadhaar) {
  form.append("adhaar", {
    uri: files.aadhaar.uri,
    name: files.aadhaar.name,
    type: files.aadhaar.type,
  } as any);
}

    console.log("FORM DATA:", form);

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
      console.log("✅ Updated Successfully");
      setIsEditing(false);

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
  <ScrollView
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
  >
    {/* HEADER */}
    <AppHeader
      title="Personal Information"
      subtitle="Manage your personal details"
      icon="person-outline"
      actionText={!isEditing ? "Edit" : "Cancel"}
      onActionPress={!isEditing ? handleEdit : handleCancel}
    />

    {/* PERSONAL DETAILS */}
    <View style={styles.card}>
      <InputItem label="Full Name *" value={formData.fullName} error={errors.fullName} editable={isEditing} onChange={(v:any)=>handleChange("fullName",v)} />

      <InputItem label="Gender *" value={formData.gender} error={errors.gender} editable={isEditing} onChange={(v:any)=>handleChange("gender",v)} />

      <InputItem label="Blood Group" value={formData.bloodGroup} editable={isEditing} onChange={(v:any)=>handleChange("bloodGroup",v)} />

      <InputItem label="Date of Birth *" value={formData.dob} error={errors.dob} editable={isEditing} onChange={(v:any)=>handleChange("dob",v)} />

      <InputItem label="Address Line 1 *" value={formData.address1} error={errors.address1} editable={isEditing} onChange={(v:any)=>handleChange("address1",v)} />

      <InputItem label="Address Line 2" value={formData.address2} editable={isEditing} onChange={(v:any)=>handleChange("address2",v)} />

      <InputItem label="City *" value={formData.city} error={errors.city} editable={isEditing} onChange={(v:any)=>handleChange("city",v)} />

      <InputItem label="State *" value={formData.state} error={errors.state} editable={isEditing} onChange={(v:any)=>handleChange("state",v)} />

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

      <DocButton label="Profile Photo" onPress={() => isEditing && pickFile("photo")} />
      <DocButton label="PAN Card" onPress={() => isEditing && pickFile("pan")} />
      <DocButton label="Aadhaar Card" onPress={() => isEditing && pickFile("aadhaar")} />
    </View>

    {/* SAVE */}
    {isEditing && (
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    )}
  </ScrollView>
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
    padding: 16,
    paddingBottom: 40,
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

  docText: {
    color: "#fff",
    fontWeight: "600",
  },

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
});