/**
 * Login Screen Template
 * 
 * A ready-to-use login screen with email/password authentication.
 * Customize as needed for your design.
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/toast';

export function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email, password });
      showToast({ message: 'Welcome back!', type: 'success' });
      router.replace('/');
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Login failed',
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
            Welcome Back
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginBottom: theme.spacing[8] }}
          >
            Sign in to continue
          </Text>

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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            containerStyle={{ marginBottom: theme.spacing[2] }}
          />

          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.push('/auth/forgot-password' as any)}
            style={{ alignSelf: 'flex-end', marginBottom: theme.spacing[6] }}
          >
            Forgot Password?
          </Button>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleLogin}
            isLoading={isLoading}
            style={{ marginBottom: theme.spacing[4] }}
          >
            Sign In
          </Button>

          <View style={styles.footer}>
            <Text variant="body" color="secondary">
              Don't have an account?{' '}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push('/auth/register' as any)}
            >
              Sign Up
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
