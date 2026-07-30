import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { BreadcrumbProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, typography } from "../../../shared/theme";

export function Breadcrumb({
  items,
}: BreadcrumbProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={`bc-${idx}`}>
            {idx > 0 ? (
              <AppIcon color={themeColors.textMuted} name="chevron-forward-outline" size={12} />
            ) : null}

            <Text style={[styles.crumbText, isLast && styles.lastCrumbText]} numberOfLines={1}>
              {item}
            </Text>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  crumbText: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },
  lastCrumbText: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.bold,
  },
});