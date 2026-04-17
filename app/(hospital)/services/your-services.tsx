// import React, { useState, useCallback, useContext } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { useRouter, useFocusEffect } from "expo-router";
// import {
//   Colors,
//   FontFamily,
//   FontSize,
//   Spacing,
//   Radius,
//   Shadow,
//   ButtonSize,
// } from "@/src/shared/constants/theme";
// import { Department } from "@/src/features/services/constants/departments";
// import { AuthContext } from "@/src/core/context/AuthContext";
// import api from "@/src/core/api/apiClient";

// export default function YourServicesScreen() {
//   const router = useRouter();
//   const auth = useContext(AuthContext);
//   const vendorId = auth?.user?.vendorId;
//   const [services, setServices] = useState<Department[]>([]);
//   const [loading, setLoading] = useState(true);

//   // useFocusEffect(
//   //   useCallback(() => {
//   //     let active = true;
//   //     setLoading(true);
//   //     loadSelectedServices().then((ids) => {
//   //       if (!active) return;
//   //       if (ids.length === 0) {
//   //         // router.replace('/(hospital)/services/select');
//   //         router.replace('/services/select');
//   //         return;
//   //       }
//   //       const depts = ids
//   //         .map((id) => DEPARTMENTS.find((d) => d.id === id))
//   //         .filter((d): d is Department => !!d);
//   //       setServices(depts);
//   //       setLoading(false);
//   //     });
//   //     return () => {
//   //       active = false;
//   //     };
//   //   }, [])
//   // );
//   useFocusEffect(
//     useCallback(() => {
//       if (vendorId) {
//         loadServices();
//       }
//     }, [vendorId]),
//   );
//   const getDepartmentIcon = (name: string): string => {
//     const n = name?.toLowerCase() || "";
//     if (n.includes("cardio") || n.includes("heart")) return "favorite";
//     if (n.includes("dent") || n.includes("oral")) return "coronavirus";
//     if (n.includes("neuro") || n.includes("brain")) return "device-hub";
//     if (n.includes("pediatr") || n.includes("child")) return "child-friendly";
//     if (n.includes("ent") || n.includes("ear") || n.includes("throat"))
//       return "hearing";
//     if (n.includes("radio") || n.includes("xray") || n.includes("scan"))
//       return "image-search";
//     if (n.includes("ortho") || n.includes("bone") || n.includes("joint"))
//       return "accessible";
//     if (n.includes("physio") || n.includes("rehab")) return "self-improvement";
//     if (n.includes("psych") || n.includes("mental")) return "psychology-alt";
//     if (n.includes("gynec") || n.includes("women")) return "pregnant-woman";
//     if (n.includes("ophthal") || n.includes("eye")) return "visibility";
//     if (n.includes("dermat") || n.includes("skin")) return "face";
//     if (n.includes("oncol") || n.includes("cancer")) return "biotech";
//     if (n.includes("urol") || n.includes("kidney")) return "water-drop";
//     if (n.includes("general") || n.includes("medicine"))
//       return "local-hospital";
//     return "medical-services"; // default
//   };
//   const loadServices = async () => {
//     try {
//       setLoading(true);

//       // 1️⃣ Get selected departments (IDs)
//       const hospitalRes = await api.get(
//         `/api/Hospital/GetHospitalById/${vendorId}`,
//       );

//       const selectedIds: number[] =
//         hospitalRes.data?.departments || hospitalRes.data?.dept_ids || [];

//       console.log("Hospital selectedIds:", selectedIds);

//       // 2️⃣ Get all departments
//       const deptRes = await api.get("/api/Hospital/GetDeprt_HOSP");
//       const allDepts = deptRes.data || [];

//       // 3️⃣ Map IDs → full department objects
//       // const mapped = selectedIds
//       //   .map((id: any) =>
//       //     allDepts.find((d: any) => String(d.id) === String(id)),
//       //   )
//       //   .filter(Boolean)
//       //   .map((d: any) => ({
//       //     id: String(d.id),
//       //     name: d.dep_name,
//       //     specialty: d.specialty || '',
//       //     description: d.description || '',
//       //     icon: 'medical-services',
//       //   }));
//       const mapped = selectedIds
//         .map((id: any) =>
//           allDepts.find((d: any) => String(d.id) === String(id)),
//         )
//         .filter(Boolean)
//         .map((d: any) => ({
//           id: String(d.id),
//           name: d.dep_name,
//           specialty: d.specialty || "",
//           description: d.description || "",
//           icon: getDepartmentIcon(d.dep_name), // ✅ dynamic icon
//         }));

