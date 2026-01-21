/**
 * Welcome Screens Component
 * 
 * Beautiful welcome/onboarding screens with swipe navigation.
 * 
 * Usage:
 *   <WelcomeScreens
 *     screens={[...]}
 *     onComplete={() => completeOnboarding()}
 *   />
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  ViewToken,
  Platform,
} from 'react-native';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface WelcomeScreen {
  id: string;
  title: string;
  description: string;
  icon?: string; // Emoji or icon
  image?: any; // Image source
}

export interface WelcomeScreensProps {
  screens: WelcomeScreen[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function WelcomeScreens({ screens, onComplete, onSkip }: WelcomeScreensProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const isLastScreen = currentIndex === screens.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Screens */}
      <FlatList
        ref={flatListRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.screen, { width: SCREEN_WIDTH }]}>
            <View style={styles.screenContent}>
              {/* Icon/Image */}
              {item.icon && (
                <Text
                  variant="h1"
                  style={{
                    fontSize: 80,
                    marginBottom: theme.spacing[6],
                  }}
                >
                  {item.icon}
                </Text>
              )}

              {/* Title */}
              <Text
                variant="h1"
                align="center"
                style={{ marginBottom: theme.spacing[3] }}
              >
                {item.title}
              </Text>

              {/* Description */}
              <Text
                variant="bodyLarge"
                color="secondary"
                align="center"
                style={{ maxWidth: 300 }}
              >
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Navigation Footer */}
      <View style={[styles.footer, { padding: theme.spacing[6] }]}>
        {/* Progress Dots */}
        <View style={styles.pagination}>
          {screens.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: theme.colors.primary,
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLastScreen && onSkip && (
            <Button variant="ghost" onPress={onSkip}>
              Skip
            </Button>
          )}
          <View style={{ flex: 1 }} />
          <Button variant="primary" onPress={handleNext}>
            {isLastScreen ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
