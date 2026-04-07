import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProtectedLayout from "@/src/core/layout/ProtectedLayout";

export default function DoctorLayout() {
  return (
    <ProtectedLayout allowedRoles={["DOC"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0F766E",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            height: 60,
            paddingBottom: 6,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="work-details"
          options={{
            title: "Work",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            title: "Services",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="medkit-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="nurse-list"
          options={{
            title: "Nurses",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden */}
        <Tabs.Screen name="personal-details" options={{ href: null }} />
        <Tabs.Screen name="professional-details" options={{ href: null }} />
        <Tabs.Screen name="bank-details" options={{ href: null }} />
        <Tabs.Screen name="privacy-policy" options={{ href: null }} />
      </Tabs>
    </ProtectedLayout>
  );
}