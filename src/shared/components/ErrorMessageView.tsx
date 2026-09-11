import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { colors, radius, spacing, typography } from "../theme";
import { AppIcon } from "../icons";

export interface ErrorMessageViewProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  compact?: boolean;
  icon?: string;
}

export function ErrorMessageView({
  message,
  onRetry,
  isRetrying = false,
  compact = false,
  icon = "alert-circle-outline",
}: ErrorMessageViewProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];

  if (compact) {
    return (
      <View
        style={[
          styles.compactBanner,
          {
            backgroundColor: isDark ? "#3B1818" : "#FFF0F0",
            borderColor: isDark ? "#7A2E2E" : "#FFCDD2",
          },
        ]}
      >
        <Text style={styles.compactText}>{message}</Text>
        {onRetry ? (
          <Pressable
            accessibilityLabel="Retry loading"
            accessibilityRole="button"
            disabled={isRetrying}
            onPress={onRetry}
            style={({ pressed }) => [styles.compactRetryBtn, pressed && { opacity: 0.8 }]}
          >
            {isRetrying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <AppIcon color="#FFFFFF" name="refresh-outline" size={14} />
                <Text style={styles.compactRetryText}>Retry</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.fullContainer, { backgroundColor: themeColors.surfaceSecondary }]}>
      <AppIcon color={colors.status.error} name={icon as any} size={36} />
      <Text style={[styles.fullTitle, { color: themeColors.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.fullMessage, { color: themeColors.textMuted }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityLabel="Retry operation"
          accessibilityRole="button"
          disabled={isRetrying}
          onPress={onRetry}
          style={({ pressed }) => [styles.fullRetryBtn, pressed && { opacity: 0.85 }]}
        >
          {isRetrying ? (
            <ActivityIndicator color={colors.primary.contrastText} size="small" />
          ) : (
            <>
              <AppIcon color={colors.primary.contrastText} name="refresh-outline" size={16} />
              <Text style={styles.fullRetryText}>Retry</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  compactBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  compactText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.status.error,
    flex: 1,
  },
  compactRetryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary.main,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.button,
  },
  compactRetryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  fullContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    gap: spacing.xs,
  },
  fullTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    marginTop: spacing.xs,
  },
  fullMessage: {
    fontSize: typography.fontSize.xs + 1,
    textAlign: "center",
    lineHeight: typography.lineHeight.sm,
  },
  fullRetryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    marginTop: spacing.sm,
  },
  fullRetryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.contrastText,
  },
});
