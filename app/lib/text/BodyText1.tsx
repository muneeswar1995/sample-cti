import React from 'react';

import { AppText, AppTextProps } from './AppText';

export const BodyText1: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="body1" {...props} />;
};
