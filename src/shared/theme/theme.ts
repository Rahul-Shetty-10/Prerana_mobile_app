/**
 * SmartGuru Design Tokens for Prerana Mobile App
 * Pure design tokens object containing colors, typography, spacing, radius, and shadows.
 * No ThemeProvider or ThemeContext is used per project requirements.
 */

export const colors = {
  // Brand colors
  primary: {
    main: "#E86A50",
    light: "#F5A08D",
    dark: "#C84E35",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#F5B800",
    light: "#FFCE3B",
    dark: "#D49E00",
    contrastText: "#1E1210",
  },

  // Light theme colors (Redesigned per mock class specs)
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceSecondary: "#F1F5F9",
    surfaceHighlighted: "#FFF4EE",
    border: "#E5E7EB",
    borderSubtle: "#F3F4F6",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    textInverse: "#FFFFFF",
    badgeBackground: "#FFF4EE",
    badgeText: "#E86A50",
    inputBackground: "#FFFFFF",
    inputBorder: "#E5E7EB",
  },

  // Dark theme colors
  dark: {
    background: "#181110",
    surface: "#221817",
    surfaceSecondary: "#2F2220",
    surfaceHighlighted: "#3A2927",
    border: "#3D2B28",
    borderSubtle: "#2A1E1C",
    textPrimary: "#FFF7F3",
    textSecondary: "#D7C6C0",
    textMuted: "#8B7772",
    textInverse: "#181110",
    badgeBackground: "#382320",
    badgeText: "#F5A08D",
    inputBackground: "#221817",
    inputBorder: "#4C3934",
  },

  // Accent variants for cards & indicators
  accents: {
    coral: {
      bg: "#FDF0EB",
      darkBg: "#382320",
      border: "#F9D5CB",
      darkBorder: "#5A342E",
      text: "#E86A50",
      darkText: "#F5A08D",
    },
    amber: {
      bg: "#FFFBEB",
      darkBg: "#332B15",
      border: "#FDE68A",
      darkBorder: "#54461E",
      text: "#D97706",
      darkText: "#FBBF24",
    },
    blue: {
      bg: "#EFF6FF",
      darkBg: "#172554",
      border: "#BFDBFE",
      darkBorder: "#1E3A8A",
      text: "#2563EB",
      darkText: "#60A5FA",
    },
    emerald: {
      bg: "#ECFDF5",
      darkBg: "#064E3B",
      border: "#A7F3D0",
      darkBorder: "#065F46",
      text: "#059669",
      darkText: "#34D399",
    },
    purple: {
      bg: "#F5F3FF",
      darkBg: "#2E1065",
      border: "#DDD6FE",
      darkBorder: "#4C1D95",
      text: "#7C3AED",
      darkText: "#A78BFA",
    },
  },

  // Status colors
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
};

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
    heavy: "System",
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
    xxl: 36,
    display: 42,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },
};

export const spacing = {
  xxs: 2,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 20,
  xxl: 24,
  card: 20,
  button: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

import AsyncStorage from "@react-native-async-storage/async-storage";

export const THEME_MODE_STORAGE_KEY = "@prerana_theme_mode";

export type ThemeMode = "dark" | "light";

export async function getSavedThemeMode(): Promise<ThemeMode> {
  try {
    const saved = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch (e) {
    // Default to dark
  }
  return "dark";
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch (e) {
    // Ignore error
  }
}

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
};

