import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { getMobileSession, invalidateMobileSession } from "../../../shared/session/sessionStore";
import { getResourceRequestHeaders, shouldInvalidateResourceResponse } from "../../../shared/session/resourceAuth";
import { VideoViewerProps } from "../types";
import { ContentComingSoon } from "./ContentComingSoon";

export function VideoViewer({ videoTitle, videoUrl, description, authToken }: VideoViewerProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const requestHeaders = useMemo(
    () => (videoUrl ? getResourceRequestHeaders(videoUrl, authToken) : undefined),
    [videoUrl, authToken],
  );

  if (!videoUrl || hasError) {
    return (
      <ContentComingSoon
        icon="videocam-outline"
        title={hasError ? "Unable to load video" : "Yet to be updated"}
        message={hasError ? "The video could not be loaded. Check your connection and try again." : "This resource has not been uploaded yet."}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {videoTitle || "Video Explanation"}
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
          source={requestHeaders ? { uri: videoUrl, headers: requestHeaders } : { uri: videoUrl }}
          originWhitelist={["http://*", "https://*"]}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction
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

const getStyles = (themeColors: any) => StyleSheet.create({
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
});
