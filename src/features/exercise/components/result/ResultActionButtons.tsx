import React from "react";
import { StyleSheet, View } from "react-native";
import { ResultActionButtonsProps } from "../../types";
import { Button } from "../../../../shared/components";
import { spacing } from "../../../../shared/theme";

export function ResultActionButtons({
  onReviewAnswers,
  onRetryExercise,
  onBackToSubject,
}: ResultActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Button
        iconName="eye-outline"
        onPress={onReviewAnswers}
        style={styles.button}
        title="Review Answers"
        variant="primary"
      />

      <Button
        iconName="refresh-outline"
        onPress={onRetryExercise}
        style={styles.button}
        title="Retry Exercise"
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