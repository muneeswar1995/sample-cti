
import React, {useEffect} from 'react';
import {StatusBar, View} from 'react-native';

import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification as getFirebaseInitialNotification,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import notifee, {
  EventType,
} from '@notifee/react-native';

import {CTIProvider, useCTI} from './src/cti/CTIProvider';
import {PersistentCTIWebView} from './src/cti/PersistentCTIWebView';
import {AppNavigator} from './src/navigation/AppNavigator';
import {initializePushNotifications} from './src/notifications/PushNotificationService';
import {
  dismissIncomingCall,
} from './src/notifications/IncomingCallNotification';

const messagingInstance = getMessaging(getApp());

type CallData = {
  type: 'INCOMING_CALL';
  callId: string;
  callerName: string;
  phoneNumber: string;
};

function PushNotificationHandler() {
  const {receiveCall, setCtiVisible} = useCTI();

  useEffect(() => {
    let mounted = true;

    const openIncomingCall = async (
      rawData?: Record<string, unknown> | null,
    ) => {
      if (
        !mounted ||
        !rawData ||
        rawData.type !== 'INCOMING_CALL' ||
        !rawData.callId
      ) {
        return;
      }

      const call: CallData = {
        type: 'INCOMING_CALL',
        callId: String(rawData.callId),
        callerName: String(
          rawData.callerName || 'Unknown caller',
        ),
        phoneNumber: String(rawData.phoneNumber || ''),
      };

      console.log('[CTI] Opening incoming call:', call);

      // Populate provider state before displaying the CTI UI.
      receiveCall(call);
      setCtiVisible(true);
    };

    // Initialize existing push-notification functionality.
    initializePushNotifications().catch(error => {
      console.error('[FCM] Initialization failed:', error);
    });

    // 1. FCM arrives while the app is in the foreground.
    const unsubscribeMessage = onMessage(
      messagingInstance,
      async remoteMessage => {
        console.log('[FCM] Foreground message:', remoteMessage.data);

        await openIncomingCall(remoteMessage.data);
      },
    );

    // 2. User taps a Firebase notification from the background.
    const unsubscribeOpened = onNotificationOpenedApp(
      messagingInstance,
      async remoteMessage => {
        console.log('[FCM] Notification opened:', remoteMessage.data);

        await openIncomingCall(remoteMessage.data);
      },
    );

    // 3. App starts from a Firebase notification tap.
    getFirebaseInitialNotification(messagingInstance)
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log(
            '[FCM] Initial notification:',
            remoteMessage.data,
          );

          await openIncomingCall(remoteMessage.data);
        }
      })
      .catch(error => {
        console.error('[FCM] Initial notification error:', error);
      });

    // 4. App is launched by the Notifee Answer action.
    notifee
      .getInitialNotification()
      .then(async initialNotification => {
        if (!initialNotification) {
          return;
        }

        const notification = initialNotification.notification;
        const actionId = initialNotification.pressAction?.id;
        const data = initialNotification.notification.data;

        console.log('[Notifee] Initial action:', actionId, data);

        if (actionId === 'answer') {
          await openIncomingCall(data);

          if (data?.callId) {
            await dismissIncomingCall(String(data.callId));
          }
        }
        if (actionId === 'reject') {
          // Cancel by the exact ID used when displaying it.
        if (notification.id) {
          await notifee.cancelNotification(notification.id);
        }

    console.log('[Notifee] Rejected and cancelled');
    return; // Never open CTI.
      }
      })
      .catch(error => {
        console.error(
          '[Notifee] Initial notification error:',
          error,
        );
      });

  // 5. Answer/Reject tapped while the app is already running.
  const unsubscribeNotifee = notifee.onForegroundEvent(
    async ({type, detail}) => {
      if (type !== EventType.ACTION_PRESS) {
        return;
      }

      const actionId = detail.pressAction?.id;
      const data = detail.notification?.data;
      const callId = data?.callId
        ? String(data.callId)
        : undefined;

      console.log('[Notifee] Action pressed:', actionId, data);

      // ANSWER: Open CTI and dismiss the notification.
      if (actionId === 'answer') {
        await openIncomingCall(data);

        if (callId) {
          await dismissIncomingCall(callId);
        }
      }

      // REJECT: Only cancel the notification.
      if (actionId === 'reject') {
        if (callId) {
          await dismissIncomingCall(callId);
        }

        // No CTI launch.
        // No CTI visibility change.
        // No rejection API call.
      }
    },
  );

    return () => {
      mounted = false;
      unsubscribeMessage();
      unsubscribeOpened();
      unsubscribeNotifee();
    };
  }, [receiveCall, setCtiVisible]);

  return null;
}

export default function App() {
  return (
    <CTIProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <View style={{flex: 1}}>
        <AppNavigator />

        <PushNotificationHandler />

        {/* Keep the CTI WebView mounted for the lifetime of the app. */}
        <PersistentCTIWebView />
      </View>
    </CTIProvider>
  );
}
