import AppHeader from "@/src/shared/components/AppHeader";
import React, { useEffect, useState ,useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

/* ✅ FIX: moved outside */
function Input({
  label,
  value,
  setValue,
  error,
  secure = false,
  isEditing,
}: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[styles.input, error && styles.errorBorder]}
        value={secure && !isEditing ? "••••••••••" : value}
        editable={isEditing}
        onChangeText={setValue}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

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

  const scrollRef = useRef<ScrollView>(null); // Ref for scrolling to top
    const [successMessage, setSuccessMessage] = useState("");

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

  useEffect(() => {
  if (!successMessage) return;
  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 4000);
  return () => clearTimeout(timer);
}, [successMessage]);

  // 🚀 FETCH DATA
  useEffect(() => {
    const init = async () => {
      try {
         const user = await AsyncStorage.getItem("user");
const parsed = JSON.parse(user || "{}");

const id = parsed?.vendorId;
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
                : data.accountType === "A"
                ? "Salary"
                : "",
          };

          setBankName(formattedData.bankName);
          setBranch(formattedData.branch);
          setIfsc(formattedData.ifsc);
          setHolderName(formattedData.holderName);
          setAccountNumber(formattedData.accountNumber);
          setConfirmAccountNumber(formattedData.confirmAccountNumber);
          setAccountType(formattedData.accountType);

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

    if (!bankName) newErrors.bankName = "Bank Name Required";
    if (!branch) newErrors.branch = "Branch Name Required";
    if (!ifsc) newErrors.ifsc = "IFSC code Required";
    if (!holderName) newErrors.holderName = "Name Required";
    if (!accountNumber) newErrors.accountNumber = "Account NumberRequired";
    if (!confirmAccountNumber)
      newErrors.confirmAccountNumber = "Required";

    if (accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Does not match";
    }

    if (!accountType) newErrors.accountType = "Account Type Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 SAVE
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
      setSuccessMessage(hasData ? "Bank details updated successfully" : "Bank details saved successfully");
        setIsEditing(false);
        setHasData(true);
        // Scroll to top to show the message
    scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        alert("❌ Failed");
      }
    } catch (e) {
      console.log(e);
      alert("Error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerWrapper}>
      <AppHeader
          title="Bank Details"
          subtitle="Manage your bank information"
          icon="card-outline"
          actionText={hasData ? (isEditing ? "Cancel" : "Edit") : ""}
          onActionPress={() => {
            if (isEditing) handleCancel();
            else setIsEditing(true);
          }}
        />
        </View>
      <ScrollView
      ref={scrollRef} // ✅ Attach Ref here
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
        
        {/* ✅ Success Message UI */}
      {successMessage ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

        <View style={styles.card}>
          <Input label="Bank Name *" value={bankName} setValue={setBankName} error={errors.bankName} isEditing={isEditing} />
          <Input label="Branch *" value={branch} setValue={setBranch} error={errors.branch} isEditing={isEditing} />
          <Input label="IFSC Code *" value={ifsc} setValue={setIfsc} error={errors.ifsc} isEditing={isEditing} />
          <Input label="Account Holder Name *" value={holderName} setValue={setHolderName} error={errors.holderName} isEditing={isEditing} />
          <Input label="Account Number *" value={accountNumber} setValue={setAccountNumber} error={errors.accountNumber}  isEditing={isEditing} />
          <Input label="Confirm Account Number *" value={confirmAccountNumber} setValue={setConfirmAccountNumber} error={errors.confirmAccountNumber} secure isEditing={isEditing} />

         {/* ACCOUNT TYPE */}
<View style={{ marginBottom: 14 }}>
  <Text style={styles.label}>Account Type *</Text>

  <TouchableOpacity
    activeOpacity={0.8}
    disabled={!isEditing}
    style={[
      styles.input,
      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ]}
    onPress={() => setShowDropdown(!showDropdown)}
  >
    <Text style={{ color: accountType ? "#000" : "#94A3B8" }}>
      {accountType || "Select Account Type"}
    </Text>

    <Text style={{ fontSize: 16 }}>
      {showDropdown ? "▲" : "▼"}
    </Text>
  </TouchableOpacity>

  {/* DROPDOWN LIST */}
  {showDropdown && (
    <View style={styles.dropdownBox}>
      {["Savings", "Current", "Salary"].map((t, index) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.dropdownItem,
            index === 2 && { borderBottomWidth: 0 },
          ]}
          onPress={() => {
            setAccountType(t);
            setShowDropdown(false);
            setErrors({ ...errors, accountType: "" });
          }}
        >
          <Text style={{ fontSize: 14 }}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}

  {errors.accountType && (
    <Text style={styles.errorText}>{errors.accountType}</Text>
  )}
</View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>
              {hasData ? "Save Changes" : "Save Details"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
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

  dropdownItem: {
    padding: 12,
    backgroundColor: "#fff",
   
  },

  errorText: { color: "red", fontSize: 12 },

  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownBox: {
  backgroundColor: "#fff",
  borderRadius: 10,
  marginTop: 4,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  overflow: "hidden",
},
successContainer: {
  backgroundColor: "#D1FAE5",
  borderColor: "#10B981",
  borderWidth: 1,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  alignItems: 'center',
  justifyContent: 'center'
},
successText: {
  color: "#065F46",
  fontWeight: "600",
  fontSize: 14,
  textAlign: "center"
},


});