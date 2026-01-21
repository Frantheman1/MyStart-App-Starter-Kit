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
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
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
import { composeValidators, useForm, validators } from '@/lib/forms';
import { useTranslation } from '@/lib/i18n';
import { logger } from '@/lib/logging/logger';
import { useImagePicker } from '@/lib/media';
import { useNetworkStatus } from '@/lib/network';
import { TourStep, useOnboarding } from '@/lib/onboarding';
import { formatDate, getRelativeTime, timeAgo } from '@/lib/utils/date-time';
import { useStore } from '@/store';
import { useTheme } from '@/theme';
import React, { useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function DemoScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { state } = useStore();
  const { t, language, setLanguage } = useTranslation();
  const { pickImage, takePhoto, isLoading: imageLoading } = useImagePicker();
  const { isConnected, type: networkType } = useNetworkStatus();
  const { isAvailable: biometricAvailable, biometricType, authenticate } = useBiometric();
  const { startTour } = useOnboarding();
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
  
  const debouncedSearch = useDebounce(searchQuery, 500);

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
});
