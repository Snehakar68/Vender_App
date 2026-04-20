import { Stack } from 'expo-router';
import { AmbulanceProvider } from '@/src/features/ambulance/context/AmbulanceContext';

export default function AmbulanceLayout() {
  return (
    <AmbulanceProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AmbulanceProvider>
  );
}
