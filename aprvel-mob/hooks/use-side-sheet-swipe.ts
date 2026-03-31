import { useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 400);

export const useSideSheetSwipe = (
  visible: boolean,
  onClose: () => void,
  onCloseStart?: () => void,
) => {
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  const handleClose = () => {
    onCloseStart?.();
    Animated.timing(slideAnim, {
      toValue: PANEL_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Check if moving Right (dx > 10)
        // Check if movement is MORE horizontal than vertical
        // This ensures scrolling the list doesn't accidentally trigger the close
        const isSwipingRight = gestureState.dx > 10;
        const isMoreHorizontal =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

        return isSwipingRight && isMoreHorizontal;
      },
      onPanResponderMove: (_, gestureState) => {
        // Prevent sliding to the left (negative values) beyond the open position
        if (gestureState.dx > 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Close if dragged > 25% of width OR flicked quickly (> 0.5 velocity)
        if (gestureState.dx > PANEL_WIDTH * 0.25 || gestureState.vx > 0.5) {
          handleClose();
        } else {
          // Snap back to open if gesture abandoned
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 14,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(PANEL_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
      }).start();
    }
  }, [visible, slideAnim]);

  return {
    slideAnim,
    panResponder,
    handleClose,
    PANEL_WIDTH,
  };
};
