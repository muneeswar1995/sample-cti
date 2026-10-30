import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const HeadingText2: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="heading2" {...props} />;
};
