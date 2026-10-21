export interface IncomingCall {
  type?: string;
  callId?: string;
  phoneNumber?: string;
  callerName?: string;
  [key: string]: unknown;
}

export interface CTIContextValue {
  incomingCall: IncomingCall | null;

  isCallReceived: boolean;
  isCallActive: boolean;

  // Whether the WebView should be visible.
  ctiVisible: boolean;

  receiveCall: (call: IncomingCall) => void;
  callConnected: (call?: IncomingCall) => void;
  clearCall: () => void;

  setCtiVisible: (visible: boolean) => void;

  // Sends an event into the CTI WebView.
  sendToCTIWebView: (payload: unknown) => void;

  registerWebView: (
    callback: (script: string) => void,
  ) => void;
}
