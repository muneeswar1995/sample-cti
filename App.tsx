import { RequestProvider } from '@react-solutions/request';
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/Toast';
import ThemeProvider from '@/context/ThemeProvider';
import { requestInstance } from '@/services/Request';
import { requestLocationPermission } from '@/utils/location';

import { AuthProvider } from './app/context';
import Router from './app/screens/routes';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Request location permissions as soon as the app launches
    requestLocationPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RequestProvider client={requestInstance}>
        <ThemeProvider>
          <AuthProvider>
              <Router />
              <ToastHost />
          </AuthProvider>
        </ThemeProvider>
      </RequestProvider>
    </SafeAreaProvider>
  );
}

export default App;
