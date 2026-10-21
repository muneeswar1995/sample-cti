import React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from '../navigation/AppNavigator';
import {useCTI} from '../cti/CTIProvider';
const [micPermissionGranted, setMicPermissionGranted] =
  useState(false);
 import {useEffect, useRef, useState} from 'react';
 import {
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

useEffect(() => {
  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') {
      setMicPermissionGranted(true);
      return;
    }

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'Microphone access is required for CTI calls.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      const granted =
        result === PermissionsAndroid.RESULTS.GRANTED;

      setMicPermissionGranted(granted);

      if (!granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Allow microphone access in app settings to make CTI calls.',
        );
      }
    } catch (error) {
      console.error('Microphone permission error:', error);
    }
  };

  requestMicPermission();
}, []);

export function HomeScreen({navigation}: Props) {
  const {
    receiveCall,
    setCtiVisible,
  } = useCTI();

  const openCTI = () => {
    receiveCall({
      type: 'INCOMING_CALL',
      callId: `demo-${Date.now()}`,
      phoneNumber: '+91 9876543210',
      callerName: 'Demo Caller',
    });

    setCtiVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CTI Home</Text>

      <Text style={styles.info}>
        WebSocket runs inside the CTI WebView.
      </Text>

      <View style={styles.button}>
        <Button
          title="Open Settings"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {/* Floating Call Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={openCTI}
        accessibilityRole="button"
        accessibilityLabel="Open CTI call screen">
  <Ionicons name="call" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222222',
  },

  info: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#555555',
  },

  button: {
    marginTop: 20,
  },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

fabIcon: {
  fontSize: 28,
  color: '#FFFFFF',
},
});
