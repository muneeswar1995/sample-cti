import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const HeadingText4: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="heading4" {...props} />;
};
