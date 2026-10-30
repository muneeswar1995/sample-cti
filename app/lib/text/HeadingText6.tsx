import React from 'react';

import type { AppTextProps } from './AppText';
import { AppText } from './AppText';

export const HeadingText6: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="heading6" {...props} />;
};
