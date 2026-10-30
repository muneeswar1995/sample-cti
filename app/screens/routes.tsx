import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context';
import LoginScreen from './auth/login/LoginScreen';
import SignupScreen from './auth/signup/SignupScreen';
import HomeTabsScreen from './home/HomeTabs';
import CheckInScreen from './home/customer-success/CheckInScreen';
import TaskDetailScreen from './home/tasks/TaskDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Router
 * Handles authentication state & conditional route grouping:
 * - Public/Auth Group (Login, Signup)
 * - Protected App Group (HomeTabs, CheckIn, TaskDetail, role-based screens)
 */
export default function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated ? (
          // ==========================================
          // Public / Authentication Group
          // ==========================================
          <Stack.Group
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        ) : (
          // ==========================================
          // Protected / Authenticated App Group
          // ==========================================
          <Stack.Group
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="HomeTabs" component={HomeTabsScreen} />
            <Stack.Screen name="CheckIn" component={CheckInScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
