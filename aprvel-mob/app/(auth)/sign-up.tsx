import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
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

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { signUp } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const { colorScheme } = useColorScheme();

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password =
          'Password must describe at least one uppercase letter';
        isValid = false;
      } else if (!/[a-z]/.test(password)) {
        newErrors.password =
          'Password must describe at least one lowercase letter';
        isValid = false;
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'Password must describe at least one number';
        isValid = false;
      } else if (!/[^a-zA-Z0-9]/.test(password)) {
        newErrors.password =
          'Password must describe at least one special character';
        isValid = false;
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp({ email, password, name });
      // Navigation is handled by AuthGuard in _layout
    } catch (e: any) {
      toast.show({
        type: 'error',
        title: 'Sign up failed',
        message: e.message || 'An error occurred during sign up',
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
              <Text style={styles.appName}>Create an account</Text>
              <Text style={styles.appDescription}>
                Enter your details to sign up for Aprvel
              </Text>
            </View>
          </View>

          {/* --- Sign Up Form --- */}
          <View style={styles.card}>
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <Input
                  placeholder='Enter your full name'
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  autoCapitalize='none'
                  keyboardType='email-address'
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder='Create a password'
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
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
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <Input
                  placeholder='Confirm your password'
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize='none'
                  right={
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={{ marginRight: 12 }}
                    >
                      {showConfirmPassword ? (
                        <Eye size={20} color={colors.icon} />
                      ) : (
                        <EyeOff size={20} color={colors.icon} />
                      )}
                    </TouchableOpacity>
                  }
                />
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <View
                style={{
                  flex: 1,
                  gap: 16,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={handleSignUp}
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
                    {loading ? 'Creating Account' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.signInContainer}
                >
                  <Text style={styles.hasAccountText}>
                    Already have an account?{' '}
                  </Text>
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>
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
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },
    hasAccountText: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
    },
    signInText: {
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
