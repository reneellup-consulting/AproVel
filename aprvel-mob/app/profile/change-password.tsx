import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useAppColors } from '@/hooks/useAppColors';
import { useFinalHeaderHeight } from '@/hooks/useFinalHeaderHeight';
import { AppColors } from '@/interfaces/color';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const { changePassword } = useAuth();
  const finalHeaderHeight = useFinalHeaderHeight();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation Errors
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleCurrentPassword = () => setShowCurrentPassword((prev) => !prev);
  const toggleNewPassword = () => setShowNewPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const validate = () => {
    let isValid = true;
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      isValid = false;
    }

    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else {
      if (newPassword.length < 8) {
        setNewPasswordError('Password must be at least 8 characters');
        isValid = false;
      } else if (!/[A-Z]/.test(newPassword)) {
        setNewPasswordError(
          'Password must describe at least one uppercase letter',
        );
        isValid = false;
      } else if (!/[a-z]/.test(newPassword)) {
        setNewPasswordError(
          'Password must describe at least one lowercase letter',
        );
        isValid = false;
      } else if (!/[0-9]/.test(newPassword)) {
        setNewPasswordError('Password must describe at least one number');
        isValid = false;
      } else if (!/[^a-zA-Z0-9]/.test(newPassword)) {
        setNewPasswordError(
          'Password must describe at least one special character',
        );
        isValid = false;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleChangePassword = async () => {
    Keyboard.dismiss();

    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({
        oldPassword: currentPassword,
        password: newPassword,
        passwordAgain: confirmPassword,
      });

      toast.show({
        type: 'success',
        message: 'Password changed successfully',
      });
      router.back();
    } catch (error: any) {
      toast.show({
        type: 'error',
        title: 'Failed to change password',
        message: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordIcon = (isVisible: boolean, toggle: () => void) => (
    <TouchableOpacity
      onPress={toggle}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{ marginRight: 12 }}
    >
      {isVisible ? (
        <Eye size={20} color={colors.mutedForeground} />
      ) : (
        <EyeOff size={20} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title='Change Password'
        enableBackground={true}
        showBackButton={true}
      />
      <View style={[styles.contentWrapper, { paddingTop: finalHeaderHeight }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <Input
                placeholder='Enter current password'
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (currentPasswordError) setCurrentPasswordError('');
                }}
                right={renderPasswordIcon(
                  showCurrentPassword,
                  toggleCurrentPassword,
                )}
              />
              {currentPasswordError ? (
                <Text style={styles.errorText}>{currentPasswordError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <Input
                placeholder='Enter new password'
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (newPasswordError) setNewPasswordError('');
                }}
                right={renderPasswordIcon(showNewPassword, toggleNewPassword)}
              />
              {newPasswordError ? (
                <Text style={styles.errorText}>{newPasswordError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <Input
                placeholder='Confirm new password'
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                right={renderPasswordIcon(
                  showConfirmPassword,
                  toggleConfirmPassword,
                )}
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <View style={styles.footer}>
              <Button
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 12,
                  shadowColor: colors.primary,
                }}
                textStyle={{
                  fontSize: 16,
                  fontFamily: 'Inter_600SemiBold',
                }}
              >
                Change Password
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentWrapper: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      flexGrow: 1,
    },
    formContainer: {
      gap: 20,
      marginTop: 20,
      flex: 1, // Ensure it takes available space
    },
    inputGroup: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    // Hint style removed as requested
    errorText: {
      color: colors.red,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      marginLeft: 4,
    },
    footer: {
      marginTop: 'auto', // Pushes footer to bottom if space allows
      marginBottom: 20,
      paddingTop: 20, // Add some top spacing from inputs
    },
  });
