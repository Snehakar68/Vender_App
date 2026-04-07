import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FontFamily, FontSize, LineHeight } from '@/constants/theme';

export type ThemedTextType =
  // Jhilmil typography scale
  | 'displayLarge'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  // Legacy aliases (keep existing code working)
  | 'default'
  | 'title'
  | 'defaultSemiBold'
  | 'subtitle'
  | 'link';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkColor = useThemeColor({}, 'primary');

  return (
    <Text
      style={[
        { color: type === 'link' ? linkColor : color },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // ── Jhilmil scale ──────────────────────────────────────────────────────────
  displayLarge: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.displayLarge,
    lineHeight: LineHeight.displayLarge,
  },
  headlineLarge: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.headlineLarge,
    lineHeight: LineHeight.headlineLarge,
  },
  headlineMedium: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.headlineMedium,
    lineHeight: LineHeight.headlineMedium,
  },
  headlineSmall: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.headlineSmall,
    lineHeight: LineHeight.headlineSmall,
  },
  titleLarge: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.titleLarge,
    lineHeight: LineHeight.titleLarge,
  },
  titleMedium: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: FontSize.titleMedium,
    lineHeight: LineHeight.titleMedium,
  },
  titleSmall: {
    fontFamily: FontFamily.headlineMedium,
    fontSize: FontSize.titleSmall,
    lineHeight: LineHeight.titleSmall,
  },
  bodyLarge: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyLarge,
    lineHeight: LineHeight.bodyLarge,
  },
  bodyMedium: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMedium,
    lineHeight: LineHeight.bodyMedium,
  },
  bodySmall: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySmall,
    lineHeight: LineHeight.bodySmall,
  },
  labelLarge: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelLarge,
    lineHeight: LineHeight.labelLarge,
  },
  labelMedium: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelMedium,
    lineHeight: LineHeight.labelMedium,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: FontFamily.label,
    fontSize: FontSize.labelSmall,
    lineHeight: LineHeight.labelSmall,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Legacy aliases ─────────────────────────────────────────────────────────
  default: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyLarge,
    lineHeight: LineHeight.bodyLarge,
  },
  defaultSemiBold: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.bodyLarge,
    lineHeight: LineHeight.bodyLarge,
  },
  title: {
    fontFamily: FontFamily.headline,
    fontSize: FontSize.displayLarge,
    lineHeight: LineHeight.displayLarge,
  },
  subtitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: FontSize.headlineSmall,
    lineHeight: LineHeight.headlineSmall,
  },
  link: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.bodyLarge,
    lineHeight: LineHeight.bodyLarge,
  },
});
