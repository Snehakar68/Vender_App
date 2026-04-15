/**
 * Jhilmil Homecare - Ambulance Vendor Design Tokens
 * Isolated Material 3 teal theme for the ambulance vendor app.
 */

export const AmbColors = {
  // Core teal
  primary: '#006565',
  onPrimary: '#ffffff',
  primaryContainer: '#008080',
  onPrimaryContainer: '#e3fffe',
  primaryFixed: '#93f2f2',
  primaryFixedDim: '#76d6d5',

  // Tertiary green
  tertiary: '#006923',
  onTertiary: '#ffffff',
  tertiaryContainer: '#00852f',
  onTertiaryContainer: '#ebffe6',
  tertiaryFixedDim: '#66df75',

  // Secondary grey
  secondary: '#5c5f60',
  onSecondary: '#ffffff',
  secondaryContainer: '#e1e3e4',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Surfaces
  surface: '#f7f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f1f4f9',
  surfaceContainer: '#ebeef3',
  surfaceContainerHigh: '#e5e8ee',
  surfaceContainerHighest: '#e0e3e8',

  // On-surface text
  onSurface: '#181c20',
  onSurfaceVariant: '#3e4949',
  outline: '#6e7979',
  outlineVariant: '#bdc9c8',

  // Inverse
  inverseSurface: '#2d3135',
  inverseOnSurface: '#eef1f6',
};

export const AmbRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const AmbShadow = {
  card: {
    shadowColor: '#006565',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  elevated: {
    shadowColor: '#006565',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
};