//       setServices(mapped);
//     } catch (err) {
//       console.log("❌ Service load error", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View
//           style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//         >
//           <ActivityIndicator size="large" color={Colors.light.primary} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (services.length === 0) {
//     router.replace("/(hospital)/services/select");
//     return null;
//   }

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top"]}>
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header row */}
//         <Text style={styles.overviewLabel}>OVERVIEW</Text>
//         <View style={styles.titleRow}>
//           <Text style={styles.title}>Your Services</Text>
//           <TouchableOpacity
//             style={styles.editBtn}
//             onPress={() => router.push("/(hospital)/services/select")}
//             activeOpacity={0.75}
//           >
//             <MaterialIcons name="edit" size={14} color={Colors.light.primary} />
//             <Text style={styles.editBtnText}>Edit</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Service list */}
//         <View style={styles.serviceList}>
//           {services.map((dept, index) => (
//             <React.Fragment key={dept.id}>
//               <View style={styles.serviceRow}>
//                 <View style={styles.iconWrap}>
//                   <MaterialIcons
//                     name={dept.icon as any}
//                     size={22}
//                     color={Colors.light.primary}
//                   />
//                 </View>
//                 <View style={styles.serviceText}>
//                   <Text style={styles.serviceName}>{dept.name}</Text>
//                   <Text style={styles.serviceDesc}>{dept.description}</Text>
//                 </View>
//                 <MaterialIcons
//                   name="north-east"
//                   size={18}
//                   color={Colors.light.onSurfaceVariant}
//                   style={styles.arrowIcon}
//                 />
//               </View>
//               {index < services.length - 1 && <View style={styles.divider} />}
//             </React.Fragment>
//           ))}
//         </View>

//         {/* General Care card */}
//         <View style={styles.generalCareCard}>
//           <TouchableOpacity style={styles.generalCarePlus} activeOpacity={0.7}>
//             <MaterialIcons name="add" size={20} color="#fff" />
//           </TouchableOpacity>
//           <View style={styles.generalCareIcon}>
//             <MaterialIcons name="medical-services" size={24} color="#fff" />
//           </View>
//           <Text style={styles.generalCareTitle}>General Care</Text>
//           <Text style={styles.generalCareDesc}>
//             Routine checkups and medical consultations.
//           </Text>
//         </View>

//         {/* Urgent consultation banner */}
//         <View style={styles.urgentBanner}>
//           <View style={styles.urgentText}>
//             <Text style={styles.urgentTitle}>Need an urgent consultation?</Text>
//             <Text style={styles.urgentDesc}>
//               Connect with our top specialists in minutes.
//             </Text>
//           </View>
//           <TouchableOpacity style={styles.bookNowBtn} activeOpacity={0.8}>
//             <Text style={styles.bookNowText}>Book Now</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={{ height: Spacing.lg }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: Colors.light.surface,
//   },
//   scroll: { flex: 1 },
//   scrollContent: {
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.md,
//   },

//   overviewLabel: {
//     fontFamily: FontFamily.label,
//     fontSize: FontSize.labelSmall,
//     color: Colors.light.outline,
//     letterSpacing: 1.2,
//     marginBottom: Spacing.xs,
//   },
//   titleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: Spacing.lg,
//   },
//   title: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.headlineLarge,
//     color: Colors.light.onSurface,
//   },
//   editBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.xl,
//     paddingVertical: 8,
//     paddingHorizontal: Spacing.md,
//     ...Shadow.subtle,
//   },
//   editBtnText: {
//     fontFamily: FontFamily.bodyMedium,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.primary,
//   },

//   serviceList: {
//     backgroundColor: Colors.light.surfaceContainerLowest,
//     borderRadius: Radius.xl,
//     paddingHorizontal: Spacing.md,
//     marginBottom: Spacing.md,
//     ...Shadow.card,
//   },
//   serviceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: Spacing.md,
//   },
//   iconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: Radius.md,
//     backgroundColor: Colors.light.primaryFixed,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: Spacing.md,
//     flexShrink: 0,
//   },
//   serviceText: {
//     flex: 1,
//   },
//   serviceName: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.titleLarge,
//     color: Colors.light.onSurface,
//     marginBottom: 2,
//   },
//   serviceDesc: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodySmall,
//     color: Colors.light.onSurfaceVariant,
//     lineHeight: 18,
//   },
//   arrowIcon: {
//     marginLeft: Spacing.sm,
//     alignSelf: "flex-start",
//     marginTop: 2,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: Colors.light.outlineVariant,
//     marginLeft: 64,
//   },

