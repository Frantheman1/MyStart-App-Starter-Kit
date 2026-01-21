/**
 * Animated Components
 * 
 * Pre-built animated components ready to use.
 * 
 * Usage:
 *   <FadeIn>
 *     <YourComponent />
 *   </FadeIn>
 */

import React, { ReactNode } from 'react';
import { Animated, ViewStyle } from 'react-native';
import {
  useFadeIn,
  useSlideIn,
  useScaleIn,
  usePulse,
  useFloat,
  AnimationConfig,
} from './hooks';

interface AnimatedWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  config?: AnimationConfig;
}

/**
 * Fade In Component
 */
export function FadeIn({ children, style, config }: AnimatedWrapperProps) {
  const opacity = useFadeIn(config);

  return (
    <Animated.View style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
}

/**
 * Slide In Component
 */
interface SlideInProps extends AnimatedWrapperProps {
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

export function SlideIn({ children, style, direction = 'left', config }: SlideInProps) {
  const { translateX, translateY } = useSlideIn(direction, config);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Scale In Component (Pop)
 */
export function ScaleIn({ children, style, config }: AnimatedWrapperProps) {
  const scale = useScaleIn(config);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Pulse Component (Breathing)
 */
interface PulseProps extends AnimatedWrapperProps {
  minScale?: number;
  maxScale?: number;
}

export function Pulse({ children, style, config, minScale, maxScale }: PulseProps) {
  const pulse = usePulse({ ...config, minScale, maxScale });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulse }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Float Component (Hover)
 */
export function Float({ children, style, config }: AnimatedWrapperProps) {
  const translateY = useFloat(config);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Fade and Slide In (combined)
 */
export function FadeSlideIn({ children, style, direction = 'bottom', config }: SlideInProps) {
  const opacity = useFadeIn(config);
  const { translateX, translateY } = useSlideIn(direction, config);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Fade and Scale In (combined)
 */
export function FadeScaleIn({ children, style, config }: AnimatedWrapperProps) {
  const opacity = useFadeIn(config);
  const scale = useScaleIn(config);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Stagger List - Animate children with stagger
 */
interface StaggerListProps {
  children: ReactNode[];
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
  style?: ViewStyle;
}

export function StaggerList({
  children,
  staggerDelay = 100,
  animationType = 'fade',
  style,
}: StaggerListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => {
        const config = { delay: index * staggerDelay };
        
        switch (animationType) {
          case 'slide':
            return <SlideIn config={config} style={style}>{child}</SlideIn>;
          case 'scale':
            return <ScaleIn config={config} style={style}>{child}</ScaleIn>;
          case 'fade':
          default:
            return <FadeIn config={config} style={style}>{child}</FadeIn>;
        }
      })}
    </>
  );
}
