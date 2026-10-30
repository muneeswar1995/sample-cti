import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const HeadingText5: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="heading5" {...props} />;
};
