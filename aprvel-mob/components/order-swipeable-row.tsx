import { OrderCard } from '@/components/order-card';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrder } from '@/interfaces/db-types';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface LeftActionProps {
  dragX: SharedValue<number>;
  onPress: () => void;
  colors: AppColors;
}

const LeftAction = ({ dragX, onPress, colors }: LeftActionProps) => {
  const styles = makeStyles(colors);
  const textStyle = useAnimatedStyle(() => {
    const trans = interpolate(
      dragX.value,
      [0, 50, 100, 101],
      [-20, 0, 0, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: trans }],
    };
  });

  return (
    <RectButton style={styles.leftAction} onPress={onPress}>
      <Reanimated.Text style={[styles.actionText, textStyle]}>
        Reject
      </Reanimated.Text>
    </RectButton>
  );
};

interface RightActionProps {
  dragX: SharedValue<number>;
  colors: AppColors;
}

const RightAction = ({ dragX, colors }: RightActionProps) => {
  const styles = makeStyles(colors);
  const textStyle = useAnimatedStyle(() => {
    const trans = interpolate(
      dragX.value,
      [-100, -50, 0],
      [0, 0, 20],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: trans }],
    };
  });

  return (
    <View style={styles.rightAction}>
      <Reanimated.Text style={[styles.actionText, textStyle]}>
        Details
      </Reanimated.Text>
    </View>
  );
};

interface OrderSwipeableRowProps {
  item: PurchaseOrder;
  onDetails: (id: string) => void;
  onReject?: (item: PurchaseOrder) => void;
  isLastInSection?: boolean;
}

export const OrderSwipeableRow = ({
  item,
  onDetails,
  onReject,
  isLastInSection,
}: OrderSwipeableRowProps) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const swipeableRow = useRef<any>(null);

  const closeRow = () => swipeableRow.current?.close();

  const renderLeftActions = (
    progress: SharedValue<number>,
    dragX: SharedValue<number>,
  ) => {
    if (!onReject) return null;
    return (
      <LeftAction
        dragX={dragX}
        onPress={() => {
          closeRow();
          onReject(item);
        }}
        colors={colors}
      />
    );
  };

  const renderRightActions = (
    progress: SharedValue<number>,
    dragX: SharedValue<number>,
  ) => {
    return <RightAction dragX={dragX} colors={colors} />;
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRow}
      renderLeftActions={onReject ? renderLeftActions : undefined}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(direction) => {
        // "left" means the left panel opened (Reject) - swiped L->R
        // "right" means the right panel opened (Details) - swiped R->L

        if (direction === 'left') {
          // Auto-trigger details when swiping R->L
          closeRow();
          onDetails(String(item.id));
        } else if (direction === 'right' && !onReject) {
          // Edge case: if no reject action but somehow swiped left?
          // Should be prevented by not passing renderLeftActions
        }
        // Note: Reject (swiping L->R) is triggered by button press, not auto-open.
      }}
      containerStyle={[
        isLastInSection && {
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
        {
          borderBottomWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      <OrderCard item={item} onPress={() => {}} />
    </ReanimatedSwipeable>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    leftAction: {
      backgroundColor: colors.red || '#F04438',
      justifyContent: 'center',
      width: 119,
      height: '100%',
      alignItems: 'center',
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    rightAction: {
      backgroundColor: colors.primary || '#3b82f6',
      justifyContent: 'center',
      flex: 1,
      alignItems: 'flex-end',
      paddingRight: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    actionText: {
      color: 'white',
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      backgroundColor: 'transparent',
    },
  });
