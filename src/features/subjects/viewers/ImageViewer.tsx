import React, { useRef, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageViewerProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import { ViewerToolbar } from "./ViewerToolbar";
import { Asset } from "expo-asset";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { ContentComingSoon } from "./ContentComingSoon";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

// ─── Zoom and Pan Gesture Controller ─────────────────────────────────────────

interface ZoomPanViewProps {
  children: React.ReactNode;
  width: number;
  height: number;
  zoomScale: number;
  setZoomScale: React.Dispatch<React.SetStateAction<number>>;
  rotation: number;
}

function ZoomPanView({
  children,
  width,
  height,
  zoomScale,
  setZoomScale,
  rotation,
}: ZoomPanViewProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: zoomScale,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }),
      ...(zoomScale === 1
        ? [
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
          ]
        : []),
    ]).start();
    lastScale.current = zoomScale;
    if (zoomScale === 1) {
      lastTranslate.current = { x: 0, y: 0 };
    }
  }, [zoomScale]);

  const initialDistance = useRef(0);
  const isPinching = useRef(false);

  const getDistance = (evt: GestureResponderEvent) => {
    const touches = evt.nativeEvent.touches;
    if (touches.length >= 2) {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          isPinching.current = true;
          initialDistance.current = getDistance(evt);
        } else {
          isPinching.current = false;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length >= 2) {
          if (!isPinching.current) {
            isPinching.current = true;
            initialDistance.current = getDistance(evt);
          }
          const currentDistance = getDistance(evt);
          if (initialDistance.current > 0 && currentDistance > 0) {
            const nextScale = lastScale.current * (currentDistance / initialDistance.current);
            const clampedScale = Math.max(0.8, Math.min(nextScale, 4.0));
            scale.setValue(clampedScale);
            setZoomScale(clampedScale);
          }
        } else if (touches.length === 1 && !isPinching.current) {
          const dx = gestureState.dx;
          const dy = gestureState.dy;
          translateX.setValue(lastTranslate.current.x + dx);
          translateY.setValue(lastTranslate.current.y + dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        isPinching.current = false;
        
        let currentScale = 1;
        try {
          // @ts-ignore
          currentScale = scale.__getValue();
        } catch (_) {}

        if (currentScale <= 1.05) {
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 50 }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
          ]).start();
          lastScale.current = 1;
          lastTranslate.current = { x: 0, y: 0 };
          setZoomScale(1);
        } else {
          lastScale.current = currentScale;
          lastTranslate.current = {
            x: lastTranslate.current.x + gestureState.dx,
            y: lastTranslate.current.y + gestureState.dy,
          };
          
          const maxDragX = (width * currentScale - width) / 2 + 50;
          const maxDragY = (height * currentScale - height) / 2 + 50;
          
          let boundedX = Math.max(-maxDragX, Math.min(lastTranslate.current.x, maxDragX));
          let boundedY = Math.max(-maxDragY, Math.min(lastTranslate.current.y, maxDragY));

          if (boundedX !== lastTranslate.current.x || boundedY !== lastTranslate.current.y) {
            Animated.parallel([
              Animated.spring(translateX, { toValue: boundedX, useNativeDriver: true, friction: 8, tension: 50 }),
              Animated.spring(translateY, { toValue: boundedY, useNativeDriver: true, friction: 8, tension: 50 }),
            ]).start();
            lastTranslate.current = { x: boundedX, y: boundedY };
          }
        }
      },
    })
  ).current;

  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={{
          width,
          height,
          transform: [
            { scale },
            { translateX },
            { translateY },
            { rotate: `${rotation}deg` },
          ],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const localInfographic = require("../../../chapter/Infographic.png");
const localMindmap = require("../../../chapter/Mindmap.png");

// ─── Component ───────────────────────────────────────────────────────────────

export function ImageViewer({
  title,
  description,
  imageUrl,
  isMindmap = false,
  authToken,
  tenantSlug,
}: ImageViewerProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [imageError, setImageError] = useState(false);
  const lastTap = useRef<number>(0);

  // No backend URL at all — show Coming Soon screen (do NOT show local mock)
  if (!imageUrl) {
    return (
      <ContentComingSoon
        icon={isMindmap ? "git-network-outline" : "image-outline"}
        title={isMindmap ? "Mind Map Image Coming Soon" : "Infographic Coming Soon"}
        message="This visual content is being prepared by our team. Check back soon!"
      />
    );
  }

  const activeImage = (imageUrl && !imageError)
    ? {
        uri: imageUrl,
      }
    : (isMindmap ? localMindmap : localInfographic);
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
      let localUri = "";
      if (imageUrl && !imageError) {
        try {
          const filename = imageUrl.split("/").pop() || "image.png";
          const tempPath = `${FileSystem.documentDirectory}${filename}`;
          console.log(`[SUBJECTS][ImageViewer] Downloading image with headers: ${imageUrl}`);
          const downloadResult = await FileSystem.downloadAsync(imageUrl, tempPath);
          if (downloadResult.status !== 200 && downloadResult.status !== 201) {
            throw new Error(`HTTP status ${downloadResult.status}`);
          }
          localUri = downloadResult.uri;
        } catch (err) {
          console.warn("[SUBJECTS][ImageViewer] Download failed, sharing local asset:", err);
          const asset = Asset.fromModule(isMindmap ? localMindmap : localInfographic);
          await asset.downloadAsync();
          localUri = asset.localUri || "";
        }
      } else {
        const asset = Asset.fromModule(isMindmap ? localMindmap : localInfographic);
        await asset.downloadAsync();
        localUri = asset.localUri || "";
      }

      if (localUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(localUri);
      }
    } catch (_) {
      // Share unavailable on this platform
    }
  };

  const renderScrollableImage = (height: number) => (
    <ZoomPanView
      width={CARD_WIDTH}
      height={height}
      zoomScale={zoomScale}
      setZoomScale={setZoomScale}
      rotation={rotation}
    >
      <Pressable onPress={handleDoubleTap}>
        <Image
          resizeMode="contain"
          source={activeImage}
          onError={() => {
            if (imageUrl) {
              console.warn("[SUBJECTS][ImageViewer] Failed to load remote inline image, using local fallback.");
              setImageError(true);
            }
          }}
          style={{
            width: CARD_WIDTH,
            height: height,
          }}
        />
      </Pressable>
    </ZoomPanView>
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
          <ZoomPanView
            width={SCREEN_WIDTH}
            height={Dimensions.get("window").height - 160}
            zoomScale={zoomScale}
            setZoomScale={setZoomScale}
            rotation={rotation}
          >
            <Pressable onPress={handleDoubleTap}>
              <Image
                resizeMode="contain"
                source={activeImage}
                onError={() => {
                  if (imageUrl) {
                    console.warn("[SUBJECTS][ImageViewer] Failed to load remote fullscreen image, using local fallback.");
                    setImageError(true);
                  }
                }}
                style={{
                  width: SCREEN_WIDTH,
                  height: Dimensions.get("window").height - 160,
                }}
              />
            </Pressable>
          </ZoomPanView>
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