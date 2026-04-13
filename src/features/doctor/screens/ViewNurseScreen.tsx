import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import api from "@/src/core/api/apiClient";
import AppHeader from "@/src/shared/components/AppHeader";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { useRouter, useFocusEffect } from "expo-router";
import { BackHandler } from "react-native";
import { useCallback } from "react";
import { ActivityIndicator } from "react-native";


export default function ViewNurseScreen() {
    const { nurseId } = useLocalSearchParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<any[]>([]);
    const [degrees, setDegrees] = useState<any[]>([]);
    const router = useRouter();



    const [viewer, setViewer] = useState<{
        visible: boolean;
        type: "image" | "pdf";
        data: string | null;
    }>({
        visible: false,
        type: "image",
        data: null,
    });

    const Info = ({ label, value }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
                <Text style={styles.label}>{label}</Text>
            </View>

            <View style={styles.infoRight}>
                <Text style={styles.value} numberOfLines={2}>
                    {value || "-"}
                </Text>
            </View>
        </View>
    );
    const getDepartmentName = (id: number) => {
        return departments.find((d) => d.id === id)?.dep_Name || id;
    };

    const getDegreeName = (id: number) => {
        return degrees.find((d) => d.id === Number(id))?.degree_Name || id;
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                router.replace("/(doctor)/nurse-list");
                return true; // prevent default behavior
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [])
    );
    useEffect(() => {
        if (!nurseId) return;

        const loadNurse = async () => {
            try {
                const res = await api.get(`/api/Nurse/GetNurseById/${nurseId}`);
                const n = res.data?.nurse || res.data;

                const mapGender = (g: string) => {
                    return g === "M" ? "Male" : g === "F" ? "Female" : "Other";
                };

                const mapped = {
                    name: n.full_name,
                    gender: mapGender(n.gender),
                    dob: n.dob,
                    email: n.email,
                    phone: n.mobile,
                    altPhone: n.mobile_1,
                    blood: n.bloodG,

                    address1: n.adrs_1,
                    address2: n.adrs_2,
                    city: n.city,
                    state: n.state,
                    pin: n.pin_code,
                    summary: n.summary,

                    pan: n.panNo,
                    aadhaar: n.adhaarNo,

                    qualification: n.qualification,
                    experience: n.exp,
                    registrationNo: n.registrationNo,
                    registrationDate: n.registrationDate,
                    department: n.dep_id,

                    shift: n.shift,
                    shiftChange: n.shiftchange,

                    linkedWith: n.nurseLinked?.linked_with,
                    linkedId: n.nurseLinked?.linked_id,
                    isApproved: n.nurseLinked?.is_approved,

                    panFile: n.nurseIMG?.[0]?.pan || null,
                    aadhaarFile: n.nurseIMG?.[0]?.adhaar || null,
                    licenseFile: n.nurseIMG?.[0]?.license || null,

                    photo: n.nurseIMG?.[0]?.photo
                        ? `data:image/png;base64,${n.nurseIMG[0].photo}`
                        : null,
                };

                setData(mapped);
            } catch (e) {
                console.log("Failed to load nurse");
            } finally {
                setLoading(false);
            }
        };

        loadNurse();
    }, [nurseId]);

    useEffect(() => {
        const loadMasters = async () => {
            try {
                const [depRes, degRes] = await Promise.all([
                    api.get("/api/Doctor/GetDeprt_Doc"),
                    api.get("/api/Doctor/GetDegree"),
                ]);

                setDepartments(depRes.data || []);
                setDegrees(degRes.data || []);
            } catch (e) {
                console.log(" Failed to load masters");
            }
        };

        loadMasters();
    }, []);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0F766E" />
                <Text style={styles.loaderText}>Loading nurse details...</Text>
            </View>
        );
    }
    if (!data) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Nurse not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1 }}>

            <View style={styles.headerWrapper}>
                <AppHeader
                    title="View Nurse"
                    subtitle="View Nurse Information"
                    icon="person-outline"
                />
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.profileCard}>
                    <View style={styles.profileRow}>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                                if (data.photo) {
                                    setViewer({
                                        visible: true,
                                        type: "image",
                                        data: data.photo,
                                    });
                                }
                            }}
                        >
                            {data.photo ? (
                                <Image source={{ uri: data.photo }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarText}>
                                        {data.name?.charAt(0)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{data.name}</Text>
                            <Text style={styles.sub}>
                                {data.gender} • {data.dob}
                            </Text>

                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    {data.isApproved === "Y" ? "Approved" : "Pending"}
                                </Text>
                            </View>
                        </View>

                    </View>
                </View>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>

                    <Info label="Email" value={data.email} />
                    <Info label="Phone" value={data.phone} />
                    <Info label="Alt Phone" value={data.altPhone} />
                    <Info label="Blood Group" value={data.blood} />

                    <Info label="Address" value={`${data.address1}, ${data.city}`} />
                    <Info label="State" value={data.state} />
                    <Info label="PIN" value={data.pin} />

                    <Info label="PAN" value={data.pan} />
                    <Info label="Aadhaar" value={data.aadhaar} />

                    <Info label="Summary" value={data.summary} />
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Professional Information</Text>
                    </View>

                    <Info label="Department" value={getDepartmentName(data.department)} />
                    <Info label="Qualification" value={getDegreeName(data.qualification)} />
                    <Info label="Experience" value={`${data.experience} yrs`} />

                    <Info label="Registration No" value={data.registrationNo} />
                    <Info label="Registration Date" value={data.registrationDate} />

                    <Info label="Shift" value={data.shift || "-"} />
                    <Info label="Shift Change Days" value={data.shiftChange} />

                    <Info
                        label="Linked With"
                        value={
                            data.linkedWith === "D"
                                ? "Doctor"
                                : data.linkedWith === "H"
                                    ? "Hospital"
                                    : "-"
                        }
                    />

                    <Info label="Linked ID" value={data.linkedId} />

                    <Info
                        label="Approval Status"
                        value={data.isApproved === "Y" ? "Approved" : "Pending"}
                    />
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Documents</Text>
                    </View>

                    <DocumentView
                        label="PAN Document"
                        file={data.panFile}
                        setViewer={setViewer}
                    />
                    <DocumentView label="Aadhaar Document" file={data.aadhaarFile} setViewer={setViewer} />
                    <DocumentView label="Registration Certificate" file={data.licenseFile} setViewer={setViewer} />
                </View>

                <Modal visible={viewer.visible} transparent>
                    <View style={styles.modalOverlay}>


                        {viewer.type === "image" && (
                            <View style={styles.imageContainer}>

                                <Image
                                    source={{ uri: viewer.data! }}
                                    style={styles.fullImage}
                                    resizeMode="contain"
                                />
                                <TouchableOpacity
                                    style={styles.closeBtnDynamic}
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
            </ScrollView>
        </View>
    );
}

const Info = ({ label, value }: any) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "-"}</Text>
    </View>
);
const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 12,
        backgroundColor: "#F1F5F9",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        height: 56,
        paddingHorizontal: 16,

        marginBottom: 12,
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
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },

    subtitle: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    section: {
        fontWeight: "700",
        marginBottom: 12,
        fontSize: 14,
        color: "#0F172A",
    },

    row: {
        marginBottom: 10,
        borderBottomWidth: 0.5,
        borderColor: "#E2E8F0",
        paddingBottom: 6,
    },

    left: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },



    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },

    fullImage: {
        width: "100%",
        height: "80%",
    },

    imageContainer: {
        width: "100%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },

    closeBtnDynamic: {
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
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },

    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },

    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },

    avatarFallback: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#0F766E",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },

    sub: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 2,
    },

    statusBadge: {
        marginTop: 6,
        alignSelf: "flex-start",
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    statusText: {
        color: "#166534",
        fontSize: 12,
        fontWeight: "600",
    },

    sectionHeader: {
        marginBottom: 10,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#F1F5F9",
    },

    infoLeft: {
        flex: 1,
    },

    infoRight: {
        flex: 1,
        alignItems: "flex-end",
    },

    label: {
        fontSize: 12,
        color: "#64748B",
    },

    value: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
        textAlign: "right",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        elevation: 1,
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
});
const DocumentView = ({ label, file, setViewer }: any) => {
    if (!file) return <Info label={label} value="Not Available" />;

    const isPdf = file.startsWith("JVBER");

    const handleView = async () => {
        try {
            if (isPdf) {
                const fileUri =
                    FileSystem.cacheDirectory +
                    `${label.replace(/\s/g, "_")}.pdf`;

                await FileSystem.writeAsStringAsync(fileUri, file.trim(), {
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
                setViewer({
                    visible: true,
                    type: "image",
                    data: `data:image/png;base64,${file}`,
                });
            }
        } catch (e) {
            console.log(" Document open failed", e);
        }
    };
    return (
        <View style={styles.docRow}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity style={styles.viewBtn} onPress={handleView}>
                <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
        </View>
    );
};