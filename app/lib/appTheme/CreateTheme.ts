import { Appearance,Dimensions, PixelRatio, Platform } from 'react-native';

import type {
  AlertTheme,
  AppBarTheme,
  AvatarTheme,
  BadgeTheme,
  Breakpoints,
  CheckboxTheme,
  ChipTheme,
  ComponentThemes,
  DialogTheme,
  DrawerTheme,
  ListItemTheme,
  ListTheme,
  Palette,
  ProgressTheme,
  RadioTheme,
  Shadows,
  Shape,
  SkeletonTheme,
  SliderTheme,
  SnackbarTheme,
  Spacing,
  SwitchTheme,
  Theme,
  ThemeOptions,
  ThemeText,
  TooltipTheme,
  TransitionOptions,
  Transitions,
  ZIndex} from './types';

// Get device dimensions

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base reference screen (iPhone 12)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Detect landscape mode
const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;

// Detect tablet
const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600;

// Landscape dampening factors
// Tablets need a stronger font reduction than phones
const LANDSCAPE_FONT_FACTOR = isLandscape
  ? isTablet
    ? 0.7 // tablets landscape
    : 0.85 // phones landscape
  : 1;

const scaleWidth = (size: number): number => {
  const { width, height } = Dimensions.get('window');
  const screenMin = Math.min(width, height); // avoids overscaling in landscape
  return (screenMin / BASE_WIDTH) * size;
};

const scaleHeight = (size: number): number => {
  const { width, height } = Dimensions.get('window');
  const screenMax = Math.max(width, height);
  return (screenMax / BASE_HEIGHT) * size;
};
const scaleRadius = (size: number): number => {
  const { width, height } = Dimensions.get('window');
  const screenMin = Math.min(width, height);
  return (screenMin / BASE_WIDTH) * size;
};

// Base font scaling (your existing logic)
const scaleFontBase = (size: number) => {
  const scaleWidthFactor = SCREEN_WIDTH / BASE_WIDTH;
  const scaleHeightFactor = SCREEN_HEIGHT / BASE_HEIGHT;
  const scale = Math.min(scaleWidthFactor, scaleHeightFactor);
  const newSize = size * scale;

  return Platform.OS === 'ios'
    ? newSize
    : PixelRatio.roundToNearestPixel(newSize);
};

// FINAL responsive font scaling
const scaleFont = (size: number) => {
  const scaled = scaleFontBase(size);
  return scaled * LANDSCAPE_FONT_FACTOR;
};

