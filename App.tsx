
import React, {useEffect} from 'react';
import {StatusBar, View} from 'react-native';

import {CTIProvider, useCTI} from './src/cti/CTIProvider';
import {PersistentCTIWebView} from './src/cti/PersistentCTIWebView';
import {AppNavigator} from './src/navigation/AppNavigator';


export default function App() {
  return (
    <CTIProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <View style={{flex: 1}}>
        <AppNavigator />

        {/* Keep the CTI WebView mounted for the lifetime of the app. */}
        <PersistentCTIWebView />
      </View>
    </CTIProvider>
  );
}
