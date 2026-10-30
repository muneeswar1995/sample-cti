import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/lib/appTheme';
import { useAuth } from '@/context';
import { Icon } from '@/lib/layout';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { logout, role } = useAuth();
  const isDark = theme.palette.mode === 'dark';
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const displayName = role === 'manager' ? 'Team Manager' : 'CS Associate';
  const displayRole = role === 'manager' ? 'Manager · CS Lead' : 'Customer Success';
  const initials = displayName.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
    header: {
      paddingHorizontal: 16, paddingVertical: 14,
      backgroundColor: isDark ? '#1E293B' : '#fff',
      borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: theme.palette.text.primary },
    profileCard: {
      margin: 16,
      backgroundColor: isDark ? '#1E293B' : '#fff',
      borderRadius: 16, padding: 20, alignItems: 'center',
      borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    avatar: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: theme.palette.primary.main,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    initials: { color: '#fff', fontSize: 26, fontWeight: '700' },
    name: { fontSize: 18, fontWeight: '700', color: theme.palette.text.primary },
    roleText: { fontSize: 13, color: theme.palette.text.secondary, marginTop: 4 },
    roleBadge: {
      marginTop: 10, borderRadius: 20,
      backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF',
      borderWidth: 1, borderColor: isDark ? '#2563EB' : '#BFDBFE',
      paddingHorizontal: 14, paddingVertical: 5,
    },
    roleBadgeText: { fontSize: 12, fontWeight: '700', color: theme.palette.primary.main },
    section: { marginHorizontal: 16, marginTop: 4, marginBottom: 8 },
    sectionLabel: {
      fontSize: 11, fontWeight: '700', color: theme.palette.text.secondary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingHorizontal: 4,
    },
    menuCard: {
      backgroundColor: isDark ? '#1E293B' : '#fff',
      borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0',
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#F1F5F9',
    },
    menuItemLast: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 16, paddingVertical: 14,
    },
    menuIcon: {
      width: 32, height: 32, borderRadius: 8,
      alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: theme.palette.text.primary },
    menuChevron: {},
    logoutCard: {
      marginHorizontal: 16, marginTop: 16, marginBottom: 32,
      backgroundColor: isDark ? '#1E293B' : '#fff',
      borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0',
      overflow: 'hidden',
    },
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 16, paddingVertical: 14,
    },
    logoutText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  });

  const menuItems = [
    { icon: 'notifications', iconBg: '#EFF6FF', iconColor: theme.palette.primary.main, label: 'Notifications', last: false },
    { icon: 'lock', iconBg: '#F0FDF4', iconColor: '#16A34A', label: 'Change Password', last: false },
    { icon: 'help-outline', iconBg: '#FEF9EC', iconColor: '#D97706', label: 'Help & Support', last: true },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.palette.primary.main]}
            tintColor={theme.palette.primary.main}
          />
        }
      >
        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.initials}>{initials}</Text>
          </View>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.roleText}>{displayRole}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeText}>{role === 'manager' ? 'Manager' : 'Employee'}</Text>
          </View>
        </View>

        {/* Settings Section */}
        {/* <View style={s.section}>
          <Text style={s.sectionLabel}>Settings</Text>
          <View style={s.menuCard}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={item.last ? s.menuItemLast : s.menuItem}
                activeOpacity={0.7}
              >
                <View style={[s.menuIcon, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} type="material" size={18} color={item.iconColor} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Icon name="chevron-right" type="material" size={20} color={theme.palette.text.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* Logout */}
        <View style={s.logoutCard}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="logout" type="material" size={18} color="#EF4444" />
            </View>
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