// Default palette colors
const createPalette = (mode: 'light' | 'dark' = 'light'): Palette => {
  const isLight = mode === 'light';

  return {
    mode,
    common: {
      black: '#000000',
      white: '#FFFFFF'
    },
    primary: {
      main: isLight ? '#1976d2' : '#90caf9',
      light: isLight ? '#42a5f5' : '#e3f2fd',
      dark: isLight ? '#1565c0' : '#42a5f5',
      contrastText: isLight ? '#ffffff' : '#000000'
    },
    secondary: {
      main: isLight ? '#dc004e' : '#f48fb1',
      light: isLight ? '#ff5983' : '#fce4ec',
      dark: isLight ? '#9a0036' : '#c2185b',
      contrastText: isLight ? '#ffffff' : '#000000'
    },
    error: {
      main: isLight ? '#d32f2f' : '#f44336',
      light: isLight ? '#ef5350' : '#e57373',
      dark: isLight ? '#c62828' : '#d32f2f',
      contrastText: isLight ? '#ffffff' : '#ffffff'
    },
    warning: {
      main: isLight ? '#ed6c02' : '#ff9800',
      light: isLight ? '#ff9800' : '#ffb74d',
      dark: isLight ? '#e65100' : '#f57c00',
      contrastText: isLight ? '#ffffff' : '#000000'
    },
    info: {
      main: isLight ? '#0288d1' : '#29b6f6',
      light: isLight ? '#03a9f4' : '#4fc3f7',
      dark: isLight ? '#01579b' : '#0277bd',
      contrastText: isLight ? '#ffffff' : '#000000'
    },
    success: {
      main: isLight ? '#2e7d32' : '#66bb6a',
      light: isLight ? '#4caf50' : '#81c784',
      dark: isLight ? '#1b5e20' : '#388e3c',
      contrastText: isLight ? '#ffffff' : '#000000'
    },
    grey: {
      50: isLight ? '#fafafa' : '#303030',
      100: isLight ? '#f5f5f5' : '#404040',
      200: isLight ? '#eeeeee' : '#525252',
      300: isLight ? '#e0e0e0' : '#666666',
      400: isLight ? '#bdbdbd' : '#7a7a7a',
      500: isLight ? '#9e9e9e' : '#9e9e9e',
      600: isLight ? '#757575' : '#bdbdbd',
      700: isLight ? '#616161' : '#e0e0e0',
      800: isLight ? '#424242' : '#eeeeee',
      900: isLight ? '#212121' : '#f5f5f5'
    },
    text: {
      primary: isLight ? '#000000de' : 'rgba(255, 255, 255, 0.87)',
      secondary: isLight ? '#00000099' : 'rgba(255, 255, 255, 0.6)',
      disabled: isLight ? '#00000061' : 'rgba(255, 255, 255, 0.38)',
      hint: isLight ? '#00000061' : 'rgba(255, 255, 255, 0.38)'
    },
    divider: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    background: {
      default: isLight ? '#fafafa' : '#121212',
      paper: isLight ? '#ffffff' : '#1e1e1e',
      level1: isLight ? '#ffffff' : '#2a2a2a',
      level2: isLight ? '#f5f5f5' : '#333333'
    },
    action: {
      active: isLight ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
      hover: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
      selected: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      disabled: isLight ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.26)',
      disabledBackground: isLight
        ? 'rgba(0, 0, 0, 0.12)'
        : 'rgba(255, 255, 255, 0.12)'
    },
    border: {
      main: isLight ? 'rgba(0,0,0,0.15)' : '#2A2A2A',
      light: isLight ? 'rgba(0,0,0,0.08)' : '#333333',
      dark: isLight ? 'rgba(0,0,0,0.05)' : '#262626',
      contrastText: isLight ? 'rgba(0,0,0,0.25)' : '#404040'
    }
  };
};

// Default text
const createTextTheme = (palette: Palette): ThemeText => {
  const fontFamily = {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light'
  };

  const fontSize = {
    xs: scaleFont(12),
    sm: scaleFont(14),
    base: scaleFont(16),
    lg: scaleFont(18),
    xl: scaleFont(20),
    '2xl': scaleFont(24),
    '3xl': scaleFont(30),
    '4xl': scaleFont(36),
    '5xl': scaleFont(48),
    '6xl': scaleFont(60)
  };

  const fontWeight = {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const
  };

  const lineHeight = {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8
  };

  const letterSpacing = {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1
  };

  return {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    heading1: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize['4xl'],
      fontWeight: fontWeight.light,
      lineHeight: lineHeight.tight * fontSize['4xl'],
      letterSpacing: letterSpacing.tight,
      color: palette.text.primary
    },
    heading2: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.light,
      lineHeight: lineHeight.tight * fontSize['3xl'],
      letterSpacing: letterSpacing.tight,
      color: palette.text.primary
    },
    heading3: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize['2xl'],
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize['2xl'],
      letterSpacing: letterSpacing.normal,
      color: palette.text.primary
    },
    heading4: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xl,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.xl,
      letterSpacing: letterSpacing.normal,
      color: palette.text.primary
    },
    heading5: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.lg,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.lg,
      letterSpacing: letterSpacing.normal,
      color: palette.text.primary
    },
    heading6: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal * fontSize.base,
      letterSpacing: letterSpacing.wide,
      color: palette.text.primary
    },
    subHeading1: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.base,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.base,
      letterSpacing: letterSpacing.normal,
      color: palette.text.primary
    },
    subHeading2: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal * fontSize.sm,
      letterSpacing: letterSpacing.normal,
      color: palette.text.primary
    },
    body1: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.base,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.base,
      letterSpacing: letterSpacing.normal,
      color: palette.text.primary
    },
    body2: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.sm,
      letterSpacing: letterSpacing.normal,
      color: palette.text.secondary
    },
    button: {
      fontFamily: fontFamily.medium,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal * fontSize.sm,
      letterSpacing: letterSpacing.wide,
      textTransform: 'uppercase' as const,
      color: palette.text.primary
    },
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.xs,
      letterSpacing: letterSpacing.normal,
      color: palette.text.secondary
    },
    overline: {
      fontFamily: fontFamily.regular,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal * fontSize.xs,
      letterSpacing: letterSpacing.widest,
      textTransform: 'uppercase' as const,
      color: palette.text.secondary
    }
  };
};

