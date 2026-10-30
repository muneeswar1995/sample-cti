import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ToastCard from './ToastCard';
import { registerToastHost } from './toastManager';
import type { ToastItem } from './types';

/** Older toasts drop off the bottom of the stack once this many are visible. */
const MAX_VISIBLE = 3;

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    registerToastHost((toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, MAX_VISIBLE));
    });

    return () => registerToastHost(null);
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  if (!toasts.length) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top + 8,
      left: 12,
      right: 12,
      gap: 8,
    },
  });

  return (
    // `box-none` keeps the untouched area around the cards interactive.
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </View>
  );
}
