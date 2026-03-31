import { useAppColors } from '@/hooks/useAppColors';
import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

export interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ style, onFocus, onBlur, left, right, containerStyle, ...props }, ref) => {
    const colors = useAppColors();
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const borderColor = isFocused ? colors.primary : colors.border;
    const backgroundColor = colors.accent;

    if (left || right) {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor,
              borderColor,
              borderWidth: 1,
            },
            containerStyle,
          ]}
        >
          {left}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.foreground,
                flex: 1,
                borderWidth: 0,
                height: '100%',
                paddingHorizontal: left ? 8 : 16,
              },
              style,
            ]}
            placeholderTextColor={colors.mutedForeground}
            cursorColor={colors.primary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {right}
        </View>
      );
    }

    return (
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            backgroundColor,
            borderColor,
            color: colors.foreground,
            borderWidth: 1,
          },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        cursorColor={colors.primary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
