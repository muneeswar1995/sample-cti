
import {AppRegistry} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

import App from './App';
import {name as appName} from './app.json';

const messaging = getMessaging(getApp());

const CHANNEL_ID = 'incoming-calls';

// Register before AppRegistry.registerComponent().
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('[FCM-BG] Message received:', remoteMessage.data);

  const data = remoteMessage.data;

  if (data?.type !== 'INCOMING_CALL' || !data.callId) {
    console.log('[FCM-BG] Ignored message');
    return;
  }

  try {
    // Create the channel before displaying the notification.
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Incoming calls',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });

    await notifee.displayNotification({
      id: `call-${data.callId}`,
      title: data.callerName || 'Incoming call',
      body: data.phoneNumber || 'Unknown number',
      data: {
        type: 'INCOMING_CALL',
        callId: String(data.callId),
        callerName: String(data.callerName || 'Unknown caller'),
        phoneNumber: String(data.phoneNumber || ''),
      },
      android: {
        channelId: CHANNEL_ID,
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        ongoing: true,
        autoCancel: false,
        fullScreenAction: {
          id: 'open-call',
          launchActivity: 'default',
        },
        pressAction: {
          id: 'open-call',
          launchActivity: 'default',
        },
        actions: [
          {
            title: 'Reject',
            pressAction: {id: 'reject',
                  launchActivity: 'default',
            },
          },
          {
            title: 'Answer',
            pressAction: {
              id: 'answer',
              launchActivity: 'default',
            },
          },
        ],
      },
    });

    console.log('[FCM-BG] Incoming-call notification displayed');
  } catch (error) {
    console.error('[FCM-BG] Notification creation failed:', error);
    throw error;
  }
});

AppRegistry.registerComponent(appName, () => App);
