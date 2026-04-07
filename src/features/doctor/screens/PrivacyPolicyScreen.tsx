import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>
            Your data privacy and security are important to us.
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>

          <Section
            title="1. Information We Collect"
            content="We collect personal details such as name, contact information, and professional data to provide better healthcare services."
          />

          <Section
            title="2. How We Use Your Information"
            content="Your information is used to manage appointments, improve service quality, and ensure a seamless healthcare experience."
          />

          <Section
            title="3. Data Security"
            content="We implement industry-standard security measures to protect your data from unauthorized access and misuse."
          />

          <Section
            title="4. Sharing of Information"
            content="We do not sell your data. Information is shared only with authorized healthcare providers and necessary services."
          />

          <Section
            title="5. Your Rights"
            content="You can request access, correction, or deletion of your personal data at any time."
          />

          <Section
            title="6. Updates to Policy"
            content="We may update this policy periodically. Continued use of the app indicates acceptance of updates."
          />

        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Last updated: February 2026
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  sectionText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 20,
  },
});
function Section({ title, content }: { title: string; content: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{content}</Text>
    </View>
  );
}