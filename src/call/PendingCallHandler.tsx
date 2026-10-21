
// import React, {useCallback, useEffect, useRef} from 'react';
// import {
//   AppState,
//   DeviceEventEmitter,
// } from 'react-native';

// import {useCTI} from '../cti/CTIProvider';
// import {
//   getPendingCall,
//   clearPendingCall,
//   setupCallManager,
// } from './CallManager';

// export default function PendingCallHandler() {
//   const {receiveCall, setCtiVisible} = useCTI();

//   const processingCallId = useRef<string | null>(null);

//   const openCTI = useCallback(
//     async (call: any) => {
//       if (!call?.callId || !call.answered || call.rejected) {
//         return;
//       }

//       // Prevent the same answer event from opening the dialog twice.
//       if (processingCallId.current === String(call.callId)) {
//         return;
//       }

//       processingCallId.current = String(call.callId);

//       try {
//         console.log(
//           '[CTI] Opening WebView for call:',
//           call.callId,
//         );

//         receiveCall({
//           type: 'INCOMING_CALL',
//           callId: String(call.callId),
//           phoneNumber:
//             call.callerNumber || call.phoneNumber || '',
//           callerName: call.callerName || 'Incoming Call',
//         });

//         // Show the existing persistent CTI WebView.
//         setCtiVisible(true);

//         // The provider has received the call event.
//         await clearPendingCall();
//       } catch (error) {
//         processingCallId.current = null;

//         console.error(
//           '[CTI] Failed to open incoming call:',
//           error,
//         );
//       }
//     },
//     [receiveCall, setCtiVisible],
//   );

//   const checkPendingCall = useCallback(async () => {
//     try {
//       const call = await getPendingCall();

//       if (!call) {
//         return;
//       }

//       if (call.rejected) {
//         await clearPendingCall();
//         return;
//       }

//       if (call.answered) {
//         await openCTI(call);
//       }
//     } catch (error) {
//       console.error(
//         '[CTI] Failed to read pending call:',
//         error,
//       );
//     }
//   }, [openCTI]);

//   useEffect(() => {
//     let mounted = true;

//     setupCallManager()
//       .then(() => {
//         if (mounted) {
//           return checkPendingCall();
//         }
//       })
//       .catch(error => {
//         console.error(
//           '[CTI] Call manager initialization failed:',
//           error,
//         );
//       });

//     const answerSubscription = DeviceEventEmitter.addListener(
//       'CTI_ANSWERED',
//       (call: any) => {
//         openCTI(call);
//       },
//     );

//     const rejectSubscription = DeviceEventEmitter.addListener(
//       'CTI_REJECTED',
//       async () => {
//         await clearPendingCall();
//       },
//     );

//     const appStateSubscription = AppState.addEventListener(
//       'change',
//       state => {
//         if (state === 'active') {
//           checkPendingCall();
//         }
//       },
//     );

//     return () => {
//       mounted = false;
//       answerSubscription.remove();
//       rejectSubscription.remove();
//       appStateSubscription.remove();
//     };
//   }, [checkPendingCall, openCTI]);

//   // This component only handles events; it renders no UI.
//   return null;
// }
