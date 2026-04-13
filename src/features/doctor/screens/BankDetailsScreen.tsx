import AppHeader from "@/src/shared/components/AppHeader";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import { Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function BankDetailsScreen() {
  const [form, setForm] = useState({
    bankName: "",
    branch: "",
    ifsc: "",
    accountName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ac_type: "",
  });

  type ErrorType = {
    bankName?: string;
    branch?: string;
    ifsc?: string;
    accountName?: string;
    accountNumber?: string;
    confirmAccountNumber?: string;
    ac_type?: string;
  };

  const [errors, setErrors] = useState<ErrorType>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [edit, setEdit] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const auth = useContext(AuthContext);
    const vendorId = auth?.user?.vendorId;
  const token = auth?.user?.token;

  const validate = () => {
    const err: ErrorType = {};

    if (!form.bankName.trim()) err.bankName = "Bank Name required";
    if (!form.branch.trim()) err.branch = "Branch required";

    if (!form.ifsc) err.ifsc = "IFSC required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.toUpperCase()))
      err.ifsc = "Invalid IFSC";

    if (!form.accountName.trim())
      err.accountName = "Account Holder required";

    if (!form.accountNumber)
      err.accountNumber = "Account Number required";

    if (!form.confirmAccountNumber)
      err.confirmAccountNumber = "Confirm account number required";
    else if (form.accountNumber !== form.confirmAccountNumber)
      err.confirmAccountNumber = "Account numbers do not match";

    if (!form.ac_type)
      err.ac_type = "Select account type";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(doctor)/profile");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };
  useEffect(() => {
    if (successModal) {
      const timer = setTimeout(() => {
        setSuccessModal(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successModal]);

 const handleEdit = () => {
  if (submitting || loading || successModal) return;

  setEdit(prev => !prev);
};

  useEffect(() => {
    const fetchBankDetails = async () => {

      try {

        const res = await fetch(
          `https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/GetBankDetailsById/${vendorId}`
        );

        const data = await res.json();

        setForm({
          bankName: data.bankName || "",
          branch: data.branchName || "",
          ifsc: data.ifscCode || "",
          accountName: data.accountHolderName || "",
          accountNumber: data.accountNumber || "",
          confirmAccountNumber: data.accountNumber || "",
          ac_type: data.accountType || "",
        });
      } catch (err) {
        console.log(err);
        setSuccessModal(true);
        setEdit(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);


  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);


      const payload = {
        vendor_id: vendorId,
        bankName: form.bankName,
        branchName: form.branch,
        ifscCode: form.ifsc,
        account_HolderName: form.accountName,
        account_number: form.accountNumber,
        account_type: form.ac_type,
      };

      const res = await fetch(
        "https://coreapi-service-111763741518.asia-south1.run.app/api/Bank/UpdateBankDetails",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccessModal(true);
      setEdit(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <View style={{ flex: 1 }}>

        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0F766E" />
          <Text style={styles.loaderText}>Loading bank details...</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>

      <View style={styles.headerWrapper}>
        <AppHeader
          title="Bank Details"
          subtitle="Manage your bank information"
          icon="card-outline"
          actionText={edit ? "Cancel" : "Edit"}
          onActionPress={handleEdit}
          disabled={submitting || loading || successModal}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.card}>
          <Input
            label="Bank Name *"
            value={form.bankName}
            editable={edit}
            onChangeText={(t) => handleChange("bankName", t)}
            error={errors.bankName}
          />

          <Input
            label="Branch *"
            value={form.branch}
            editable={edit}
            onChangeText={(t) => handleChange("branch", t)}
            error={errors.branch}
          />

          <Input
            label="IFSC Code *"
            value={form.ifsc}
            editable={edit}
            onChangeText={(t) =>
              handleChange(
                "ifsc",
                t.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11)
              )
            }
            error={errors.ifsc}
            maxLength={11}
          />
          <Input
            label="Account Holder Name *"
            value={form.accountName}
            editable={edit}
            onChangeText={(t) =>
              handleChange("accountName", t.replace(/[^A-Za-z\s]/g, ""))
            }
            error={errors.accountName}
          />

          <Input
            label="Account Number *"
            value={form.accountNumber}
            editable={edit}
            onChangeText={(t) =>
              handleChange("accountNumber", t.replace(/\D/g, ""))
            }
            error={errors.accountNumber}
            secure={!edit}
          />

          <Input
            label="Confirm Account Number *"
            value={form.confirmAccountNumber}
            editable={edit}
            onChangeText={(t) =>
              handleChange("confirmAccountNumber", t.replace(/\D/g, ""))
            }
            error={errors.confirmAccountNumber}
            secure={!edit}
          />
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Account Type *</Text>

            <View
              style={[
                styles.dropdown,
                errors.ac_type && { borderColor: "red" },
                edit && { borderColor: "#0F766E" },
              ]}
            >
              <Picker
                selectedValue={form.ac_type}
                enabled={edit}
                onValueChange={(value) => handleChange("ac_type", value)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Select Account Type" value="" />
                <Picker.Item label="Savings Account" value="S" />
                <Picker.Item label="Current Account" value="C" />
                <Picker.Item label="Salary Account" value="A" />
              </Picker>
            </View>

            {errors.ac_type && (
              <Text style={{ color: "red", fontSize: 12 }}>
                {errors.ac_type}
              </Text>
            )}
          </View>
        </View>

        {edit && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
      <Modal visible={successModal} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>

            <View style={modalStyles.iconWrapper}>

              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            </View>

            <Text style={modalStyles.title}>Success!</Text>

            <Text style={modalStyles.subtitle}>
              Your bank details have been updated successfully.
            </Text>

            <TouchableOpacity
              style={modalStyles.button}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={modalStyles.buttonText}>Done</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  edit: {
    color: "#0F766E",
    fontWeight: "600",
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
});
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0F766E",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
type InputProps = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  error?: string;
  editable?: boolean;
  secure?: boolean;
  maxLength?: number;
};

function Input({
  label,
  value,
  onChangeText,
  error,
  editable = true,
  secure = false,
  maxLength,
}: InputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          error && { borderColor: "red", borderWidth: 1 },
        ]}
        value={value}
        editable={editable}
        secureTextEntry={secure}
        onChangeText={onChangeText}
        maxLength={maxLength}
      />

      {error && (
        <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
      )}
    </View>
  );
}