// eslint-disable-next-line react-native/split-platform-components
import { Alert, Platform, ToastAndroid } from 'react-native';

import { emitToast } from '@/components/Toast/toastManager';
import type { ToastOptions, ToastVariant } from '@/components/Toast/types';

type VariantType = ToastVariant;

export const showToast = (
  message: string,
  variant: VariantType = 'default',
  options?: ToastOptions
) => {
  if (emitToast(message, variant, options)) {
    return;
  }

  // No ToastHost mounted yet (very early startup) - fall back to the platform UI.
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert(variant.toUpperCase(), message);
  }
};
