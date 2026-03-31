import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const Collapsible = ({
  expanded,
  children,
}: {
  expanded: boolean;
  children: React.ReactNode;
}) => {
  const [contentHeight, setContentHeight] = useState(0);
  const heightAnimation = useSharedValue(0);

  const colors = useAppColors();
  const styles = makeStyles(colors);

  const onLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && height !== contentHeight) {
      setContentHeight(height);
    }
  };

  React.useEffect(() => {
    if (expanded) {
      heightAnimation.value = withTiming(contentHeight, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      heightAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [expanded, contentHeight, heightAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: heightAnimation.value,
      opacity: heightAnimation.value === 0 ? 0 : 1,
    };
  });

  return (
    <Animated.View style={[styles.collapsibleContainer, animatedStyle]}>
      <View onLayout={onLayout} style={styles.collapsibleContent}>
        {children}
      </View>
    </Animated.View>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    collapsibleContainer: {
      overflow: 'hidden',
    },
    collapsibleContent: {
      position: 'absolute',
      width: '100%',
      top: 0,
      left: 0,
    },
  });
