/**
 * Image Picker Utilities
 * 
 * Simplified image picking from camera or gallery.
 * Requires: npx expo install expo-image-picker
 * 
 * Usage:
 *   const { pickImage, takePhoto } = useImagePicker();
 *   const result = await pickImage();
 *   if (result) {
 *     console.log(result.uri);
 *   }
 */

import { useState } from 'react';

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number; // 0-1
  allowsMultipleSelection?: boolean;
  mediaTypes?: 'images' | 'videos' | 'all';
}

/**
 * Hook for image picking functionality
 */
export function useImagePicker() {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async (options: ImagePickerOptions = {}): Promise<ImageResult | null> => {
    setIsLoading(true);
    try {
      // Dynamic import to avoid errors if expo-image-picker is not installed
      // @ts-ignore - Optional dependency
      const ImagePicker: any = await import('expo-image-picker');

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options.mediaTypes === 'videos' 
          ? ImagePicker.MediaTypeOptions.Videos
          : options.mediaTypes === 'all'
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type as 'image' | 'video',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      };
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (options: ImagePickerOptions = {}): Promise<ImageResult | null> => {
    setIsLoading(true);
    try {
      // Dynamic import
      // @ts-ignore - Optional dependency
      const ImagePicker: any = await import('expo-image-picker');

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return null;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [1, 1],
        quality: options.quality ?? 0.8,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: 'image',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickImage,
    takePhoto,
    isLoading,
  };
}

/**
 * Compress image (placeholder - requires expo-image-manipulator)
 */
export async function compressImage(
  uri: string,
  quality: number = 0.7
): Promise<string> {
  try {
    // @ts-ignore - Optional dependency
    const ImageManipulator: any = await import('expo-image-manipulator');
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Image compression not available. Install: npx expo install expo-image-manipulator');
    return uri;
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const Image = require('react-native').Image;
    Image.getSize(
      uri,
      (width: number, height: number) => resolve({ width, height }),
      () => resolve({ width: 0, height: 0 })
    );
  });
}
