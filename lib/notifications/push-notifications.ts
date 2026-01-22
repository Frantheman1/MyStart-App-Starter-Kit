/**
 * Push Notifications
 * 
 * Setup and manage push notifications.
 * Requires: npx expo install expo-notifications expo-device
 * 
 * Usage:
 *   const { expoPushToken, notification } = usePushNotifications();
 *   await sendPushNotification(expoPushToken, 'Hello!', 'Message body');
 */

import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { logger } from '@/lib/logging/logger';

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean | string;
  badge?: number;
}

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: any | null;
  error: string | null;
}

/**
 * Hook for push notification setup and handling
 */
export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        setExpoPushToken(token || null);
        logger.info('Push notification token registered', { token });
      })
      .catch((err) => {
        setError(err.message);
        logger.error('Failed to register push notifications', { error: err });
      });

    setupNotificationListeners();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  async function setupNotificationListeners() {
    try {
      // @ts-ignore - Optional dependency
      const Notifications = await import('expo-notifications');

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Listener for when notification is received
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification: any) => {
          setNotification(notification);
          logger.info('Notification received', {
            title: notification.request.content.title,
          });
        }
      );

      // Listener for when user interacts with notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response.notification.request.content.data;
          logger.info('Notification tapped', { data });
          // Handle deep linking or navigation here
        }
      );
    } catch (err) {
      console.warn('Notifications not available. Install: npx expo install expo-notifications');
    }
  }

  return { expoPushToken, notification, error };
}

/**
 * Register device for push notifications
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  try {
    // @ts-ignore - Optional dependency
    const Device = await import('expo-device');
    // @ts-ignore - Optional dependency
    const Notifications = await import('expo-notifications');

    if (!Device.default.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return undefined;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for push notifications');
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your Expo project ID
    });

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    throw error;
  }
}

/**
 * Send a local notification
 */
export async function scheduleLocalNotification(
  content: NotificationContent,
  trigger?: {
    seconds?: number;
    date?: Date;
    repeats?: boolean;
  }
): Promise<string> {
  try {
    // @ts-ignore - Optional dependency
    const Notifications = await import('expo-notifications');

    let notificationTrigger: any = null;
    
    if (trigger) {
      if (trigger.seconds) {
        notificationTrigger = {
          seconds: trigger.seconds,
          repeats: trigger.repeats || false,
        };
      } else if (trigger.date) {
        notificationTrigger = trigger.date;
      }
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data || {},
        sound: content.sound !== false,
        badge: content.badge,
      },
      trigger: notificationTrigger, // null = immediate
    });

    logger.info('Local notification scheduled', { id });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    // @ts-ignore - Optional dependency
    const Notifications = await import('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    logger.info('Notification cancelled', { notificationId });
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    // @ts-ignore - Optional dependency
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    // @ts-ignore - Optional dependency
    const Notifications = await import('expo-notifications');
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    return 0;
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    // @ts-ignore - Optional dependency
    const Notifications = await import('expo-notifications');
    await Notifications.setBadgeCountAsync(count);
    logger.debug('Badge count updated', { count });
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Send push notification to specific token (from your backend)
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  logger.info('Push notification sent', { title });
}
