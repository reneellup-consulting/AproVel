import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import React, { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Reanimated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface WheelPickerItemProps {
  item: string | number;
  index: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  style: any;
  textStyle: any;
}

const WheelPickerItem = React.memo(
  ({
    item,
    index,
    scrollY,
    itemHeight,
    style,
    textStyle,
  }: WheelPickerItemProps) => {
    const inputRange = [
      (index - 2) * itemHeight,
      (index - 1) * itemHeight,
      index * itemHeight,
      (index + 1) * itemHeight,
      (index + 2) * itemHeight,
    ];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollY.value,
        inputRange,
        [0.8, 0.9, 1.1, 0.9, 0.8],
        Extrapolation.CLAMP,
      );
      const opacity = interpolate(
        scrollY.value,
        inputRange,
        [0.3, 0.5, 1, 0.5, 0.3],
        Extrapolation.CLAMP,
      );
      const rotateX = interpolate(
        scrollY.value,
        inputRange,
        [45, 25, 0, -25, -45],
        Extrapolation.CLAMP,
      );

      return {
        transform: [
          { scale },
          { rotateX: `${rotateX}deg` },
          { perspective: 1000 },
        ],
        opacity,
      };
    });

    return (
      <View style={[style, { height: itemHeight }]}>
        <Reanimated.Text style={[textStyle, animatedStyle]}>
          {item}
        </Reanimated.Text>
      </View>
    );
  },
);

interface WheelPickerProps {
  data: (string | number)[];
  selectedValue: string | number;
  onValueChange: (value: string | number, index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
}

export const WheelPicker = ({
  data,
  selectedValue,
  onValueChange,
  itemHeight = 40,
  visibleItems = 5,
}: WheelPickerProps) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);

  const scrollRef = useRef<Reanimated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const [isReady, setIsReady] = useState(false);

  // Use 3 sets for the loop
  const loopedData = React.useMemo(() => [...data, ...data, ...data], [data]);
  const baseDataLength = data.length;
  const pivotPoint = baseDataLength * itemHeight;

  const containerHeight = itemHeight * visibleItems;
  const centerOffset = (containerHeight - itemHeight) / 2;

  useEffect(() => {
    const baseIndex = data.indexOf(selectedValue);
    if (baseIndex !== -1) {
      const targetY = pivotPoint + baseIndex * itemHeight;

      if (!isReady) {
        // Initial Mount
        scrollY.value = targetY;
        const timer = setTimeout(() => {
          scrollRef.current?.scrollTo({ y: targetY, animated: false });
          setIsReady(true);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Handle updates (e.g. Reset button or data change)
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
      }
    }
  }, [selectedValue, data, isReady, pivotPoint, itemHeight]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    let y = event.nativeEvent.contentOffset.y;

    // 1. Calculate the current index and value
    const index = Math.round(y / itemHeight);
    const originalIndex = index % baseDataLength;
    const value = data[originalIndex];

    // 2. Teleportation Logic:
    // If we are in the first set or the last set, jump back to the middle set
    if (y < pivotPoint || y >= pivotPoint + baseDataLength * itemHeight) {
      const newY = pivotPoint + originalIndex * itemHeight;
      scrollRef.current?.scrollTo({ y: newY, animated: false });
    }

    // 3. Notify Parent
    if (value !== selectedValue) {
      onValueChange(value, originalIndex);
    }
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <View
        style={[
          styles.selectionOverlay,
          { top: centerOffset, height: itemHeight },
        ]}
      />
      <Reanimated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        snapToInterval={itemHeight}
        decelerationRate='fast'
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: centerOffset }}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {loopedData.map((item, index) => (
          <WheelPickerItem
            key={`${item}-${index}`}
            item={item}
            index={index}
            scrollY={scrollY}
            itemHeight={itemHeight}
            style={styles.itemContainer}
            textStyle={styles.itemText}
          />
        ))}
      </Reanimated.ScrollView>
    </View>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { width: '100%', overflow: 'hidden' },
    itemContainer: { justifyContent: 'center', alignItems: 'center' },
    itemText: {
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
      color: colors.text,
    },
    selectionOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.popover + '10',
      zIndex: -1,
    },
  });
