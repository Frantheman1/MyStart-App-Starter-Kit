/**
 * EmptyState Component
 * 
 * Display an empty state with optional icon, title, description, and action.
 * 
 * Usage:
 *   <EmptyState
 *     title="No items found"
 *     description="Try adjusting your search"
 *     icon={<Icon name="search" />}
 *     action={{ label: "Clear filters", onPress: clearFilters }}
 *   />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';
import { Button } from './button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  style,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing[6] }, style]}>
      {icon && (
        <View style={[styles.iconContainer, { marginBottom: theme.spacing[4] }]}>
          {icon}
        </View>
      )}
      
      <Text variant="h3" align="center" style={{ marginBottom: theme.spacing[2] }}>
        {title}
      </Text>
      
      {description && (
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={{ marginBottom: theme.spacing[4] }}
        >
          {description}
        </Text>
      )}
      
      {action && (
        <Button
          variant="primary"
          onPress={action.onPress}
          style={{ marginTop: theme.spacing[2] }}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
