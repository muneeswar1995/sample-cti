import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { ThemeProvider as AppThemeProvider } from "@/lib/appTheme/ThemeProvider";
import { getTheme } from "@/services/Theme";
import type { TPaletteMode } from "@/services/types";
import { getItem, setItem } from "@/utils/storage";

import { ThemeContext } from "./Context";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<TPaletteMode>(systemColorScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    const fetchTheme = async () => {
      const savedMode = await getItem("themeMode");
      if (savedMode === "light" || savedMode === "dark") {
        setMode(savedMode);
      } else if (systemColorScheme === "light" || systemColorScheme === "dark") {
        setMode(systemColorScheme);
      }
    };
    fetchTheme();
  }, [systemColorScheme]);

  const changeTheme = (themeMode?: TPaletteMode) => {
    setMode((prev: TPaletteMode) => {
      const nextMode = themeMode ? themeMode : prev === "light" ? "dark" : "light";
      setItem("themeMode", nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      changeTheme,
      isDarkMode: mode === "dark"
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <AppThemeProvider theme={theme}>
        {children}
      </AppThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
