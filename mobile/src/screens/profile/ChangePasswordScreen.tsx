/**
 * Yellow Grid Mobile - Change Password Screen
 * Allows users to change their password securely
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  autoFocus?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoFocus,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.gray[500]}
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character (!@#$%^&*)';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      const showSuccess = () => {
        if (Platform.OS === 'web') {
          globalThis.alert('Password changed successfully!\n\nPlease log in with your new password.');
        } else {
          Alert.alert(
            'Success',
            'Password changed successfully! Please log in with your new password.',
            [{ text: 'OK' }]
          );
        }
      };

      showSuccess();
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to change password. Please try again.';

      if (Platform.OS === 'web') {
        globalThis.alert(`Error\n\n${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary[600]} />
              <Text style={styles.infoText}>
                Your password must be at least 8 characters and include uppercase,
                lowercase, number, and special character.
              </Text>
            </View>
          </Card>

          {/* Form */}
          <Card style={styles.formCard}>
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (errors.currentPassword) {
                  setErrors((prev) => ({ ...prev, currentPassword: undefined }));
                }
              }}
              placeholder="Enter your current password"
              error={errors.currentPassword}
              autoFocus
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }
              }}
              placeholder="Enter your new password"
              error={errors.newPassword}
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              placeholder="Re-enter your new password"
              error={errors.confirmPassword}
            />
          </Card>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Changing Password...' : 'Change Password'}
              variant="primary"
              size="lg"
              onPress={handleChangePassword}
              disabled={isLoading}
              icon={
                isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="key" size={20} color={colors.white} />
                )
              }
            />
          </View>

          {/* Cancel Link */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.gray[900],
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  infoCard: {
    backgroundColor: colors.primary[50],
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    marginLeft: spacing.md,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputError: {
    borderColor: colors.danger[500],
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
  },
  eyeButton: {
    padding: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.danger[600],
    marginTop: spacing.xs,
  },
  buttonContainer: {
    marginBottom: spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    fontWeight: typography.fontWeight.medium as '500',
  },
});

export default ChangePasswordScreen;
