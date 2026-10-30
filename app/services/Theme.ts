
import  { createTheme, type Theme } from "@/lib/appTheme";
import { adjustColorBrightness } from "@/utils/Functions";

import type { THEME_TYPES, TPaletteMode } from "./types";

export const colors: THEME_TYPES = {
  primary: "#0E4E96",
  primaryContrastText: "#f5f3f3",
  secondary: "#f85a40",
  secondaryContrastText: "#f1f1f1",

  info: "#00a8f7ff",
  infoContrastText: "#05446b",
  lightInfo: "#b6def1",
  success: "#00A550",
  successContrastText: "#044737",
  lightSuccess: "#c6fcca",
  warning: "#ecc434",
  lightWarning: "#f8e7b3",
  warningContrastText: "#534608",
  error: "#ff442f",
  errorContrastText: "#d13535",
  lightError: "#f7c2b9",

  white: "#FFFFFF",
  darkPrimary: "#272727",
  darkSecondary: "#202020",

  grey100: "#ffffff",
  grey200: "#F5F5F5",
  grey300: "#D7D7D7",
  grey400: "#B7B7B7",
  grey500: "#A1A1A1",
  grey600: "#7C7C7C",
  grey700: "#656565",
  grey800: "#515151",
  grey900: "#3b3b3b"
};

export function getTheme(paletteMode: TPaletteMode): Theme {
  const modeIsLight = paletteMode === "light";

  return createTheme({
    shape: {
      borderRadius: {
        none: 0,
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 12,
        '2xl': 16,
        '3xl': 24,
        full: 9999
      }
    },

    /**
     * @here Customizes screen size breakpoints.
     * @description Controls responsive design via values for xs, sm, md, lg, xl.
     */
    breakpoints: {
      values: {
        xs: 320,
        sm: 425,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    },

    /**
     * @here Typography styles across the app.
     * @description Custom font sizing, line height, and color based on palette mode.
     */
    text: {
      heading1: { fontSize: 56, lineHeight: 61.6 },
      heading2: { fontSize: 48, lineHeight: 52.8 },
      heading3: { fontSize: 40, lineHeight: 44 },
      heading4: { fontSize: 32, lineHeight: 35.2 },
      heading5: { fontSize: 24, lineHeight: 26.4 },
      heading6: { fontSize: 20, lineHeight: 22 },
      body1: { fontSize: 14, lineHeight: 14 },
      body2: { fontSize: 12, lineHeight: 12 },
      subHeading1: { fontSize: 16, lineHeight: 16 },
      subHeading2: { fontSize: 12, lineHeight: 12 },
      caption: { fontSize: 0.65, lineHeight: 12 }
    },

    /**
     * @here MUI color palette definitions.
     * @description Applies consistent colors across components using theme-aware styling.
     */
    palette: {
      mode: paletteMode,
      primary: {
        main: modeIsLight ? colors.primary : adjustColorBrightness(colors.primary, 30),
        dark: modeIsLight ? adjustColorBrightness(colors.primary, -30) : adjustColorBrightness(colors.primary, -10),
        light: modeIsLight ? adjustColorBrightness(colors.primary, 40) : adjustColorBrightness(colors.primary, 60),
        contrastText: modeIsLight ? colors.primaryContrastText : colors.white
      },
      secondary: {
        main: modeIsLight ? colors.secondary : adjustColorBrightness(colors.secondary, -10),
        dark: modeIsLight ? adjustColorBrightness(colors.secondary, -30) : adjustColorBrightness(colors.secondary, -30),
        light: modeIsLight ? adjustColorBrightness(colors.secondary, 30) : adjustColorBrightness(colors.secondary, 20),
        contrastText: modeIsLight ? colors.secondaryContrastText : colors.white
      },
      success: {
        main: modeIsLight ? colors.success : adjustColorBrightness(colors.success, 30),
        dark: modeIsLight ? adjustColorBrightness(colors.success, -30) : adjustColorBrightness(colors.success, -10),
        light: modeIsLight ? colors.lightSuccess : adjustColorBrightness(colors.success, 60),
        contrastText: modeIsLight ? colors.successContrastText : colors.white
      },
      warning: {
        main: modeIsLight ? colors.warning : adjustColorBrightness(colors.warning, 30),
        dark: modeIsLight ? adjustColorBrightness(colors.warning, -30) : adjustColorBrightness(colors.warning, -10),
        light: modeIsLight ? colors.lightWarning : adjustColorBrightness(colors.warning, 60),
        contrastText: modeIsLight ? colors.warningContrastText : colors.white
      },
      error: {
        main: modeIsLight ? colors.error : adjustColorBrightness(colors.error, 30),
        dark: modeIsLight ? adjustColorBrightness(colors.error, -30) : adjustColorBrightness(colors.error, -10),
        light: modeIsLight ? colors.lightError : adjustColorBrightness(colors.error, 60),
        contrastText: modeIsLight ? colors.errorContrastText : colors.white
      },
      info: {
        main: modeIsLight ? colors.info : adjustColorBrightness(colors.info, 30),
        dark: modeIsLight ? adjustColorBrightness(colors.info, -30) : adjustColorBrightness(colors.info, -10),
        light: modeIsLight ? colors.lightInfo : adjustColorBrightness(colors.info, 60),
        contrastText: modeIsLight ? colors.infoContrastText : colors.white
      },
      common: {
        white: modeIsLight ? colors.white : colors.darkPrimary,
        black: modeIsLight ? colors.darkPrimary : colors.white
      },
      background: {
        default: modeIsLight ? colors.white : colors.darkPrimary,
        paper: modeIsLight ? colors.white : colors.darkSecondary,
        level1: modeIsLight ? colors.grey100 : colors.grey900,
        level2: modeIsLight ? colors.grey200 : colors.grey800
      },
      text: {
        primary: modeIsLight ? colors.darkPrimary : colors.white,
        secondary: modeIsLight ? colors.grey600 : colors.grey400,
        disabled: modeIsLight ? colors.grey500 : colors.grey700,
        hint: modeIsLight ? colors.grey400 : colors.grey500
      },
      divider: modeIsLight ? colors.grey300 : colors.grey800,
      grey: {
        100: modeIsLight ? colors.grey100 : colors.grey900,
        200: modeIsLight ? colors.grey200 : colors.grey800,
        300: modeIsLight ? colors.grey300 : colors.grey700,
        400: modeIsLight ? colors.grey400 : colors.grey600,
        500: colors.grey500,
        600: modeIsLight ? colors.grey600 : colors.grey400,
        700: modeIsLight ? colors.grey700 : colors.grey300,
        800: modeIsLight ? colors.grey800 : colors.grey200,
        900: modeIsLight ? colors.grey900 : colors.grey100
      }
    }

  });
}
