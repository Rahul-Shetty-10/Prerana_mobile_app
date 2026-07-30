import React from "react";
import { StyleSheet, View } from "react-native";
import { SubjectItemCard } from "./SubjectItemCard";
import { SubjectListProps } from "../types";

export function SubjectList({
  subjects = [],
  selectedSubjectId,
  onSelectSubject,
}: SubjectListProps) {
  return (
    <View style={styles.container}>
      {subjects.map((subject) => {
        return (
          <SubjectItemCard
            key={subject.id}
            isSelected={subject.id === selectedSubjectId}
            onPress={onSelectSubject}
            subject={subject}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
});