import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { SavedOutputsCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { Badge } from "../../../shared/components";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function SavedOutputsCard({
  title,
  description,
  badgeText,
  placeholderText,
  savedItems = [],
  onItemPress,
}: SavedOutputsCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const hasItems = savedItems && savedItems.length > 0;

  return (
    <View style={styles.cardContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {badgeText ? <Badge label={badgeText} variant="dark" /> : null}
      </View>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Content Area: Empty State or Items List */}
      {!hasItems ? (
        <View style={styles.emptyStateBox}>
          <View style={styles.iconShell}>
            <AppIcon color={themeColors.textMuted} name="bookmark-outline" size={28} />
          </View>
          <Text style={styles.placeholderText}>{placeholderText}</Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {savedItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemIconShell}>
                <AppIcon color={colors.primary.main} name="document-text-outline" size={20} />
              </View>
              <View style={styles.itemMeta}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.subject} • {item.chapter}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textSecondary,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  emptyStateBox: {
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderStyle: "dashed",
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceHighlighted,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
    textAlign: "center",
    lineHeight: typography.lineHeight.sm + 2,
    maxWidth: 280,
  },
  itemsList: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    gap: spacing.sm,
  },
  itemIconShell: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surfaceHighlighted,
    alignItems: "center",
    justifyContent: "center",
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
    marginTop: 2,
  },
});