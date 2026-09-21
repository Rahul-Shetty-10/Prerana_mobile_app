import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { getMobileSession, invalidateMobileSession } from "../../../shared/session/sessionStore";
import { getResourceRequestHeaders, shouldInvalidateResourceResponse } from "../../../shared/session/resourceAuth";
import { VideoViewerProps } from "../types";
import { ContentComingSoon } from "./ContentComingSoon";
import { AppIcon } from "../../../shared/icons";
import { escapeHtmlUrl } from "./videoUtils.ts";

export function VideoViewer({ title, videoTitle, videoUrl, description, authToken, onResourceDisplayed }: VideoViewerProps) {
  const displayTitle = title || videoTitle || "Video Explanation";
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  React.useEffect(() => {
    if (videoUrl && !isLoading && !hasError) {
      onResourceDisplayed?.();
    }
  }, [videoUrl, isLoading, hasError, onResourceDisplayed]);

  const requestHeaders = useMemo(
    () => (videoUrl ? getResourceRequestHeaders(videoUrl, authToken) : undefined),
    [videoUrl, authToken],
  );

  const safeUrl = useMemo(() => (videoUrl ? escapeHtmlUrl(videoUrl) : ""), [videoUrl]);

  if (!videoUrl) {
    return (
      <ContentComingSoon
        icon="videocam-outline"
        title="Yet to be updated"
        message="This video resource has not been uploaded yet."
      />
    );
  }

  if (authToken && !getMobileSession()) {
    return (
      <ContentComingSoon
        icon="videocam-outline"
        title="Session expired"
        message="Please sign in again to view this resource."
      />
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <AppIcon color={colors.status.error} name="alert-circle-outline" size={32} />
        <Text style={styles.errorTitle}>Video Load Failure</Text>
        <Text style={styles.errorMessage}>
          The video could not be loaded. Please check your connection and try again.
        </Text>
        <Pressable
          accessibilityLabel="Retry loading video"
          accessibilityRole="button"
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
            setReloadKey((prev) => prev + 1);
          }}
          style={styles.retryButton}
        >
          <AppIcon color="#FFFFFF" name="refresh-outline" size={16} />
          <Text style={styles.retryButtonText}>Retry Video</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>
        {description ? <Text style={styles.description} numberOfLines={2}>{description}</Text> : null}
      </View>

      <View style={styles.player}>
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        ) : null}
        <WebView
          key={reloadKey}
          source={requestHeaders ? { uri: videoUrl, headers: requestHeaders } : { uri: videoUrl }}
          originWhitelist={["http://*", "https://*"]}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onHttpError={(event) => {
            const status = event.nativeEvent.statusCode;
            if (shouldInvalidateResourceResponse(videoUrl, status)) void invalidateMobileSession();
            setIsLoading(false);
            setHasError(true);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          style={styles.webview}
        />
      </View>
    </View>
  );
}

const getStyles = (themeColors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold as any,
      color: themeColors.textPrimary,
    },
    description: { fontSize: typography.fontSize.xs, color: themeColors.textMuted, marginTop: 2 },
    player: {
      width: "100%",
      height: 250,
      backgroundColor: "#000000",
      borderRadius: radius.md,
      overflow: "hidden",
      position: "relative",
    },
    webview: { width: "100%", height: 250, backgroundColor: "#000000" },
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: themeColors.surface,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    loadingText: { marginTop: spacing.sm, fontSize: typography.fontSize.xs, color: themeColors.textMuted },
    errorContainer: {
      minHeight: 220,
      padding: spacing.md,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: themeColors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: themeColors.border,
      gap: spacing.xs,
    },
    errorTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold as any,
      color: themeColors.textPrimary,
    },
    errorMessage: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textMuted,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary.main,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.md,
      gap: spacing.xs,
      minHeight: 44,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold as any,
    },
  });
