import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { AlertTriangle, Check, Info, X, XCircle } from 'lucide-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeOutUp,
  Layout,
  SlideInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  show: (params: Omit<ToastMessage, 'id'>) => void;
  hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const show = useCallback(
    ({
      type = 'info',
      title,
      message,
      duration = 4000,
    }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    [],
  );

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <View
        style={[
          styles.toastContainer,
          { top: insets.top + 10 }, // Adjust top position based on safe area
        ]}
        pointerEvents='box-none'
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onHide={hide} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItem = ({
  toast,
  onHide,
}: {
  toast: ToastMessage;
  onHide: (id: string) => void;
}) => {
  const colors = useAppColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onHide(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onHide]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check color={colors.success || '#22C55E'} size={20} />;
      case 'error':
        return <XCircle color={colors.destructive || '#EF4444'} size={20} />;
      case 'warning':
        return <AlertTriangle color={colors.orange || '#F97316'} size={20} />;
      case 'info':
      default:
        return <Info color={colors.blue || '#3B82F6'} size={20} />;
    }
  };

  const getAccentColor = () => {
    switch (toast.type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.1)'; // green-500 with opacity
      case 'error':
        return 'rgba(239, 68, 68, 0.1)'; // red-500 with opacity
      case 'warning':
        return 'rgba(249, 115, 22, 0.1)'; // orange-500 with opacity
      case 'info':
      default:
        return 'rgba(59, 130, 246, 0.1)'; // blue-500 with opacity
    }
  };

  return (
    <Animated.View
      entering={SlideInUp}
      exiting={FadeOutUp}
      layout={Layout.springify()}
      style={styles.toast}
    >
      <View
        style={[styles.accentContainer, { backgroundColor: getAccentColor() }]}
      >
        {getIcon()}
      </View>
      <View style={styles.contentContainer}>
        {toast.title && <Text style={styles.title}>{toast.title}</Text>}
        <Text style={styles.message}>{toast.message}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onHide(toast.id)}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X color={colors.mutedForeground} size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      right: 16,
      top: 16, // Will be adjusted by insets in component
      zIndex: 9999,
      gap: 10,
      maxWidth: 334, // Reasonable max width for larger screens
      width: '100%', // Take full width on mobile up to max
      alignSelf: 'center', // Center on tablet/web
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    accentContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    contentContainer: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
    },
    message: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    closeButton: {
      marginLeft: 12,
      alignSelf: 'flex-start',
      marginTop: 2,
    },
  });
