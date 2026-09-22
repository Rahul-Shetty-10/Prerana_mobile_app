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

export function VideoViewer({ title, videoTitle, videoUrl, description, authToken, onResourceDisplayed }: VideoViewerProps) {
  const displayTitle = title || videoTitle || "Video Explanation";
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const displayedRef = React.useRef<boolean>(false);

  const injectedJS = `
    (function() {
      function notifyReady() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MEDIA_READY' }));
        }
      }
      function notifyError(err) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MEDIA_ERROR', error: String(err || '') }));
        }
      }
      function attach(v) {
        if (v.readyState >= 3) {
          notifyReady();
        } else {
          v.addEventListener('canplay', notifyReady, { once: true });
          v.addEventListener('loadeddata', notifyReady, { once: true });
          v.addEventListener('playing', notifyReady, { once: true });
        }
        v.addEventListener('error', function(e) { notifyError(e); });
      }
      // A document that loads but never produces a playable element is not a
      // watched video - an HTML error page served with status 200 must not
      // count as progress. Poll briefly, because the element is often created
      // by the player script after load.
      var attempts = 0;
      function checkMedia() {
        var v = document.querySelector('video');
        if (v) { attach(v); return; }
        attempts++;
        if (attempts > 40) {
          // Cross-origin embed players expose no inspectable video element;
          // treat a rendered iframe as playable rather than failing it.
          if (document.querySelector('iframe')) { notifyReady(); }
          else { notifyError('no playable media found'); }
          return;
        }
        setTimeout(checkMedia, 250);
      }
      if (document.readyState === 'complete') {
        checkMedia();
      } else {
        window.addEventListener('load', checkMedia);
      }
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MEDIA_READY") {
        setIsLoading(false);
        if (!displayedRef.current) {
          displayedRef.current = true;
          onResourceDisplayed?.();
        }
      } else if (data.type === "MEDIA_ERROR") {
        setIsLoading(false);
        setHasError(true);
      }
    } catch (e) {
      // Ignored
    }
  };

  const requestHeaders = useMemo(
    () => (videoUrl ? getResourceRequestHeaders(videoUrl, authToken) : undefined),
    [videoUrl, authToken],
  );

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
            displayedRef.current = false;
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
          injectedJavaScript={injectedJS}
          onMessage={handleMessage}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            // Document load finished; actual media readiness is handled via onMessage
          }}
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
