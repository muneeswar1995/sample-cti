import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  View,
  BackHandler,
} from 'react-native';

import WebView, {
  type WebViewMessageEvent,
} from 'react-native-webview';

import {CTI_URL} from './config';
import {useCTI} from './CTIProvider';

export function PersistentCTIWebView() {
  const webViewRef = useRef<WebView>(null);

  const {
    incomingCall,
    isCallReceived,
    isCallActive,
    ctiVisible,
    receiveCall,
    callConnected,
    clearCall,
    registerWebView,
    sendToCTIWebView,
    setCtiVisible,
  } = useCTI();

  /**
   * Register the persistent WebView bridge.
   * The same WebView remains mounted when the dialog is hidden.
   */
  useEffect(() => {
    registerWebView((script: string) => {
      webViewRef.current?.injectJavaScript(script);
    });
  }, [registerWebView]);

  /**
   * Receive events from the CTI webpage.
   */
  const handleMessage = (event: WebViewMessageEvent) => {
  try {
        console.log('[CTI] Event received:', event.nativeEvent.data);

    const message = JSON.parse(event.nativeEvent.data);

    if (message.source !== 'CTI_WEB') {
      // Handle your existing RN bridge messages here.
      return;
    }

    const callEvent = message.payload;

    const eventType = (
      callEvent.event_type ??
      callEvent.type ??
      ''
    ).toUpperCase();

    if (
      eventType.includes('INCOMING_CALL') ||
      eventType.includes('RINGING')
    ) {
      receiveCall(callEvent);
      setCtiVisible(true);
    } else if (
      eventType.includes('CALL_CONNECTED') ||
      eventType.includes('ANSWERED')
    ) {
      callConnected(callEvent);
      setCtiVisible(true);
    } else if (
      eventType.includes('CALL_ENDED') ||
      eventType.includes('CALL_DISCONNECTED')
    ) {
      clearCall();
      setCtiVisible(false);
    }
  } catch (error) {
    console.error('[CTI] Failed to process WebView message:', error);
  }
};

  const showCallDialog =
    isCallReceived || isCallActive;

  /**
   * Hide the dialog without unmounting the WebView.
   */
  const hideCTI = () => {
    setCtiVisible(false);
  };

  /**
   * Optional Android back-button handling.
   * Dismiss the dialog without destroying the CTI page.
   */
  useEffect(() => {
    if (!ctiVisible || !showCallDialog) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        hideCTI();
        return true;
      },
    );

    return () => subscription.remove();
  }, [ctiVisible, showCallDialog]);

  const injectedJavaScript = `
(function () {
  const OriginalWebSocket = window.WebSocket;

  window.WebSocket = function (...args) {
    const socket = new OriginalWebSocket(...args);

    console.log('[CTI DEBUG] WebSocket created:', args[0]);

    socket.addEventListener('message', function (event) {
      console.log('[CTI DEBUG] WebSocket message:', event.data);

      window.ReactNativeWebView?.postMessage(
        JSON.stringify({
          source: 'CTI_WEBSOCKET_DEBUG',
          data: event.data
        })
      );
    });

    return socket;
  };

  window.WebSocket.prototype = OriginalWebSocket.prototype;
})();
true;
`;

return (
  <View
    style={styles.root}
    pointerEvents={ctiVisible ? 'auto' : 'none'}
  >
    {/* Dialog backdrop */}
    {ctiVisible && (
      <Pressable
        style={styles.backdrop}
        onPress={hideCTI}
      />
    )}

    {/* Persistent WebView container */}
    <View
      style={[
        styles.callPanel,
        !ctiVisible && styles.hidden,
      ]}
      pointerEvents={ctiVisible ? 'auto' : 'none'}
    >
      {/* Close button */}
      {/* {ctiVisible && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideCTI}
          accessibilityRole="button"
          accessibilityLabel="Close CTI dialog"
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )} */}

      {/* Same WebView stays mounted */}
      <WebView
        ref={webViewRef}
        source={{ uri: CTI_URL }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}        
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onLoadEnd={() => {
          console.log('[RN CTI] WebView loaded');
          sendToCTIWebView({ type: 'RN_READY' });
        }}
        onError={event => {
          console.log(
            '[RN CTI] WebView error:',
            event.nativeEvent,
          );
        }}
      />
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    elevation: 10000,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  callPanel: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '10%',
    bottom: '10%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 30,
  },

  hidden: {
    opacity: 0,
    zIndex: -1,
    elevation: -1,
  },

  closeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    elevation: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 28,
    color: '#333333',
    lineHeight: 32,
  },

  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});