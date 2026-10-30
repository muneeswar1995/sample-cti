import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/lib/appTheme';

import { useAuth } from '../../../context';
import { getStyles } from './LoginScreen.styles';
import { BodyText1, HeadingText5 } from '@/lib/text';
import { useLogin } from './Functions';
import { setItem } from '@/utils/storage';
import { KEY } from '@/services/Constant';

const UserIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const LockIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export default function LoginScreen() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [postLogin, loading] = useLogin();

  const handleLogin = async () => {
    postLogin({
      employeeId,
      password
    }).then(async (response: any) => {
      const data = response?.data ;
      const token = data?.data?.accessToken;
      const user = data?.data?.user;
      const userRole = user?.role?.roleName;
      await setItem(KEY.USER,user)
      if (token) {
        login(token, userRole);
      } else {
        console.error("Token is missing from login response:", response);
      }
    }).catch((error: any) => {
      console.log("error", error);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Image source={require('../../../assets/achala-health-small-logo-preview.png')}
          style={styles.logo}
        />
        <HeadingText5 style={styles.title}>
          Field Ops
        </HeadingText5>

        <BodyText1 style={styles.subtitle}>
          Achala Health · Customer Success
        </BodyText1>

        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <UserIcon color={theme.palette.text.secondary} />
          </View>
          <TextInput
            style={styles.inputText}
            placeholder="Employee ID"
            placeholderTextColor={theme.palette.text.secondary}
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <LockIcon color={theme.palette.text.secondary} />
          </View>
          <TextInput
            style={styles.inputText}
            placeholder="Password"
            placeholderTextColor={theme.palette.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
