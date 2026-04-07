import { Colors, type ColorKey } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKey,
): string {
  const theme = useColorScheme();
  const colorFromProps = props[theme];
  if (colorFromProps) return colorFromProps;
  return Colors[theme][colorName] as string;
}
