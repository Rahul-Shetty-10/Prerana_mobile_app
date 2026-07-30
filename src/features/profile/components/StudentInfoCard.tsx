import React from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { StudentInfoCardProps } from "../types";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";

export function StudentInfoCard({
  info,
}: StudentInfoCardProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);

  const initial = info.name ? info.name.charAt(0).toUpperCase() : "S";

  return (
    <View style={styles.cardContainer}>
      {/* Avatar & Main Details */}
      <View style={styles.topRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        <View style={styles.mainDetails}>
          <Text style={styles.nameText}>{info.name}</Text>
          <Text style={styles.emailText}>{info.email}</Text>
          <View style={styles.idBadge}>
            <AppIcon color={colors.primary.main} name="id-card-outline" size={14} />
            <Text style={styles.idText}>ID: {info.enrollmentId}</Text>
          </View>
        </View>
      </View>

      {/* Class, Board & Workspace Pills */}
      <View style={styles.infoGrid}>
        <View style={styles.infoPill}>
          <AppIcon color={themeColors.textMuted} name="school-outline" size={14} />
          <Text style={styles.infoPillText}>{info.studentClass}</Text>
        </View>

        <View style={styles.infoPill}>
          <AppIcon color={themeColors.textMuted} name="ribbon-outline" size={14} />
          <Text style={styles.infoPillText}>{info.board}</Text>
        </View>

        <View style={styles.infoPillFull}>
          <AppIcon color={themeColors.textMuted} name="business-outline" size={14} />
          <Text style={styles.infoPillText}>{info.workspace}</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  cardContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  avatarInitial: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primary.contrastText,
  },
  mainDetails: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
  },
  emailText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textMuted,
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  idText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: themeColors.borderSubtle,
    paddingTop: spacing.sm + 2,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  infoPillFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    width: "100%",
  },
  infoPillText: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textSecondary,
  },
});