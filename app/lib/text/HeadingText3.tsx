import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const HeadingText3: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="heading3" {...props} />;
};
