import React from "react";
import { StyleSheet, View } from "react-native";
import { MemoryGridProps } from "../types";
import { MemoryCard } from "./MemoryCard";
import { spacing } from "../../../shared/theme";

export function MemoryGrid({ cards, onCardPress, disabled }: MemoryGridProps) {
  return (
    <View style={styles.gridContainer}>
      {cards.map((card) => (
        <MemoryCard
          key={card.id}
          card={card}
          disabled={disabled}
          onPress={onCardPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});