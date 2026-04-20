// import AppHeader from "@/src/shared/components/AppHeader";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function PersonalDetailsScreen() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         showsVerticalScrollIndicator={false}
//       >

//         {/* HEADER */}
//         <AppHeader
//   title="Personal Information"
//   subtitle="Manage your personal details"
//   icon="person-outline"
//   actionText="Edit"
//   onActionPress={() => {}}
// />

//         {/* PERSONAL DETAILS */}
//         <View style={styles.card}>
//           <Input label="Full Name *" value="Aman" />
//           <Input label="Gender *" value="Male" />
//           <Input label="Blood Group" value="A+" />
//           <Input label="Date of Birth *" value="23-02-2026" />
//           <Input label="Address Line 1 *" value="jh" />
//           <Input label="Address Line 2" value="" />
//           <Input label="City *" value="Purani Bajar" />
//           <Input label="State *" value="Bihar" />
//           <Input label="PIN Code *" value="811311" />
//           <Input label="Aadhaar Number *" value="151848489494" />
//           <Input label="PAN Number *" value="ABCDE3432D" />
//           <Input label="Introduction *" value="jkfjrjrn" multiline />
//         </View>

//         {/* CONTACT */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Contact</Text>
//           <Input label="Email *" value="aman@gmail.com" />
//           <Input label="Mobile Number *" value="9874845648" />
//           <Input label="Alternate Mobile" value="" />
//         </View>

//         {/* DOCUMENTS */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Documents</Text>

//           <DocButton label="View Profile Photo" />
//           <DocButton label="View Aadhaar" />
//           <DocButton label="View PAN" />
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

//   textArea: {
//     height: 80,
//     textAlignVertical: "top",
//   },

//   docBtn: {
//     backgroundColor: "#0F766E",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 10,
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
//   },

//   saveText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });
// function Input({
//   label,
//   value,
//   multiline = false,
// }: {
//   label: string;
//   value: string;
//   multiline?: boolean;
// }) {
//   return (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput
//         style={[styles.input, multiline && styles.textArea]}
//         value={value}
//         editable={false}
//         multiline={multiline}
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
//src/features/doctor/screens/PersonalDetailsScreen.tsx
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
    ActivityIndicator,
} from "react-native";
import { useContext } from "react";
import { AuthContext } from "@/src/core/context/AuthContext";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import CityStatePin from "@/src/shared/components/CityAutocomplete";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
// import Pdf from "react-native-pdf";
import { useCallback } from "react";
import * as IntentLauncher from "expo-intent-launcher";


