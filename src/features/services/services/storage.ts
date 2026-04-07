import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICES_KEY = '@jhilmil/selected_services';

export async function loadSelectedServices(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SERVICES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function saveSelectedServices(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(ids));
}

export { SERVICES_KEY };