//   generalCareCard: {
//     backgroundColor: Colors.light.primary,
//     borderRadius: Radius.xl,
//     padding: Spacing.md,
//     marginBottom: Spacing.md,
//     minHeight: 110,
//     justifyContent: "flex-end",
//     ...Shadow.card,
//   },
//   generalCarePlus: {
//     position: "absolute",
//     top: Spacing.md,
//     right: Spacing.md,
//     width: 32,
//     height: 32,
//     borderRadius: Radius.full,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   generalCareIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: Radius.md,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: Spacing.sm,
//   },
//   generalCareTitle: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.titleLarge,
//     color: "#fff",
//     marginBottom: 2,
//   },
//   generalCareDesc: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodySmall,
//     color: "rgba(255,255,255,0.8)",
//   },

//   urgentBanner: {
//     backgroundColor: Colors.light.inverseSurface,
//     borderRadius: Radius.xl,
//     padding: Spacing.md,
//     flexDirection: "column",
//     gap: Spacing.md,
//   },
//   urgentText: {
//     flex: 1,
//   },
//   urgentTitle: {
//     fontFamily: FontFamily.headline,
//     fontSize: FontSize.titleLarge,
//     color: Colors.light.inverseOnSurface,
//     marginBottom: 4,
//   },
//   urgentDesc: {
//     fontFamily: FontFamily.body,
//     fontSize: FontSize.bodySmall,
//     color: "rgba(238,241,246,0.8)",
//   },
//   bookNowBtn: {
//     alignSelf: "flex-start",
//     borderWidth: 1.5,
//     borderColor: Colors.light.inverseOnSurface,
//     borderRadius: Radius.xl,
//     paddingVertical: 10,
//     paddingHorizontal: Spacing.lg,
//   },
//   bookNowText: {
//     fontFamily: FontFamily.bodySemiBold,
//     fontSize: FontSize.bodyMedium,
//     color: Colors.light.inverseOnSurface,
//   },
// });
import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Colors,
  FontFamily,
  FontSize,
  Spacing,
  Radius,
  Shadow,
} from '@/src/shared/constants/theme';
import { Department } from '@/src/features/services/constants/departments';
import { AuthContext } from '@/src/core/context/AuthContext';
import api from '@/src/core/api/apiClient';

// ── Icon helper ───────────────────────────────────────────────────────────────
const getDepartmentIcon = (name: string): string => {
  const n = name?.toLowerCase() || '';
  if (n.includes('cardio') || n.includes('heart')) return 'favorite';
  if (n.includes('dent') || n.includes('oral')) return 'coronavirus';
  if (n.includes('neuro') || n.includes('brain')) return 'device-hub';
  if (n.includes('pediatr') || n.includes('child')) return 'child-friendly';
  if (n.includes('ent') || n.includes('ear') || n.includes('throat')) return 'hearing';
  if (n.includes('radio') || n.includes('xray') || n.includes('scan')) return 'image-search';
  if (n.includes('ortho') || n.includes('bone') || n.includes('joint')) return 'accessible';
  if (n.includes('physio') || n.includes('rehab')) return 'self-improvement';
  if (n.includes('psych') || n.includes('mental')) return 'psychology-alt';
  if (n.includes('gynec') || n.includes('women')) return 'pregnant-woman';
  if (n.includes('ophthal') || n.includes('eye')) return 'visibility';
  if (n.includes('dermat') || n.includes('skin')) return 'face';
  if (n.includes('oncol') || n.includes('cancer')) return 'biotech';
  if (n.includes('urol') || n.includes('kidney')) return 'water-drop';
  if (n.includes('general') || n.includes('medicine')) return 'local-hospital';
  return 'medical-services';
};

