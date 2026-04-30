// import { Tabs } from "expo-router";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { Colors } from "@/src/shared/constants/theme";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function CleanerLayout() {
//   return (
//     <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
//       <Tabs
//         screenOptions={{
//           headerShown: false,
//           tabBarStyle: {
//             backgroundColor: Colors.light.surfaceContainerLowest,
//             borderTopWidth: 0,
//             elevation: 8,
//             shadowColor: "#006a6a",
//             shadowOpacity: 0.1,
//             shadowRadius: 16,
//             shadowOffset: { width: 0, height: -4 },
//             height: 62,
//             paddingBottom: 8,
//             paddingTop: 6,
//           },
//           tabBarActiveTintColor: Colors.light.primary,
//           tabBarInactiveTintColor: Colors.light.outline,
//           tabBarLabelStyle: {
//             fontFamily: "Inter_500Medium",
//             fontSize: 10,
//             letterSpacing: 0.8,
//             textTransform: "uppercase",
//           },
//         }}
//       >
//         <Tabs.Screen
//           name="home"
//           options={{
//             title: "Home",
//             tabBarIcon: ({ color, size }) => (
//               <MaterialIcons name="home" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="personal/Personal_Details"
//           options={{
//             title: "Profile",
//             tabBarIcon: ({ color, size }) => (
//               <MaterialIcons name="person" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="bankDetails/Bank_Details"
//           options={{
//             title: "Bank",
//             tabBarIcon: ({ color, size }) => (
//               <MaterialIcons name="account-balance" size={size} color={color} />
//             ),
//           }}
//         />
//       </Tabs>
//     </SafeAreaView>
//   );
// }
import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/src/shared/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CleanerLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.light.surfaceContainerLowest,
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: "#006a6a",
            shadowOpacity: 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: Colors.light.outline,
          tabBarLabelStyle: {
            fontFamily: "Inter_500Medium",
            fontSize: 10,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          },
        }}
      >
        {/* 1. HOME TAB */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />

        {/* 2. PERSONAL DETAILS TAB */}
        <Tabs.Screen
          name="personal/Personal_Details"
          options={{
            title: "Personal",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />

        {/* 3. BANK DETAILS TAB */}
        <Tabs.Screen
          name="bankDetails/Bank_Details"
          options={{
            title: "Bank",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="account-balance" size={size} color={color} />
            ),
          }}
        />

        {/* 4. PROFILE DETAILS TAB */}
        <Tabs.Screen
          name="profile/Profile_Details"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="account-circle" size={size} color={color} />
            ),
          }}
        />

        {/* ─── HIDE GHOST TABS ─── */}
        {/* This prevents the folders themselves from appearing as extra tabs */}
        <Tabs.Screen name="personal" options={{ href: null }} />
        <Tabs.Screen name="bankDetails" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        
        {/* If there is an index.tsx in the root (cleaner) folder, hide it too */}
        <Tabs.Screen name="index" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}