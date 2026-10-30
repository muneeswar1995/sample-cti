import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/appTheme';
import { Icon, IconType } from '@/lib/layout';
import { useAuth } from '@/context';
import { isManagerRole } from '@/utils/roles';

export type TabKey = 'team' | 'location' | 'users' | 'profile' | 'myTrips' | 'tasks';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
  iconType: IconType;
}

const MANAGERTABS: Tab[] = [
  { key: 'team',     label: 'Home',     icon: 'home',         iconType: 'material' },
  { key: 'users',    label: 'Users',    icon: 'group',        iconType: 'material' },
  { key: 'location', label: 'Location', icon: 'location-on',  iconType: 'material' },
  { key: 'profile',  label: 'Profile',  icon: 'person',       iconType: 'material' },
];
const EMPLOYEETABS: Tab[] = [
  { key: 'team',     label: 'Home',     icon: 'home',         iconType: 'material' },
  { key: 'tasks',    label: 'Tasks',    icon: 'check-box',    iconType: 'material' },
  { key: 'myTrips',  label: 'Trips',    icon: 'commute',      iconType: 'material' },
  { key: 'profile',  label: 'Profile',  icon: 'person',       iconType: 'material' },
];
interface BottomNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { theme } = useTheme();
  const { role } = useAuth();
  const insets = useSafeAreaInsets();

  const tabs = isManagerRole(role) ? MANAGERTABS : EMPLOYEETABS;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.palette.background.paper,
      borderTopWidth: 1,
      borderTopColor: theme.palette.divider,
      paddingBottom: Math.max(insets.bottom, 8),
      paddingTop: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      gap: 3,
    },
    activeIndicator: {
      position: 'absolute',
      top: -8,
      width: 28,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.palette.primary.main,
    },
    label: {
      fontSize: 10,
      fontWeight: '500',
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.activeIndicator} />}
            <Icon
              name={tab.icon}
              type={tab.iconType}
              size={24}
              color={isActive ? theme.palette.primary.main : theme.palette.text.secondary}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.palette.primary.main : theme.palette.text.secondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
