import React from 'react';

import type { AppTextProps } from './AppText';
import { AppText } from './AppText';

export const BodyText2: React.FC<Omit<AppTextProps, 'variant'>> = (props) => {
  return <AppText variant="body2" {...props} />;
};
