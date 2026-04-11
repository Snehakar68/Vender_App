import React, { useEffect, useState } from "react";
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
};

type ErrorType = Partial<Record<keyof FormType, string>>;

export default function Personal() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
  });

  const [errors, setErrors] = useState<ErrorType>({});

  /* 🔥 API CALL */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const vendorId = "NUR00000000000000071";

      const res = await fetch(
        `https://coreapi-service-111763741518.asia-south1.run.app/api/Nurse/GetNurPersonnelInfoById/${vendorId}`
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
    fetchData(); // reset to API data
  };

  const handleChange = (key: keyof FormType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: key === "pan" ? value.toUpperCase() : value,
    }));
  };

  /* 🔥 VALIDATION */
  const validate = () => {
    const newErrors: ErrorType = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name required";
    if (!formData.gender.trim()) newErrors.gender = "Gender required";
    if (!formData.dob.trim()) newErrors.dob = "DOB required";

    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Mobile must be 10 digits";

    if (formData.altMobile && !/^\d{10}$/.test(formData.altMobile))
      newErrors.altMobile = "Alt mobile must be 10 digits";

    if (!formData.bloodGroup.trim())
      newErrors.bloodGroup = "Blood group required";

    if (!formData.address1.trim())
      newErrors.address1 = "Address required";

    if (!formData.city.trim()) newErrors.city = "City required";
    if (!formData.state.trim()) newErrors.state = "State required";

    if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan))
      newErrors.pan = "Invalid PAN";

    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar))
      newErrors.aadhaar = "Aadhaar must be 12 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      console.log("SAVE API DATA:", formData);
      setIsEditing(false);
      // 👉 PUT API here later
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
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>PERSONAL INFORMATION</Text>

        {!isEditing ? (
          <TouchableOpacity onPress={handleEdit}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <InputItem label="FULL NAME" value={formData.fullName} error={errors.fullName} editable={isEditing} onChange={(v: string)=> handleChange("fullName", v)} />

        <View style={styles.row}>
          <InputItem label="GENDER" value={formData.gender} error={errors.gender} editable={isEditing} onChange={(v: string) => handleChange("gender", v)} />
          <InputItem label="DOB" value={formData.dob} error={errors.dob} editable={isEditing} onChange={(v: string) => handleChange("dob", v)} />
        </View>

        <InputItem label="EMAIL" value={formData.email} error={errors.email} editable={isEditing} onChange={(v: string) => handleChange("email", v)} />

        <View style={styles.row}>
          <InputItem label="MOBILE" value={formData.mobile} error={errors.mobile} editable={isEditing} onChange={(v: string) => handleChange("mobile", v)} />
          <InputItem label="ALT MOBILE" value={formData.altMobile} error={errors.altMobile} editable={isEditing} onChange={(v: string) => handleChange("altMobile", v)} />
        </View>

        <InputItem label="BLOOD GROUP" value={formData.bloodGroup} error={errors.bloodGroup} editable={isEditing} onChange={(v: string) => handleChange("bloodGroup", v)} />

        <InputItem label="ADDRESS LINE 1" value={formData.address1} error={errors.address1} editable={isEditing} onChange={(v: string) => handleChange("address1", v)} />

        <InputItem label="ADDRESS LINE 2" value={formData.address2} editable={isEditing} onChange={(v: string) => handleChange("address2", v)} />

        <View style={styles.row}>
          <InputItem label="CITY" value={formData.city} error={errors.city} editable={isEditing} onChange={(v: string) => handleChange("city", v)} />
          <InputItem label="STATE" value={formData.state} error={errors.state} editable={isEditing} onChange={(v: string) => handleChange("state", v)} />
        </View>

        <InputItem label="PINCODE" value={formData.pincode} error={errors.pincode} editable={isEditing} onChange={(v: string) => handleChange("pincode", v)} />

        <View style={styles.row}>
          <InputItem label="PAN" value={formData.pan} error={errors.pan} editable={isEditing} onChange={(v: string) => handleChange("pan", v)} />
          <InputItem label="AADHAAR" value={formData.aadhaar} error={errors.aadhaar} editable={isEditing} onChange={(v: string) => handleChange("aadhaar", v)} />
        </View>

        <InputItem label="SUMMARY" value={formData.summary} error={errors.summary} editable={isEditing} onChange={(v: string) => handleChange("summary", v)} />
      </View>

     

      {/* DOCUMENTS */}
      <Text style={styles.header}>DOCUMENTS</Text>

      <View style={styles.card}>
        <DocItem title="View Profile Photo" />
        <DocItem title="View Pan Card" />
        <DocItem title="View Aadhaar Card" />
      </View>

       {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

/* INPUT */
function InputItem({ label, value, editable, onChange, error }: any) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        style={[
          styles.input,
          { borderColor: error ? "red" : "#ddd" },
        ]}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

/* DOC ITEM */
function DocItem({ title }: { title: string }) {
  return (
    <TouchableOpacity style={styles.docRow}>
      <View style={styles.docLeft}>
        <Ionicons name="document-text-outline" size={20} color="#0f766e" />
        <Text style={styles.docText}>{title}</Text>
      </View>
      <Ionicons name="eye-outline" size={20} color="#999" />
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f7fb" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },

  header: { fontSize: 12, color: "#777", marginTop: 10 },

  editBtn: { color: "#0f766e" },
  cancelBtn: { color: "#0f766e" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  item: { marginBottom: 12, flex: 1 },

  label: { fontSize: 11, color: "#888" },

  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },

  error: {
    color: "red",
    fontSize: 11,
    marginTop: 2,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  saveButton: {
    backgroundColor: "#0f766e",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  docRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  docLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  docText: {
    marginLeft: 10,
    fontSize: 14,
  },
});