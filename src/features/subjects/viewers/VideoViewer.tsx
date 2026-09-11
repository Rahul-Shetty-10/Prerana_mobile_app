import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { VideoViewerProps } from "../types";
import { ContentComingSoon } from "./ContentComingSoon";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { appConfig } from "../../../config";

import { ErrorMessageView } from "../../../shared/components/ErrorMessageView";

export function VideoViewer({
  title,
  videoTitle,
  videoUrl,
  description,
}: VideoViewerProps) {
  const displayTitle = title || videoTitle || "Video Explanation";
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <ContentComingSoon
        icon="videocam-outline"
        title="Yet to be updated"
        message="This video resource is currently unavailable."
      />
    );
  }

  if (hasError) {
    return (
      <ErrorMessageView
        icon="videocam-outline"
        message="The video could not be loaded. Please check your network connection and try again."
        onRetry={() => {
          setHasError(false);
          setIsLoading(true);
        }}
      />
    );
  }

  const isDirectVideo =
    /\.(mp4|webm|m3u8|mov|avi|mkv)(\?.*)?$/i.test(videoUrl) ||
    videoUrl.includes("/uploads/") ||
    videoUrl.includes("s3.") ||
    videoUrl.includes("resource-asset");

  const videoHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html { width: 100%; height: 100%; background-color: #000000; display: flex; justify-content: center; align-items: center; overflow: hidden; }
          video { width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        ${
          isDirectVideo
            ? `<video src="${videoUrl}" controls playsinline autoplay controlsList="nodownload"></video>`
            : `<iframe src="${videoUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
        }
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>
        {Boolean(description) && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      <View style={styles.playerContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        <WebView
          source={isDirectVideo ? { html: videoHtml, baseUrl: appConfig.apiBaseUrl.replace("/api/mobile/v1", "") } : { uri: videoUrl }}
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
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
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
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
    description: {
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
      marginTop: 2,
    },
    playerContainer: {
      width: "100%",
      height: 250,
      backgroundColor: "#000000",
      position: "relative",
      borderRadius: radius.md,
      overflow: "hidden",
    },
    webview: {
      width: "100%",
      height: 250,
      backgroundColor: "#000000",
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: themeColors.surface,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: typography.fontSize.xs,
      color: themeColors.textMuted,
    },
  });
