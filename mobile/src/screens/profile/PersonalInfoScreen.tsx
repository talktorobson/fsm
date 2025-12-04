/**
 * Yellow Grid Mobile - Personal Information Screen
 * Allows users to view and edit their profile details
 */

import React, { useState, useEffect } from 'react';
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
import { useAuthStore } from '../../store/auth.store';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  editable?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  autoFocus?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  editable = true,
  icon,
  autoFocus,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null, !editable && styles.inputDisabled]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={editable ? colors.gray[500] : colors.gray[400]}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.input, !editable && styles.inputTextDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          autoCorrect={false}
          autoFocus={autoFocus}
        />
        {!editable && (
          <Ionicons name="lock-closed" size={16} color={colors.gray[400]} style={styles.lockIcon} />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role?: string;
}

const PersonalInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  // Track changes
  useEffect(() => {
    const originalFirstName = user?.firstName || '';
    const originalLastName = user?.lastName || '';
    const originalPhone = (user as any)?.phone || '';

    setHasChanges(
      firstName !== originalFirstName ||
      lastName !== originalLastName ||
      phone !== originalPhone
    );
  }, [firstName, lastName, phone, user]);

  // Load latest profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await apiService.get<UserProfile>('/users/me');
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      // Update auth store with latest profile
      updateUser(profile as any);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const updatedProfile = await apiService.patch<UserProfile>('/users/me', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      });
      
      // Update auth store
      updateUser(updatedProfile as any);

      const showSuccess = () => {
        if (Platform.OS === 'web') {
          globalThis.alert('Profile updated successfully!');
        } else {
          Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK' }]);
        }
      };

      showSuccess();
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update profile. Please try again.';

      if (Platform.OS === 'web') {
        globalThis.alert(`Error\n\n${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (Platform.OS === 'web') {
        if (globalThis.confirm('You have unsaved changes. Are you sure you want to go back?')) {
          navigation.goBack();
        }
      } else {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to go back?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
          ]
        );
      }
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editable Fields */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Edit Your Details</Text>
            
            <FormInput
              label="First Name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) {
                  setErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              placeholder="Enter your first name"
              error={errors.firstName}
              icon="person"
              autoFocus
            />

            <FormInput
              label="Last Name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) {
                  setErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              placeholder="Enter your last name"
              error={errors.lastName}
              icon="person"
            />

            <FormInput
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              placeholder="+33 6 12 34 56 78"
              error={errors.phone}
              keyboardType="phone-pad"
              icon="call"
            />
          </Card>

          {/* Read-only Fields */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <Text style={styles.sectionNote}>These fields cannot be changed</Text>

            <FormInput
              label="Email Address"
              value={user?.email || ''}
              onChangeText={() => {}}
              placeholder=""
              icon="mail"
              editable={false}
            />

            <FormInput
              label="Role"
              value={user?.role || ''}
              onChangeText={() => {}}
              placeholder=""
              icon="shield"
              editable={false}
            />
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isSaving ? 'Saving...' : 'Save Changes'}
              variant="primary"
              size="lg"
              onPress={handleSave}
              disabled={isSaving || !hasChanges}
              icon={
                isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                )
              }
            />
          </View>

          {/* Cancel Link */}
          <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
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
  formCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  sectionNote: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
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
  inputDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  lockIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
  },
  inputTextDisabled: {
    color: colors.gray[500],
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

export default PersonalInfoScreen;
