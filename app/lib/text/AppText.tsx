import React from 'react';
import type { TextProps as RNTextProps, TextStyle } from 'react-native';
import { Text as RNText } from 'react-native';

import { useTheme } from '@/lib/appTheme';

export type TextVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'subHeading1'
  | 'subHeading2'
  | 'body1'
  | 'body2'
  | 'caption';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'hint'
  | 'error'
  | 'success'
  | 'warning'
  | string;

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontWeight?: TextStyle['fontWeight'];
  style?: TextStyle | TextStyle[];
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'body1',
  color = 'primary',
  align = 'auto',
  fontWeight,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  // Resolve color
  let textColor: string;
  switch (color) {
    case 'primary':
      textColor = theme.palette.text.primary;
      break;
    case 'secondary':
      textColor = theme.palette.text.secondary;
      break;
    case 'disabled':
      textColor = theme.palette.text.disabled;
      break;
    case 'hint':
      textColor = theme.palette.text.hint;
      break;
    case 'error':
      textColor = theme.palette.error.main;
      break;
    case 'success':
      textColor = theme.palette.success.main;
      break;
    case 'warning':
      textColor = theme.palette.warning.main;
      break;
    default:
      textColor = color; // direct hex/rgb/color string
  }

  // Resolve typography styles from theme
  const typographyStyle = theme.text[variant] || {};

  const combinedStyles: TextStyle = {
    ...typographyStyle,
    color: textColor,
    textAlign: align,
    ...(fontWeight ? { fontWeight } : {})
  };

  return (
    <RNText style={[combinedStyles, style]} {...rest}>
      {children}
    </RNText>
  );
};
