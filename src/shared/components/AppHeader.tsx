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
    <View style={styles.container}>
      {/* LEFT */}
      <View style={styles.left}>
        {icon && (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={18} color="#0F172A" />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          {!!subtitle && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* RIGHT */}
      {actionText && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={onActionPress}
        >
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    height: 56, // 🔥 perfect professional height
    paddingHorizontal: 16,

    backgroundColor: "#fff",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  textContainer: {
    justifyContent: "center",
    flexShrink: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },

  button: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#0F766E",

    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});