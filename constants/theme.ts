/**
 * Jhilmil Homecare — "Clinical Atelier" Design System
 * Design tokens exported from Google Stitch / Precision Empathy visual language.
 *
 * Rules:
 *  - No 1px solid borders — use surface color shifts instead
 *  - No pure black text — use onSurface (#181c20)
 *  - No sharp corners — minimum radius.md (8)
 *  - No standard blue — primary is deep teal (#006565)
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const palette = {
  // Primary — Deep authoritative teal
  primary: '#006565',
  primaryContainer: '#008080',
  primaryFixed: '#93f2f2',
  primaryFixedDim: '#76d6d5',
  inversePrimary: '#76d6d5',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#ffffff',

  // Secondary — Neutral slate
  secondary: '#5c5f60',
  secondaryContainer: '#e1e3e4',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#181c20',

  // Tertiary — Success / positive outcomes
  tertiary: '#006923',
  tertiaryContainer: '#00852f',
  tertiaryFixed: '#83fc8e',
  tertiaryFixedDim: '#66df75',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#ffffff',

  // Error — Emergency / destructive
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#410002',

  // Surfaces — Light mode
  surface: '#f7f9ff',
  surfaceBright: '#f7f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f1f4f9',
  surfaceContainer: '#ebeef3',
  surfaceContainerHigh: '#e5e8ee',
  surfaceContainerHighest: '#e0e3e8',
  surfaceVariant: '#e0e3e8',
  surfaceTint: '#006a6a',
  inverseSurface: '#2d3135',
  inverseOnSurface: '#eef1f6',

  // Text on surfaces — Light mode
  onSurface: '#181c20',
  onSurfaceVariant: '#3e4949',

  // Outline
  outline: '#6e7979',
  outlineVariant: '#bdc9c8',

  // Dark surface equivalents
  dark: {
    surface: '#0f1416',
    surfaceContainerLowest: '#0a0f11',
    surfaceContainerLow: '#171c1e',
    surfaceContainer: '#1b2022',
    surfaceContainerHigh: '#252b2d',
    surfaceContainerHighest: '#303638',
    onSurface: '#dde4e4',
    onSurfaceVariant: '#bcc9c8',
    outline: '#869393',
    outlineVariant: '#3e4949',
  },
} as const;

export const Colors = {
  light: {
    // Core tokens (compatible with existing themed components)
    text: palette.onSurface,
    background: palette.surface,
    tint: palette.primary,
    icon: palette.onSurfaceVariant,
    tabIconDefault: palette.outline,
    tabIconSelected: palette.primary,

    // Full Jhilmil palette
    primary: palette.primary,
    primaryContainer: palette.primaryContainer,
    primaryFixed: palette.primaryFixed,
    primaryFixedDim: palette.primaryFixedDim,
    inversePrimary: palette.inversePrimary,
    onPrimary: palette.onPrimary,

    secondary: palette.secondary,
    secondaryContainer: palette.secondaryContainer,
    onSecondary: palette.onSecondary,

    tertiary: palette.tertiary,
    tertiaryContainer: palette.tertiaryContainer,
    tertiaryFixed: palette.tertiaryFixed,
    onTertiary: palette.onTertiary,

    error: palette.error,
    errorContainer: palette.errorContainer,
    onError: palette.onError,

    surface: palette.surface,
    surfaceContainerLowest: palette.surfaceContainerLowest,
    surfaceContainerLow: palette.surfaceContainerLow,
    surfaceContainer: palette.surfaceContainer,
    surfaceContainerHigh: palette.surfaceContainerHigh,
    surfaceContainerHighest: palette.surfaceContainerHighest,
    surfaceVariant: palette.surfaceVariant,
    inverseSurface: palette.inverseSurface,
    inverseOnSurface: palette.inverseOnSurface,

    onSurface: palette.onSurface,
    onSurfaceVariant: palette.onSurfaceVariant,
    outline: palette.outline,
    outlineVariant: palette.outlineVariant,
  },
  dark: {
    // Core tokens
    text: palette.dark.onSurface,
    background: palette.dark.surface,
    tint: palette.inversePrimary,
    icon: palette.dark.onSurfaceVariant,
    tabIconDefault: palette.dark.outline,
    tabIconSelected: palette.inversePrimary,

    // Full Jhilmil palette — dark variants
    primary: palette.inversePrimary,
    primaryContainer: palette.primary,
    primaryFixed: palette.primaryFixed,
    primaryFixedDim: palette.primaryFixedDim,
    inversePrimary: palette.primary,
    onPrimary: palette.onSurface,

    secondary: '#c0c8c8',
    secondaryContainer: '#3b3e3f',
    onSecondary: palette.onSurface,

    tertiary: palette.tertiaryFixed,
    tertiaryContainer: palette.tertiary,
    tertiaryFixed: palette.tertiaryFixed,
    onTertiary: palette.onSurface,

    error: '#ffb4ab',
    errorContainer: '#93000a',
    onError: '#690005',

    surface: palette.dark.surface,
    surfaceContainerLowest: palette.dark.surfaceContainerLowest,
    surfaceContainerLow: palette.dark.surfaceContainerLow,
    surfaceContainer: palette.dark.surfaceContainer,
    surfaceContainerHigh: palette.dark.surfaceContainerHigh,
    surfaceContainerHighest: palette.dark.surfaceContainerHighest,
    surfaceVariant: palette.dark.surfaceContainerHigh,
    inverseSurface: palette.surfaceContainerLowest,
    inverseOnSurface: palette.onSurface,

    onSurface: palette.dark.onSurface,
    onSurfaceVariant: palette.dark.onSurfaceVariant,
    outline: palette.dark.outline,
    outlineVariant: palette.dark.outlineVariant,
  },
} as const;

export type ThemeColors = typeof Colors.light;
export type ColorKey = keyof ThemeColors;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const FontFamily = {
  /** Headlines, display text — Manrope (geometric precision) */
  headline: 'Manrope_700Bold',
  headlineSemiBold: 'Manrope_600SemiBold',
  headlineMedium: 'Manrope_500Medium',
  headlineRegular: 'Manrope_400Regular',
  /** Body, UI, labels — Inter (maximum legibility) */
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  label: 'Inter_500Medium',
} as const;

