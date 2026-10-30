import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const HeadingText1: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="heading1" {...props} />;
};
