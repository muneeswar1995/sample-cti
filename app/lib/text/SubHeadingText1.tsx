import React from 'react';

import type { AppTextProps } from './AppText';
import { AppText } from './AppText';

export const SubHeadingText1: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="subHeading1" {...props} />;
};