export const FontSize = {
  displayLarge: 32,
  displayMedium: 28,
  headlineLarge: 24,
  headlineMedium: 22,
  headlineSmall: 20,
  titleLarge: 18,
  titleMedium: 16,
  titleSmall: 14,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 13,
  labelLarge: 14,
  labelMedium: 12,
  labelSmall: 11,
} as const;

export const LineHeight = {
  displayLarge: 40,
  displayMedium: 36,
  headlineLarge: 32,
  headlineMedium: 30,
  headlineSmall: 28,
  titleLarge: 26,
  titleMedium: 24,
  titleSmall: 22,
  bodyLarge: 24,
  bodyMedium: 22,
  bodySmall: 20,
  labelLarge: 20,
  labelMedium: 18,
  labelSmall: 16,
} as const;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 24,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows (ambient teal glow — no harsh drop shadows)
// ---------------------------------------------------------------------------

export const Shadow = {
  card: {
    shadowColor: '#006a6a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#006a6a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#006a6a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export const ButtonSize = {
  minHeight: 56,
  borderRadius: Radius.xl,
  paddingHorizontal: Spacing.lg,
} as const;

// ---------------------------------------------------------------------------
// Signature gradient (for hero sections, primary cards)
// ---------------------------------------------------------------------------

export const Gradient = {
  primary: ['#006565', '#008080'] as [string, string],
  surface: ['#f7f9ff', '#ebeef3'] as [string, string],
} as const;