// Default spacing
const createSpacing = (): Spacing => ({
  unit: 8,
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(16),
  lg: scaleWidth(24),
  xl: scaleWidth(32),
  '2xl': scaleWidth(48),
  '3xl': scaleWidth(64),
  '4xl': scaleWidth(96),
  '5xl': scaleWidth(128)
});

// Default shape
const createShape = (): Shape => ({
  borderRadius: {
    none: 0,
    xs: scaleWidth(2),
    sm: scaleWidth(4),
    md: scaleWidth(8),
    lg: scaleWidth(12),
    xl: scaleWidth(16),
    '2xl': scaleWidth(24),
    '3xl': scaleWidth(32),
    full: 9999
  }
});

// Default breakpoints
const createBreakpoints = (): Breakpoints => {
  const values = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  };

  const up = (key: keyof typeof values): string => {
    return `@media (min-width: ${values[key]}px)`;
  };

  const down = (key: keyof typeof values): string => {
    return `@media (max-width: ${values[key] - 0.05}px)`;
  };

  const between = (
    start: keyof typeof values,
    end: keyof typeof values
  ): string => {
    return `@media (min-width: ${values[start]}px) and (max-width: ${
      values[end] - 0.05
    }px)`;
  };

  const only = (key: keyof typeof values): string => {
    return between(key, key);
  };

  return {
    values,
    up,
    down,
    between,
    only
  };
};

// Default shadows
const createShadows = (palette: Palette): Shadows => {
  const shadowColor =
    palette.mode === 'light' ? palette.common.black : palette.common.white;

  return {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0
    },
    xs: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1,
      elevation: 1
    },
    sm: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2
    },
    md: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    lg: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8
    },
    xl: {
      shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12
    },
    '2xl': {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 16
    }
  };
};