export default function YourServicesScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId;

  const [services, setServices] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ useFocusEffect re-fetches every time screen comes into focus
  // This ensures updated services show after returning from SelectServicesScreen
  useFocusEffect(
    useCallback(() => {
      if (vendorId) {
        loadServices();
      }
    }, [vendorId]),
  );

  const loadServices = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get selected department IDs for this hospital
      const hospitalRes = await api.get(`/api/Hospital/GetHospitalById/${vendorId}`);
      const selectedIds: any[] =
        hospitalRes.data?.departments ||
        hospitalRes.data?.dept_ids ||
        [];

      console.log('Hospital selectedIds:', selectedIds);

      if (selectedIds.length === 0) {
        setServices([]);
        return;
      }

      // 2️⃣ Get all departments
      const deptRes = await api.get('/api/Hospital/GetDeprt_HOSP');
      const allDepts = deptRes.data || [];

      // 3️⃣ Map IDs → full department objects
      // ✅ Match using dep_id || id (same as web version)
      const mapped = selectedIds
        .map((id: any) =>
          allDepts.find(
            (d: any) => String(d.dep_id || d.id) === String(id),
          ),
        )
        .filter(Boolean)
        .map((d: any) => ({
          id: String(d.dep_id || d.id),
          name: d.dep_name,
          specialty: d.specialty || '',
          description: d.description || '',
          icon: getDepartmentIcon(d.dep_name), // ✅ dynamic icon
        }));

      setServices(mapped);
    } catch (err) {
      console.log('❌ Service load error', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (services.length === 0) {
    router.replace('/(hospital)/services/select');
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.overviewLabel}>OVERVIEW</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Your Services</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(hospital)/services/select')}
            activeOpacity={0.75}
          >
            <MaterialIcons name="edit" size={14} color={Colors.light.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Service list */}
        <View style={styles.serviceList}>
          {services.map((dept, index) => (
            <React.Fragment key={dept.id}>
              <View style={styles.serviceRow}>
                <View style={styles.iconWrap}>
                  <MaterialIcons
                    name={dept.icon as any}
                    size={22}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={styles.serviceText}>
                  <Text style={styles.serviceName}>{dept.name}</Text>
                  <Text style={styles.serviceDesc}>{dept.description}</Text>
                </View>
                <MaterialIcons
                  name="north-east"
                  size={18}
                  color={Colors.light.onSurfaceVariant}
                  style={styles.arrowIcon}
                />
              </View>
              {index < services.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* General Care card */}
        <View style={styles.generalCareCard}>
          <TouchableOpacity style={styles.generalCarePlus} activeOpacity={0.7}>
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.generalCareIcon}>
            <MaterialIcons name="medical-services" size={24} color="#fff" />
          </View>
          <Text style={styles.generalCareTitle}>General Care</Text>
          <Text style={styles.generalCareDesc}>
            Routine checkups and medical consultations.
          </Text>
        </View>

        {/* Urgent consultation banner */}
        <View style={styles.urgentBanner}>
          <View style={styles.urgentText}>
            <Text style={styles.urgentTitle}>Need an urgent consultation?</Text>
            <Text style={styles.urgentDesc}>
              Connect with our top specialists in minutes.
            </Text>
          </View>
          <TouchableOpacity style={styles.bookNowBtn} activeOpacity={0.8}>
            <Text style={styles.bookNowText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  overviewLabel: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    color: Colors.light.outline,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineLarge,
    color: Colors.light.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    ...Shadow.subtle,
  },
  editBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.primary,
  },

  serviceList: {
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  serviceText: { flex: 1 },
  serviceName: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
    marginBottom: 2,
  },
  serviceDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 18,
  },
  arrowIcon: { marginLeft: Spacing.sm, alignSelf: 'flex-start', marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: Colors.light.outlineVariant,
    marginLeft: 64,
  },

  generalCareCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 110,
    justifyContent: 'flex-end',
    ...Shadow.card,
  },
  generalCarePlus: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalCareIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  generalCareTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: '#fff',
    marginBottom: 2,
  },
  generalCareDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },

  urgentBanner: {
    backgroundColor: Colors.light.inverseSurface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'column',
    gap: Spacing.md,
  },
  urgentText: { flex: 1 },
  urgentTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.inverseOnSurface,
    marginBottom: 4,
  },
  urgentDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: 'rgba(238,241,246,0.8)',
  },
  bookNowBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: Colors.light.inverseOnSurface,
    borderRadius: Radius.xl,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  bookNowText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.inverseOnSurface,
  },
});
