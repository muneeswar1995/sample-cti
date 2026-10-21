import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  CTIContextValue,
  IncomingCall,
} from './types';

const CTIContext =
  createContext<CTIContextValue | undefined>(
    undefined,
  );

export function CTIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const webViewJavaScriptRef = useRef<
    ((script: string) => void) | null
  >(null);

  const [incomingCall, setIncomingCall] =
    useState<IncomingCall | null>(null);

  const [isCallReceived, setIsCallReceived] =
    useState(false);

  const [isCallActive, setIsCallActive] =
    useState(false);

  const [ctiVisible, setCtiVisible] =
    useState(false);

  const receiveCall = useCallback(
    (call: IncomingCall) => {
      console.log(
        '[RN CTI] Incoming call:',
        call,
      );

      setIncomingCall(call);
      setIsCallReceived(true);
      setIsCallActive(false);

      // Bring the existing WebView to the foreground.
      setCtiVisible(true);
    },
    [],
  );

  const callConnected = useCallback(
    (call?: IncomingCall) => {
      console.log(
        '[RN CTI] Call connected',
      );

      if (call) {
        setIncomingCall(current => ({
          ...(current ?? {}),
          ...call,
        }));
      }

      setIsCallReceived(false);
      setIsCallActive(true);

      // Keep the same WebView visible.
      setCtiVisible(true);
    },
    [],
  );

  const clearCall = useCallback(() => {
    console.log('[RN CTI] Call ended');

    setIncomingCall(null);
    setIsCallReceived(false);
    setIsCallActive(false);

    // Hide the same WebView.
    setCtiVisible(false);
  }, []);

  const registerWebView = useCallback(
    (
      callback: (script: string) => void,
    ) => {
      webViewJavaScriptRef.current =
        callback;
    },
    [],
  );

  const sendToCTIWebView = useCallback(
    (payload: unknown) => {
      const callback =
        webViewJavaScriptRef.current;

      if (!callback) {
        console.log(
          '[RN CTI] WebView is not ready',
        );
        return;
      }

      const json = JSON.stringify(payload);

      // JSON is inserted as a JS expression.
      const safeJson = json
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');

      callback(`
        window.dispatchEvent(
          new CustomEvent('RN_CTI_EVENT', {
            detail: ${safeJson}
          })
        );
        true;
      `);
    },
    [],
  );

  useEffect(() => {
    return () => {
      webViewJavaScriptRef.current = null;
    };
  }, []);

  const value: CTIContextValue = {
    incomingCall,
    isCallReceived,
    isCallActive,
    ctiVisible,

    receiveCall,
    callConnected,
    clearCall,

    setCtiVisible,

    sendToCTIWebView,
    registerWebView,
  };

  return (
    <CTIContext.Provider value={value}>
      {children}
    </CTIContext.Provider>
  );
}

export function useCTI() {
  const context = useContext(CTIContext);

  if (!context) {
    throw new Error(
      'useCTI must be used inside CTIProvider',
    );
  }

  return context;
}
