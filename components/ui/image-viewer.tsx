/**
 * Image Viewer
 * 
 * Full-screen image viewer with zoom and pan.
 * 
 * Usage:
 *   <ImageViewer
 *     visible={showViewer}
 *     imageUri={imageUri}
 *     onClose={() => setShowViewer(false)}
 *   />
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
  Platform,
} from 'react-native';
import { Text } from './text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ImageViewerProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  title?: string;
}

export function ImageViewer({ visible, imageUri, onClose, title }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => scale > 1,
      onMoveShouldSetPanResponder: () => scale > 1,
      onPanResponderMove: (_, gestureState) => {
        if (scale > 1) {
          translateXAnim.setValue(gestureState.dx);
          translateYAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
      Animated.parallel([
        Animated.spring(translateXAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();
      setScale(1);
      },
    })
  ).current;

  const handleDoubleTap = () => {
    if (scale === 1) {
      Animated.spring(scaleAnim, {
        toValue: 2,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      setScale(2);
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      Animated.parallel([
        Animated.spring(translateXAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
      setScale(1);
    }
  };

  const handleClose = () => {
    // Reset zoom
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setScale(1);
        onClose();
      });
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
        {/* Header */}
        {title && (
          <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <Text variant="h4" style={{ color: '#fff' }}>
              {title}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: '#fff' }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image */}
        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleClose}
            onLongPress={handleDoubleTap}
            style={styles.imageTouchable}
          >
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateX: translateXAnim },
                    { translateY: translateYAnim },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <Text variant="caption" style={{ color: '#fff', textAlign: 'center' }}>
            Double tap to zoom • Pinch to zoom • Drag to pan
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 16,
  },
});
