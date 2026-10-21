
import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {getApp} from '@react-native-firebase/app';

import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

const messagingInstance = getMessaging(getApp());

export async function initializePushNotifications(): Promise<string | null> {
  try {
    // Request notification permission on Android 13+.
    if (
      Platform.OS === 'android' &&
      Number(Platform.Version) >= 33
    ) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM] Notification permission denied');
        return null;
      }
    }

    // Request notification permission on iOS.
    if (Platform.OS === 'ios') {
      const status = await requestPermission(
        messagingInstance,
      );

      if (
        status !== AuthorizationStatus.AUTHORIZED &&
        status !== AuthorizationStatus.PROVISIONAL
      ) {
        console.log('[FCM] Notification permission denied');
        return null;
      }
    }

    // Retrieve the FCM registration token.
    const token = await getToken(messagingInstance);

    console.log('[FCM] Device token:', token);

    // TODO: Send token to your backend and associate it
    // with the authenticated user/device.

    return token;
  } catch (error) {
    console.error(
      '[FCM] Failed to initialize push notifications:',
      error,
    );

    return null;
  }
}
