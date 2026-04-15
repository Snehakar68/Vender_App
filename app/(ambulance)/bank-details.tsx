import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AmbColors } from '@/src/features/ambulance/constants/ambulanceTheme';
import TransactionalHeader from '@/src/features/ambulance/components/TransactionalHeader';
import { AuthContext } from '@/src/core/context/AuthContext';
import BankDetailsForm from '@/src/shared/components/BankDetailsForm';

export default function AmbulanceBankDetailsScreen() {
  const auth = useContext(AuthContext);
  const vendorId = auth?.user?.vendorId ?? '';
  const token = auth?.user?.token;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TransactionalHeader title="Bank Details" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BankDetailsForm vendorId={vendorId} token={token} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AmbColors.surface },
  scrollContent: { padding: 20, paddingBottom: 40 },
});
