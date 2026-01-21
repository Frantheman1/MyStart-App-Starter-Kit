/**
 * Register Screen Template
 * 
 * A ready-to-use registration screen.
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/toast';

export function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({ name, email, password });
      showToast({ message: 'Account created successfully!', type: 'success' });
      router.replace('/');
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Registration failed',
        type: 'error',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { padding: theme.spacing[6] }]}>
          <Text variant="h1" align="center" style={{ marginBottom: theme.spacing[2] }}>
            Create Account
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginBottom: theme.spacing[6] }}
          >
            Sign up to get started
          </Text>

          <Input
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
            containerStyle={{ marginBottom: theme.spacing[4] }}
          />

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            containerStyle={{ marginBottom: theme.spacing[4] }}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            containerStyle={{ marginBottom: theme.spacing[4] }}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            containerStyle={{ marginBottom: theme.spacing[6] }}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleRegister}
            isLoading={isLoading}
            style={{ marginBottom: theme.spacing[4] }}
          >
            Create Account
          </Button>

          <View style={styles.footer}>
            <Text variant="body" color="secondary">
              Already have an account?{' '}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push('/auth/login' as any)}
            >
              Sign In
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
