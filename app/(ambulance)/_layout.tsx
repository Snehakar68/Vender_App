import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbulanceProvider } from '@/src/features/ambulance/context/AmbulanceContext';

export default function AmbulanceLayout() {
  return (
    <AmbulanceProvider>
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#006565',
            shadowOpacity: 0.10,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#006565',
          tabBarInactiveTintColor: '#6e7979',
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 10,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ambulances"
          options={{
            title: 'Ambulance',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="emergency" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="drivers"
          options={{
            title: 'Driver',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="directions-car" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden push screens */}
        <Tabs.Screen name="live-tracking" options={{ href: null }} />
        <Tabs.Screen name="trips" options={{ href: null }} />
        <Tabs.Screen name="driver-assignment" options={{ href: null }} />
        <Tabs.Screen name="add-ambulance" options={{ href: null }} />
        <Tabs.Screen name="add-driver" options={{ href: null }} />
        <Tabs.Screen name="personal-information" options={{ href: null }} />
        <Tabs.Screen name="equipment-facilities" options={{ href: null }} />
        <Tabs.Screen name="bank-details" options={{ href: null }} />
        {/* <Tabs.Screen name="bank-details" options={{ href: null }} /> */}
      </Tabs>
    </SafeAreaView>
    </AmbulanceProvider>
  );
}
