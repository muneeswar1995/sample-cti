import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  HomeTabs: undefined;
  CheckIn: undefined;
  TaskDetail: { task?: any; taskId: number };
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
