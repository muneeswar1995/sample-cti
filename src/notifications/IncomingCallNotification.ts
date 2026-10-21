
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import {Platform} from 'react-native';

export type IncomingCallData = {
  callId: string;
  callerName: string;
  phoneNumber: string;
  type: 'INCOMING_CALL';
};

const CHANNEL_ID = 'incoming-calls';

export async function createIncomingCallChannel() {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Incoming calls',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
  });
}

export async function showIncomingCallNotification(
  call: IncomingCallData,
) {
  await createIncomingCallChannel();

  await notifee.displayNotification({
    id: `call-${call.callId}`,
    title: call.callerName || 'Incoming call',
    body: call.phoneNumber || 'Unknown number',
    data: {
      type: 'INCOMING_CALL',
      callId: call.callId,
      callerName: call.callerName,
      phoneNumber: call.phoneNumber,
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
          pressAction: {id: 'reject'},
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
}

export async function dismissIncomingCall(callId: string) {
  await notifee.cancelNotification(`call-${callId}`);
}

export {EventType};
