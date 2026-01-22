/**
 * QR Scanner Modal Component
 * 
 * Full-screen QR code scanner modal.
 * 
 * Usage:
 *   <QRScannerModal
 *     visible={showScanner}
 *     onClose={() => setShowScanner(false)}
 *     onScan={(result) => console.log(result)}
 *   />
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '@/theme';
import { logger } from '@/lib/logging/logger';

export interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (result: { type: string; data: string }) => void;
  title?: string;
}

export function QRScannerModal({
  visible,
  onClose,
  onScan,
  title = 'Scan QR Code',
}: QRScannerModalProps) {
  const theme = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [BarCodeScanner, setBarCodeScanner] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadScanner();
    } else {
      setScanned(false);
    }
  }, [visible]);

  const loadScanner = async () => {
    try {
      // @ts-ignore - Optional dependency
      const Scanner = await import('expo-barcode-scanner');
      setBarCodeScanner(Scanner.BarCodeScanner);

      const { status } = await Scanner.BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to scan QR codes.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      logger.error('Failed to load QR scanner', { error });
      Alert.alert('Error', 'QR scanner not available. Install: npx expo install expo-barcode-scanner');
      onClose();
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    logger.info('QR code scanned', { type, data });
    onScan({ type, data });
    
    // Auto close after a short delay
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!visible || !BarCodeScanner) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Camera Permission Required
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              Please enable camera permission in settings to scan QR codes.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.scannerContainer, { backgroundColor: '#000' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: '#fff' }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Scanner */}
        {hasPermission && BarCodeScanner && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeTypes={[
              BarCodeScanner.Constants.BarCodeType.qr,
              BarCodeScanner.Constants.BarCodeType.ean13,
              BarCodeScanner.Constants.BarCodeType.ean8,
              BarCodeScanner.Constants.BarCodeType.code128,
            ]}
          />
        )}

        {/* Overlay with scanning area */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={[styles.instruction, { color: '#fff' }]}>
              Point your camera at a QR code
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
