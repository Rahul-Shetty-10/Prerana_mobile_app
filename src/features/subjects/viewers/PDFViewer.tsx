import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  ActivityIndicator,
  Dimensions,
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
import { ensurePdfJsCached, writeTextbookHtml, textbookHtmlPath } from "../utils/pdfCache";
import { ViewerToolbar } from "./ViewerToolbar";
import { ContentComingSoon } from "./ContentComingSoon";
import { ZoomPanView } from "./ZoomPanView";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

interface PDFViewerProps {
  documentTitle: string;
  pdfUrl?: string;
  authToken?: string;
  tenantSlug?: string;
}

export function PDFViewer({ documentTitle, pdfUrl, authToken, tenantSlug }: PDFViewerProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const webViewRef = useRef<WebView>(null);
  const [loadState, setLoadState] = useState<"loading" | "rendering" | "ready" | "error">("loading");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pdfBase64Ref = useRef<string>("");
  const targetPageRef = useRef<number | null>(null);
  const targetPageTimeoutRef = useRef<any>(null);



  useEffect(() => {
    return () => {
      if (targetPageTimeoutRef.current) {
        clearTimeout(targetPageTimeoutRef.current);
      }
    };
  }, []);

  const handleLoadEnd = () => {
    const injectTheme = `if (typeof setTheme === 'function') { setTheme("${theme}", ${isDark}); }`;
    let injectPdf = "";
    if (pdfBase64Ref.current) {
      injectPdf = `if (typeof loadPdfFromBase64 === 'function') { loadPdfFromBase64("${pdfBase64Ref.current}"); }`;
    }
    const injectState = `if (typeof goToPage === 'function') { goToPage(${currentPage}); }`;
    webViewRef.current?.injectJavaScript(injectTheme + injectPdf + injectState);
  };

  const loadTextbook = async () => {
    try {
      setLoadState("loading");
      setLoadingProgress(0.1);

      const cached = await ensurePdfJsCached((prog) => {
        setLoadingProgress(0.1 + prog * 0.4);
      });

      if (!cached) {
        throw new Error("Failed to cache offline PDF rendering libraries.");
      }

      await writeTextbookHtml();
      setLoadingProgress(0.6);

      let localPdfUri = "";
      if (pdfUrl && pdfUrl.startsWith("http")) {
        const filename = pdfUrl.split("/").pop() || "Textbook.pdf";
        const tempPath = `${FileSystem.documentDirectory}${filename}`;
        console.log(`[SUBJECTS][PDFViewer] Downloading textbook notes from backend: ${pdfUrl}`);
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, tempPath);
        if (downloadResult.status !== 200 && downloadResult.status !== 201) {
          throw new Error(`HTTP status ${downloadResult.status}`);
        }
        localPdfUri = downloadResult.uri;
      } else {
        throw new Error("Textbook URL is not available.");
      }

      if (!localPdfUri) {
        throw new Error("Unable to resolve Textbook PDF URI.");
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
    loadTextbook();
  }, [pdfUrl]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "PDF_LOADED") {
        setTotalPages(data.totalPages);
        setLoadState("ready");
        setTimeout(() => {
          const inject = `if (typeof goToPage === 'function') { goToPage(${currentPage}); }`;
          webViewRef.current?.injectJavaScript(inject);
        }, 100);
      } else if (data.type === "PAGE_VISIBLE") {
        if (targetPageRef.current !== null) {
          if (data.page === targetPageRef.current) {
            targetPageRef.current = null;
            if (targetPageTimeoutRef.current) {
              clearTimeout(targetPageTimeoutRef.current);
            }
          } else {
            return;
          }
        }
        setCurrentPage(data.page);
      } else if (data.type === "ERROR") {
        setErrorMessage(data.message);
        setLoadState("error");
      }
    } catch (e) {
      // Ignored
    }
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
  const handleDownload = async () => {
    try {
      let localPdfUri = "";
      if (pdfUrl && pdfUrl.startsWith("http")) {
        const filename = pdfUrl.split("/").pop() || "Textbook.pdf";
        const tempPath = `${FileSystem.documentDirectory}${filename}`;
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, tempPath);
        localPdfUri = downloadResult.uri;
      } else {
        const asset = Asset.fromModule(require("../../../chapter/Textbook.pdf"));
        await asset.downloadAsync();
        localPdfUri = asset.localUri || "";
      }

      if (localPdfUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(localPdfUri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Textbook",
        });
      }
    } catch (_) {
      // Share unavailable on this platform
    }
  };

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    targetPageRef.current = clamped;

    if (targetPageTimeoutRef.current) {
      clearTimeout(targetPageTimeoutRef.current);
    }

    targetPageTimeoutRef.current = setTimeout(() => {
      targetPageRef.current = null;
    }, 800);

    webViewRef.current?.injectJavaScript(
      `if (typeof goToPage === 'function') { goToPage(${clamped}); } true;`
    );
  };

  // ── Renderers ─────────────────────────────────────────────────────────────

  const renderLoader = () => {
    if (loadState === "ready" || loadState === "error") return null;

    const labelText = loadState === "loading"
      ? `Preparing reader... ${Math.round(loadingProgress * 100)}%`
      : "Rendering pages...";

    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color={colors.primary.main} size="large" />
        <Text style={styles.statusTitle}>{labelText}</Text>
        <Text style={styles.statusSubtitle}>Optimizing for smooth offline scrolling</Text>
      </View>
    );
  };

  const renderError = () => {
    if (loadState !== "error") return null;
    return (
      <View style={styles.centerBox}>
        <AppIcon color={colors.status.error} name="alert-circle-outline" size={44} />
        <Text style={styles.statusTitle}>Unable to Open Textbook</Text>
        <Text style={styles.statusSubtitle}>{errorMessage || "An unexpected error occurred."}</Text>
        <Pressable
          onPress={loadTextbook}
          style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
        >
          <AppIcon color={colors.primary.contrastText} name="refresh-outline" size={16} />
          <Text style={styles.retryBtnText}>Retry Loading</Text>
        </Pressable>
      </View>
    );
  };

  const renderPDFContent = (width: number, height: number) => {
    if (Platform.OS === "web") {
      const srcUri = pdfUrl || Asset.fromModule(require("../../../chapter/Textbook.pdf")).uri;
      return (
        <iframe
          src={srcUri}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={documentTitle}
        />
      );
    }

    return (
      <ZoomPanView
        width={width}
        height={height}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        rotation={rotation}
      >
        {({ width: w, height: h }) => (
          <WebView
            allowFileAccess
            allowUniversalAccessFromFileURLs
            mixedContentMode="always"
            onMessage={handleMessage}
            originWhitelist={["*"]}
            ref={webViewRef}
            scalesPageToFit={true}
            setBuiltInZoomControls={true}
            setDisplayZoomControls={false}
            source={{ uri: textbookHtmlPath }}
            style={[styles.webView, { width: w, height: h }, loadState === "rendering" && { opacity: 0 }]}
            onLoadEnd={handleLoadEnd}
          />
        )}
      </ZoomPanView>
    );
  };

  // ── Page navigation bar ───────────────────────────────────────────────────

  const renderPageNav = () => {
    if (loadState !== "ready" || Platform.OS === "web") return null;

    return (
      <View style={styles.pageNav}>
        <Pressable
          onPress={() => goToPage(currentPage - 1)}
          style={({ pressed }) => [styles.pageNavBtn, pressed && styles.pressed]}
        >
          <AppIcon color={themeColors.textPrimary} name="chevron-back-outline" size={16} />
        </Pressable>

        <Text style={styles.pageNavText}>
          {currentPage} / {totalPages}
        </Text>

        <Pressable
          onPress={() => goToPage(currentPage + 1)}
          style={({ pressed }) => [styles.pageNavBtn, pressed && styles.pressed]}
        >
          <AppIcon color={themeColors.textPrimary} name="chevron-forward-outline" size={16} />
        </Pressable>
      </View>
    );
  };

  // ── Fullscreen modal ──────────────────────────────────────────────────────

  const renderFullscreen = () => (
    <Modal
      animationType="fade"
      onRequestClose={() => setIsFullscreen(false)}
      statusBarTranslucent
      transparent={false}
      visible={isFullscreen}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setIsFullscreen(false)}
            style={styles.modalCloseBtn}
          >
            <AppIcon color="#FFFFFF" name="close-outline" size={22} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{documentTitle}</Text>
        </View>

        <ViewerToolbar
          isFullscreen={true}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onToggleFullscreen={() => setIsFullscreen(false)}
          onDownload={handleDownload}
        />

        <View style={styles.modalBody}>
          {isFullscreen ? renderPDFContent(SCREEN_WIDTH, Dimensions.get("window").height - 160) : null}
        </View>

        {renderPageNav()}
      </SafeAreaView>
    </Modal>
  );

  // ── Main inline render ────────────────────────────────────────────────────

  if (!pdfUrl) {
    return (
      <ContentComingSoon
        title="Textbook Coming Soon"
        message="Textbook materials for this chapter are currently being compiled by the backend team."
      />
    );
  }

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

      {/* Main WebView Container */}
      <View style={styles.pdfContainer}>
        {renderLoader()}
        {renderError()}

        {(loadState === "ready" || loadState === "rendering") && !isFullscreen && renderPDFContent(CARD_WIDTH, 480)}
      </View>

      {renderPageNav()}
      {renderFullscreen()}
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
      height: 480,
      backgroundColor: themeColors.surfaceSecondary,
      position: "relative",
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
    // Page navigation
    pageNav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xs,
      gap: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderSubtle,
      backgroundColor: themeColors.surface,
    },
    pageNavBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: themeColors.surfaceSecondary,
      borderWidth: 1,
      borderColor: themeColors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    pageNavText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: isDark ? colors.primary.light : colors.primary.main,
    },
    // Modal styles
    modalSafeArea: {
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
      flexShrink: 1,
    },
    modalBody: {
      flex: 1,
      backgroundColor: "#0A0A0A",
    },
  });