import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth, useThemeContext } from '@/context';
import { useTheme } from '@/lib/appTheme';
import { Icon } from '@/lib/layout';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heroCard: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowColor: '#000'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  section: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)'
  },
  menuItemLast: {
    borderBottomWidth: 0
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12
  },
  valueText: {
    fontSize: 14,
    marginRight: 6
  },
  variantButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4
  },
  variantButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    width: '31%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  variantButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24
  },
  bottomSpacer: {
    height: 100 // Spacer to prevent bottom tab cutoff
  }
});

interface ProfileScreenProps {
  tabVariant: 'standard' | 'floating' | 'glassmorphism';
  setTabVariant: (v: 'standard' | 'floating' | 'glassmorphism') => void;
}

export default function ProfileScreen({
  tabVariant,
  setTabVariant
}: ProfileScreenProps) {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const { changeTheme } = useThemeContext();
  const isDark = theme.palette.mode === 'dark';

  const handleLogout = () => {
    console.log('User logged out');
    logout();
  };

  const themedContainerStyle = {
    backgroundColor: theme.palette.background.default
  };

  const themedCardStyle = {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    borderWidth: isDark ? 1 : 0,
    shadowColor: theme.palette.common.black
  };

  const primaryTextStyle = {
    color: theme.palette.text.primary
  };

  const secondaryTextStyle = {
    color: theme.palette.text.secondary
  };

  return (
    <ScrollView style={[styles.container, themedContainerStyle]} bounces={true}>

      {/* Profile Hero Card inside ScrollView */}
      <View style={[styles.heroCard, { backgroundColor: theme.palette.primary.main }]}>
        <View style={[styles.avatar, { backgroundColor: theme.palette.primary.light }]}>
          <Icon name="user" type="feather" size={48} color={theme.palette.primary.main} />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>SYSTEM ADMINISTRATOR</Text>
        </View>
      </View>

      <View style={styles.content}>

        {/* Preference Settings Section */}
        <Text style={[styles.sectionTitle, primaryTextStyle]}>Preferences</Text>
        <View style={[styles.section, themedCardStyle]}>

          {/* Theme Toggle */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => changeTheme()}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Icon
                name={isDark ? 'moon' : 'sun'}
                type="feather"
                size={20}
                color={theme.palette.primary.main}
              />
              <Text style={[styles.menuItemText, primaryTextStyle]}>Color Mode</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.valueText, secondaryTextStyle]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Bottom Tab Bar Selection Option */}
          <View style={[styles.menuItem, styles.menuItemLast, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={styles.menuItemLeft}>
                <Icon name="layers" type="feather" size={20} color={theme.palette.primary.main} />
                <Text style={[styles.menuItemText, primaryTextStyle]}>Bottom Tab Style</Text>
              </View>
              <Text style={[styles.valueText, secondaryTextStyle, { textTransform: 'capitalize' }]}>
                {tabVariant}
              </Text>
            </View>

            {/* Quick button toggles */}
            <View style={styles.variantButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.variantButton,
                  tabVariant === 'standard' && { backgroundColor: theme.palette.primary.main }
                ]}
                onPress={() => setTabVariant('standard')}
              >
                <Text style={[
                  styles.variantButtonText,
                  { color: tabVariant === 'standard' ? theme.palette.primary.contrastText : theme.palette.text.primary }
                ]}>
                  Standard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.variantButton,
                  tabVariant === 'floating' && { backgroundColor: theme.palette.primary.main }
                ]}
                onPress={() => setTabVariant('floating')}
              >
                <Text style={[
                  styles.variantButtonText,
                  { color: tabVariant === 'floating' ? theme.palette.primary.contrastText : theme.palette.text.primary }
                ]}>
                  Floating
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.variantButton,
                  tabVariant === 'glassmorphism' && { backgroundColor: theme.palette.primary.main }
                ]}
                onPress={() => setTabVariant('glassmorphism')}
              >
                <Text style={[
                  styles.variantButtonText,
                  { color: tabVariant === 'glassmorphism' ? theme.palette.primary.contrastText : theme.palette.text.primary }
                ]}>
                  Glass
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Account Details Section */}
        <Text style={[styles.sectionTitle, primaryTextStyle]}>Account Settings</Text>
        <View style={[styles.section, themedCardStyle]}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Icon name="edit-3" type="feather" size={20} color={theme.palette.text.secondary} />
              <Text style={[styles.menuItemText, primaryTextStyle]}>Edit Profile</Text>
            </View>
            <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Icon name="lock" type="feather" size={20} color={theme.palette.text.secondary} />
              <Text style={[styles.menuItemText, primaryTextStyle]}>Change Password</Text>
            </View>
            <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Icon name="bell" type="feather" size={20} color={theme.palette.text.secondary} />
              <Text style={[styles.menuItemText, primaryTextStyle]}>Notifications</Text>
            </View>
            <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={[styles.section, themedCardStyle]}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Icon name="help-circle" type="feather" size={20} color={theme.palette.text.secondary} />
              <Text style={[styles.menuItemText, primaryTextStyle]}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Icon name="file-text" type="feather" size={20} color={theme.palette.text.secondary} />
              <Text style={[styles.menuItemText, primaryTextStyle]}>Terms of Service</Text>
            </View>
            <Icon name="chevron-right" type="feather" size={16} color={theme.palette.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.palette.error.main }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="log-out" type="feather" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, secondaryTextStyle]}>Version 1.0.0 (Production)</Text>
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}
