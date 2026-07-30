import React, { useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { LatestSignalsProps, SignalCategory, SignalItem } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
const TABS: { id: SignalCategory; label: string }[] = [
  { id: "assessments", label: "Assessments" },
  { id: "requests", label: "Requests" },
  { id: "library", label: "Library" },
];

export function LatestSignalsSection({
  signals = [],
  isLoading = false,
  onSignalPress,
}: LatestSignalsProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const [activeTab, setActiveTab] = useState<SignalCategory>("assessments");

  const filteredSignals = signals.filter((s) => s.category === activeTab);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Latest Signals</Text>

      {/* Segmented Control Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              onPress={() => setActiveTab(tab.id)}
              style={({ pressed }) => [
                styles.tabItem,
                isActive && styles.activeTabItem,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Dynamic Content Container */}
      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.primary.main} size="small" />
            <Text style={styles.stateText}>Loading signals...</Text>
          </View>
        ) : filteredSignals.length === 0 ? (
          <View style={styles.stateBlock}>
            <AppIcon color={themeColors.textMuted} name="notifications-off-outline" size={28} />
            <Text style={styles.stateText}>No signals in this category yet.</Text>
          </View>
        ) : (
          <View style={styles.signalList}>
            {filteredSignals.map((signal, index) => (
              <React.Fragment key={signal.id}>
                {index > 0 ? <View style={styles.divider} /> : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => onSignalPress?.(signal)}
                  style={({ pressed }) => [
                    styles.signalRow,
                    pressed && onSignalPress && styles.pressed,
                  ]}
                >
                  <View style={styles.iconShell}>
                    <AppIcon color={isDark ? colors.primary.light : colors.primary.main} name={signal.iconName} size={18} />
                  </View>

                  <View style={styles.signalContent}>
                    <Text numberOfLines={1} style={styles.signalTitle}>
                      {signal.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.signalSubtitle}>
                      {signal.subtitle}
                    </Text>
                    <Text style={styles.signalTimestamp}>{signal.timestamp}</Text>
                  </View>

                  {signal.statusText ? (
                    <Badge
                      label={signal.statusText}
                      variant={
                        signal.statusVariant === "success"
                          ? "secondary"
                          : signal.statusVariant === "warning"
                          ? "secondary"
                          : "accent"
                      }
                    />
                  ) : null}
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: themeColors.surfaceSecondary,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  activeTabItem: {
    backgroundColor: themeColors.surfaceHighlighted,
    borderWidth: 1,
    borderColor: isDark ? colors.primary.light : colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: themeColors.textMuted,
  },
  activeTabText: {
    color: isDark ? colors.primary.light : colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  signalList: {
    gap: 0,
  },
  signalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  signalContent: {
    flex: 1,
    gap: 2,
  },
  signalTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: themeColors.textPrimary,
  },
  signalSubtitle: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textSecondary,
  },
  signalTimestamp: {
    fontSize: typography.fontSize.xs - 2,
    color: themeColors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.borderSubtle,
    marginVertical: 4,
  },
  stateBlock: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  stateText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
  },
});