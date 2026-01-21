/**
 * Forgot Password Screen Template
 * 
 * A ready-to-use password recovery screen.
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/toast';

export function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { resetPassword, isLoading } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    try {
      await resetPassword({ email });
      setSubmitted(true);
      showToast({
        message: 'Password reset instructions sent to your email',
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Failed to send reset email',
        type: 'error',
      });
    }
  };

  if (submitted) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, padding: theme.spacing[6] },
        ]}
      >
        <View style={styles.content}>
          <Text variant="h2" align="center" style={{ marginBottom: theme.spacing[4] }}>
            Check Your Email
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginBottom: theme.spacing[6] }}>
            We've sent password reset instructions to {email}
          </Text>
          <Button variant="primary" fullWidth onPress={() => router.back()}>
            Back to Login
          </Button>
        </View>
      </View>
    );
  }

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
            Forgot Password?
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginBottom: theme.spacing[6] }}
          >
            Enter your email and we'll send you instructions to reset your password
          </Text>

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            containerStyle={{ marginBottom: theme.spacing[6] }}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            isLoading={isLoading}
            style={{ marginBottom: theme.spacing[4] }}
          >
            Send Reset Instructions
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.back()}
          >
            Back to Login
          </Button>
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
});
