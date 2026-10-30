export type TPaletteMode = "light" | "dark";

export interface THEME_TYPES {
  primary: string;
  primaryContrastText: string;
  secondary: string;
  secondaryContrastText: string;

  info: string;
  infoContrastText: string;
  lightInfo: string;

  success: string;
  successContrastText: string;
  lightSuccess: string;

  warning: string;
  warningContrastText: string;
  lightWarning: string;

  error: string;
  errorContrastText: string;
  lightError: string;

  darkPrimary: string;
  darkSecondary: string;
  white: string;

  grey100: string;
  grey200: string;
  grey300: string;
  grey400: string;
  grey500: string;
  grey600: string;
  grey700: string;
  grey800: string;
  grey900: string;
}

export interface IResponseInterface<T> {
  status: number;
  data: T;
  message: string;
  timestamp: string;
}
