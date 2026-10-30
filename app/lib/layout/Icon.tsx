import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export type IconType = 'feather' | 'ionicons' | 'material' | 'community' | 'font-awesome';

interface IconProps {
  name: string;
  type?: IconType;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  type = 'feather',
  size = 24,
  color,
  style
}) => {
  switch (type) {
    case 'ionicons':
      return <Ionicons name={name} size={size} color={color} style={style} />;
    case 'material':
      return <MaterialIcons name={name} size={size} color={color} style={style} />;
    case 'community':
      return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
    case 'font-awesome':
      return <FontAwesome name={name} size={size} color={color} style={style} />;
    case 'feather':
    default:
      return <Feather name={name} size={size} color={color} style={style} />;
  }
};
