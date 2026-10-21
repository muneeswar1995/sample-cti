
// import {Platform, DeviceEventEmitter} from 'react-native';
// import RNCallKeep from 'react-native-callkeep';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {v4 as uuidv4} from 'uuid';

// const PENDING_CALL_KEY = '@cti/pending-call';
// const CALL_MAP_KEY = '@cti/call-map';

// let initialized = false;
// let setupPromise = null;
// let listenersRegistered = false;

// async function readCallMap() {
//   const json = await AsyncStorage.getItem(CALL_MAP_KEY);
//   return json ? JSON.parse(json) : {};
// }

// async function saveCallMap(map) {
//   await AsyncStorage.setItem(CALL_MAP_KEY, JSON.stringify(map));
// }

// export async function setupCallManager() {
//   if (setupPromise) {
//     return setupPromise;
//   }

//   setupPromise = (async () => {
//     if (!initialized) {
//       await RNCallKeep.setup({
//         ios: {
//           appName: 'CTI',
//           supportsVideo: false,
//           includesCallsInRecents: false,
//         },
//         android: {
//           alertTitle: 'Phone account permission',
//           alertDescription: 'Allow CTI to manage incoming calls.',
//           cancelButton: 'Cancel',
//           okButton: 'OK',
//         },
//       });

//       if (Platform.OS === 'android') {
//         await RNCallKeep.setAvailable(true);
//       }

//       initialized = true;
//     }

//     if (!listenersRegistered) {
//       RNCallKeep.addEventListener(
//         'answerCall',
//         async ({callUUID}) => {
//           try {
//             const map = await readCallMap();
//             const call = map[callUUID];

//             if (!call) {
//               console.warn(
//                 '[CTI] No call found for UUID:',
//                 callUUID,
//               );
//               return;
//             }

//             const pendingCall = {
//               ...call,
//               answered: true,
//               rejected: false,
//             };

//             await AsyncStorage.setItem(
//               PENDING_CALL_KEY,
//               JSON.stringify(pendingCall),
//             );

//             // Notify the React Native app if its JS runtime
//             // is already running.
//             DeviceEventEmitter.emit(
//               'CTI_ANSWERED',
//               pendingCall,
//             );

//             // Bring the existing app to the foreground.
//             if (Platform.OS === 'android') {
//               RNCallKeep.backToForeground();
//             }

//             console.log(
//               '[CTI] Answer pressed:',
//               pendingCall.callId,
//             );
//           } catch (error) {
//             console.error(
//               '[CTI] Answer handling failed:',
//               error,
//             );
//           }
//         },
//       );

//       RNCallKeep.addEventListener(
//         'endCall',
//         async ({callUUID}) => {
//           try {
//             const map = await readCallMap();
//             const call = map[callUUID];

//             if (!call) {
//               return;
//             }

//             const pendingCall = {
//               ...call,
//               answered: false,
//               rejected: true,
//             };

//             await AsyncStorage.setItem(
//               PENDING_CALL_KEY,
//               JSON.stringify(pendingCall),
//             );

//             DeviceEventEmitter.emit(
//               'CTI_REJECTED',
//               pendingCall,
//             );

//             console.log(
//               '[CTI] Call ended:',
//               pendingCall.callId,
//             );
//           } catch (error) {
//             console.error(
//               '[CTI] End-call handling failed:',
//               error,
//             );
//           }
//         },
//       );

//       listenersRegistered = true;
//     }
//   })();

//   try {
//     await setupPromise;
//   } catch (error) {
//     setupPromise = null;
//     throw error;
//   }
// }

// export async function showIncomingCall(data) {
//   if (
//     data?.type !== 'INCOMING_CALL' ||
//     !data?.callId
//   ) {
//     console.warn('[CTI] Invalid incoming call payload');
//     return;
//   }

//   await setupCallManager();

//   // Avoid displaying duplicate calls for the same callId.
//   const existingMap = await readCallMap();
//   const existing = Object.values(existingMap).find(
//     call => call.callId === String(data.callId),
//   );

//   if (existing) {
//     console.log(
//       '[CTI] Duplicate incoming call ignored:',
//       data.callId,
//     );
//     return;
//   }

//   const callUUID = uuidv4();

//   const call = {
//     callId: String(data.callId),
//     callerName: data.callerName || 'Incoming call',
//     callerNumber:
//       data.callerNumber || data.phoneNumber || 'Unknown',
//     webViewUrl: data.webViewUrl || '',
//     callUUID,
//     answered: false,
//     rejected: false,
//   };

//   existingMap[callUUID] = call;

//   // Save the call before displaying native UI.
//   await saveCallMap(existingMap);

//   await RNCallKeep.displayIncomingCall(
//     callUUID,
//     call.callerNumber,
//     call.callerName,
//     'generic',
//     false,
//   );

//   console.log('[CTI] Incoming call displayed:', call.callId);
// }

// export async function getPendingCall() {
//   const json = await AsyncStorage.getItem(PENDING_CALL_KEY);
//   return json ? JSON.parse(json) : null;
// }

// export async function clearPendingCall() {
//   await AsyncStorage.removeItem(PENDING_CALL_KEY);
// }

// export async function removeCallFromMap(callUUID) {
//   const map = await readCallMap();
//   delete map[callUUID];
//   await saveCallMap(map);
// }
