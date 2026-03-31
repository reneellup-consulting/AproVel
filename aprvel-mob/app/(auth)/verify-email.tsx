import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyEmail() {
  const { user, resendVerification, checkAuthStatus, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const { colorScheme } = useColorScheme();
  const toast = useToast();

  // Timer Ref to clear interval on unmount
  const timerRef = useRef<any>(null);
  const pollingRef = useRef<any>(null);

  useEffect(() => {
    startTimer();
    startPolling();

    return () => {
      stopTimer();
      stopPolling();
    };
  }, []);

  const startTimer = () => {
    setCanResend(false);
    setTimeLeft(120);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setCanResend(true);
          stopPolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    // Poll every 30 seconds
    pollingRef.current = setInterval(() => {
      checkAuthStatus();
    }, 30000);
  };

  const stopPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerification();
      toast.show({
        type: 'success',
        message: 'Verification email sent successfully.',
      });
      startTimer();
      startPolling();
      // Restart polling if it was stopped (though we don't stop it on timeout)
    } catch (e: any) {
      toast.show({
        type: 'error',
        message: e.message || 'Failed to resend verification email.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={
              colorScheme === 'dark'
                ? require('@/assets/images/logo_dark.png')
                : require('@/assets/images/logo_light.png')
            }
            style={styles.logoImage}
            resizeMode='contain'
          />
        </View>

        <Text style={styles.title}>Verify your email</Text>

        <Text style={styles.description}>
          We've sent a verification link to{' '}
          <Text style={styles.emailText}>{user?.email}</Text>. Please check your
          inbox and click the link to verify your account.
        </Text>

        {!canResend && (
          <View style={styles.statusContainer}>
            <ActivityIndicator
              color={colors.primary}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.statusText}>
              Thinking... Waiting for verification
            </Text>
          </View>
        )}

        {canResend ? (
          <TouchableOpacity
            onPress={handleResend}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>Resend Email</Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>
            Resend available in {formatTime(timeLeft)}
          </Text>
        )}

        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Cancel Verification</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: 'center',
    },
    content: {
      alignItems: 'center',
      gap: 24,
    },
    logoContainer: {
      marginBottom: 20,
    },
    logoImage: {
      width: 100,
      height: 100,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 24,
    },
    emailText: {
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    statusContainer: {
      alignItems: 'center',
      padding: 20,
    },
    statusText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    button: {
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      minWidth: 200,
    },
    buttonText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    timerText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    signOutButton: {
      marginTop: 20,
    },
    signOutText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
    },
  });
