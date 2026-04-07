import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/src/shared/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HospitalLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.light.surfaceContainerLowest,
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#006a6a',
            shadowOpacity: 0.10,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: Colors.light.outline,
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
          name="services"
          options={{
            title: 'Services',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="medical-services" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="doctors"
          options={{
            title: 'Doctors',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person-search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="nurses"
          options={{
            title: 'Nurses',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="health-and-safety" size={size} color={color} />
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
      </Tabs>
    </SafeAreaView>
  );
}