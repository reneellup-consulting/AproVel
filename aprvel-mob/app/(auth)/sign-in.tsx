import { GoogleLogo } from '@/components/ui/icons/google-logo';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // The AuthGuard in _layout will automatically redirect on success/status change
    } catch (e: any) {
      toast.show({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const colors = useAppColors();
  const styles = makeStyles(colors);
  const { colorScheme } = useColorScheme();

  const handleSignIn = async () => {
    let hasError = false;
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await signIn({ email, password });
      // The AuthGuard in _layout will automatically redirect on success
    } catch (e: any) {
      toast.show({
        type: 'error',
        title: "We're unable to sign you in",
        message:
          'Email and password do not match. Please try again. If email and password do not work, your account may have been disabled.',
        duration: 7000,
      });
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
              <Text style={styles.appName}>Log in to your account</Text>
              <Text style={styles.appDescription}>
                Welcome back! Please enter your details.
              </Text>
            </View>
          </View>

          {/* --- Sign In Form Card --- */}
          <View style={styles.card}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  autoCapitalize='none'
                  keyboardType='email-address'
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder='Enter your password'
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize='none'
                  right={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={{ marginRight: 12 }}
                    >
                      {showPassword ? (
                        <Eye size={20} color={colors.icon} />
                      ) : (
                        <EyeOff size={20} color={colors.icon} />
                      )}
                    </TouchableOpacity>
                  }
                />
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={{ alignSelf: 'flex-end', marginTop: 8 }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                    }}
                  >
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flex: 1,
                  gap: 16,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={handleSignIn}
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
                    {loading ? 'Signing In' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  style={[styles.button, styles.googleButton]}
                  disabled={loading}
                >
                  <GoogleLogo style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, styles.googleButtonText]}>
                    Sign in with Google
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up' as any)}
                style={styles.signUpContainer}
              >
                <Text style={styles.noAccountText}>
                  Don't have an account?{' '}
                </Text>
                <Text style={styles.signUpText}>Sign Up</Text>
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
    // Branding Styles
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
    // Card Styles
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
    passwordContainer: {
      height: 44,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    passwordInput: {
      flex: 1,
      height: '100%',
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      paddingVertical: 0,
    },
    button: {
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
    googleButton: {
      marginTop: 0,
      backgroundColor: colors.accent,
      borderWidth: 1,
      borderColor: colors.border,
    },
    googleButtonText: {
      color: colors.mutedForeground,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: colors.mutedForeground,
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },
    noAccountText: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
    },
    signUpText: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
    },
    errorText: {
      color: colors.red,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      marginLeft: 4,
    },
  });
