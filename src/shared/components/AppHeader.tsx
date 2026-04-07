import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppHeader({
  title,
  subtitle,
  icon,
  actionText,
  onActionPress,
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  actionText?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.header}>
      {/* LEFT */}
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={18} color="#0F172A" />
          </View>
        )}

        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </View>

      {/* RIGHT */}
      {actionText && (
        <TouchableOpacity style={styles.btn} onPress={onActionPress}>
          <Text style={styles.btnText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
  },

  btn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});