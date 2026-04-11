import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ErrorType = {
  bankName?: string;
  branch?: string;
  ifsc?: string;
  holderName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  accountType?: string;
};

export default function Bank() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<ErrorType>({});
  const [originalData, setOriginalData] = useState<any>(null);
  const handleCancel = () => {
  if (originalData) {
    setBankName(originalData.bankName);
    setBranch(originalData.branch);
    setIfsc(originalData.ifsc);
    setHolderName(originalData.holderName);
    setAccountNumber(originalData.accountNumber);
    setConfirmAccountNumber(originalData.confirmAccountNumber);
    setAccountType(originalData.accountType);
  }

  setErrors({});
  setIsEditing(false);
};

  // 🚀 FETCH DATA
  useEffect(() => {
    const init = async () => {
      try {
        const id = await AsyncStorage.getItem("vendorId");
        if (!id) return;

        setVendorId(id);

        const res = await fetch(
          `https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/GetBankDetailsById/${id}`
        );

        const data = await res.json();

       if (data && data.vendorId) {
  setHasData(true);
  setIsEditing(false);

  const formattedData = {
    bankName: data.bankName || "",
    branch: data.branchName || "",
    ifsc: data.ifscCode || "",
    holderName: data.accountHolderName || "",
    accountNumber: data.accountNumber || "",
    confirmAccountNumber: data.accountNumber || "",
    accountType:
      data.accountType === "S"
        ? "Savings"
        : data.accountType === "C"
        ? "Current"
        : data.accountType === "SA"
        ? "Salary"
        : "",
  };

  // ✅ SET STATES
  setBankName(formattedData.bankName);
  setBranch(formattedData.branch);
  setIfsc(formattedData.ifsc);
  setHolderName(formattedData.holderName);
  setAccountNumber(formattedData.accountNumber);
  setConfirmAccountNumber(formattedData.confirmAccountNumber);
  setAccountType(formattedData.accountType);

  // ✅ SAVE ORIGINAL DATA
  setOriginalData(formattedData);
} else {
          setHasData(false);
          setIsEditing(true);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ✅ VALIDATION
  const validate = () => {
    let newErrors: ErrorType = {};

    if (!bankName) newErrors.bankName = "Required";
    if (!branch) newErrors.branch = "Required";
    if (!ifsc) newErrors.ifsc = "Required";
    if (!holderName) newErrors.holderName = "Required";
    if (!accountNumber) newErrors.accountNumber = "Required";
    if (!confirmAccountNumber) newErrors.confirmAccountNumber = "Required";

    if (accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Does not match";
    }

    if (!accountType) newErrors.accountType = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 SAVE (POST + PUT)
  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      vendor_id: vendorId,
      bankName,
      branchName: branch,
      ifscCode: ifsc,
      account_HolderName: holderName,
      account_number: accountNumber,
      account_type:
        accountType === "Savings"
          ? "S"
          : accountType === "Current"
          ? "C"
          : "SA",
    };

    try {
      const url = hasData
        ? "https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/UpdateBankDetails"
        : "https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/CreateBankDetails";

      const method = hasData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        alert("✅ Saved");
        setIsEditing(false);
        setHasData(true);
      } else {
        alert("❌ Failed");
      }
    } catch (e) {
      console.log(e);
      alert("Error");
    }
  };

  const renderInput = (
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    setValue: (t: string) => void,
    key: keyof ErrorType
  ) => (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputBox, errors[key] && styles.errorBorder]}>
        {icon}
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          value={value}
          editable={isEditing}
          onChangeText={(t) => {
            setValue(t);
            setErrors({ ...errors, [key]: "" });
          }}
        />
      </View>

      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}  contentContainerStyle={{ paddingBottom: 40 }} // ✅ BEST WAY
  showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Bank Details</Text>

        {hasData && (
  <TouchableOpacity
    onPress={() => {
      if (isEditing) {
        handleCancel(); // ✅ cancel clicked
      } else {
        setIsEditing(true); // ✅ edit clicked
      }
    }}
  >
    <Text style={styles.edit}>
      {isEditing ? "Cancel" : "Edit"}
    </Text>
  </TouchableOpacity>
)}
      </View>

      {renderInput(
        "Bank Name",
        <MaterialIcons name="account-balance" size={20} color="#777" />,
        "Enter bank name",
        bankName,
        setBankName,
        "bankName"
      )}

      {renderInput(
        "Branch",
        <Ionicons name="location-outline" size={20} color="#777" />,
        "Enter branch",
        branch,
        setBranch,
        "branch"
      )}

      {renderInput(
        "IFSC Code",
        <Ionicons name="code-outline" size={20} color="#777" />,
        "Enter IFSC code",
        ifsc,
        setIfsc,
        "ifsc"
      )}

      {renderInput(
        "Account Holder Name",
        <Ionicons name="person-outline" size={20} color="#777" />,
        "Enter name",
        holderName,
        setHolderName,
        "holderName"
      )}

      {renderInput(
        "Account Number",
        <Ionicons name="card-outline" size={20} color="#777" />,
        "Enter account number",
        accountNumber,
        setAccountNumber,
        "accountNumber"
      )}

      {renderInput(
        "Confirm Account Number",
        <Ionicons name="refresh-outline" size={20} color="#777" />,
        "Re-enter account number",
        confirmAccountNumber,
        setConfirmAccountNumber,
        "confirmAccountNumber"
      )}

      {/* DROPDOWN */}
      <Text style={styles.label}>Account Type</Text>

      <TouchableOpacity
        disabled={!isEditing}
        style={styles.inputBox}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Ionicons name="wallet-outline" size={20} />
        <Text style={{ marginLeft: 10 }}>
          {accountType || "Select Type"}
        </Text>
      </TouchableOpacity>

      {showDropdown &&
        ["Savings", "Current", "Salary"].map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.dropdownItem}
            onPress={() => {
              setAccountType(t);
              setShowDropdown(false);
            }}
          >
            <Text>{t}</Text>
          </TouchableOpacity>
        ))}

      {/* SAVE BUTTON */}
      {isEditing && (
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {hasData ? "Save Changes" : "Save Details"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f7fb", paddingBottom: 40, },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
  },

  title: { fontSize: 22, fontWeight: "bold" },
  edit: { color: "#0f766e", fontWeight: "bold" },

  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    marginLeft: 2,
    
  },

  inputBox: {
    flexDirection: "row",
    backgroundColor: "#e9edf3",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
   
  },

  input: { flex: 1, marginLeft: 10 },

  dropdownItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    paddingBottom:20,
  },

  button: {
    backgroundColor: "#0f766e",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
  },

  buttonText: { color: "#fff", textAlign: "center" },

  errorText: { color: "red", fontSize: 12 },
  errorBorder: { borderWidth: 1, borderColor: "red" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});