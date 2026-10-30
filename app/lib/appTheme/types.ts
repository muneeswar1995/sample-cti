import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Base theme types
export interface Theme {
  palette: Palette;
  text: ThemeText;
  spacing: Spacing;
  shape: Shape;
  breakpoints: Breakpoints;
  shadows: Shadows;
  components: ComponentThemes;
  transitions: Transitions;
  zIndex: ZIndex;
}

// Color palette types
export interface Palette {
  mode: 'light' | 'dark';
  common: CommonColors;
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  warning: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  grey: GreyColor;
  text: TextColors;
  divider: string;
  border: PaletteColor;
  background: BackgroundColors;
  action: ActionColors;
}

export interface PaletteColor {
  main: string;
  light?: string;
  dark?: string;
  contrastText?: string;
}

export interface CommonColors {
  black: string;
  white: string;
}

export interface GreyColor {
  50?: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
}

export interface BackgroundColors {
  default: string;
  paper: string;
  level1: string;
  level2: string;
  level3?: string;
}

export interface ActionColors {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
  disabledBackground: string;
}

// Typography types
export interface ThemeText {
  fontFamily: FontFamily;
  fontSize: FontSizes;
  fontWeight: FontWeights;
  lineHeight: LineHeights;
  letterSpacing: LetterSpacings;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  heading4: TextStyle;
  heading5: TextStyle;
  heading6: TextStyle;
  subHeading1: TextStyle;
  subHeading2: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  button: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
}

export interface FontFamily {
  regular: string;
  medium: string;
  bold: string;
  light: string;
}

export interface FontSizes {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
}

export interface FontWeights {
  light: '100' | '200' | '300';
  regular: '400';
  medium: '500';
  semibold: '600';
  bold: '700' | '800' | '900';
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacings {
  tighter: number;
  tight: number;
  normal: number;
  wide: number;
  wider: number;
  widest: number;
}

// Spacing types
export interface Spacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
}

// Shape types
export interface Shape {
  borderRadius: BorderRadius;
}

