import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const SubHeadingText2: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="subHeading2" {...props} />;
};
