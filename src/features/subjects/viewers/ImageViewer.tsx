import React, { useRef, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageViewerProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { ViewerToolbar } from "./ViewerToolbar";
import { Asset } from "expo-asset";
import * as Sharing from "expo-sharing";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

// ─── Assets ──────────────────────────────────────────────────────────────────

const localInfographic = require("../../../chapter/Infographic.png");
const localMindmap = require("../../../chapter/Mindmap.png");

// ─── Component ───────────────────────────────────────────────────────────────

export function ImageViewer({
  title,
  description,
  isMindmap = false,
}: ImageViewerProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastTap = useRef<number>(0);

  const activeImage = isMindmap ? localMindmap : localInfographic;
  const label = isMindmap ? "MIND MAP IMAGE" : "INFOGRAPHIC";

  const handleZoomIn = () => setZoomScale((p) => Math.min(p + 0.25, 4));
  const handleZoomOut = () => setZoomScale((p) => Math.max(p - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoomScale(1);
    setRotation(0);
  };
  const handleFitWidth = () => {
    setZoomScale(1.0);
  };
  const handleFitScreen = () => {
    setZoomScale(0.8);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      setZoomScale((prev) => (prev > 1 ? 1 : 2.5));
    }
    lastTap.current = now;
  };

  const handleDownload = async () => {
    try {
      const asset = Asset.fromModule(activeImage);
      await asset.downloadAsync();
      if (asset.localUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(asset.localUri);
      }
    } catch (_) {
      // Share unavailable on this platform
    }
  };

  const renderScrollableImage = (height: number) => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { minWidth: CARD_WIDTH * zoomScale, minHeight: height * zoomScale },
      ]}
      horizontal
      maximumZoomScale={4}
      minimumZoomScale={0.5}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={[styles.scrollView, { height: height * Math.max(zoomScale, 1) }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { minWidth: CARD_WIDTH * zoomScale, minHeight: height * zoomScale },
        ]}
        maximumZoomScale={4}
        minimumZoomScale={0.5}
        showsVerticalScrollIndicator={false}
        style={{ height: height * zoomScale, width: CARD_WIDTH * zoomScale }}
      >
        <Pressable onPress={handleDoubleTap}>
          <Image
            resizeMode="contain"
            source={activeImage}
            style={{
              width: CARD_WIDTH * zoomScale,
              height: height * zoomScale,
              transform: [{ rotate: `${rotation}deg` }],
            }}
          />
        </Pressable>
      </ScrollView>
    </ScrollView>
  );

  // ── Fullscreen Modal ───────────────────────────────────────────────────────

  const renderFullscreen = () => (
    <Modal
      animationType="fade"
      onRequestClose={() => setIsFullscreen(false)}
      statusBarTranslucent
      transparent={false}
      visible={isFullscreen}
    >
      <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
        {/* Modal header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setIsFullscreen(false)}
            style={styles.modalCloseBtn}
          >
            <AppIcon color={"#FFFFFF"} name="close-outline" size={22} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title || label}</Text>
        </View>

        {/* Shared toolbar in modal */}
        <ViewerToolbar
          isFullscreen={true}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onToggleFullscreen={() => setIsFullscreen(false)}
          onDownload={handleDownload}
        />

        {/* Full-screen image */}
        <View style={styles.modalBody}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            horizontal
            maximumZoomScale={6}
            minimumZoomScale={0.25}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={styles.modalScrollH}
          >
            <ScrollView
              maximumZoomScale={6}
              minimumZoomScale={0.25}
              showsVerticalScrollIndicator={false}
              style={styles.modalScrollV}
            >
              <Pressable onPress={handleDoubleTap}>
                <Image
                  resizeMode="contain"
                  source={activeImage}
                  style={{
                    width: SCREEN_WIDTH * zoomScale,
                    height: (Dimensions.get("window").height - 160) * zoomScale,
                    transform: [{ rotate: `${rotation}deg` }],
                  }}
                />
              </Pressable>
            </ScrollView>
          </ScrollView>
        </View>

        <Text style={styles.modalHint}>Double-tap to toggle zoom • Pinch to zoom</Text>
      </SafeAreaView>
    </Modal>
  );

  // ── Inline card ───────────────────────────────────────────────────────────

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

      {title ? <Text style={styles.titleText}>{title}</Text> : null}

      {/* Image canvas (scrollable, full card width) */}
      <View style={styles.imageContainer}>
        {renderScrollableImage(300)}
        <Text style={styles.hintText}>Double-tap to zoom • Scroll to pan • ⤢ for fullscreen</Text>
      </View>

      {description ? (
        <Text style={styles.descriptionText}>{description}</Text>
      ) : null}

      {renderFullscreen()}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (themeColors: any) =>
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
    titleText: {
      fontSize: typography.fontSize.sm + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    imageContainer: {
      width: "100%",
      backgroundColor: themeColors.surfaceSecondary,
      overflow: "hidden",
    },
    scrollView: {
      width: "100%",
    },
    scrollContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    hintText: {
      fontSize: typography.fontSize.xs - 2,
      color: themeColors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.xs,
      fontStyle: "italic",
    },
    descriptionText: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textSecondary,
      textAlign: "center",
      padding: spacing.md,
      lineHeight: typography.lineHeight.sm + 2,
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
    },
    modalBody: {
      flex: 1,
      backgroundColor: "#0A0A0A",
    },
    modalScrollH: {
      flex: 1,
    },
    modalScrollV: {
      flex: 1,
    },
    modalScrollContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    modalHint: {
      fontSize: typography.fontSize.xs - 1,
      color: "rgba(255,255,255,0.4)",
      textAlign: "center",
      paddingVertical: spacing.sm,
      fontStyle: "italic",
    },
  });