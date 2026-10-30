import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/appTheme';
import { Icon, IconType } from '@/lib/layout';
import { hexToRgba } from '@/utils/Functions';

import type { ToastItem, ToastVariant } from './types';

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  default: 3200,
  info: 3200,
  success: 3200,
  warning: 4000,
  error: 5000,
};

const VARIANT_META: Record<ToastVariant, { title: string; icon: string; iconType: IconType }> = {
  default: { title: 'Notice', icon: 'info-outline', iconType: 'material' },
  info: { title: 'Heads up', icon: 'info-outline', iconType: 'material' },
  success: { title: 'Success', icon: 'check-circle-outline', iconType: 'material' },
  warning: { title: 'Warning', icon: 'warning-amber', iconType: 'material' },
  error: { title: 'Something went wrong', icon: 'error-outline', iconType: 'material' },
};

const ENTER_OFFSET = -28;
const EXIT_OFFSET = -18;
const SWIPE_THRESHOLD = -18;

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export default function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const { theme } = useTheme();
  const { id, message, variant } = toast;

  const translateY = useRef(new Animated.Value(ENTER_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const dismissed = useRef(false);

  const meta = VARIANT_META[variant] || VARIANT_META.default;
  const duration = toast.duration ?? DEFAULT_DURATION[variant] ?? DEFAULT_DURATION.default;

  const accent = useMemo(() => {
    switch (variant) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  }, [variant, theme]);

  const dismiss = useCallback(() => {
    if (dismissed.current) {
      return;
    }
    dismissed.current = true;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: EXIT_OFFSET,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(id));
  }, [id, onDismiss, opacity, scale, translateY]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 200,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progress, {
      toValue: 0,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        dismiss();
      }
    });
  }, [dismiss, duration, opacity, progress, scale, translateY]);

  // Swipe up to dismiss - the card tracks the finger, then snaps back or leaves.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_evt, gesture) => {
        // Resist downward drags so the card stays anchored near the top.
        translateY.setValue(gesture.dy < 0 ? gesture.dy : gesture.dy * 0.25);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy < SWIPE_THRESHOLD) {
          dismiss();
          return;
        }
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 220,
          mass: 0.7,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const isDark = theme.palette.mode === 'dark';

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingTop: 12,
      paddingBottom: 16,
      paddingHorizontal: 14,
      borderRadius: theme.shape.borderRadius['2xl'],
      backgroundColor: isDark ? theme.palette.background.level1 : theme.palette.background.paper,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? hexToRgba(accent, 0.35) : theme.palette.divider,
      overflow: 'hidden',
      ...theme.shadows.lg,
      // shadowColor: isDark ? '#000000' : hexToRgba(accent, 1),
      shadowOpacity: isDark ? 0.45 : 0.2,
    },
    iconChip: {
      width: 34,
      height: 34,
      borderRadius: theme.shape.borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(accent, isDark ? 0.22 : 0.14),
    },
    body: {
      flex: 1,
      paddingTop: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: 0.1,
      color: theme.palette.text.primary,
    },
    message: {
      marginTop: 3,
      fontSize: 12.5,
      lineHeight: 17,
      color: theme.palette.text.secondary,
    },
    closeBtn: {
      width: 22,
      height: 22,
      borderRadius: theme.shape.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.grey[200],
    },
    progressTrack: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: 7,
      height: 3,
      borderRadius: theme.shape.borderRadius.full,
      backgroundColor: hexToRgba(accent, isDark ? 0.2 : 0.12),
      overflow: 'hidden',
    },
    progressFill: {
      width: '100%',
      height: '100%',
      borderRadius: theme.shape.borderRadius.full,
      backgroundColor: accent,
      // Shrunk with scaleX so the countdown can run on the native driver.
      transformOrigin: 'left center',
    },
  });

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{ opacity, transform: [{ translateY }, { scale }] }}
      {...panResponder.panHandlers}
    >
      <Pressable onPress={dismiss} style={styles.card}>
        <View style={styles.iconChip}>
          <Icon name={meta.icon} type={meta.iconType} size={19} color={accent} />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.title}>
              {toast.title || meta.title}
            </Text>
            <Pressable
              onPress={dismiss}
              hitSlop={10}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
            >
              <Icon name="close" type="material" size={13} color={theme.palette.text.secondary} />
            </Pressable>
          </View>
          <Text numberOfLines={3} style={styles.message}>
            {message}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { transform: [{ scaleX: progress }] }]} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
