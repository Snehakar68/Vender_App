import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Introduction',
    body: 'Jhilmil Homecare ("we", "our", "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our services.',
  },
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly to us, such as your name, contact details, hospital information, and bank account details for payout purposes. We also collect usage data and device information automatically when you use our app.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to provide, maintain, and improve our services; process transactions and send related information; send promotional communications (with your consent); respond to comments and questions; and comply with legal obligations.',
  },
  {
    title: 'Information Sharing',
    body: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except to trusted third parties who assist us in operating our platform and servicing you, provided those parties agree to keep this information confidential.',
  },
  {
    title: 'Data Security',
    body: 'We implement industry-standard security measures to protect your information, including end-to-end encryption for sensitive financial data. However, no method of transmission over the internet or method of electronic storage is 100% secure.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving promotional communications from us. To exercise these rights, please contact us through the app or at privacy@jhilmilhomecare.com.',
  },
  {
    title: 'Cookies and Tracking',
    body: 'Our app may use local storage and analytics tools to enhance your experience and understand usage patterns. You can control these settings through your device preferences.',
  },
  {
    title: 'Children\'s Privacy',
    body: 'Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children under 18.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date below.',
  },
  {
    title: 'Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact us at:\n\nJhilmil Homecare\nEmail: privacy@jhilmilhomecare.com\nPhone: 1800-XXX-XXXX\nAddress: Health City, Mumbai, Maharashtra 400001',
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>

        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceContainerLowest,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  headerTitle: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.titleLarge,
    color: Colors.light.onSurface,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  lastUpdated: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    color: Colors.light.outline,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },

  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyLarge,
    color: Colors.light.onSurface,
    marginBottom: Spacing.xs,
  },
  sectionBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 22,
  },
});