// Default component themes
const createComponentThemes = (
  theme: Omit<Theme, 'components'>
): ComponentThemes => {
  const { palette, text, spacing, shape, shadows } = theme;

  return {
    Button: {
      root: {
        borderRadius: shape.borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center'
      },
      text: {
        backgroundColor: 'transparent'
      },
      contained: {
        backgroundColor: palette.primary.main,
        ...shadows.sm
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: palette.primary.main
      },
      textButton: {
        backgroundColor: 'transparent'
      },
      sizeSmall: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 32
      },
      sizeMedium: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36
      },
      sizeLarge: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 42
      },
      colorPrimary: {
        backgroundColor: palette.primary.main
      },
      colorSecondary: {
        backgroundColor: palette.secondary.main
      },
      colorError: {
        backgroundColor: palette.error.main
      },
      colorWarning: {
        backgroundColor: palette.warning.main
      },
      colorInfo: {
        backgroundColor: palette.info.main
      },
      colorSuccess: {
        backgroundColor: palette.success.main
      },
      disabled: {
        backgroundColor: palette.action.disabledBackground,
        opacity: 0.6
      },
      fullWidth: {
        width: '100%'
      }
    },
    Card: {
      root: {
        backgroundColor: palette.background.paper,
        borderRadius: shape.borderRadius.md,
        ...shadows.sm
      },
      header: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.divider
      },
      content: {
        padding: spacing.md
      },
      actions: {
        padding: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm
      },
      media: {
        height: 200,
        backgroundColor: palette.grey[200]
      },
      elevation1: shadows.xs,
      elevation2: shadows.sm,
      elevation3: shadows.md,
      elevation4: shadows.lg,
      elevation5: shadows.xl
    },
    TextField: {
      root: {
        marginVertical: spacing.sm
      },
      input: {
        ...text.body1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: palette.divider,
        borderRadius: shape.borderRadius.sm,
        backgroundColor: palette.background.paper
      },
      label: {
        ...text.body2,
        color: palette.text.secondary,
        marginBottom: spacing.xs
      },
      helperText: {
        ...text.caption,
        color: palette.text.secondary,
        marginTop: spacing.xs
      },
      error: {
        borderColor: palette.error.main,
        color: palette.error.main
      },
      disabled: {
        backgroundColor: palette.action.disabledBackground,
        opacity: 0.6
      },
      focused: {
        borderColor: palette.primary.main
      },
      outlined: {
        borderWidth: 1,
        borderColor: palette.divider
      },
      filled: {
        backgroundColor: palette.action.hover,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: palette.divider
      },
      standard: {
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: palette.divider,
        backgroundColor: 'transparent'
      }
    },
    // Add more component themes as needed...
    AppBar: {} as AppBarTheme,
    Drawer: {} as DrawerTheme,
    List: {} as ListTheme,
    ListItem: {} as ListItemTheme,
    Chip: {} as ChipTheme,
    Avatar: {} as AvatarTheme,
    Badge: {} as BadgeTheme,
    Switch: {} as SwitchTheme,
    Checkbox: {} as CheckboxTheme,
    Radio: {} as RadioTheme,
    Slider: {} as SliderTheme,
    Progress: {} as ProgressTheme,
    Skeleton: {} as SkeletonTheme,
    Tooltip: {} as TooltipTheme,
    Snackbar: {} as SnackbarTheme,
    Dialog: {} as DialogTheme,
    Alert: {} as AlertTheme
  };
};

// Default transitions
const createTransitions = (): Transitions => ({
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  create: (props: string | string[], options?: TransitionOptions) => {
    const duration = options?.duration || 300;
    const easing = options?.easing || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = options?.delay || 0;

    const properties = Array.isArray(props) ? props.join(', ') : props;
    return `${properties} ${duration}ms ${easing} ${delay}ms`;
  }
});

// Default z-index
const createZIndex = (): ZIndex => ({
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
});

// Main theme creation function
const createTheme = (options: ThemeOptions = {}): Theme => {
  const {
    palette: paletteOptions = {},
    text: textOptions = {},
    spacing: spacingOptions = {},
    shape: shapeOptions = {},
    breakpoints: breakpointsOptions = {},
    shadows: shadowsOptions = {},
    components: componentsOptions = {},
    transitions: transitionsOptions = {},
    zIndex: zIndexOptions = {}
  } = options;

  const mode = paletteOptions.mode || 'light';
  const palette = { ...createPalette(mode), ...paletteOptions };
  const spacing = { ...createSpacing(), ...spacingOptions };
  const shape = { ...createShape(), ...shapeOptions };
  const breakpoints = { ...createBreakpoints(), ...breakpointsOptions };
  const shadows = { ...createShadows(palette), ...shadowsOptions };
  const text = { ...createTextTheme(palette), ...textOptions };
  const transitions = { ...createTransitions(), ...transitionsOptions };
  const zIndex = { ...createZIndex(), ...zIndexOptions };

  const baseTheme = {
    palette,
    text,
    spacing,
    shape,
    breakpoints,
    shadows,
    transitions,
    zIndex
  };

  const components = {
    ...createComponentThemes(baseTheme),
    ...componentsOptions
  };

  return {
    ...baseTheme,
    components
  };
};

const isSystemDarkMode = (): boolean => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark';
};

export {
  createTheme,
  isSystemDarkMode,
  scaleFont,
  scaleHeight,
  scaleRadius,
  scaleWidth
};
