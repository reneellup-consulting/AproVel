import { BadgeVariant, StatusBadge } from '@/components/status-badge';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAppColors } from '@/hooks/useAppColors';

interface OrderStatusProps {
  status: string;
}

export function OrderStatus({ status }: OrderStatusProps) {
  const colors = useAppColors();
  // Helper to map API status strings to Badge variants
  const getVariant = (currentStatus: string): BadgeVariant => {
    switch (currentStatus.toLowerCase()) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected'; // or 'rejected' depending on your theme
      case 'pending':
        return 'pending'; // usually orange/yellow for pending
      case 'partial':
        return 'partial';
      case 'received':
        return 'received';
      default:
        return 'default';
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <StatusBadge
        variant={getVariant(status)}
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          paddingHorizontal: 0,
          paddingVertical: 0,
        }}
      >
        <View />
      </StatusBadge>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: colors.mutedForeground,
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}
