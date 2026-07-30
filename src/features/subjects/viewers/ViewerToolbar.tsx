import React from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing } from "../../../shared/theme";

export interface ViewerToolbarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onToggleFullscreen?: () => void;
  onDownload?: () => void;
  isFullscreen?: boolean;
  isDownloading?: boolean;
}

export function ViewerToolbar({
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleFullscreen,
  onDownload,
  isFullscreen = false,
  isDownloading = false,
}: ViewerToolbarProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  return (
    <View style={styles.container}>
      <View style={styles.buttonGroup}>
        {onZoomOut && (
          <Pressable
            accessibilityLabel="Zoom Out"
            onPress={onZoomOut}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="remove-outline" size={18} />
          </Pressable>
        )}

        {onZoomIn && (
          <Pressable
            accessibilityLabel="Zoom In"
            onPress={onZoomIn}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="add-outline" size={18} />
          </Pressable>
        )}

        {onRotate && (
          <Pressable
            accessibilityLabel="Rotate Clockwise"
            onPress={onRotate}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="refresh-outline" size={18} />
          </Pressable>
        )}

        {onToggleFullscreen && (
          <Pressable
            accessibilityLabel="Toggle Fullscreen"
            onPress={onToggleFullscreen}
            style={({ pressed }) => [styles.btn, styles.accentBtn, pressed && styles.pressed]}
          >
            <AppIcon
              color={colors.primary.main}
              name={isFullscreen ? "contract-outline" : "expand-outline"}
              size={18}
            />
          </Pressable>
        )}

        {onDownload && (
          <Pressable
            accessibilityLabel="Download"
            disabled={isDownloading}
            onPress={onDownload}
            style={({ pressed }) => [
              styles.btn,
              isDownloading && { opacity: 0.5 },
              pressed && !isDownloading && styles.pressed,
            ]}
          >
            {isDownloading ? (
              <ActivityIndicator color={themeColors.textPrimary} size="small" />
            ) : (
              <AppIcon color={themeColors.textPrimary} name="download-outline" size={18} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSubtle,
      gap: spacing.xs,
    },
    buttonGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    btn: {
      width: 34,
      height: 34,
      borderRadius: radius.sm,
      backgroundColor: themeColors.surfaceSecondary,
      borderWidth: 1,
      borderColor: themeColors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    accentBtn: {
      borderColor: colors.primary.main,
      backgroundColor: colors.primary.main + "10",
    },
    pressed: {
      opacity: 0.7,
      transform: [{ scale: 0.96 }],
    },
  });
