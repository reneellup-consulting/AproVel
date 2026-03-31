import { useThemeContext } from '@/theme/theme-provider';

export function useColorScheme() {
  return useThemeContext();
}
