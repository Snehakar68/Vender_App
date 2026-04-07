/**
 * Jhilmil Homecare - Clinical Atelier Design System (Final Locked)
 */

export const Colors = {
  light: {
    // Core
    primary: "#2E86DE",
    secondary: "#54A0FF",
    tertiary: "#00A8A8",
    error: "#E74C3C",

    // Backgrounds
    background: "#F5F6FA",
    surface: "#FFFFFF",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F8F9FB",
    surfaceContainerHigh: "#F1F3F7",          // ✅ added
    surfaceContainerHighest: "#EEF1F6",

    // Text
    onSurface: "#222F3E",
    onSurfaceVariant: "#6B7280",
    onPrimary: "#FFFFFF",                     // ✅ added

    // Borders
    outline: "#A0A4A8",
    outlineVariant: "#D1D5DB",

    // Extended
    primaryFixed: "#D6E9FF",
    tertiaryFixed: "#CFF5F5",

    // Status containers
    errorContainer: "#FDECEA",                // ✅ added

    // Inverse
    inverseSurface: "#1F2937",
    inverseOnSurface: "#FFFFFF",
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Radius
export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

// Shadow
export const Shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
};

// Fonts
export const FontFamily = {
  headline: "Inter_600SemiBold",
  headlineMedium: "Inter_600SemiBold",
  headlineSemiBold: "Inter_600SemiBold",

  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",

  label: "Inter_500Medium",
};

// Font sizes
export const FontSize = {
  labelSmall: 10,
  labelMedium: 12,
  labelLarge: 13,

  bodySmall: 12,
  bodyMedium: 14,
  bodyLarge: 16,

  titleSmall: 14,
  titleLarge: 16,

  headlineSmall: 18,
  headlineMedium: 20,   // ✅ ADD THIS
  headlineLarge: 22,
};

// Button
export const ButtonSize = {
  minHeight: 48,
};