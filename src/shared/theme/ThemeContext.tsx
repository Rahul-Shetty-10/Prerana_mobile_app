import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSavedThemeMode, saveThemeMode, ThemeMode } from "./theme";

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
  isToggling: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isReady, setIsReady] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const saved = await getSavedThemeMode();
        setTheme(saved);
      } catch (e) {
        // Fallback
      } finally {
        setIsReady(true);
      }
    }
    loadSavedTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsToggling(true);
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      // Fire-and-forget: save to storage without blocking the UI
      void saveThemeMode(next);
      return next;
    });
    // Clear the toggling flag after the next frame renders
    requestAnimationFrame(() => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => {
          setIsToggling(false);
        });
      } else {
        setTimeout(() => {
          setIsToggling(false);
        }, 0);
      }
    });
  }, []);

  if (!isReady) {
    return null; // Prevents flash of unstyled content
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark", isToggling }}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}