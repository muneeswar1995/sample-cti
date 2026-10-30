import React from 'react';

import type { AppTextProps } from './AppText';
import { AppText } from './AppText';

export const CaptionText: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="caption" {...props} />;
};
