/**
 * Privacy Settings Screen
 * 
 * Template screen for managing privacy and consent preferences.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTheme } from '@/theme';
import { Text, Button, Card } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { consentManager, ConsentPreferences } from '@/lib/privacy/consent';
import { dataDeletion } from '@/lib/privacy/data-deletion';
import { useAuth } from '@/features/auth';

export function PrivacySettingsScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { user, deleteAccount } = useAuth();
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = consentManager.getPreferences();
    setPreferences(prefs);
  };

  const handleToggle = async (type: keyof Omit<ConsentPreferences, 'lastUpdated'>) => {
    if (!preferences || type === 'functional') return;

    const newValue = !preferences[type];
    
    if (newValue) {
      await consentManager.grantConsent(type);
    } else {
      await consentManager.revokeConsent(type);
    }

    await loadPreferences();
    showToast({
      message: `${type} ${newValue ? 'enabled' : 'disabled'}`,
      type: 'success',
    });
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await dataDeletion.requestDataExport({
        userId: user.id,
        format: 'json',
      });
      
      showToast({
        message: 'Data export prepared. Check your email for download link.',
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: 'Failed to export data. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await deleteAccount();
      showToast({
        message: 'Account deleted successfully',
        type: 'success',
      });
    } catch (error) {
      showToast({
        message: 'Failed to delete account. Please try again.',
        type: 'error',
      });
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: theme.spacing[4] }}
    >
      <Text variant="h2" style={{ marginBottom: theme.spacing[4] }}>
        Privacy & Data
      </Text>

      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h4" style={{ marginBottom: theme.spacing[3] }}>
          Data Collection Preferences
        </Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text variant="body" weight="medium">
              Analytics
            </Text>
            <Text variant="caption" color="secondary">
              Help us improve by sharing usage data
            </Text>
          </View>
          <Switch
            value={preferences?.analytics ?? false}
            onValueChange={() => handleToggle('analytics')}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text variant="body" weight="medium">
              Crash Reporting
            </Text>
            <Text variant="caption" color="secondary">
              Automatically report app crashes
            </Text>
          </View>
          <Switch
            value={preferences?.crashReporting ?? false}
            onValueChange={() => handleToggle('crashReporting')}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text variant="body" weight="medium">
              Marketing
            </Text>
            <Text variant="caption" color="secondary">
              Receive personalized offers and updates
            </Text>
          </View>
          <Switch
            value={preferences?.marketing ?? false}
            onValueChange={() => handleToggle('marketing')}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
          />
        </View>

        <View style={[styles.preferenceItem, { borderBottomWidth: 0 }]}>
          <View style={styles.preferenceText}>
            <Text variant="body" weight="medium">
              Functional
            </Text>
            <Text variant="caption" color="secondary">
              Required for app to function properly
            </Text>
          </View>
          <Switch
            value={true}
            disabled
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
          />
        </View>
      </Card>

      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h4" style={{ marginBottom: theme.spacing[2] }}>
          Your Data
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
          You have the right to access and control your personal data
        </Text>

        <Button
          variant="outline"
          fullWidth
          onPress={handleExportData}
          isLoading={isLoading}
          style={{ marginBottom: theme.spacing[3] }}
        >
          Export My Data
        </Button>

        <Text variant="caption" color="secondary">
          Download a copy of your data in JSON format
        </Text>
      </Card>

      <Card variant="outlined">
        <Text variant="h4" style={{ marginBottom: theme.spacing[2] }} color="error">
          Danger Zone
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </Text>

        <Button
          variant="danger"
          fullWidth
          onPress={handleDeleteAccount}
          isLoading={isLoading}
        >
          Delete My Account
        </Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
});
