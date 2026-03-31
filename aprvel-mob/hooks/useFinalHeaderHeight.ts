import { useHeaderHeight } from '@react-navigation/elements';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useFinalHeaderHeight = () => {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

  // If react-navigation returns 0 (common on initial render or with transparent headers),
  // fallback to safe area top + standard navbar height.
  return headerHeight > 0 ? headerHeight : insets.top + NAVBAR_HEIGHT;
};
