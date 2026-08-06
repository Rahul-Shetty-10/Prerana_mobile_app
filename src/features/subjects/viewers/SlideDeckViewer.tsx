import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { ensurePdfJsCached, writeSlidedeckHtml, slidedeckHtmlPath } from "../utils/pdfCache";
import { ViewerToolbar } from "./ViewerToolbar";
import { ContentComingSoon } from "./ContentComingSoon";

interface SlideDeckViewerProps {
  documentTitle: string;
  pdfUrl?: string;
  authToken?: string;
  tenantSlug?: string;
}

export function SlideDeckViewer({ documentTitle, pdfUrl, authToken, tenantSlug }: SlideDeckViewerProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const webViewRef = useRef<WebView>(null);
  const [loadState, setLoadState] = useState<"loading" | "rendering" | "ready" | "error">("loading");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalPages, setTotalPages] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const pdfBase64Ref = useRef<string>("");

  // No backend URL — show Coming Soon immediately
  if (!pdfUrl) {
    return (
      <ContentComingSoon
        icon="easel-outline"
        title="Slide Deck Coming Soon"
        message="The slide deck for this chapter is being prepared. Check back soon!"
      />
    );
  }

  const handleLoadEnd = () => {
    const injectTheme = `if (typeof setTheme === 'function') { setTheme("${theme}", ${isDark}); }`;
    let injectPdf = "";
    if (pdfBase64Ref.current) {
      injectPdf = `if (typeof loadPdfFromBase64 === 'function') { loadPdfFromBase64("${pdfBase64Ref.current}"); }`;
    }
    const injectState = `if (typeof setSlide === 'function') { setSlide(${currentPage}); }`;
    webViewRef.current?.injectJavaScript(injectTheme + injectPdf + injectState);
  };

  const handleDownload = async () => {
    try {
      let localPdfUri = "";
      if (pdfUrl && pdfUrl.startsWith("http")) {
        const filename = pdfUrl.split("/").pop() || "Slidedeck.pdf";
        const tempPath = `${FileSystem.documentDirectory}${filename}`;
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, tempPath);
        localPdfUri = downloadResult.uri;
      } else {
        const asset = Asset.fromModule(require("../../../chapter/Slidedeck.pdf"));
        await asset.downloadAsync();
        localPdfUri = asset.localUri || "";
      }

      if (localPdfUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(localPdfUri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Slide Deck",
        });
      }
    } catch (_) {
      // Handle error silently
    }
  };

  const loadSlidedeck = async () => {
    try {
      setLoadState("loading");
      setLoadingProgress(0.1);

      const cached = await ensurePdfJsCached((prog) => {
        setLoadingProgress(0.1 + prog * 0.4);
      });

      if (!cached) {
        throw new Error("Failed to cache offline PDF rendering libraries.");
      }

      await writeSlidedeckHtml();
      setLoadingProgress(0.6);

      let localPdfUri = "";
      let downloadFailed = false;
      if (pdfUrl && pdfUrl.startsWith("http")) {
        try {
          const filename = pdfUrl.split("/").pop() || "Slidedeck.pdf";
          const tempPath = `${FileSystem.documentDirectory}${filename}`;
          console.log(`[SUBJECTS][SlideDeckViewer] Downloading slidedeck from backend: ${pdfUrl}`);
          const downloadResult = await FileSystem.downloadAsync(pdfUrl, tempPath);
          if (downloadResult.status !== 200 && downloadResult.status !== 201) {
            throw new Error(`HTTP status ${downloadResult.status}`);
          }
          localPdfUri = downloadResult.uri;
        } catch (err) {
          console.warn("[SUBJECTS][SlideDeckViewer] Remote download failed, falling back to local slidedeck asset:", err);
          downloadFailed = true;
        }
      }

      if (!pdfUrl || !pdfUrl.startsWith("http") || downloadFailed) {
        const asset = Asset.fromModule(require("../../../chapter/Slidedeck.pdf"));
        await asset.downloadAsync();
        localPdfUri = asset.localUri || "";
      }

      if (!localPdfUri) {
        throw new Error("Unable to resolve local Slidedeck PDF URI.");
      }

      const base64 = await FileSystem.readAsStringAsync(localPdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      pdfBase64Ref.current = base64;

      setLoadingProgress(1.0);
      setLoadState("rendering");

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setLoadState("error");
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      setLoadState("ready");
      return;
    }
    loadSlidedeck();
  }, [pdfUrl]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "PDF_LOADED") {
        setTotalPages(data.totalPages);
        setLoadState("ready");
      } else if (data.type === "SLIDE_CHANGE") {
        setCurrentPage(data.current);
      } else if (data.type === "ERROR") {
        setErrorMessage(data.message);
        setLoadState("error");
      }
    } catch (e) {
      // Ignored
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    webViewRef.current?.injectJavaScript("if (typeof nextSlide === 'function') { nextSlide(); }");
  };

  const handlePrev = () => {
    webViewRef.current?.injectJavaScript("if (typeof prevSlide === 'function') { prevSlide(); }");
  };

  // ── Toolbar handlers ──────────────────────────────────────────────────────

  const handleZoomIn = () => setZoomScale((p) => Math.min(p + 0.25, 4));
  const handleZoomOut = () => setZoomScale((p) => Math.max(p - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoomScale(1);
    setRotation(0);
  };
  const handleFitWidth = () => setZoomScale(1.0);
  const handleFitScreen = () => setZoomScale(0.8);

  // ── Renderers ─────────────────────────────────────────────────────────────

  const renderLoader = () => {
    if (loadState === "ready" || loadState === "error") return null;

    const labelText = loadState === "loading"
      ? `Buffering Slide Deck... ${Math.round(loadingProgress * 100)}%`
      : "Preparing presentation slides...";

    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={colors.primary.main} size="large" />
        <Text style={styles.statusTitle}>{labelText}</Text>
        <Text style={styles.statusSubtitle}>Generating page-by-page interactive view</Text>
      </View>
    );
  };

  const renderError = () => {
    if (loadState !== "error") return null;
    return (
      <View style={styles.centerBox}>
        <AppIcon color={colors.status.error} name="alert-circle-outline" size={44} />
        <Text style={styles.statusTitle}>Unable to Open Presentation</Text>
        <Text style={styles.statusSubtitle}>{errorMessage || "An unexpected error occurred."}</Text>
        <Pressable
          onPress={loadSlidedeck}
          style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
        >
          <AppIcon color={colors.primary.contrastText} name="refresh-outline" size={16} />
          <Text style={styles.retryBtnText}>Retry Loading</Text>
        </Pressable>
      </View>
    );
  };

  const renderDeckContent = (inFullscreen = false) => {
    if (Platform.OS === "web") {
      const srcUri = pdfUrl || Asset.fromModule(require("../../../chapter/Slidedeck.pdf")).uri;
      return (
        <View style={inFullscreen ? styles.fullscreenPdfContainer : styles.pdfContainer}>
          <iframe
            src={srcUri}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={documentTitle}
          />
        </View>
      );
    }

    return (
      <View style={inFullscreen ? styles.fullscreenPdfContainer : styles.pdfContainer}>
        {renderLoader()}
        {renderError()}

        {(loadState === "ready" || loadState === "rendering") && (
          <View style={{ flex: 1, transform: [{ scale: zoomScale }, { rotate: `${rotation}deg` }] }}>
            <WebView
              allowFileAccess
              allowUniversalAccessFromFileURLs
              mixedContentMode="always"
              onMessage={handleMessage}
              originWhitelist={["*"]}
              ref={webViewRef}
              scalesPageToFit={true}
              source={{ uri: slidedeckHtmlPath }}
              style={[styles.webView, loadState === "rendering" && { opacity: 0 }]}
              onLoadEnd={handleLoadEnd}
            />
          </View>
        )}
      </View>
    );
  };

  // ── Slide navigation bar ──────────────────────────────────────────────────

  const renderSlideNav = () => {
    if (loadState !== "ready" || Platform.OS === "web") return null;

    return (
      <View style={styles.pageNavRow}>
        <Pressable
          disabled={currentPage === 1}
          onPress={handlePrev}
          style={({ pressed }) => [
            styles.navBtn,
            currentPage === 1 && styles.navBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          <AppIcon color={currentPage === 1 ? themeColors.textMuted : themeColors.textPrimary} name="arrow-back-outline" size={16} />
          <Text style={[styles.navBtnText, currentPage === 1 && { color: themeColors.textMuted }]}>Prev</Text>
        </Pressable>

        <Text style={styles.slideCounter}>
          {currentPage} / {totalPages}
        </Text>

        <Pressable
          disabled={currentPage === totalPages}
          onPress={handleNext}
          style={({ pressed }) => [
            styles.navBtn,
            currentPage === totalPages && styles.navBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.navBtnText, currentPage === totalPages && { color: themeColors.textMuted }]}>Next</Text>
          <AppIcon color={currentPage === totalPages ? themeColors.textMuted : themeColors.textPrimary} name="arrow-forward-outline" size={16} />
        </Pressable>
      </View>
    );
  };

  // ── Return ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.card}>
      {/* Shared ViewerToolbar */}
      <ViewerToolbar
        isFullscreen={false}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onToggleFullscreen={() => setIsFullscreen(true)}
        onDownload={handleDownload}
      />

      {/* Presentation View Area - Render only if NOT in fullscreen */}
      {!isFullscreen ? renderDeckContent(false) : <View style={styles.pdfContainer} />}

      {/* Slide Navigation */}
      {renderSlideNav()}

      {/* Fullscreen Presentation Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
        visible={isFullscreen}
      >
        <SafeAreaView edges={["top", "bottom"]} style={styles.fullscreenContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsFullscreen(false)}
              style={styles.modalCloseBtn}
            >
              <AppIcon color="#FFFFFF" name="close-outline" size={22} />
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.modalTitle}>
              {documentTitle}
            </Text>
          </View>

          {/* Modal Toolbar */}
          <ViewerToolbar
            isFullscreen={true}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotate={handleRotate}
            onToggleFullscreen={() => setIsFullscreen(false)}
            onDownload={handleDownload}
          />

          {/* Fullscreen view area - Render only in fullscreen */}
          <View style={styles.fullscreenBody}>
            {isFullscreen ? renderDeckContent(true) : null}
          </View>

          {/* Fullscreen Bottom Navigation */}
          <View style={styles.fullscreenNavRow}>
            <Pressable
              disabled={currentPage === 1}
              onPress={handlePrev}
              style={[styles.modalNavBtn, currentPage === 1 && styles.modalNavBtnDisabled]}
            >
              <AppIcon color="#FFFFFF" name="arrow-back-outline" size={18} />
              <Text style={styles.modalNavBtnText}>Previous</Text>
            </Pressable>

            <Text style={styles.modalCounter}>
              {currentPage} / {totalPages}
            </Text>

            <Pressable
              disabled={currentPage === totalPages}
              onPress={handleNext}
              style={[styles.modalNavBtn, currentPage === totalPages && styles.modalNavBtnDisabled]}
            >
              <Text style={styles.modalNavBtnText}>Next</Text>
              <AppIcon color="#FFFFFF" name="arrow-forward-outline" size={18} />
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: themeColors.border,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      ...shadows.sm,
      overflow: "hidden",
    },
    pdfContainer: {
      height: 320,
      backgroundColor: themeColors.surfaceSecondary,
      position: "relative",
      overflow: "hidden",
    },
    fullscreenPdfContainer: {
      flex: 1,
      backgroundColor: "#1a1514",
      overflow: "hidden",
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    centerBox: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: themeColors.surfaceSecondary,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    statusTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    statusSubtitle: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textMuted,
      textAlign: "center",
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.primary.main,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.button,
      marginTop: spacing.sm,
    },
    retryBtnText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary.contrastText,
    },
    pressed: {
      opacity: 0.85,
    },
    // Slide Navigation
    pageNavRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.sm + 2,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      backgroundColor: themeColors.surface,
    },
    navBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      borderRadius: radius.button,
      borderWidth: 1,
      borderColor: themeColors.border,
      backgroundColor: themeColors.surfaceSecondary,
    },
    navBtnDisabled: {
      opacity: 0.5,
      backgroundColor: themeColors.surface,
    },
    navBtnText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textPrimary,
    },
    slideCounter: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textMuted,
    },
    // Fullscreen Mode
    fullscreenContainer: {
      flex: 1,
      backgroundColor: "#0A0A0A",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.heavy,
      color: "#FFFFFF",
      flex: 1,
    },
    modalCounter: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: "rgba(255,255,255,0.7)",
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.sm,
    },
    fullscreenBody: {
      flex: 1,
      position: "relative",
    },
    fullscreenNavRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.1)",
      backgroundColor: "#0A0A0A",
    },
    modalNavBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: radius.button,
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    modalNavBtnDisabled: {
      opacity: 0.3,
    },
    modalNavBtnText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: "#FFFFFF",
    },
  });