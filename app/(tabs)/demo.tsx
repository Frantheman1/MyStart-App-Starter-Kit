/**
 * Demo Screen
 * 
 * Showcases all the starter kit components and features.
 * This demonstrates what's available in your starter kit!
 */

import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Input,
  Loader,
  Modal,
  SearchBar,
  SkeletonCard,
  Text,
  SwipeableItem,
  ImageViewer,
  InfiniteScroll,
  Paywall,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { analytics, AnalyticsEvents } from '@/lib/analytics/analytics';
import {
  FadeIn,
  FadeSlideIn,
  Float,
  Pulse,
  ScaleIn,
  SlideIn,
  usePressAnimation,
  useRotate,
  useShake,
  useWiggle,
} from '@/lib/animations';
import { useBiometric } from '@/lib/auth';
import { useClipboard } from '@/lib/clipboard';
import { useHaptics } from '@/lib/haptics';
import { composeValidators, useForm, validators } from '@/lib/forms';
import { useTranslation } from '@/lib/i18n';
import { logger } from '@/lib/logging/logger';
import { useImagePicker } from '@/lib/media';
import { useNetworkStatus } from '@/lib/network';
import { usePermissions } from '@/lib/permissions';
import { useShare } from '@/lib/share';
import { useKeyboard, dismissKeyboard } from '@/lib/keyboard';
import { QRScannerModal } from '@/lib/qr-scanner';
import { useLocation } from '@/lib/location';
import { useAppVersion } from '@/lib/app-version';
import { useRateLimit } from '@/lib/rate-limit';
import { useGeofencing, useProximity } from '@/lib/geofencing';
import { useTrial } from '@/lib/trial';
import { useInAppPurchase } from '@/lib/purchases';
import {
  usePushNotifications,
  scheduleLocalNotification,
  setBadgeCount,
  getBadgeCount,
} from '@/lib/notifications';
import { TourStep, useOnboarding } from '@/lib/onboarding';
import { formatDate, getRelativeTime, timeAgo } from '@/lib/utils/date-time';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import React, { useState, useEffect } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function DemoScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { state } = useStore();
  const { t, language, setLanguage } = useTranslation();
  const { pickImage, takePhoto, isLoading: imageLoading } = useImagePicker();
  const { isConnected, type: networkType } = useNetworkStatus();
  const { isAvailable: biometricAvailable, biometricType, authenticate } = useBiometric();
  const { expoPushToken, notification, error: notificationError } = usePushNotifications();
  const { startTour } = useOnboarding();
  const haptics = useHaptics();
  const { share, shareImage } = useShare();
  const { copy, getString } = useClipboard();
  const { request: requestPermission, check: checkPermission, showSettingsAlert } = usePermissions();
  const { confirm, alert } = useConfirmDialog();
  const { shakeAnim, shake } = useShake();
  const { wiggle, rotate } = useWiggle();
  const spinAnim = useRotate({ infinite: true });
  const { scaleAnim, animateIn, animateOut } = usePressAnimation();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [badgeCount, setBadgeCountState] = useState(0);
  const [clipboardText, setClipboardText] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<Record<string, string>>({});
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImageUri, setViewingImageUri] = useState<string | undefined>();
  const [infiniteScrollData, setInfiniteScrollData] = useState<number[]>([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [proximityStatus, setProximityStatus] = useState<string>('');
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { isVisible: keyboardVisible, height: keyboardHeight } = useKeyboard();
  const { getCurrentLocation, reverseGeocode } = useLocation();
  const { currentVersion, checkForUpdate, showUpdateAlert, openAppStore } = useAppVersion();
  const rateLimit = useRateLimit('demo-api-call', 5, 10000); // 5 calls per 10 seconds
  const { geofences, addGeofence, removeGeofence } = useGeofencing();
  const { checkProximity, nearbyLocations } = useProximity();
  const { isTrialActive, daysRemaining, daysUsed, isExpired, shouldShowPaywall, resetTrial } = useTrial({ trialDays: 3 });
  const { products, fetchProducts, purchaseProduct, restorePurchases, isLoading: purchaseLoading } = useInAppPurchase();

  // Form example
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: any = {};
      const emailError = composeValidators(
        validators.required('Email is required'),
        validators.email()
      )(values.email);
      if (emailError) errors.email = emailError;

      const passwordError = validators.minLength(6)(values.password);
      if (passwordError) errors.password = passwordError;

      return errors;
    },
    onSubmit: async (values) => {
      showToast({ message: 'Form submitted!', type: 'success' });
      console.log('Form values:', values);
    },
  });

  const handleButtonClick = (variant: string) => {
    showToast({ 
      message: `${variant} ${t('demo.buttonClicked')}`, 
      type: 'success' 
    });
    logger.info('Button clicked', { variant });
    analytics.track(AnalyticsEvents.BUTTON_CLICKED, { 
      button_name: variant,
      screen: 'demo',
    });
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'no' : 'en';
    setLanguage(newLang);
    showToast({
      message: newLang === 'en' ? 'Language changed to English' : 'Språk endret til norsk',
      type: 'success',
    });
  };

  const handlePickImage = async () => {
    const result = await pickImage({ allowsEditing: true, quality: 0.8 });
    if (result) {
      setAvatarUri(result.uri);
      showToast({ message: 'Image selected!', type: 'success' });
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto({ allowsEditing: true, quality: 0.8 });
    if (result) {
      setAvatarUri(result.uri);
      showToast({ message: 'Photo taken!', type: 'success' });
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    showToast({ message: `Searching: ${query}`, type: 'info' });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast({ message: 'Refreshed!', type: 'success' });
    }, 2000);
  };

  const handleBiometricAuth = async () => {
    const result = await authenticate({
      promptMessage: 'Authenticate to continue',
      cancelLabel: 'Cancel',
    });
    
    if (result.success) {
      showToast({ message: `Authenticated with ${result.biometricType}!`, type: 'success' });
    } else {
      showToast({ message: result.error || 'Authentication failed', type: 'error' });
    }
  };

  const handleStartTour = () => {
    const tourSteps: TourStep[] = [
      {
        id: 'welcome',
        title: '👋 Welcome to the Tour!',
        description: 'Let me show you around this amazing starter kit. You can skip anytime!',
        position: 'center',
      },
      {
        id: 'language',
        title: '🌐 Multi-Language Support',
        description: 'Switch between English and Norwegian instantly. Perfect for international apps!',
        position: 'top',
      },
      {
        id: 'components',
        title: '🎨 Beautiful Components',
        description: 'All the UI components you need: Buttons, Cards, Modals, Inputs, and more!',
        position: 'center',
      },
      {
        id: 'forms',
        title: '📝 Smart Forms',
        description: 'Forms with built-in validation, error handling, and submit management.',
        position: 'bottom',
      },
      {
        id: 'media',
        title: '📸 Media Handling',
        description: 'Pick images from gallery or take photos with camera. All permissions handled!',
        position: 'bottom',
      },
      {
        id: 'network',
        title: '📡 Network Aware',
        description: 'Automatically detects offline status and shows a banner. Queues requests!',
        position: 'center',
      },
      {
        id: 'complete',
        title: '🎉 You\'re All Set!',
        description: 'This is just a taste of what\'s included. Check the docs for everything else!',
        position: 'center',
      },
    ];

    startTour(tourSteps);
    logger.info('Interactive tour started');
    analytics.track('tour_started', { source: 'demo' });
  };

  const handleSendNotification = async () => {
    try {
      await scheduleLocalNotification({
        title: '🎉 Hello from Starter Kit!',
        body: 'This is a local notification. Works great for reminders and alerts!',
        sound: true,
        data: { type: 'demo', timestamp: Date.now() },
      });
      showToast({ message: 'Notification sent! Check your notification tray.', type: 'success' });
      analytics.track('notification_sent', { type: 'local' });
    } catch (error) {
      showToast({ 
        message: error instanceof Error ? error.message : 'Failed to send notification', 
        type: 'error' 
      });
    }
  };

  const handleScheduleNotification = async () => {
    try {
      await scheduleLocalNotification(
        {
          title: '⏰ Scheduled Notification',
          body: 'This notification was scheduled for 5 seconds from now!',
          sound: true,
        },
        { seconds: 5 }
      );
      showToast({ message: 'Notification scheduled for 5 seconds!', type: 'success' });
    } catch (error) {
      showToast({ 
        message: error instanceof Error ? error.message : 'Failed to schedule notification', 
        type: 'error' 
      });
    }
  };

  const handleUpdateBadge = async () => {
    try {
      const newCount = badgeCount + 1;
      await setBadgeCount(newCount);
      setBadgeCountState(newCount);
      showToast({ message: `Badge count: ${newCount}`, type: 'info' });
    } catch {
      showToast({ message: 'Failed to update badge', type: 'error' });
    }
  };

  const handleCheckBadge = async () => {
    try {
      const count = await getBadgeCount();
      setBadgeCountState(count);
      showToast({ message: `Current badge count: ${count}`, type: 'info' });
    } catch {
      showToast({ message: 'Failed to get badge count', type: 'error' });
    }
  };

  // Haptic Feedback Handlers
  const handleHapticImpact = async (style: 'light' | 'medium' | 'heavy') => {
    await haptics.impact(style);
    showToast({ message: `${style} impact haptic`, type: 'info' });
  };

  const handleHapticNotification = async (type: 'success' | 'warning' | 'error') => {
    await haptics.notification(type);
    showToast({ message: `${type} notification haptic`, type: 'info' });
  };

  // Share Handlers
  const handleShare = async () => {
    const result = await share('Check out this amazing starter kit! 🚀');
    if (result) {
      showToast({ message: 'Shared successfully!', type: 'success' });
    }
  };

  const handleShareImage = async () => {
    if (avatarUri) {
      const result = await shareImage(avatarUri, {
        title: 'My Avatar',
        message: 'Check out my avatar!',
      });
      if (result) {
        showToast({ message: 'Image shared!', type: 'success' });
      }
    } else {
      showToast({ message: 'Pick an image first!', type: 'warning' });
    }
  };

  // Clipboard Handlers
  const handleCopyToClipboard = async () => {
    const text = 'Hello from Starter Kit! 📋';
    const success = await copy(text);
    if (success) {
      showToast({ message: 'Copied to clipboard!', type: 'success' });
      haptics.selection();
    }
  };

  const handlePasteFromClipboard = async () => {
    const text = await getString();
    setClipboardText(text);
    if (text) {
      showToast({ message: 'Pasted from clipboard!', type: 'success' });
    } else {
      showToast({ message: 'Clipboard is empty', type: 'info' });
    }
  };

  // Permission Handlers
  const handleRequestPermission = async (type: 'camera' | 'mediaLibrary' | 'notifications' | 'location') => {
    const result = await requestPermission(type);
    setPermissionStatus((prev) => ({
      ...prev,
      [type]: result.granted ? '✅ Granted' : result.canAskAgain ? '❌ Denied' : '🚫 Blocked',
    }));
    
    if (result.granted) {
      showToast({ message: `${type} permission granted!`, type: 'success' });
      haptics.success();
    } else if (!result.canAskAgain) {
      showSettingsAlert(type);
    } else {
      showToast({ message: `${type} permission denied`, type: 'warning' });
    }
  };

  const handleCheckPermission = async (type: 'camera' | 'mediaLibrary' | 'notifications' | 'location') => {
    const result = await checkPermission(type);
    setPermissionStatus((prev) => ({
      ...prev,
      [type]: result.granted ? '✅ Granted' : result.canAskAgain ? '❌ Denied' : '🚫 Blocked',
    }));
    showToast({ 
      message: `${type}: ${result.granted ? 'Granted' : 'Not granted'}`, 
      type: result.granted ? 'success' : 'info' 
    });
  };

  // Confirmation Dialog Handlers
  const handleConfirmDialog = async () => {
    const confirmed = await confirm({
      title: 'Delete Item?',
      message: 'This action cannot be undone. Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      showToast({ message: 'Item deleted!', type: 'success' });
      haptics.success();
    } else {
      showToast({ message: 'Cancelled', type: 'info' });
    }
  };

  const handleAlertDialog = async () => {
    await alert('Important Notice', 'This is an alert dialog. Click OK to dismiss.');
    showToast({ message: 'Alert dismissed', type: 'info' });
  };

  // QR Scanner Handlers
  const handleQRScan = (result: { type: string; data: string }) => {
    setQrScanResult(result.data);
    showToast({ message: `QR Code scanned: ${result.data}`, type: 'success' });
    haptics.success();
  };

  // Location Handlers
  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
      showToast({ message: 'Location retrieved!', type: 'success' });
      haptics.success();
      
      // Reverse geocode
      const address = await reverseGeocode(location.coords);
      if (address) {
        setLocationAddress(address.address || null);
      }
    } else {
      showToast({ message: 'Failed to get location', type: 'error' });
    }
  };

  // Image Viewer Handlers
  const handleViewImage = (uri: string) => {
    setViewingImageUri(uri);
    setShowImageViewer(true);
  };

  // App Version Handlers
  const handleCheckVersion = async () => {
    // In a real app, you'd provide your API URL here
    // For demo, we'll simulate a version check
    const versionInfo = await checkForUpdate();
    if (versionInfo.needsUpdate) {
      showUpdateAlert(
        () => {
          showToast({ message: 'Opening app store...', type: 'info' });
        },
        () => {
          showToast({ message: 'Update skipped', type: 'info' });
        }
      );
    } else {
      showToast({ message: 'App is up to date!', type: 'success' });
    }
  };

  const handleSimulateOutdated = async () => {
    // Simulate an outdated version scenario
    showToast({ 
      message: 'Simulating outdated app...', 
      type: 'info' 
    });
    
    // Show alert as if update is needed
    showUpdateAlert(
      () => {
        showToast({ message: 'Would open app store in production!', type: 'success' });
        haptics.success();
      },
      () => {
        showToast({ message: 'Update skipped', type: 'info' });
      }
    );
  };

  // Rate Limiting Handlers
  const handleRateLimitedAction = () => {
    const canProceed = rateLimit.check();
    if (canProceed) {
      const remaining = rateLimit.getRemaining();
      showToast({ 
        message: `Action allowed! ${remaining} requests remaining.`, 
        type: 'success' 
      });
      haptics.success();
    } else {
      const resetTime = rateLimit.getTimeUntilReset();
      showToast({ 
        message: `Rate limited! Try again in ${resetTime} seconds.`, 
        type: 'error' 
      });
      haptics.error();
    }
  };

  // Infinite Scroll Handlers
  useEffect(() => {
    // Initialize with first 10 items
    setInfiniteScrollData(Array.from({ length: 10 }, (_, i) => i + 1));
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreItems) return;

    setIsLoadingMore(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentLength = infiniteScrollData.length;
    const newItems = Array.from(
      { length: 10 }, 
      (_, i) => currentLength + i + 1
    );

    setInfiniteScrollData((prev) => [...prev, ...newItems]);

    // Stop after 50 items for demo
    if (currentLength + 10 >= 50) {
      setHasMoreItems(false);
    }

    setIsLoadingMore(false);
  };

  // Geofencing Handlers
  const handleAddGeofence = async () => {
    if (currentLocation) {
      await addGeofence({
        id: `geofence-${Date.now()}`,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 100, // 100 meters
        notifyOnEnter: true,
        notifyOnExit: true,
      });
      showToast({ message: 'Geofence added at current location!', type: 'success' });
      haptics.success();
    } else {
      showToast({ message: 'Get your location first!', type: 'warning' });
    }
  };

  const handleCheckProximity = async () => {
    if (!currentLocation) {
      showToast({ message: 'Get your location first!', type: 'warning' });
      return;
    }

    // Demo locations (you can replace with real locations)
    const demoLocations = [
      {
        id: 'location-1',
        name: 'Demo Location 1',
        latitude: currentLocation.coords.latitude + 0.001, // ~100m away
        longitude: currentLocation.coords.longitude,
        radius: 50,
        onReach: () => {
          showToast({ message: '🎉 Reached Location 1!', type: 'success' });
          haptics.success();
        },
      },
      {
        id: 'location-2',
        name: 'Demo Location 2',
        latitude: currentLocation.coords.latitude - 0.002, // ~200m away
        longitude: currentLocation.coords.longitude,
        radius: 50,
        onReach: () => {
          showToast({ message: '🎉 Reached Location 2!', type: 'success' });
          haptics.success();
        },
      },
    ];

    const nearby = await checkProximity(demoLocations, 50);
    const reached = nearby.filter((l) => l.isReached);
    
    if (reached.length > 0) {
      setProximityStatus(`${reached.length} location(s) reached!`);
    } else {
      const closest = nearby[0];
      setProximityStatus(`Closest: ${closest.name} (${closest.distance}m away)`);
    }
  };

  // Trial & Paywall Handlers
  useEffect(() => {
    // Show paywall if trial expired
    if (shouldShowPaywall() && !showPaywall) {
      // Auto-show paywall after a delay (for demo purposes)
      // In production, you'd show this immediately
      setTimeout(() => {
        setShowPaywall(true);
      }, 2000);
    }
  }, [shouldShowPaywall, showPaywall]);

  const handleSubscribe = async (productId: string) => {
    const result = await purchaseProduct(productId);
    if (result.success) {
      showToast({ message: 'Subscription successful!', type: 'success' });
      haptics.success();
      setShowPaywall(false);
      // In production, you'd also call endTrial() here
    } else {
      showToast({ message: result.error || 'Purchase failed', type: 'error' });
      haptics.error();
    }
  };

  const handleRestorePurchases = async () => {
    const results = await restorePurchases();
    if (results.length > 0) {
      showToast({ message: `${results.length} purchase(s) restored!`, type: 'success' });
      haptics.success();
    } else {
      showToast({ message: 'No purchases to restore', type: 'info' });
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: theme.spacing[4] }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={{ marginBottom: theme.spacing[6] }}>
        <Text variant="h1" style={{ marginBottom: theme.spacing[2] }}>
          🚀 {t('demo.title')}
        </Text>
        <Text variant="body" color="secondary">
          {t('demo.subtitle')}
        </Text>
      </View>

      {/* Language Switcher */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          🌐 {t('demo.language')}
        </Text>
        <Button 
          variant="primary" 
          fullWidth 
          onPress={toggleLanguage}
        >
          {t('demo.switchLanguage')}
        </Button>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2], textAlign: 'center' }}>
          {language === 'en' ? 'Current: English' : 'Nåværende: Norsk'}
        </Text>
      </Card>

      {/* Typography */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          {t('demo.typography')}
        </Text>
        <Text variant="h4" style={{ marginBottom: theme.spacing[2] }}>{t('demo.heading4')}</Text>
        <Text variant="bodyLarge" style={{ marginBottom: theme.spacing[2] }}>{t('demo.bodyLarge')}</Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
          {t('demo.bodySecondary')}
        </Text>
        <Text variant="caption" color="tertiary">{t('demo.captionText')}</Text>
      </Card>

      {/* Buttons */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          {t('demo.buttons')}
        </Text>
        <Button 
          variant="primary" 
          fullWidth 
          onPress={() => handleButtonClick(t('demo.primaryButton'))}
          style={{ marginBottom: theme.spacing[2] }}
        >
          {t('demo.primaryButton')}
        </Button>
        <Button 
          variant="secondary" 
          fullWidth 
          onPress={() => handleButtonClick(t('demo.secondaryButton'))}
          style={{ marginBottom: theme.spacing[2] }}
        >
          {t('demo.secondaryButton')}
        </Button>
        <Button 
          variant="outline" 
          fullWidth 
          onPress={() => handleButtonClick(t('demo.outlineButton'))}
          style={{ marginBottom: theme.spacing[2] }}
        >
          {t('demo.outlineButton')}
        </Button>
        <Button 
          variant="ghost" 
          fullWidth 
          onPress={() => handleButtonClick(t('demo.ghostButton'))}
        >
          {t('demo.ghostButton')}
        </Button>
      </Card>

      {/* Inputs */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          {t('demo.inputFields')}
        </Text>
        <Input
          label={t('demo.email')}
          placeholder={t('demo.emailPlaceholder')}
          value={inputValue}
          onChangeText={setInputValue}
          helperText={t('demo.helperText')}
          containerStyle={{ marginBottom: theme.spacing[3] }}
        />
        <Input
          label={t('demo.password')}
          placeholder={t('demo.passwordPlaceholder')}
          secureTextEntry
          error={inputValue.length > 0 && inputValue.length < 6 ? t('demo.tooShort') : undefined}
        />
      </Card>

      {/* Interactive Features */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          {t('demo.interactiveFeatures')}
        </Text>
        
        <Button 
          variant="primary" 
          fullWidth 
          onPress={() => setModalVisible(true)}
          style={{ marginBottom: theme.spacing[2] }}
        >
          {t('demo.openModal')}
        </Button>

        <Button 
          variant="secondary" 
          fullWidth 
          onPress={() => {
            setShowLoader(true);
            setTimeout(() => setShowLoader(false), 2000);
          }}
          style={{ marginBottom: theme.spacing[2] }}
        >
          {t('demo.showLoader')}
        </Button>

        <Button 
          variant="outline" 
          fullWidth 
          onPress={() => setShowEmpty(!showEmpty)}
        >
          {t('demo.toggleEmpty')}
        </Button>
      </Card>

      {/* NEW: Form Management */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          📝 Form Management (NEW!)
        </Text>
        <Input
          label="Email (with validation)"
          placeholder="your@email.com"
          value={form.values.email}
          onChangeText={form.handleChange('email')}
          onBlur={form.handleBlur('email')}
          error={form.touched.email ? form.errors.email : undefined}
          containerStyle={{ marginBottom: theme.spacing[3] }}
        />
        <Input
          label="Password (min 6 chars)"
          placeholder="Enter password"
          value={form.values.password}
          onChangeText={form.handleChange('password')}
          onBlur={form.handleBlur('password')}
          error={form.touched.password ? form.errors.password : undefined}
          secureTextEntry
          containerStyle={{ marginBottom: theme.spacing[3] }}
        />
        <Button 
          variant="primary" 
          fullWidth 
          onPress={form.handleSubmit}
          isLoading={form.isSubmitting}
          isDisabled={!form.isValid}
        >
          Submit Form
        </Button>
      </Card>

      {/* NEW: Image Picker */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          📸 Image Picker (NEW!)
        </Text>
        <View style={{ alignItems: 'center', marginBottom: theme.spacing[3] }}>
          <Avatar 
            source={avatarUri ? { uri: avatarUri } : undefined}
            name="User Name"
            size={100}
          />
        </View>
        <Button 
          variant="primary" 
          fullWidth 
          onPress={handlePickImage}
          isLoading={imageLoading}
          style={{ marginBottom: theme.spacing[2] }}
        >
          Pick from Gallery
        </Button>
        <Button 
          variant="secondary" 
          fullWidth 
          onPress={handleTakePhoto}
          isLoading={imageLoading}
        >
          Take Photo
        </Button>
        <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
          Requires: npx expo install expo-image-picker
        </Text>
      </Card>

      {/* NEW: Network Status */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          📡 Network Status (NEW!)
        </Text>
        <Text variant="body" color="secondary">
          Status: {isConnected === null ? 'Checking...' : isConnected ? '✅ Connected' : '❌ Offline'}
        </Text>
        <Text variant="body" color="secondary">
          Type: {networkType || 'Unknown'}
        </Text>
        <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
          Turn on Airplane Mode to see offline banner
        </Text>
      </Card>

      {/* NEW: UI Patterns */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          🎨 UI Patterns (NEW!)
        </Text>
        
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search with debounce..."
          style={{ marginBottom: theme.spacing[3] }}
        />
        {debouncedSearch && (
          <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Debounced: &quot;{debouncedSearch}&quot;
          </Text>
        )}

        {/* Bottom Sheet */}
        <Button 
          variant="secondary" 
          fullWidth 
          onPress={() => setBottomSheetVisible(true)}
          style={{ marginBottom: theme.spacing[2] }}
        >
          Open Bottom Sheet
        </Button>

        {/* Skeleton */}
        <Button 
          variant="outline" 
          fullWidth 
          onPress={() => setShowSkeleton(!showSkeleton)}
        >
          {showSkeleton ? 'Hide' : 'Show'} Skeleton Loader
        </Button>

        {showSkeleton && (
          <View style={{ marginTop: theme.spacing[3] }}>
            <SkeletonCard />
          </View>
        )}
      </Card>

      {/* NEW: Date/Time Utils */}
      <Card style={{ marginBottom: theme.spacing[4] }}>
        <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          📅 Date/Time Utils (NEW!)
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
          Current: {formatDate(new Date(), 'MMM DD, YYYY HH:mm')}
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
          Relative: {getRelativeTime(new Date(Date.now() - 3600000))}
        </Text>
        <Text variant="body" color="secondary">
          Smart: {timeAgo(new Date(Date.now() - 86400000))}
        </Text>
      </Card>

      {/* NEW: Animations Showcase */}
      <FadeSlideIn direction="bottom">
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            ✨ Animations System (NEW!)
          </Text>
          
          {/* Animation Examples */}
          <View style={{ gap: theme.spacing[3] }}>
            {/* Fade In */}
            <FadeIn>
              <View style={[styles.animBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text variant="body" align="center">Fade In</Text>
              </View>
            </FadeIn>

            {/* Slide In */}
            <SlideIn direction="left">
              <View style={[styles.animBox, { backgroundColor: theme.colors.primaryLight + '40' }]}>
                <Text variant="body" align="center">Slide In (Left)</Text>
              </View>
            </SlideIn>

            {/* Scale In */}
            <ScaleIn>
              <View style={[styles.animBox, { backgroundColor: theme.colors.info + '20' }]}>
                <Text variant="body" align="center">Scale In (Pop)</Text>
              </View>
            </ScaleIn>

            {/* Pulse */}
            <Pulse>
              <View style={[styles.animBox, { backgroundColor: theme.colors.success + '20' }]}>
                <Text variant="body" align="center">Pulse (Breathing)</Text>
              </View>
            </Pulse>

            {/* Float */}
            <Float>
              <View style={[styles.animBox, { backgroundColor: theme.colors.warning + '20' }]}>
                <Text variant="body" align="center">Float (Hover)</Text>
              </View>
            </Float>

            {/* Interactive Animations */}
            <View style={{ gap: theme.spacing[2], marginTop: theme.spacing[2] }}>
              {/* Shake Button */}
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <Button variant="outline" fullWidth onPress={shake}>
                  🚨 Shake Me (Error Effect)
                </Button>
              </Animated.View>

              {/* Wiggle Button */}
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Button variant="outline" fullWidth onPress={wiggle}>
                  👋 Wiggle Me (Attention)
                </Button>
              </Animated.View>

              {/* Press Animation */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Button
                  variant="primary"
                  fullWidth
                  onPressIn={animateIn}
                  onPressOut={animateOut}
                >
                  Press & Hold (Scale)
                </Button>
              </Animated.View>

              {/* Spinning Icon */}
              <View style={styles.spinContainer}>
                <Animated.Text style={[styles.spinIcon, { transform: [{ rotate: spinAnim }] }]}>
                  ⚙️
                </Animated.Text>
                <Text variant="body" color="secondary">
                  Infinite Rotation
                </Text>
              </View>
            </View>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[3] }}>
            10+ animation hooks + components ready to use!
          </Text>
        </Card>
      </FadeSlideIn>

      {/* NEW: Biometric Auth */}
      <SlideIn direction="right">
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          🔐 Biometric Auth (NEW!)
        </Text>
        {biometricAvailable ? (
          <>
            <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
              Available: {biometricType === 'facial' ? 'Face ID' : biometricType === 'fingerprint' ? 'Touch ID' : 'Biometric'}
            </Text>
            <Button variant="primary" fullWidth onPress={handleBiometricAuth}>
              Authenticate
            </Button>
          </>
        ) : (
          <Text variant="body" color="secondary">
            Not available on this device
          </Text>
        )}
        <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
          Requires: npx expo install expo-local-authentication
        </Text>
        </Card>
      </SlideIn>

      {/* NEW: Interactive Tour */}
      <ScaleIn config={{ delay: 100 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
          🎯 Interactive App Tour (NEW!)
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
          Take a guided tour through the app! This is the advanced feature you wanted.
        </Text>
        <Button 
          variant="primary" 
          fullWidth 
          onPress={handleStartTour}
        >
          🚀 Start App Tour
        </Button>
        <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
          An interactive guide that walks you through all features!
        </Text>
        </Card>
      </ScaleIn>

      {/* NEW: Push Notifications Demo */}
      <FadeIn config={{ delay: 200 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            🔔 Push Notifications (NEW!)
          </Text>
          
          {/* Status Info */}
          {notificationError ? (
            <View style={[styles.notificationStatus, { backgroundColor: theme.colors.error + '20', marginBottom: theme.spacing[3] }]}>
              <Text variant="body" color="error">
                ⚠️ {notificationError}
              </Text>
            </View>
          ) : expoPushToken ? (
            <View style={[styles.notificationStatus, { backgroundColor: theme.colors.success + '20', marginBottom: theme.spacing[3] }]}>
              <Text variant="body" color="success">
                ✅ Push token registered
              </Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[1] }}>
                Token: {expoPushToken.substring(0, 20)}...
              </Text>
            </View>
          ) : (
            <View style={[styles.notificationStatus, { backgroundColor: theme.colors.warning + '20', marginBottom: theme.spacing[3] }]}>
              <Text variant="body" color="warning">
                ⏳ Registering push token...
              </Text>
            </View>
          )}

          {/* Last Notification */}
          {notification && (
            <View style={[styles.notificationStatus, { backgroundColor: theme.colors.info + '20', marginBottom: theme.spacing[3] }]}>
              <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>
                📬 Last Notification:
              </Text>
              <Text variant="body" color="secondary">
                {notification.request?.content?.title || 'No title'}
              </Text>
              <Text variant="caption" color="tertiary">
                {notification.request?.content?.body || 'No body'}
              </Text>
            </View>
          )}

          {/* Badge Count */}
          <View style={{ marginBottom: theme.spacing[3] }}>
            <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
              Badge Count: {badgeCount}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
              <Button 
                variant="outline" 
                onPress={handleCheckBadge}
                style={{ flex: 1 }}
              >
                Check Badge
              </Button>
              <Button 
                variant="outline" 
                onPress={handleUpdateBadge}
                style={{ flex: 1 }}
              >
                Increment Badge
              </Button>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: theme.spacing[2] }}>
            <Button 
              variant="primary" 
              fullWidth 
              onPress={handleSendNotification}
            >
              📤 Send Notification Now
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              onPress={handleScheduleNotification}
            >
              ⏰ Schedule Notification (5s)
            </Button>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[3] }}>
            Requires: npx expo install expo-notifications expo-device
          </Text>
          <Text variant="caption" color="tertiary">
            Works best on physical devices. Notifications appear in system tray!
          </Text>
        </Card>
      </FadeIn>

      {/* NEW: Haptic Feedback */}
      <FadeIn config={{ delay: 300 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            📳 Haptic Feedback (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Tactile feedback for better UX. Try the buttons below!
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>Impact:</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginBottom: theme.spacing[3] }}>
              <Button variant="outline" onPress={() => handleHapticImpact('light')} style={{ flex: 1 }}>
                Light
              </Button>
              <Button variant="outline" onPress={() => handleHapticImpact('medium')} style={{ flex: 1 }}>
                Medium
              </Button>
              <Button variant="outline" onPress={() => handleHapticImpact('heavy')} style={{ flex: 1 }}>
                Heavy
              </Button>
            </View>

            <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>Notifications:</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginBottom: theme.spacing[3] }}>
              <Button variant="outline" onPress={() => handleHapticNotification('success')} style={{ flex: 1 }}>
                Success
              </Button>
              <Button variant="outline" onPress={() => handleHapticNotification('warning')} style={{ flex: 1 }}>
                Warning
              </Button>
              <Button variant="outline" onPress={() => handleHapticNotification('error')} style={{ flex: 1 }}>
                Error
              </Button>
            </View>

            <Button variant="secondary" fullWidth onPress={() => haptics.selection()}>
              Selection Haptic
            </Button>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Requires: npx expo install expo-haptics
          </Text>
        </Card>
      </FadeIn>

      {/* NEW: Share Functionality */}
      <SlideIn direction="left">
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            📤 Share Functionality (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Native share sheet for sharing content.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button variant="primary" fullWidth onPress={handleShare}>
              Share Text
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              onPress={handleShareImage}
              disabled={!avatarUri}
            >
              Share Image {!avatarUri && '(Pick image first)'}
            </Button>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Opens native share sheet on your device!
          </Text>
        </Card>
      </SlideIn>

      {/* NEW: Clipboard Utilities */}
      <ScaleIn config={{ delay: 400 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            📋 Clipboard Utilities (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Copy and paste text easily.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button variant="primary" fullWidth onPress={handleCopyToClipboard}>
              Copy to Clipboard
            </Button>
            <Button variant="secondary" fullWidth onPress={handlePasteFromClipboard}>
              Paste from Clipboard
            </Button>
            
            {clipboardText && (
              <View style={[styles.clipboardBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
                <Text variant="caption" color="tertiary" style={{ marginBottom: theme.spacing[1] }}>
                  Clipboard Content:
                </Text>
                <Text variant="body">{clipboardText || '(empty)'}</Text>
              </View>
            )}
          </View>
        </Card>
      </ScaleIn>

      {/* NEW: Permissions Manager */}
      <FadeSlideIn direction="bottom" config={{ delay: 500 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            🔐 Permissions Manager (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Unified permission handling for all app permissions.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            {(['camera', 'mediaLibrary', 'notifications', 'location'] as const).map((permission) => (
              <View key={permission} style={{ marginBottom: theme.spacing[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[1] }}>
                  <Text variant="body" style={{ flex: 1, textTransform: 'capitalize' }}>
                    {permission}:
                  </Text>
                  <Text variant="body" style={{ marginRight: theme.spacing[2] }}>
                    {permissionStatus[permission] || '❓ Unknown'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                  <Button
                    variant="outline"
                    onPress={() => handleCheckPermission(permission)}
                    style={{ flex: 1 }}
                  >
                    Check
                  </Button>
                  <Button
                    variant="primary"
                    onPress={() => handleRequestPermission(permission)}
                    style={{ flex: 1 }}
                  >
                    Request
                  </Button>
                </View>
              </View>
            ))}
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Automatically opens settings if permission is blocked.
          </Text>
        </Card>
      </FadeSlideIn>

      {/* NEW: Confirmation Dialogs */}
      <FadeIn config={{ delay: 600 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            ⚠️ Confirmation Dialogs (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Reusable confirmation and alert dialogs.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button variant="primary" fullWidth onPress={handleConfirmDialog}>
              Show Confirmation Dialog
            </Button>
            <Button variant="secondary" fullWidth onPress={handleAlertDialog}>
              Show Alert Dialog
            </Button>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Promise-based API - easy to use!
          </Text>
        </Card>
      </FadeIn>

      {/* NEW: Keyboard Utilities */}
      <SlideIn direction="right" config={{ delay: 700 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            ⌨️ Keyboard Utilities (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Track keyboard visibility and dismiss on scroll.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
              <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>
                Keyboard Status:
              </Text>
              <Text variant="body" color="secondary">
                {keyboardVisible ? `✅ Visible (${Math.round(keyboardHeight)}px)` : '❌ Hidden'}
              </Text>
            </View>

            <Button variant="primary" fullWidth onPress={dismissKeyboard}>
              Dismiss Keyboard
            </Button>
            <Text variant="caption" color="tertiary">
              Try typing in the search bar above, then tap this button!
            </Text>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            ScrollView automatically dismisses keyboard on scroll.
          </Text>
        </Card>
      </SlideIn>

      {/* NEW: QR Code Scanner */}
      <ScaleIn config={{ delay: 800 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            📷 QR Code Scanner (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Scan QR codes and barcodes with your camera.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button variant="primary" fullWidth onPress={() => setShowQRScanner(true)}>
              📷 Open QR Scanner
            </Button>
            
            {qrScanResult && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
                <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>
                  Last Scanned:
                </Text>
                <Text variant="body" color="secondary">
                  {qrScanResult}
                </Text>
              </View>
            )}
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Requires: npx expo install expo-barcode-scanner
          </Text>
        </Card>
      </ScaleIn>

      {/* NEW: Location Services */}
      <FadeSlideIn direction="bottom" config={{ delay: 900 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            📍 Location Services (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Get GPS coordinates, reverse geocode, and calculate distances.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button variant="primary" fullWidth onPress={handleGetLocation}>
              📍 Get Current Location
            </Button>
            
            {currentLocation && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
                <Text variant="body" style={{ marginBottom: theme.spacing[2] }}>
                  Coordinates:
                </Text>
                <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
                  Lat: {currentLocation.coords.latitude.toFixed(6)}
                </Text>
                <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
                  Lng: {currentLocation.coords.longitude.toFixed(6)}
                </Text>
                {locationAddress && (
                  <>
                    <Text variant="body" style={{ marginTop: theme.spacing[2], marginBottom: theme.spacing[1] }}>
                      Address:
                    </Text>
                    <Text variant="body" color="secondary">
                      {locationAddress}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Requires: npx expo install expo-location
          </Text>
        </Card>
      </FadeSlideIn>

      {/* NEW: Swipeable List Items */}
      <FadeIn config={{ delay: 1000 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            👆 Swipeable List Items (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Swipe left or right to reveal actions.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <SwipeableItem
              leftActions={
                <Button
                  variant="danger"
                  onPress={() => {
                    showToast({ message: 'Item deleted!', type: 'success' });
                    haptics.success();
                  }}
                >
                  Delete
                </Button>
              }
              rightActions={
                <Button
                  variant="secondary"
                  onPress={() => {
                    showToast({ message: 'Item edited!', type: 'info' });
                    haptics.selection();
                  }}
                >
                  Edit
                </Button>
              }
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text variant="body" style={{ fontWeight: '600' }}>
                    Swipeable Item
                  </Text>
                  <Text variant="caption" color="secondary">
                    Swipe left to delete, right to edit
                  </Text>
                </View>
                <Text>👉</Text>
              </View>
            </SwipeableItem>

            <SwipeableItem
              leftActions={
                <Button
                  variant="danger"
                  onPress={() => showToast({ message: 'Archived!', type: 'success' })}
                >
                  Archive
                </Button>
              }
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text variant="body" style={{ fontWeight: '600' }}>
                    Another Item
                  </Text>
                  <Text variant="caption" color="secondary">
                    Swipe left to archive
                  </Text>
                </View>
                <Text>👉</Text>
              </View>
            </SwipeableItem>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Swipe left or right on the items above!
          </Text>
        </Card>
      </FadeIn>

      {/* NEW: Image Viewer */}
      <SlideIn direction="left" config={{ delay: 1100 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            🖼️ Image Viewer (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Full-screen image viewer with zoom and pan.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            {avatarUri ? (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onPress={() => handleViewImage(avatarUri)}
                >
                  🖼️ View Full Screen Image
                </Button>
                <Text variant="caption" color="tertiary">
                  Pick an image first, then view it full screen!
                </Text>
              </>
            ) : (
              <>
                <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
                  Pick an image from the Image Picker section above first!
                </Text>
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => {
                    showToast({ message: 'Pick an image first!', type: 'info' });
                  }}
                >
                  No Image Selected
                </Button>
              </>
            )}
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Double tap to zoom • Drag to pan when zoomed
          </Text>
        </Card>
      </SlideIn>

      {/* NEW: App Version Checker */}
      <FadeIn config={{ delay: 1200 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            🔄 App Version Checker (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Check for app updates and redirect to app store. Can auto-popup when outdated!
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
              <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>
                Current Version:
              </Text>
              <Text variant="body" color="secondary">
                {currentVersion}
              </Text>
            </View>

            <Button variant="primary" fullWidth onPress={handleCheckVersion}>
              🔍 Check for Updates
            </Button>
            <Button variant="secondary" fullWidth onPress={handleSimulateOutdated}>
              🎭 Simulate Outdated App (Show Alert)
            </Button>
            <Button variant="outline" fullWidth onPress={openAppStore}>
              📱 Open App Store
            </Button>
          </View>

          <View style={[styles.infoBox, { backgroundColor: theme.colors.info + '20', padding: theme.spacing[3], marginTop: theme.spacing[3], borderRadius: theme.borderRadius.base }]}>
            <Text variant="body" style={{ marginBottom: theme.spacing[1], fontWeight: '600' }}>
              💡 For Production:
            </Text>
            <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
              • Add VersionCheckerProvider to app/_layout.tsx
            </Text>
            <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
              • Set autoCheckOnMount: true
            </Text>
            <Text variant="caption" color="secondary">
              • Set autoShowAlert: true
            </Text>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Currently disabled for starter kit. Enable in production!
          </Text>
        </Card>
      </FadeIn>

      {/* NEW: Rate Limiting */}
      <ScaleIn config={{ delay: 1300 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            🚦 Rate Limiting (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Prevent API spam with rate limiting. Try clicking multiple times!
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
              <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>
                Rate Limit Status:
              </Text>
              <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
                Remaining: {rateLimit.getRemaining()} / 5 requests
              </Text>
              <Text variant="caption" color="tertiary">
                Resets in: {rateLimit.getTimeUntilReset()}s
              </Text>
            </View>

            <Button variant="primary" fullWidth onPress={handleRateLimitedAction}>
              🚦 Try Rate Limited Action
            </Button>
            <Button variant="outline" fullWidth onPress={() => rateLimit.reset()}>
              🔄 Reset Rate Limit
            </Button>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Limited to 5 requests per 10 seconds. Perfect for API calls!
          </Text>
        </Card>
      </ScaleIn>

      {/* NEW: Infinite Scroll */}
      <FadeSlideIn direction="bottom" config={{ delay: 1400 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            ♾️ Infinite Scroll (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Reusable infinite scroll list pattern. Scroll down to load more!
          </Text>
          
          <View style={[styles.infiniteScrollContainer, { height: 300, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base }]}>
            <InfiniteScroll
              data={infiniteScrollData}
              renderItem={({ item }) => (
                <View style={[styles.listItem, { backgroundColor: theme.colors.card, marginBottom: theme.spacing[2], padding: theme.spacing[3], borderRadius: theme.borderRadius.base }]}>
                  <Text variant="body">Item #{item}</Text>
                </View>
              )}
              onLoadMore={handleLoadMore}
              hasMore={hasMoreItems}
              isLoading={isLoadingMore}
              contentContainerStyle={{ padding: theme.spacing[2] }}
            />
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Automatically loads more when you scroll to the bottom!
          </Text>
        </Card>
      </FadeSlideIn>

      {/* NEW: GPS Tracker / Geofencing */}
      <FadeIn config={{ delay: 1500 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            📍 GPS Tracker / Geofencing (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Pokestop-like proximity detection and geofencing.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button variant="primary" fullWidth onPress={handleAddGeofence}>
              📍 Add Geofence at Current Location
            </Button>
            <Button variant="secondary" fullWidth onPress={handleCheckProximity}>
              🎯 Check Proximity (Pokestop-like)
            </Button>

            {geofences.length > 0 && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
                <Text variant="body" style={{ marginBottom: theme.spacing[1] }}>
                  Active Geofences: {geofences.length}
                </Text>
                {geofences.map((geofence) => (
                  <View key={geofence.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[1] }}>
                    <Text variant="caption" color="secondary">
                      {geofence.id} ({geofence.radius}m)
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        removeGeofence(geofence.id);
                        showToast({ message: 'Geofence removed', type: 'info' });
                      }}
                    >
                      Remove
                    </Button>
                  </View>
                ))}
              </View>
            )}

            {proximityStatus && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.info + '20', padding: theme.spacing[3] }]}>
                <Text variant="body" color="secondary">
                  {proximityStatus}
                </Text>
              </View>
            )}

            {nearbyLocations.length > 0 && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
                <Text variant="body" style={{ marginBottom: theme.spacing[2] }}>
                  Nearby Locations:
                </Text>
                {nearbyLocations.slice(0, 3).map((location) => (
                  <View key={location.id} style={{ marginBottom: theme.spacing[1] }}>
                    <Text variant="body">
                      {location.name}: {location.distance}m
                      {location.isReached && ' ✅'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Get your location first, then add geofences or check proximity!
          </Text>
        </Card>
      </FadeIn>

      {/* NEW: Trial System */}
      <SlideIn direction="right" config={{ delay: 1600 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            ⏱️ Trial System (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Track app usage and manage trial periods. Paywall shows after trial expires.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
              <Text variant="body" style={{ marginBottom: theme.spacing[2] }}>
                Trial Status:
              </Text>
              <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
                Active: {isTrialActive ? '✅ Yes' : '❌ No'}
              </Text>
              <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
                Days Remaining: {daysRemaining}
              </Text>
              <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[1] }}>
                Days Used: {daysUsed}
              </Text>
              <Text variant="body" color="secondary">
                Expired: {isExpired ? '✅ Yes' : '❌ No'}
              </Text>
            </View>

            <Button variant="primary" fullWidth onPress={() => setShowPaywall(true)}>
              💳 Show Paywall
            </Button>
            <Button variant="outline" fullWidth onPress={resetTrial}>
              🔄 Reset Trial (Testing)
            </Button>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Paywall automatically shows when trial expires!
          </Text>
        </Card>
      </SlideIn>

      {/* NEW: In-App Purchases */}
      <ScaleIn config={{ delay: 1700 }}>
        <Card style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing[3] }}>
            💰 In-App Purchases (NEW!)
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[3] }}>
            Handle subscriptions and in-app purchases.
          </Text>
          
          <View style={{ gap: theme.spacing[2] }}>
            <Button
              variant="primary"
              fullWidth
              onPress={() => fetchProducts(['monthly', 'yearly'])}
              isLoading={purchaseLoading}
            >
              📦 Fetch Products
            </Button>
            <Button variant="secondary" fullWidth onPress={handleRestorePurchases}>
              🔄 Restore Purchases
            </Button>

            {products.length > 0 && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.surface, padding: theme.spacing[3] }]}>
                <Text variant="body" style={{ marginBottom: theme.spacing[2] }}>
                  Available Products:
                </Text>
                {products.map((product) => (
                  <View key={product.id} style={{ marginBottom: theme.spacing[2] }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>
                      {product.title}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {product.description} - {product.price}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleSubscribe(product.id)}
                      style={{ marginTop: theme.spacing[1] }}
                    >
                      Purchase
                    </Button>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.infoBox, { backgroundColor: theme.colors.warning + '20', padding: theme.spacing[3], borderRadius: theme.borderRadius.base }]}>
              <Text variant="caption" color="secondary">
                💡 Configure products in App Store Connect / Play Console
              </Text>
            </View>
          </View>

          <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
            Requires: npx expo install expo-in-app-purchases
          </Text>
        </Card>
      </ScaleIn>

      {/* State Info */}
      <Card variant="filled">
        <Text variant="h3" style={{ marginBottom: theme.spacing[2] }}>
          📊 {t('demo.globalState')}
        </Text>
        <Text variant="body" color="secondary">
          {t('demo.theme')}: {t('demo.active')}
        </Text>
        <Text variant="body" color="secondary">
          {t('demo.uiLoading')}: {state.ui.isLoading ? t('common.yes') : t('common.no')}
        </Text>
        <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing[2] }}>
          Pull down to refresh! {t('demo.checkConsole')}
        </Text>
      </Card>

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      {/* Image Viewer Modal */}
      {viewingImageUri && (
        <ImageViewer
          visible={showImageViewer}
          imageUri={viewingImageUri}
          onClose={() => {
            setShowImageViewer(false);
            setViewingImageUri(undefined);
          }}
          title="Image Viewer"
        />
      )}

      {/* Paywall Modal */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
        trialDaysRemaining={daysRemaining}
        products={products.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: p.price,
        }))}
        title="Unlock Premium Features"
        subtitle="Subscribe to get unlimited access"
        features={[
          'Unlimited usage',
          'All premium features',
          'Ad-free experience',
          'Priority support',
          'Early access to new features',
        ]}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        snapPoints={[0.5]}
      >
        <View style={{ padding: theme.spacing[4] }}>
          <Text variant="h2" style={{ marginBottom: theme.spacing[3] }}>
            Bottom Sheet
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
            This is a bottom sheet component. Drag down to close or tap outside.
          </Text>
          <Button variant="primary" fullWidth onPress={() => setBottomSheetVisible(false)}>
            Close
          </Button>
        </View>
      </BottomSheet>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t('demo.modalTitle')}
        size="md"
      >
        <Text variant="body" style={{ marginBottom: theme.spacing[4] }}>
          {t('demo.modalContent')}
        </Text>
        <Button variant="primary" fullWidth onPress={() => setModalVisible(false)}>
          {t('demo.closeModal')}
        </Button>
      </Modal>

      {/* Loader Overlay */}
      {showLoader && (
        <Loader fullScreen text={t('common.loading')} />
      )}

      {/* Empty State */}
      {showEmpty && (
        <View style={{ marginTop: theme.spacing[4] }}>
          <EmptyState
            title={t('demo.emptyTitle')}
            description={t('demo.emptyDescription')}
            action={{
              label: t('demo.dismiss'),
              onPress: () => setShowEmpty(false),
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  spinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  spinIcon: {
    fontSize: 32,
  },
  notificationStatus: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  clipboardBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginTop: 8,
  },
  statusBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  infiniteScrollContainer: {
    overflow: 'hidden',
  },
  listItem: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