export default function PersonalDetailsScreen() {
    const [edit, setEdit] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [successModal, setSuccessModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [viewing, setViewing] = useState(false);
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
    const auth = useContext(AuthContext);
    const vendorId = auth?.user?.vendorId;
    const token = auth?.user?.token;
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
        photo: { uri: string | null, preview: string | null },
        aadhaarFile: { uri: string | null, preview: string | null },
        panFile: { uri: string | null, preview: string | null },
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
        photo: { uri: null, preview: null },
        aadhaarFile: { uri: null, preview: null },
        panFile: { uri: null, preview: null },
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
        if (!form.phone) e.phone = "Phone required";
        else if (!/^\d{10}$/.test(form.phone))
            e.phone = "Must be exactly 10 digits";

        if (!form.aadhaar) e.aadhaar = "Aadhaar required";
        else if (!/^\d{12}$/.test(form.aadhaar))
            e.aadhaar = "Must be exactly 12 digits";

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
        if (!form.photo?.uri && !form.photo?.preview)
            e.photo = "Photo required";

        if (!form.aadhaarFile?.uri && !form.aadhaarFile?.preview)
            e.aadhaarFile = "Aadhaar file required";

        if (!form.panFile?.uri && !form.panFile?.preview)
            e.panFile = "PAN file required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.5,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            const fileInfo: any = await FileSystem.getInfoAsync(asset.uri);

            if (fileInfo.size && fileInfo.size > 200 * 1024) {
                Alert.alert("Error", "Photo must be under 200KB");
                return;
            }

            setForm(prev => ({
                ...prev,
                photo: {
                    uri: asset.uri,
                    preview: null
                }
            }));

            setErrors((prev: any) => {
                const copy = { ...prev };
                delete copy.photo;
                return copy;
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
        // ✅ ONLY STORE URI
        setForm(prev => ({
            ...prev,
            [field]: {
                uri: file.uri,
                preview: null
            }
        }));

        setErrors((prev: any) => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });

    };

    const handleChange = (field: string, value: any, options?: any) => {
        let finalValue = value;

        if (options?.numeric) {
            finalValue = value.replace(/[^0-9]/g, "");
        }
        if (options?.uppercase) {
            finalValue = finalValue.toUpperCase();
        }

        if (options?.maxLength) {
            finalValue = finalValue.slice(0, options.maxLength);
        }
        setForm((prev) => ({
            ...prev,
            [field]: finalValue,
        }));

        setErrors((prev: any) => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (successModal) {
            const timer = setTimeout(() => {
                setSuccessModal(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [successModal]);

    const base64ToLocalFile = async (base64: string, filename: string) => {
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        // delete old file if exists
        await FileSystem.deleteAsync(fileUri, { idempotent: true });

        await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: "base64",
        });

        return fileUri;
    };

    const fetchData = async () => {
        try {
            setInitialLoading(true);


            const res = await fetch(
                `https://coreapi-service-111763741518.asia-south1.run.app/api/Doctor/GetDoctorById/${vendorId}`
            );

            const data = await res.json();

            const docs = data.doctorDocs?.[0] || {};

            const photoUri = docs.photo
                ? await base64ToLocalFile(docs.photo, "photo.jpg")
                : null;
            const isAadhaarPdf = docs.adhaar?.startsWith("JVBER");

            const aadhaarUri = docs.adhaar
                ? await base64ToLocalFile(
                    docs.adhaar,
                    isAadhaarPdf ? "aadhaar.pdf" : "aadhaar.jpg"
                )
                : null;

            const isPanPdf = docs.pan?.startsWith("JVBER");

            const panUri = docs.pan
                ? await base64ToLocalFile(
                    docs.pan,
                    isPanPdf ? "pan.pdf" : "pan.jpg"
                )
                : null;

            setForm(prev => ({
                ...prev,
                name: data.full_Name || "",
                gender: data.gender || "",
                bloodGroup: data.bloodG || "",
                dob: data.dob || "",
                addr1: data.adrs_1 || "",
                addr2: data.adrs_2 || "",
                city: data.city || "",
                state: data.state || "",
                pin: data.pin_code || "",
                aadhaar: String(data.adhaarNo || data.aadharNo || ""),
                pan: String(data.panNo || ""),
                summary: data.summary || "",
                email: data.email || "",
                phone: data.mobile || "",
                altPhone: data.mobile_1 || "",

                photo: { uri: photoUri, preview: null },
                aadhaarFile: { uri: aadhaarUri, preview: null },
                panFile: { uri: panUri, preview: null },
            }));

        } catch (err) {
            console.log("Fetch Error:", err);
        } finally {
            setInitialLoading(false);
        }
    };
    const handleEdit = () => {
        if (editLoading || saving || initialLoading || successModal) return;

        setEditLoading(true);

        setShowCityDropdown(false);

        setEdit(prev => !prev);

        setTimeout(() => {
            setEditLoading(false);
        }, 400);

    };

    const uriToFile = async (uri: string, name: string) => {
        const fileInfo = await FileSystem.getInfoAsync(uri);

        return {
            uri,
            name,
            type: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
        } as any;
    };

    const base64ToFile = async (dataUrl: string, filename: string) => {
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        const base64 = dataUrl.replace(/^data:.*;base64,/, "");

        await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: "base64",
        });

        return {
            uri: fileUri,
            name: filename,
            type: filename.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
        } as any;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            if (!vendorId || !token) {
                Alert.alert("Error", "Session expired");
                return;
            }
            setSaving(true);

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
            body.append("adhaarNo", form.aadhaar);
            body.append("panNo", form.pan);
            const getFileName = (base64: string, name: string) => {
                const isPdf = base64.startsWith("data:application/pdf") || base64.startsWith("JVBER");
                return isPdf ? `${name}.pdf` : `${name}.jpg`;
            };
            // ✅ PHOTO (always image)
            // ✅ PHOTO
            if (form.photo?.uri) {
                body.append("photo", await uriToFile(form.photo.uri, "photo.jpg"));
            } else if (form.photo?.preview) {
                body.append("photo", await base64ToFile(form.photo.preview, "photo.jpg"));
            }

            // AADHAAR
            if (form.aadhaarFile?.uri) {
                body.append("adhaar", await uriToFile(form.aadhaarFile.uri, "aadhaar.jpg"));
            } else if (form.aadhaarFile?.preview) {
                body.append("adhaar", await base64ToFile(form.aadhaarFile.preview, "aadhaar.jpg"));
            }

            // PAN
            if (form.panFile?.uri) {
                body.append("pan", await uriToFile(form.panFile.uri, "pan.jpg"));
            } else if (form.panFile?.preview) {
                body.append("pan", await base64ToFile(form.panFile.preview, "pan.jpg"));
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
            setSaving(false);
        }
    };

    if (initialLoading) {
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
                    title="Personal Information"
                    subtitle={edit ? "Edit your details" : "Manage your personal details"}
                    icon="person-outline"
                    actionText={edit ? "Cancel" : "Edit"}
                    onActionPress={handleEdit}
                    disabled={editLoading || saving}
                />
            </View>
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Input label="Full Name *" value={form.name} editable={edit} error={errors.name}
                        onChangeText={(v: string) => handleChange("name", v)} />


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
                                <Picker.Item label="Male" value="M" />
                                <Picker.Item label="Female" value="F" />
                                <Picker.Item label="Other" value="O" />
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
                        onChangeText={(v: any) =>
                            setForm((prev) => ({ ...prev, addr1: v }))
                        } />

                    <Input label="Address Line 2" value={form.addr2} editable={edit}
                        onChangeText={(v: any) =>
                            setForm((prev) => ({ ...prev, addr2: v }))
                        } />

                    <CityStatePin
                        form={form}
                        setForm={setForm}
                        setErrors={setErrors}
                        errors={errors}
                        mode={edit ? "edit" : "view"}
                        showDropdown={showCityDropdown}
                        setShowDropdown={setShowCityDropdown}
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
                        onChangeText={(v: any) =>
                            setForm((prev) => ({ ...prev, summary: v }))
                        } />
                </View>
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

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <DocumentField
                        label="Photo *"
                        file={form.photo}
                        error={errors.photo}
                        edit={edit}
                        setViewer={setViewer}
                        onPick={pickImage}
                        isImageOnly
                        viewing={viewing}
                        setViewing={setViewing}
                    />

                    <DocumentField
                        label="Aadhaar *"
                        file={form.aadhaarFile}
                        error={errors.aadhaarFile}
                        edit={edit}
                        setViewer={setViewer}
                        onPick={() => pickDocument("aadhaarFile")}
                        viewing={viewing}
                        setViewing={setViewing}
                    />

                    <DocumentField
                        label="PAN *"
                        file={form.panFile}
                        error={errors.panFile}
                        edit={edit}
                        setViewer={setViewer}
                        onPick={() => pickDocument("panFile")}
                        viewing={viewing}
                        setViewing={setViewing}
                    />
                </View>

                <Modal visible={viewer.visible} transparent>
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
                            </View>
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
                </Modal>
                <Modal visible={successModal} transparent animationType="fade">
                    <View style={modalStyles.overlay}>
                        <View style={modalStyles.card}>

                            <View style={modalStyles.iconWrapper}>
                                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                            </View>

                            <Text style={modalStyles.title}>Success!</Text>

                            <Text style={modalStyles.subtitle}>
                                Your profile has been updated successfully.
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
            </ScrollView>
            {edit && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={saving || initialLoading}
                    >
                        <Text style={styles.saveText}>   {saving ? "Updating..." : "Update"}</Text>
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
function DocumentField({
    label,
    file,
    error, // ✅ ADD THIS
    edit,
    setViewer,
    onPick,
    isImageOnly = false,
    viewing,
    setViewing,
}: any) {

    // ✅ normalize file
    const fileUri = file?.uri || file?.preview;

    // ✅ detect PDF
    const isPdf =
        fileUri?.endsWith(".pdf") ||
        fileUri?.includes("application/pdf");

    const handleView = async () => {
        if (!fileUri) return;

        // IMAGE
        if (!isPdf) {
            setViewer({
                visible: true,
                type: "image",
                data: fileUri,
            });
            return;
        }

        // PDF
        if (viewing) return;
        setViewing(true);

        try {
            let contentUri = fileUri;

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
            Alert.alert("Error", "Cannot open PDF");
        } finally {
            setViewing(false);
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
                            style={{ width: 40, height: 40 }}
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
                        {fileUri
                            ? "Replace File"
                            : isImageOnly
                                ? "Upload Image"
                                : "Upload File"}
                    </Text>
                </TouchableOpacity>

            )}
            {error && (
                <Text style={{ color: "red", fontSize: 11, marginTop: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );
}