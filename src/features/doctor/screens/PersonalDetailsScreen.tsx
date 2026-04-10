import AppHeader from "@/src/shared/components/AppHeader";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import CityStatePin from "@/src/shared/components/CityAutocomplete";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import { useCallback } from "react";

export default function PersonalDetailsScreen() {
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [successModal, setSuccessModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
const [viewer, setViewer] = useState<{
  visible: boolean;
  type: "image" | "pdf";
  data: string | null;
}>({
  visible: false,
  type: "image",
  data: null,
});
const router = useRouter();

   const [form, setForm] = useState<{
  name: string;
  gender: string;
  bloodGroup: string;
  dob: string;
  addr1: string;
  addr2: string;
  city: string;
  state: string;
  pin: string;
  aadhaar: string;
  pan: string;
  summary: string;
  email: string;
  phone: string;
  altPhone: string;
  photo: string | null;
  aadhaarFile: string | null;
  panFile: string | null;
}>({
  name: "",
  gender: "",
  bloodGroup: "",
  dob: "",
  addr1: "",
  addr2: "",
  city: "",
  state: "",
  pin: "",
  aadhaar: "",
  pan: "",
  summary: "",
  email: "",
  phone: "",
  altPhone: "",
  photo: null,
  aadhaarFile: null,
  panFile: null,
});
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
    const validate = () => {
        const e: any = {};

        if (!form.name.trim()) e.name = "Name required";

        if (!form.gender) e.gender = "Select gender";

        if (!form.dob) e.dob = "DOB required";

        if (!form.email) e.email = "Email required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Invalid email";

        // 📱 PHONE
        if (!form.phone) e.phone = "Phone required";
        else if (!/^\d{10}$/.test(form.phone))
            e.phone = "Must be exactly 10 digits";

        // 🆔 AADHAAR
        if (!form.aadhaar) e.aadhaar = "Aadhaar required";
        else if (!/^\d{12}$/.test(form.aadhaar))
            e.aadhaar = "Must be exactly 12 digits";

        // 🧾 PAN
        if (!form.pan) e.pan = "PAN required";
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan))
            e.pan = "Format: ABCDE1234F";

        if (!form.addr1.trim()) e.addr1 = "Address required";

        if (!form.city) e.city = "City required";

        if (!form.state) e.state = "State required";

        if (!/^\d{6}$/.test(form.pin))
            e.pin = "PIN must be 6 digits";

        if (!form.summary.trim())
            e.summary = "Summary required";

        if (!form.photo) e.photo = "Photo required";
        if (!form.aadhaarFile) e.aadhaarFile = "Aadhaar file required";
        if (!form.panFile) e.panFile = "PAN file required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            const base64 = result.assets[0].base64;

            setForm({
                ...form,
                photo: `data:image/jpeg;base64,${base64}`,
            });
        }
    };
    const pickDocument = async (field: "aadhaarFile" | "panFile") => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf"],
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const file = result.assets[0];
        if (file.size && file.size > 200 * 1024) {
            Alert.alert("Error", "File must be under 200KB");
            return;
        }
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: "base64",
        });

        setForm({
            ...form,
            [field]: base64,
        });
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
    const handleChange = (field: string, value: any, options?: any) => {
        let finalValue = value;

        // 🔹 NUMERIC ONLY
        if (options?.numeric) {
            finalValue = value.replace(/[^0-9]/g, "");
        }

        // 🔹 UPPERCASE
        if (options?.uppercase) {
            finalValue = finalValue.toUpperCase();
        }

        // 🔹 MAX LENGTH (CRITICAL FIX)
        if (options?.maxLength) {
            finalValue = finalValue.slice(0, options.maxLength);
        }

        // 🔹 UPDATE FORM
        setForm((prev) => ({
            ...prev,
            [field]: finalValue,
        }));

        // 🔹 REMOVE ERROR
        setErrors((prev: any) => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };
    // 🔹 FETCH DATA (LIKE WEB)
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const vendorId = await AsyncStorage.getItem("vendorId");

            const res = await fetch(
                `https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDoctorById/${vendorId}`
            );

            const data = await res.json();

            const docs = data.doctorDocs?.[0] || {};

            setForm({
                name: data.full_Name || "",
                gender: data.gender || "",
                bloodGroup: data.bloodG || "",
                dob: data.dob || "",
                addr1: data.adrs_1 || "",
                addr2: data.adrs_2 || "",
                city: data.city || "",
                state: data.state || "",
                pin: data.pin_code || "",
                aadhaar: data.adhaarNo || "",
                pan: data.panNo || "",
                summary: data.summary || "",
                email: data.email || "",
                phone: data.mobile || "",
                altPhone: data.mobile_1 || "",

                // ✅ DOCUMENTS
                photo: docs.photo || null,
                aadhaarFile: docs.adhaar || null,
                panFile: docs.pan || null,
            });
        } catch (err) {
            console.log("Fetch Error:", err);
        }
    };

    // 🔹 TOGGLE EDIT
    const handleEdit = () => {
        setEdit((prev) => !prev);
    };


    // 🔹 SAVE API
    const handleSave = async () => {
        if (!validate()) return;
        try {
            setLoading(true);

            const vendorId = await AsyncStorage.getItem("vendorId");
            const token = await AsyncStorage.getItem("accessToken");

            const body = new FormData();

            body.append("vendor_id", vendorId || "");
            body.append("full_name", form.name);
            body.append("Gender", form.gender);
            body.append("dob", form.dob);
            body.append("email", form.email);
            body.append("mobile", form.phone);
            body.append("mobile_1", form.altPhone);
            body.append("BloodG", form.bloodGroup);
            body.append("adrs_1", form.addr1);
            body.append("adrs_2", form.addr2);
            body.append("City", form.city);
            body.append("State", form.state);
            body.append("pin_code", form.pin);
            body.append("Summary", form.summary);
            if (form.photo) {
                body.append("photo", await base64ToFile(form.photo, "photo.jpg"));
            }

            if (form.aadhaarFile) {
                body.append("adhaar", await base64ToFile(form.aadhaarFile, "aadhaar.jpg"));
            }

            if (form.panFile) {
                body.append("pan", await base64ToFile(form.panFile, "pan.jpg"));
            }

            const res = await fetch(
                "https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/UpdateDocPersonnelInfo",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body,
                }
            );

            if (!res.ok) throw new Error("Update failed");
            setSuccessModal(true);

            setEdit(false);
            fetchData();
        } catch (err) {
            Alert.alert("Error", "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>

            {/* ✅ FIXED HEADER */}
            <View style={styles.headerWrapper}>
                <AppHeader
                    title="Personal Information"
                    subtitle={edit ? "Edit your details" : "Manage your personal details"}
                    icon="person-outline"
                    actionText={edit ? "Cancel" : "Edit"}
                    onActionPress={handleEdit}
                />
            </View>

            {/* ✅ SCROLLABLE CONTENT */}
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* PERSONAL DETAILS */}
                <View style={styles.card}>
                    <Input label="Full Name *" value={form.name} editable={edit} error={errors.name}
                        onChangeText={(v: any) => setForm({ ...form, name: v })} />


                    <View style={{ marginBottom: 14 }}>
                        <Text style={styles.label}>Gender *</Text>

                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={form.gender}
                                onValueChange={(value) => handleChange("gender", value)}
                                style={{ height: 50, color: "#111" }}
                                dropdownIconColor="#111"
                                mode="dropdown"
                                enabled={edit}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="Male" />
                                <Picker.Item label="Female" value="Female" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>

                        {errors.gender && <Text style={{ color: "red" }}>{errors.gender}</Text>}
                    </View>

                    <View style={{ marginBottom: 14 }}>
                        <Text style={styles.label}>Blood Group *</Text>

                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={form.bloodGroup}
                                onValueChange={(value) => handleChange("bloodGroup", value)}
                                style={{ height: 50, color: "#111" }}
                                dropdownIconColor="#111"
                                mode="dropdown"
                                enabled={edit}
                            >
                                <Picker.Item label="Select Blood Group" value="" />
                                <Picker.Item label="A+" value="A+" />
                                <Picker.Item label="A-" value="A-" />
                                <Picker.Item label="B+" value="B+" />
                                <Picker.Item label="B-" value="B-" />
                                <Picker.Item label="AB+" value="AB+" />
                                <Picker.Item label="AB-" value="AB-" />
                                <Picker.Item label="O+" value="O+" />
                                <Picker.Item label="O-" value="O-" />
                            </Picker>
                        </View>
                    </View>

                    <View style={{ marginBottom: 14 }}>
                        <Text style={styles.label}>Date of Birth *</Text>

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
                                    color: form.dob ? "#111827" : "#6B7280",
                                    fontSize: 14,
                                }}
                            >
                                {form.dob || "Select date"}
                            </Text>
                        </TouchableOpacity>

                        {errors.dob && (
                            <Text style={{ color: "red", fontSize: 11 }}>
                                {errors.dob}
                            </Text>
                        )}
                    </View>
                    <Modal visible={showDatePicker} transparent animationType="slide">
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: "flex-end" }}
                            activeOpacity={1}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.dateModalContainer}>
                                <DateTimePicker
                                    value={form.dob ? new Date(form.dob) : new Date()}
                                    mode="date"
                                    display="spinner"
                                    maximumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        if (event.type === "set" && selectedDate) {
                                            const formatted = selectedDate.toISOString().split("T")[0];

                                            handleChange("dob", formatted);

                                            setShowDatePicker(false);
                                        } else {
                                            setShowDatePicker(false);
                                        }
                                    }}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    <Input label="Address Line 1 *" value={form.addr1} editable={edit} error={errors.addr1}
                        onChangeText={(v: any) => setForm({ ...form, addr1: v })} />

                    <Input label="Address Line 2" value={form.addr2} editable={edit}
                        onChangeText={(v: any) => setForm({ ...form, addr2: v })} />

                    <CityStatePin
                        form={form}
                        setForm={setForm}
                        setErrors={setErrors}
                        errors={errors}
                        mode={edit ? "edit" : "view"}   // ✅ IMPORTANT
                    />

                    <Input
                        label="Aadhaar Number *"
                        value={form.aadhaar}
                        editable={edit}
                        error={errors.aadhaar}
                        keyboardType="numeric"
                        onChangeText={(v: any) =>
                            handleChange("aadhaar", v, { numeric: true, maxLength: 12 })
                        }
                    />

                    <Input
                        label="PAN Number *"
                        value={form.pan}
                        editable={edit}
                        error={errors.pan}
                        autoCapitalize="characters"
                        onChangeText={(v: any) =>
                            handleChange("pan", v, { uppercase: true, maxLength: 10 })
                        }
                    />
                    <Input label="Introduction *" value={form.summary} editable={edit} multiline error={errors.summary}
                        onChangeText={(v: any) => setForm({ ...form, summary: v })} />
                </View>

                {/* CONTACT */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Contact</Text>

                    <Input label="Email *" value={form.email} editable={edit} error={errors.email}
                        onChangeText={(v: any) =>
                            handleChange("email", v)
                        } />

                    <Input
                        label="Mobile Number *"
                        value={form.phone}
                        editable={edit}
                        error={errors.phone}
                        keyboardType="numeric"
                        onChangeText={(v: any) =>
                            handleChange("phone", v, { numeric: true, maxLength: 10 })
                        }
                    />
                    <Input
                        label="Alternate Mobile"
                        value={form.altPhone}
                        editable={edit}
                        keyboardType="numeric"
                        onChangeText={(v: any) =>
                            handleChange("altPhone", v, { numeric: true, maxLength: 10 })
                        }
                    />
                </View>

                {/* DOCUMENTS */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Documents</Text>

                    <DocumentField
                        label="Profile Photo"
                        file={form.photo}
                        edit={edit}
                        setViewer={setViewer}
                        onPick={pickImage}
                        isImageOnly
                    />

                    <DocumentField
                        label="Aadhaar"
                        file={form.aadhaarFile}
                        edit={edit}
                        setViewer={setViewer}
                        onPick={() => pickDocument("aadhaarFile")}
                    />

                    <DocumentField
                        label="PAN"
                        file={form.panFile}
                        edit={edit}
                        setViewer={setViewer}
                        onPick={() => pickDocument("panFile")}
                    />
                </View>

                {/* IMAGE MODAL */}
                <Modal visible={viewer.visible} transparent>
                    <View style={styles.modalOverlay}>
                        {viewer.type === "image" && (
                            <View style={styles.imageContainer}>
                               {viewer.data && (
  <Image
    source={{ uri: viewer.data as string }}
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
                        )}
                    </View>
                </Modal>
                <Modal visible={successModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.successBox}>
                            <Text style={styles.successTitle}>Success</Text>
                            <Text style={styles.successText}>
                                Profile updated successfully
                            </Text>

                            <TouchableOpacity
                                style={styles.successBtn}
                                onPress={() => setSuccessModal(false)}
                            >
                                <Text style={{ color: "#fff" }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

            {/* BOTTOM UPDATE BUTTON */}
            {edit && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveText}>
                            {loading ? "Updating..." : "Update"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}

function Input({ label, value, editable, onChangeText, error, multiline = false }: any) {
    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    error && { borderWidth: 1, borderColor: "red" },
                    !editable && { opacity: 0.6 },
                ]}
                value={value}
                editable={editable}
                onChangeText={onChangeText}
                multiline={multiline}
            />

            {error && (
                <Text style={{ color: "red", fontSize: 11, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );
}

function DocButton({ label }: any) {
    return (
        <TouchableOpacity style={styles.docBtn}>
            <Text style={styles.docText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#F1F5F9",
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
    },
    docBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 10,
    },

    docTextField: {
        color: "#64748B",
        fontSize: 13,
    },
    headerWrapper: {
        backgroundColor: "#fff",

        paddingTop: StatusBar.currentHeight || 0, // ✅ THIS FIXES IT

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
        padding: 20,
        borderRadius: 14,
        width: "80%",
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
    docRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    dateModalContainer: {
  backgroundColor: "#fff",
  padding: 10,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 12,
        borderTopWidth: 1,
        borderColor: "#E2E8F0",
    },


    saveText: {
        color: "#fff",
        fontWeight: "600",
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
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
    },
    label: {
        fontSize: 13,
        color: "#334155",
        marginBottom: 6,
        marginTop: 10,
        fontWeight: "500",
    },

    pickerContainer: {
        backgroundColor: "#F1F5F9",
        borderRadius: 10,
        justifyContent: "center",
        height: 50,
        overflow: "hidden",
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
  
});
function DocumentField({
    label,
    file,
    edit,
    setViewer,
    onPick,
    isImageOnly = false,
}: any) {

    const isPdf =
        file?.startsWith("JVBER") ||
        file?.includes("application/pdf");

    const handleView = async () => {
        if (!file) return;

        try {
            if (isPdf) {
                const fileUri =
                    FileSystem.cacheDirectory +
                    `${label.replace(/\s/g, "_")}.pdf`;

                await FileSystem.writeAsStringAsync(fileUri, file, {
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
                const imageUri = file.startsWith("data:")
                    ? file
                    : `data:image/png;base64,${file}`;

                setViewer({
                    visible: true,
                    type: "image",
                    data: imageUri,
                });
            }
        } catch (e) {
            console.log("View failed", e);
        }
    };

    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.docBox}>

                {/* LEFT SIDE */}
                {file ? (
                    isPdf ? (
                        <Text style={styles.docTextField}>PDF Uploaded</Text>
                    ) : (
                        <Image
                            source={{
                                uri: file.startsWith("data:")
                                    ? file
                                    : `data:image/png;base64,${file}`,
                            }}
                            style={{ width: 40, height: 40, borderRadius: 6 }}
                        />
                    )
                ) : (
                    <Text style={styles.docTextField}>
                        {edit ? "Select file..." : "No document available"}
                    </Text>
                )}

                {/* RIGHT SIDE */}
                {file && (
                    <TouchableOpacity style={styles.viewBtn} onPress={handleView}>
                        <Text style={styles.viewText}>View</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* EDIT MODE INPUT */}
            {edit && (
                <TouchableOpacity style={styles.uploadBtn} onPress={onPick}>
                    <Text style={styles.uploadText}>
                        {file ? "Replace File" : isImageOnly ? "Upload Image" : "Upload File"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
