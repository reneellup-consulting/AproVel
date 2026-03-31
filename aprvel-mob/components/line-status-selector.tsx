import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LineStatusSelectorProps {
  status: string | null;
  onChange: (newStatus: string) => void;
  readOnly?: boolean;
}

const OPTIONS = ['Release', 'Hold'];

export const LineStatusSelector = ({
  status,
  onChange,
  readOnly,
}: LineStatusSelectorProps) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const [containerWidth, setContainerWidth] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Default to 'Release' if status is null or pending
  const currentStatus = status || 'Release';

  const activeIndex = OPTIONS.findIndex(
    (opt) => opt.toLowerCase() === currentStatus.toLowerCase(),
  );

  const safeIndex = activeIndex === -1 ? 0 : activeIndex;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: safeIndex,
      useNativeDriver: true,
      bounciness: 0,
      speed: 16,
    }).start();
  }, [safeIndex, slideAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const tabWidth = containerWidth / OPTIONS.length;

  const getActiveColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'release':
        return colors.success;
      case 'hold':
        return colors.primary;
      default:
        return colors.foreground;
    }
  };

  const visualStatus = activeIndex === -1 ? 'Release' : currentStatus;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Sliding Background Pill */}
      <Animated.View
        style={[
          styles.activePill,
          {
            width: tabWidth - 4,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, tabWidth + 2],
                }),
              },
            ],
            borderColor: getActiveColor(visualStatus),
          },
        ]}
      />

      {/* Text Labels */}
      <View style={[styles.labelsContainer, readOnly && { opacity: 0.7 }]}>
        {OPTIONS.map((option) => {
          const isActive = option.toLowerCase() === visualStatus.toLowerCase();
          const activeTextColor = getActiveColor(option);

          // Dynamic Label Logic: Change to past tense if active
          let labelText = option;
          if (isActive) {
            if (option === 'Release') labelText = 'Released';
            if (option === 'Hold') labelText = 'On Hold';
          }

          return (
            <TouchableOpacity
              key={option}
              style={styles.touchable}
              onPress={() => !readOnly && onChange(option)} // Pass original value ('Release') to parent
              activeOpacity={readOnly ? 1 : 0.8}
            >
              <Text
                style={[
                  styles.labelText,
                  isActive && {
                    color: activeTextColor,
                    fontFamily: 'Inter_600SemiBold',
                  },
                ]}
              >
                {labelText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      height: 44,
      backgroundColor: colors.accent,
      borderRadius: 8,
      position: 'relative',
      justifyContent: 'center',
    },
    activePill: {
      position: 'absolute',
      height: 38,
      top: 3,
      backgroundColor: colors.accent,
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    labelsContainer: {
      flexDirection: 'row',
      height: '100%',
    },
    touchable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
  });
