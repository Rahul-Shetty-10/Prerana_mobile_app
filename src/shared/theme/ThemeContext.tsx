import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSavedThemeMode, saveThemeMode, ThemeMode } from "./theme";

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // 250ms smooth transition animation
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 100,
      useNativeDriver: true,
    }).start(async () => {
      setTheme(nextTheme);
      await saveThemeMode(nextTheme);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  if (!isReady) {
    return null; // Prevents flash of unstyled content
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {children}
      </Animated.View>
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