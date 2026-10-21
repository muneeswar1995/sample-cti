import React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Settings
      </Text>

      <Text style={styles.info}>
        The CTI WebView is still mounted while
        this screen is active.
      </Text>

      <Button
        title="Close"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 15,
  },

  info: {
    fontSize: 16,
    marginBottom: 24,
  },
});
