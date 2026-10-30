import React, { useState } from 'react';
import type {
  TextStyle,
  ViewStyle} from 'react-native';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/appTheme';

import type { IconType } from './Icon';
import { Icon } from './Icon';

export interface HeaderRightAction {
  iconName?: string;
  iconType?: IconType;
  label?: string;
  onPress: () => void;
  color?: string;
}

export interface HeaderMenuOption {
  label: string;
  onPress: () => void;
  icon?: string;
  iconType?: IconType;
  isDestructive?: boolean;
}

export interface HeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backIconName?: string;
  backIconType?: IconType;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  rightActions?: HeaderRightAction[];
  menuOptions?: HeaderMenuOption[];
  height?: number;
  backgroundColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.15)';

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    zIndex: 10
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  leftSlot: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  centerSlot: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightSlot: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  backButton: {
    padding: 8
  },
  titleContainer: {
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center'
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    padding: 8,
    marginLeft: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    width: 180,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden'
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  menuOptionIcon: {
    marginRight: 10
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: '500'
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600'
  }
});
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  backIconName = 'arrow-left',
  backIconType = 'feather',
  leftComponent,
  rightComponent,
  rightActions = [],
  menuOptions = [],
  height = 56,
  backgroundColor,
  style,
  titleStyle,
  subtitleStyle
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const headerBgColor = backgroundColor || theme.palette.background.paper;
  const contentHeight = height;

  const handleMenuOptionPress = (onPress: () => void) => {
    setMenuVisible(false);
    onPress();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: headerBgColor,
          paddingTop: insets.top,
          borderBottomColor: theme.palette.divider
        },
        style
      ]}
    >
      <View style={[styles.content, { height: contentHeight }]}>
        {/* Left Section */}
        <View style={styles.leftSlot}>
          {leftComponent ? (
            leftComponent
          ) : showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon
                name={backIconName}
                type={backIconType}
                size={24}
                color={theme.palette.text.primary}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center Section (Title/Subtitle) */}
        <View style={styles.centerSlot}>
          {typeof title === 'string' ? (
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.title,
                  { color: theme.palette.text.primary },
                  titleStyle
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.palette.text.secondary },
                    subtitleStyle
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          ) : (
            title
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSlot}>
          {rightComponent ? (
            rightComponent
          ) : (
            <View style={styles.rightActionsContainer}>
              {/* Custom Action Buttons */}
              {rightActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  {action.iconName ? (
                    <Icon
                      name={action.iconName}
                      type={action.iconType || 'feather'}
                      size={22}
                      color={action.color || theme.palette.text.primary}
                    />
                  ) : action.label ? (
                    <Text style={[styles.actionButtonText, { color: action.color || theme.palette.primary.main }]}>
                      {action.label}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}

              {/* More Menu Trigger */}
              {menuOptions.length > 0 && (
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="more-vertical"
                    type="feather"
                    size={22}
                    color={theme.palette.text.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Reusable Dropdown Menu Modal */}
      {menuOptions.length > 0 && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    top: insets.top + height - 8,
                    shadowColor: theme.palette.common.black
                  }
                ]}
              >
                {menuOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuOption,
                      index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.palette.divider }
                    ]}
                    onPress={() => handleMenuOptionPress(option.onPress)}
                    activeOpacity={0.7}
                  >
                    {option.icon && (
                      <Icon
                        name={option.icon}
                        type={option.iconType || 'feather'}
                        size={18}
                        color={
                          option.isDestructive
                            ? theme.palette.error.main
                            : theme.palette.text.primary
                        }
                        style={styles.menuOptionIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.menuOptionText,
                        {
                          color: option.isDestructive
                            ? theme.palette.error.main
                            : theme.palette.text.primary
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};
