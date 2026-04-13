import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onActionPress?: () => void;
  disabled?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  icon,
  actionText,
  onActionPress,
  disabled,
}: Props) {
  return (
    <View style={styles.container}>
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
      {actionText && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.button,
            disabled && { opacity: 0.5 },
          ]}
          onPress={() => {
            if (disabled) return;
            onActionPress?.();
          }}
          disabled={disabled}
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

    height: 56,
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