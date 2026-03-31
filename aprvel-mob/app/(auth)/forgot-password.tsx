import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const colors = useAppColors();
  const styles = makeStyles(colors);

  const handleResetPassword = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      toast.show({
        type: 'success',
        message: 'Password reset link sent to your email.',
      });
      router.back();
    } catch (e: any) {
      toast.show({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Header Section --- */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* --- Branding Section --- */}
          <View style={styles.brandSection}>
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
            <View style={styles.appNameContainer}>
              <Text style={styles.appName}>Forgot Password?</Text>
              <Text style={styles.appDescription}>
                Enter your email address to reset your password.
              </Text>
            </View>
          </View>

          {/* --- Form Section --- */}
          <View style={styles.card}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize='none'
                  keyboardType='email-address'
                />
              </View>

              <TouchableOpacity
                onPress={handleResetPassword}
                style={styles.button}
                disabled={loading}
              >
                {loading && (
                  <ActivityIndicator
                    color={colors.primaryForeground}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.buttonText}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16,
      gap: 32,
    },
    header: {
      position: 'absolute',
      top: 16,
      left: 16,
      zIndex: 1,
    },
    backButton: {
      padding: 8,
    },
    brandSection: {
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    logoContainer: {
      width: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoImage: {
      width: 80,
      height: 80,
    },
    appNameContainer: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
    },
    appName: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      color: colors.accentForeground,
    },
    appDescription: {
      textAlign: 'center',
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      color: colors.mutedForeground,
      maxWidth: '100%',
      lineHeight: 24,
    },
    card: {
      backgroundColor: colors.background,
    },
    form: {
      gap: 20,
    },
    inputGroup: {
      gap: 6,
    },
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.mutedForeground,
    },
    input: {
      height: 44,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
    },
    button: {
      marginTop: 24,
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      shadowColor: colors.primary,
    },
    buttonText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    linkButton: {
      alignItems: 'center',
      padding: 10,
    },
    linkText: {
      color: colors.primary,
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
    },
  });
