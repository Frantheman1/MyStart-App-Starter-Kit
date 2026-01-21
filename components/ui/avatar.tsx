/**
 * Avatar Component
 * 
 * Profile picture component with fallback initials.
 * 
 * Usage:
 *   <Avatar source={{ uri: user.avatar }} name="John Doe" size={64} />
 */

import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Text } from './text';
import { useTheme } from '@/theme';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  borderRadius?: number;
}

export function Avatar({ source, name, size = 48, borderRadius }: AvatarProps) {
  const theme = useTheme();
  const radius = borderRadius ?? size / 2;

  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  if (source) {
    return (
      <Image
        source={source}
        style={[containerStyle, styles.image]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text
        variant="body"
        weight="semibold"
        style={{
          color: theme.colors.background,
          fontSize: size * 0.4,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
});
