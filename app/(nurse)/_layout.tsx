// import { Stack } from "expo-router";

// export default function NurseLayout() {
//   return <Stack screenOptions={{ headerShown: false }} />;
// }
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NurseLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="professional"
        options={{
          title: "Professional",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="work"
        options={{
          title: "Work",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
            <Tabs.Screen
        name="bank"
        options={{
          href: null, // 👈 hides from tab bar
        }}
      />

         <Tabs.Screen
        name="personal"
        options={{
          href: null, // 👈 hides from tab bar
        }}
      />


    </Tabs>
  );
}