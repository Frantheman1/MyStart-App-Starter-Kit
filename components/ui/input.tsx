/**
 * Input Component
 * 
 * A themed text input with label, error states, and icons.
 * 
 * Usage:
 *   <Input
 *     label="Email"
 *     placeholder="Enter your email"
 *     value={email}
 *     onChangeText={setEmail}
 *     error="Invalid email"
 *   />
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="caption"
          weight="medium"
          style={{ marginBottom: theme.spacing[1], color: theme.colors.text }}
        >
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.primary
              : theme.colors.border,
            borderRadius: theme.borderRadius.base,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          {...props}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.base,
              paddingHorizontal: theme.spacing[3],
              paddingVertical: theme.spacing[3],
            },
            leftIcon ? { paddingLeft: theme.spacing[1] } : {},
            rightIcon ? { paddingRight: theme.spacing[1] } : {},
            style,
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {(error || helperText) && (
        <Text
          variant="caption"
          color={error ? 'error' : 'secondary'}
          style={{ marginTop: theme.spacing[1] }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minHeight: 44,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
});
