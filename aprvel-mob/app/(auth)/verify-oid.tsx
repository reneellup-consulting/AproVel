import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOid() {
  const { verifyOid, signOut } = useAuth();
  const [oid, setOid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = useAppColors();
  const styles = makeStyles(colors);
  const { colorScheme } = useColorScheme();
  const toast = useToast();

  const handleVerify = async () => {
    if (!oid.trim()) {
      setError('OID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOid(oid);
      toast.show({
        type: 'success',
        message: 'Account verified successfully!',
      });
      // Navigation is handled by AuthGuard
    } catch (e: any) {
      setError(e.message || 'Verification failed. Please check your OID.');
      toast.show({
        type: 'error',
        message: e.message || 'Verification failed.',
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

          <Text style={styles.title}>Link your account</Text>

          <Text style={styles.description}>
            Please enter your OID (Organization ID) to link your account as a
            Purchase Order Approver.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>OID</Text>
              <Input
                placeholder='Enter OID'
                value={oid}
                onChangeText={(text) => {
                  setOid(text);
                  if (error) setError('');
                }}
                autoCapitalize='none'
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <TouchableOpacity
              onPress={handleVerify}
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.buttonText}>Verify OID</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Cancel Verification</Text>
            </TouchableOpacity>
          </View>
        </View>
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
      justifyContent: 'center',
    },
    content: {
      padding: 24,
      gap: 24,
      alignItems: 'center',
    },
    logoContainer: {
      marginBottom: 10,
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
    form: {
      width: '100%',
      gap: 24,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.mutedForeground,
    },
    errorText: {
      color: colors.red,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
    },
    button: {
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },
    signOutButton: {
      alignSelf: 'center',
    },
    signOutText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
    },
  });
