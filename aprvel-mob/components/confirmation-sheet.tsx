import { useAppColors } from '@/hooks/useAppColors';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { AppColors } from '@/interfaces/color';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant?: 'approve' | 'reject';
  isLoading?: boolean;
}

export const ConfirmationSheet = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmVariant = 'approve',
  isLoading,
}: ConfirmationSheetProps) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [reason, setReason] = useState('');
  const colors = useAppColors();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && confirmVariant === 'reject') {
      // Delay focus to ensure modal animation has finished
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
    }
  }, [visible, confirmVariant]);

  const styles = makeStyles(colors);

  // Create the PanResponder to handle gestures
  const panResponder = useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if dragging DOWN (dy > 0)
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        // Move the view with the finger, but prevent dragging UP past the top (dy < 0)
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 100px OR flicked down quickly -> Close
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          // Otherwise -> Spring back to open position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset position to 0 just in case previous drag left it elsewhere
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      setReason('');
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const { keyboardHeight, isKeyboardVisible, keyboardAnimationDuration } =
    useKeyboardHeight();
  const animatedKeyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedKeyboardHeight, {
      toValue: keyboardHeight,
      duration: keyboardAnimationDuration,
      useNativeDriver: false,
    }).start();
  }, [keyboardHeight, keyboardAnimationDuration]);

  // Base padding matches the original static style
  const basePaddingBottom = Platform.OS === 'ios' ? 40 : 24;

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          // Outer view handles the native transform (slide) and gestures
          {...panResponder.panHandlers}
          style={{
            width: '100%',
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Animated.View
            // Inner view handles the JS-driven padding and visual styling
            style={[
              styles.sheetContainer,
              {
                paddingBottom: Animated.add(
                  animatedKeyboardHeight,
                  basePaddingBottom,
                ),
              },
            ]}
          >
            {/* You can also attach {...panResponder.panHandlers} to JUST 
               this handle View below if you want ONLY the handle to be draggable.
               Attaching it to the sheetContainer (above) is usually better UX.
            */}
            <View style={styles.handle} />

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {confirmVariant === 'reject' && (
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder='Reason for rejection (Optional)'
                placeholderTextColor={colors.mutedForeground}
                value={reason}
                onChangeText={setReason}
                multiline
              />
            )}

            {!isKeyboardVisible && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    confirmVariant === 'reject'
                      ? styles.rejectButton
                      : styles.approveButton,
                  ]}
                  onPress={() => onConfirm(reason)}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'Processing...' : confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    sheetContainer: {
      backgroundColor: colors.accent,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      gap: 16,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.muted,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 8,
      // Add some padding to make the handle easier to grab if you move handlers here
      marginVertical: 5,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.accentForeground,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    approveButton: {
      backgroundColor: colors.primary,
    },
    rejectButton: {
      backgroundColor: '#F04438',
    },
    confirmButtonText: {
      fontFamily: 'Inter_600SemiBold',
      color: colors.primaryForeground,
    },
    input: {
      borderTopWidth: 1,
      borderColor: colors.border,
      padding: 12,
      color: colors.accentForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
  });
