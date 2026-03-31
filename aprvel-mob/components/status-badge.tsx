import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { CORNERS } from '@/theme/globals';
import { TextStyle, ViewStyle } from 'react-native';

export type BadgeVariant =
  | 'default'
  | 'pending'
  | 'rejected'
  | 'outline'
  | 'approved'
  | 'partial'
  | 'received';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function StatusBadge({
  children,
  variant = 'default',
  style,
  textStyle,
}: BadgeProps) {
  const primaryColor = useColor('primary');
  const primaryForegroundColor = useColor('primaryForeground');
  const secondaryForegroundColor = useColor('secondaryForeground');
  const destructiveForegroundColor = useColor('destructiveForeground');
  const borderColor = useColor('border');

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: CORNERS,
    };

    switch (variant) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#535862' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#F04438' };
      case 'approved':
        return { ...baseStyle, backgroundColor: '#17B26A' };
      case 'partial':
        return { ...baseStyle, backgroundColor: '#F79009' };
      case 'received':
        return { ...baseStyle, backgroundColor: '#2E90FA' };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor,
        };
      default:
        return { ...baseStyle, backgroundColor: primaryColor };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'center',
    };

    switch (variant) {
      case 'pending':
        return { ...baseTextStyle, color: secondaryForegroundColor };
      case 'rejected':
        return { ...baseTextStyle, color: destructiveForegroundColor };
      case 'outline':
        return { ...baseTextStyle, color: primaryColor };
      default:
        return { ...baseTextStyle, color: primaryForegroundColor };
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{children}</Text>
    </View>
  );
}
