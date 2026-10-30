/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState} from 'react';

import { createTheme } from './CreateTheme';
import type {
  Theme,
  ThemeContextValue,
  ThemeOptions,
  UseThemeReturn
} from './types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
  defaultTheme?: ThemeOptions;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme: providedTheme,
  defaultTheme
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (providedTheme) {
      return providedTheme;
    }
    return createTheme(defaultTheme);
  });
  useEffect(() => {
    if (providedTheme) {
      setThemeState(providedTheme);
    }
  }, [providedTheme]);

  const toggleColorMode = useCallback(() => {
    setThemeState(prevTheme => {
      const newMode = prevTheme.palette.mode === 'light' ? 'dark' : 'light';
      return createTheme({
        ...defaultTheme,
        palette: {
          ...defaultTheme?.palette,
          mode: newMode
        }
      });
    });
  }, [defaultTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const contextValue: ThemeContextValue = {
    theme,
    toggleColorMode,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme, toggleColorMode, setTheme } = context;

  const createStyles = useCallback(
    <T extends Record<string, any>>(styles: T | ((t: Theme) => T)): T => {
      if (typeof styles === 'function') {
        return styles(theme);
      }
      return styles;
    },
    [theme]
  );

  const makeStyles = useCallback(
    <T extends Record<string, any>>(styles: T | ((t: Theme) => T)) => {
      return () => createStyles(styles);
    },
    [createStyles]
  );

  return {
    theme,
    toggleColorMode,
    setTheme,
    createStyles,
    makeStyles
  };
};

// Hook for accessing theme without context (useful for utilities)
export const useThemeValue = (): Theme => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeValue must be used within a ThemeProvider');
  }

  return context.theme;
};

// Higher-order component for theme access
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  const WithThemeComponent = (props: P) => {
    const theme = useThemeValue();
    return <Component {...props} theme={theme} />;
  };

  WithThemeComponent.displayName = `withTheme(${
    Component.displayName || Component.name
  })`;

  return WithThemeComponent;
};
