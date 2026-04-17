import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type SurfaceLevel =
  | 'base'       // #f7f9ff — page background
  | 'lowest'     // #ffffff — cards, inputs
  | 'low'        // #f1f4f9 — section separators
  | 'container'  // #ebeef3 — default container
  | 'high'       // #e5e8ee — elevated sections
  | 'highest';   // #e0e3e8 — secondary sections

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  /** Surface level maps to a Jhilmil surface token. Defaults to 'base' (page background). */
  surface?: SurfaceLevel;
};

const surfaceColorKey: Record<SurfaceLevel, keyof typeof Colors.light> = {
  base: 'surface',
  lowest: 'surfaceContainerLowest',
  low: 'surfaceContainerLow',
  container: 'surfaceContainer',
  high: 'surfaceContainerHigh',
  highest: 'surfaceContainerHighest',
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  surface,
  ...otherProps
}: ThemedViewProps) {
  const theme = useColorScheme();

  // If explicit light/dark override or no surface specified, fall back to 'background' token
  const defaultBg = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const backgroundColor = surface
    ? (Colors[theme][surfaceColorKey[surface]] as string)
    : defaultBg;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
