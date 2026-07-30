import React from "react";
import { StyleSheet, View } from "react-native";
import { ReviewActionButtonsProps } from "../../types";
import { Button } from "../../../../shared/components";
import { spacing } from "../../../../shared/theme";

export function ReviewActionButtons({
  onRetryExercise,
  onBackToResult,
  onBackToSubject,
}: ReviewActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Button
        iconName="refresh-outline"
        onPress={onRetryExercise}
        style={styles.button}
        title="Retry Exercise"
        variant="primary"
      />

      <Button
        iconName="bar-chart-outline"
        onPress={onBackToResult}
        style={styles.button}
        title="Back to Result"
        variant="secondary"
      />

      <Button
        iconName="arrow-back-outline"
        onPress={onBackToSubject}
        style={styles.button}
        title="Back to Subject"
        variant="outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  button: {
    width: "100%",
  },
});