export interface BorderRadius {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

// Breakpoints types
export interface Breakpoints {
  values: BreakpointValues;
  up: (key: BreakpointKey) => string;
  down: (key: BreakpointKey) => string;
  between: (start: BreakpointKey, end: BreakpointKey) => string;
  only: (key: BreakpointKey) => string;
}

export interface BreakpointValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export type BreakpointKey = keyof BreakpointValues;

// Shadow types
export interface Shadows {
  none: ShadowStyle;
  xs: ShadowStyle;
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
  xl: ShadowStyle;
  '2xl': ShadowStyle;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

// Component theme types
export interface ComponentThemes {
  Button: ButtonTheme;
  Card: CardTheme;
  TextField: TextFieldTheme;
  AppBar: AppBarTheme;
  Drawer: DrawerTheme;
  List: ListTheme;
  ListItem: ListItemTheme;
  Chip: ChipTheme;
  Avatar: AvatarTheme;
  Badge: BadgeTheme;
  Switch: SwitchTheme;
  Checkbox: CheckboxTheme;
  Radio: RadioTheme;
  Slider: SliderTheme;
  Progress: ProgressTheme;
  Skeleton: SkeletonTheme;
  Tooltip: TooltipTheme;
  Snackbar: SnackbarTheme;
  Dialog: DialogTheme;
  Alert: AlertTheme;
}

export interface ButtonTheme {
  root: ViewStyle;
  text?: TextStyle;
  contained?: ViewStyle;
  outlined?: ViewStyle;
  textButton?: ViewStyle;
  sizeSmall?: ViewStyle;
  sizeMedium?: ViewStyle;
  sizeLarge?: ViewStyle;
  colorPrimary?: ViewStyle;
  colorSecondary?: ViewStyle;
  colorError?: ViewStyle;
  colorWarning?: ViewStyle;
  colorInfo?: ViewStyle;
  colorSuccess?: ViewStyle;
  disabled?: ViewStyle;
  fullWidth?: ViewStyle;
}

export interface CardTheme {
  root: ViewStyle;
  header?: ViewStyle;
  content?: ViewStyle;
  actions?: ViewStyle;
  media?: ViewStyle;
  elevation1?: ViewStyle;
  elevation2?: ViewStyle;
  elevation3?: ViewStyle;
  elevation4?: ViewStyle;
  elevation5?: ViewStyle;
}

export interface TextFieldTheme {
  root: ViewStyle;
  input?: TextStyle;
  label?: TextStyle;
  helperText?: TextStyle;
  error?: TextStyle;
  disabled?: ViewStyle;
  focused?: ViewStyle;
  outlined?: ViewStyle;
  filled?: ViewStyle;
  standard?: ViewStyle;
}

export interface AppBarTheme {
  root: ViewStyle;
  positionFixed?: ViewStyle;
  positionAbsolute?: ViewStyle;
  positionSticky?: ViewStyle;
  positionStatic?: ViewStyle;
  positionRelative?: ViewStyle;
  colorDefault?: ViewStyle;
  colorPrimary?: ViewStyle;
  colorSecondary?: ViewStyle;
  colorTransparent?: ViewStyle;
  colorInherit?: ViewStyle;
}

export interface DrawerTheme {
  root: ViewStyle;
  paper: ViewStyle;
  paperAnchorLeft: ViewStyle;
  paperAnchorRight: ViewStyle;
  paperAnchorTop: ViewStyle;
  paperAnchorBottom: ViewStyle;
  paperAnchorDockedLeft: ViewStyle;
  paperAnchorDockedRight: ViewStyle;
  paperAnchorDockedTop: ViewStyle;
  paperAnchorDockedBottom: ViewStyle;
}

export interface ListTheme {
  root: ViewStyle;
  padding?: ViewStyle;
  dense?: ViewStyle;
  subheader?: ViewStyle;
}

export interface ListItemTheme {
  root: ViewStyle;
  container?: ViewStyle;
  focusVisible?: ViewStyle;
  dense?: ViewStyle;
  alignItemsFlexStart?: ViewStyle;
  disabled?: ViewStyle;
  divider?: ViewStyle;
  gutters?: ViewStyle;
  button?: ViewStyle;
  secondaryAction?: ViewStyle;
  selected?: ViewStyle;
}

export interface ChipTheme {
  root: ViewStyle;
  sizeSmall: ViewStyle;
  sizeMedium: ViewStyle;
  colorDefault: ViewStyle;
  colorPrimary: ViewStyle;
  colorSecondary: ViewStyle;
  colorError: ViewStyle;
  colorWarning: ViewStyle;
  colorInfo: ViewStyle;
  colorSuccess: ViewStyle;
  clickable: ViewStyle;
  clickableColorPrimary: ViewStyle;
  clickableColorSecondary: ViewStyle;
  deletable: ViewStyle;
  deletableColorPrimary: ViewStyle;
  deletableColorSecondary: ViewStyle;
  outlined: ViewStyle;
  outlinedPrimary: ViewStyle;
  outlinedSecondary: ViewStyle;
  filled: ViewStyle;
  filledPrimary: ViewStyle;
  filledSecondary: ViewStyle;
  icon: ViewStyle;
  iconSmall: ViewStyle;
  iconMedium: ViewStyle;
  iconColorPrimary: ViewStyle;
  iconColorSecondary: ViewStyle;
  label: TextStyle;
  labelSmall: TextStyle;
  labelMedium: TextStyle;
  deleteIcon: ViewStyle;
  deleteIconSmall: ViewStyle;
  deleteIconMedium: ViewStyle;
  deleteIconColorPrimary: ViewStyle;
  deleteIconColorSecondary: ViewStyle;
  deleteIconOutlinedColorPrimary: ViewStyle;
  deleteIconOutlinedColorSecondary: ViewStyle;
  deleteIconFilledColorPrimary: ViewStyle;
  deleteIconFilledColorSecondary: ViewStyle;
}

export interface AvatarTheme {
  root: ViewStyle;
  img: ImageStyle;
  fallback: ViewStyle;
  colorDefault: ViewStyle;
  colorPrimary: ViewStyle;
  colorSecondary: ViewStyle;
  colorError: ViewStyle;
  colorWarning: ViewStyle;
  colorInfo: ViewStyle;
  colorSuccess: ViewStyle;
  circular: ViewStyle;
  rounded: ViewStyle;
  square: ViewStyle;
  sizeSmall: ViewStyle;
  sizeMedium: ViewStyle;
  sizeLarge: ViewStyle;
  sizeXLarge: ViewStyle;
}

export interface BadgeTheme {
  root: ViewStyle;
  badge: ViewStyle;
  colorPrimary: ViewStyle;
  colorSecondary: ViewStyle;
  colorError: ViewStyle;
  colorWarning: ViewStyle;
  colorInfo: ViewStyle;
  colorSuccess: ViewStyle;
  colorDefault: ViewStyle;
  anchorOriginTopRight: ViewStyle;
  anchorOriginBottomRight: ViewStyle;
  anchorOriginTopLeft: ViewStyle;
  anchorOriginBottomLeft: ViewStyle;
  anchorOriginTopCenter: ViewStyle;
  anchorOriginBottomCenter: ViewStyle;
  anchorOriginCenter: ViewStyle;
  invisible: ViewStyle;
  dot: ViewStyle;
  standard: ViewStyle;
  overlapRectangular: ViewStyle;
  overlapCircular: ViewStyle;
}

export interface SwitchTheme {
  root: ViewStyle;
  switchBase?: ViewStyle;
  thumb?: ViewStyle;
  track?: ViewStyle;
  checked?: ViewStyle;
  disabled?: ViewStyle;
  colorPrimary?: ViewStyle;
  colorSecondary?: ViewStyle;
  sizeSmall?: ViewStyle;
  sizeMedium?: ViewStyle;
}

export interface CheckboxTheme {
  root: ViewStyle;
  checked?: ViewStyle;
  disabled?: ViewStyle;
  indeterminate?: ViewStyle;
  colorPrimary?: ViewStyle;
  colorSecondary?: ViewStyle;
  sizeSmall?: ViewStyle;
  sizeMedium?: ViewStyle;
}

export interface RadioTheme {
  root: ViewStyle;
  checked?: ViewStyle;
  disabled?: ViewStyle;
  colorPrimary?: ViewStyle;
  colorSecondary?: ViewStyle;
  sizeSmall?: ViewStyle;
  sizeMedium?: ViewStyle;
}

export interface SliderTheme {
  root: ViewStyle;
  colorPrimary: ViewStyle;
  colorSecondary: ViewStyle;
  marked: ViewStyle;
  vertical: ViewStyle;
  disabled: ViewStyle;
  rail: ViewStyle;
  track: ViewStyle;
  thumb: ViewStyle;
  active: ViewStyle;
  focusVisible: ViewStyle;
  valueLabel: ViewStyle;
  valueLabelOpen: ViewStyle;
  thumbColorPrimary: ViewStyle;
  thumbColorSecondary: ViewStyle;
  trackColorPrimary: ViewStyle;
  trackColorSecondary: ViewStyle;
  trackFalse: ViewStyle;
  trackTrue: ViewStyle;
  valueLabelCircle: ViewStyle;
  valueLabelLabel: TextStyle;
  mark: ViewStyle;
  markActive: ViewStyle;
  markLabel: TextStyle;
  markLabelActive: TextStyle;
}

export interface ProgressTheme {
  root: ViewStyle;
  colorPrimary: ViewStyle;
  colorSecondary: ViewStyle;
  determinate: ViewStyle;
  indeterminate: ViewStyle;
  buffer: ViewStyle;
  query: ViewStyle;
  dashed: ViewStyle;
  dashedColorPrimary: ViewStyle;
  dashedColorSecondary: ViewStyle;
  bar: ViewStyle;
  bar1Determinate: ViewStyle;
  bar1Indeterminate: ViewStyle;
  bar2Indeterminate: ViewStyle;
  bar2Buffer: ViewStyle;
  bar2Query: ViewStyle;
}

export interface SkeletonTheme {
  root: ViewStyle;
  text: ViewStyle;
  rect: ViewStyle;
  circle: ViewStyle;
  pulse: ViewStyle;
  wave: ViewStyle;
  waveAnimation: ViewStyle;
}

export interface TooltipTheme {
  root: ViewStyle;
  tooltip: ViewStyle;
  arrow: ViewStyle;
  touch: ViewStyle;
  tooltipPlacementLeft: ViewStyle;
  tooltipPlacementRight: ViewStyle;
  tooltipPlacementTop: ViewStyle;
  tooltipPlacementBottom: ViewStyle;
  tooltipPlacementLeftStart: ViewStyle;
  tooltipPlacementLeftEnd: ViewStyle;
  tooltipPlacementRightStart: ViewStyle;
  tooltipPlacementRightEnd: ViewStyle;
  tooltipPlacementTopStart: ViewStyle;
  tooltipPlacementTopEnd: ViewStyle;
  tooltipPlacementBottomStart: ViewStyle;
  tooltipPlacementBottomEnd: ViewStyle;
}

export interface SnackbarTheme {
  root: ViewStyle;
  anchorOriginTopCenter?: ViewStyle;
  anchorOriginBottomCenter?: ViewStyle;
  anchorOriginTopRight?: ViewStyle;
  anchorOriginBottomRight?: ViewStyle;
  anchorOriginTopLeft?: ViewStyle;
  anchorOriginBottomLeft?: ViewStyle;
}

export interface DialogTheme {
  root: ViewStyle;
  container?: ViewStyle;
  paper?: ViewStyle;
  paperScrollPaper?: ViewStyle;
  paperScrollBody?: ViewStyle;
  paperWidthFalse?: ViewStyle;
  paperWidthXs?: ViewStyle;
  paperWidthSm?: ViewStyle;
  paperWidthMd?: ViewStyle;
  paperWidthLg?: ViewStyle;
  paperWidthXl?: ViewStyle;
  paperFullWidth?: ViewStyle;
  paperFullScreen?: ViewStyle;
}

export interface AlertTheme {
  root: ViewStyle;
  filled: ViewStyle;
  outlined: ViewStyle;
  standard: ViewStyle;
  standardSuccess: ViewStyle;
  standardInfo: ViewStyle;
  standardWarning: ViewStyle;
  standardError: ViewStyle;
  filledSuccess: ViewStyle;
  filledInfo: ViewStyle;
  filledWarning: ViewStyle;
  filledError: ViewStyle;
  outlinedSuccess: ViewStyle;
  outlinedInfo: ViewStyle;
  outlinedWarning: ViewStyle;
  outlinedError: ViewStyle;
  action: ViewStyle;
  icon: ViewStyle;
  message: ViewStyle;
  standardSuccessIcon: ViewStyle;
  standardInfoIcon: ViewStyle;
  standardWarningIcon: ViewStyle;
  standardErrorIcon: ViewStyle;
  filledSuccessIcon: ViewStyle;
  filledInfoIcon: ViewStyle;
  filledWarningIcon: ViewStyle;
  filledErrorIcon: ViewStyle;
  outlinedSuccessIcon: ViewStyle;
  outlinedInfoIcon: ViewStyle;
  outlinedWarningIcon: ViewStyle;
  outlinedErrorIcon: ViewStyle;
}

// Transition types
export interface Transitions {
  duration: TransitionDurations;
  easing: TransitionEasings;
  create: (props: string | string[], options?: TransitionOptions) => string;
}

export interface TransitionDurations {
  shortest: number;
  shorter: number;
  short: number;
  standard: number;
  complex: number;
  enteringScreen: number;
  leavingScreen: number;
}

export interface TransitionEasings {
  easeInOut: string;
  easeOut: string;
  easeIn: string;
  sharp: string;
}

export interface TransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}

// Z-index types
export interface ZIndex {
  mobileStepper: number;
  fab: number;
  speedDial: number;
  appBar: number;
  drawer: number;
  modal: number;
  snackbar: number;
  tooltip: number;
}

// Theme creation options
export interface ThemeOptions {
  palette?: Partial<Palette>;
  text?: Partial<ThemeText>;
  spacing?: Partial<Spacing>;
  shape?: Partial<Shape>;
  breakpoints?: Partial<Breakpoints>;
  shadows?: Partial<Shadows>;
  components?: Partial<ComponentThemes>;
  transitions?: Partial<Transitions>;
  zIndex?: Partial<ZIndex>;
}

// Theme context types
export interface ThemeContextValue {
  theme: Theme;
  toggleColorMode: () => void;
  setTheme: (theme: Theme) => void;
  setThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
  currentMode?: 'light' | 'dark' | 'system';
  followSystemTheme?: boolean;
}

// Hook types
export interface UseThemeReturn {
  theme: Theme;
  toggleColorMode: () => void;
  setTheme: (theme: Theme) => void;
  setThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
  currentMode?: 'light' | 'dark' | 'system';
  followSystemTheme?: boolean;
  createStyles: <T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
    styles: T | ((theme: Theme) => T),
  ) => T;
  makeStyles: <T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
    styles: T | ((theme: Theme) => T),
  ) => () => T;
}
