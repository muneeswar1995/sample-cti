
export type VariantType = "default" | "error" | "success" | "warning" | "info";

export type AuthContextValue = {
  isAuthenticated: boolean;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
};

export interface ThemeContextType {
  changeTheme: () => void;
  isDarkMode: boolean;
}
