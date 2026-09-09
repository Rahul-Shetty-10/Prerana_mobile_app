import React, { useEffect, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import { AudioViewerProps } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
import * as FileSystem from "expo-file-system/legacy";
import { ContentComingSoon } from "./ContentComingSoon";
import { appConfig } from "../../../config";


export function AudioViewer({
  audioTitle,
  audioUrl,
  speakerName = "SmartGuru Audio Tutor",
  authToken,
  tenantSlug,
}: AudioViewerProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [localAudioPath, setLocalAudioPath] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    let active = true;
    const prepareAudio = async () => {
      if (active) {
        setAudioError(false);
        setLocalAudioPath(null);
      }
      if (!audioUrl) {
        // No backend URL — don't load local mock, just leave localAudioPath null
        return;
      }

      try {
        setDownloading(true);
        // Extract a clean filename from audioUrl
        const filename = audioUrl.split("/").pop() || "Audio.m4a";
        const tempPath = `${FileSystem.documentDirectory}${filename}`;

        const fileInfo = await FileSystem.getInfoAsync(tempPath);
        if (fileInfo.exists && (fileInfo.size ?? 0) > 10000) {
          if (active) setLocalAudioPath(tempPath);
          return;
        }

        console.log(`[SUBJECTS][AudioViewer] Downloading audio from backend: ${audioUrl}`);
        const isApiUrl = audioUrl ? audioUrl.startsWith(appConfig.apiBaseUrl) : false;
        const headers = (authToken && isApiUrl)
          ? { Authorization: `Bearer ${authToken}`, ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}) }
          : undefined;
        const result = await FileSystem.downloadAsync(audioUrl, tempPath, headers ? { headers } : undefined);
        if (result.status !== 200 && result.status !== 201) {
          throw new Error(`HTTP status ${result.status}`);
        }
        if (active) setLocalAudioPath(result.uri);
      } catch (err) {
        console.warn("[SUBJECTS][AudioViewer] Failed to download remote audio:", err);
        if (active) setAudioError(true);
      } finally {
        if (active) setDownloading(false);
      }
    };

    prepareAudio();
    return () => {
      active = false;
    };
  }, [audioUrl, authToken, tenantSlug]);

  const player = useAudioPlayer(localAudioPath || "");
  const status = useAudioPlayerStatus(player);

  const isLoading = (!status.isLoaded && !!localAudioPath) || downloading;
  const isPlaying = status.playing;
  const currentTime = status.currentTime ?? 0;
  const durationSeconds = status.duration ?? 0;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch((err) => {
      console.warn("[SUBJECTS][AudioViewer] Failed to configure audio mode:", err);
    });
  }, []);

  useEffect(() => {
    if (status.didJustFinish) {
      setIsCompleted(true);
    }
  }, [status.didJustFinish]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      player.pause();
    } else {
      if (isCompleted) {
        player.seekTo(0);
        setIsCompleted(false);
      }
      player.play();
    }
  };

  const handleSkipForward = () => {
    const newPosition = Math.min(currentTime + 10, durationSeconds);
    player.seekTo(newPosition);
  };

  const handleSkipBackward = () => {
    const newPosition = Math.max(currentTime - 10, 0);
    player.seekTo(newPosition);
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    player.setPlaybackRate(nextSpeed);
  };

  const progressPercent = durationSeconds > 0 ? Math.round((currentTime / durationSeconds) * 100) : 0;

  // Do not render a player when the backend has no usable resource.
  if ((!audioUrl && !localAudioPath) || audioError) {
    return (
      <ContentComingSoon
        icon="headset-outline"
        title={audioError ? "Unable to load audio" : "Yet to be updated"}
        message={audioError
          ? "The audio explanation could not be loaded. Check your connection and try again."
          : "This resource has not been uploaded yet."}
      />
    );
  }

  return (
    <View style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        {isCompleted ? (
          <Badge label="COMPLETED" variant="accent" />
        ) : (
          <Badge label="AUDIO EXPLANATION" variant="primary" />
        )}
        <Pressable
          accessibilityLabel="Change Speed"
          accessibilityRole="button"
          onPress={handleCycleSpeed}
          style={({ pressed }) => [styles.speedBadge, pressed && styles.pressed]}
        >
          <Text style={styles.speedText}>{playbackSpeed}x SPEED</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.primary.main} size="small" />
          <Text style={styles.loaderText}>Buffering audio track...</Text>
        </View>
      ) : (
        <>
          {/* Audio Title & Speaker */}
          <View style={styles.infoBlock}>
            <Text style={styles.titleText}>{audioTitle}</Text>
            <Text style={styles.speakerText}>Narrated by {speakerName}</Text>
          </View>

          {/* Progress Bar & Seek Time */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressBarKnob, { left: `${progressPercent}%` }]} />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(durationSeconds)}</Text>
            </View>
          </View>

          {/* Controls Row: Skip -10s, Play/Pause, Skip +10s */}
          <View style={styles.controlsRow}>
            <Pressable
              accessibilityLabel="Skip 10 seconds back"
              accessibilityRole="button"
              onPress={handleSkipBackward}
              style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
            >
              <AppIcon color={themeColors.textPrimary} name="play-back-outline" size={20} />
              <Text style={styles.skipLabel}>-10s</Text>
            </Pressable>

            <Pressable
              accessibilityLabel={isPlaying ? "Pause Audio" : "Play Audio"}
              accessibilityRole="button"
              onPress={handlePlayPause}
              style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
            >
              <AppIcon
                color={colors.primary.contrastText}
                name={isPlaying ? "pause" : "play"}
                size={28}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="Skip 10 seconds forward"
              accessibilityRole="button"
              onPress={handleSkipForward}
              style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
            >
              <AppIcon color={themeColors.textPrimary} name="play-forward-outline" size={20} />
              <Text style={styles.skipLabel}>+10s</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderSubtle,
    paddingBottom: spacing.xs,
  },
  speedBadge: {
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  speedText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.heavy,
    color: isDark ? colors.primary.light : colors.primary.main,
  },
  pressed: {
    opacity: 0.85,
  },
  infoBlock: {
    alignItems: "center",
    gap: 4,
  },
  titleText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    textAlign: "center",
  },
  speakerText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textSecondary,
    textAlign: "center",
  },
  progressContainer: {
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: themeColors.surfaceSecondary,
    position: "relative",
    justifyContent: "center",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
  },
  progressBarKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: isDark ? colors.primary.light : colors.primary.main,
    position: "absolute",
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  skipBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
    gap: 2,
  },
  skipLabel: {
    fontSize: typography.fontSize.xs - 2,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textMuted,
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  loaderContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  loaderText: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
  },
});
