/**
 * Search Bar Component
 * 
 * Search input with debouncing and clear button.
 * 
 * Usage:
 *   <SearchBar
 *     value={query}
 *     onChangeText={setQuery}
 *     onSearch={handleSearch}
 *     placeholder="Search..."
 *   />
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface SearchBarProps extends TextInputProps {
  onSearch?: (query: string) => void;
  debounceMs?: number;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onSearch,
  debounceMs = 300,
  showCancelButton = false,
  onCancel,
  placeholder = 'Search...',
  ...props
}: SearchBarProps) {
  const theme = useTheme();
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value && onSearch) {
      debounceTimer.current = setTimeout(() => {
        onSearch(value as string);
      }, debounceMs) as any;
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current as any);
      }
    };
  }, [value, onSearch, debounceMs]);

  const handleClear = () => {
    onChangeText?.('');
    onSearch?.('');
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.base,
          },
        ]}
      >
        {/* Search Icon */}
        <Text variant="body" style={styles.searchIcon}>
          🔍
        </Text>

        {/* Input */}
        <TextInput
          {...props}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.base,
            },
          ]}
        />

        {/* Clear Button */}
        {value && value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text variant="body" color="tertiary">
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cancel Button */}
      {showCancelButton && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text variant="body" color="primary">
            Cancel
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  cancelButton: {
    marginLeft: 12,
  },
});
