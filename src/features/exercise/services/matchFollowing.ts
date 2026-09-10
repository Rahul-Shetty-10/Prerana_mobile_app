export interface MatchFollowingPair {
  id: string;
  rightId: string;
  leftText: string;
  rightText: string;
}

export function getMatchRightItems(pairs: MatchFollowingPair[]): Array<{ id: string; text: string }> {
  return pairs.map((pair) => ({ id: pair.rightId, text: pair.rightText }));
}

export function isMatchFollowingAnswerCorrect(
  pairs: MatchFollowingPair[],
  answer: unknown,
): boolean {
  if (!answer || typeof answer !== "object" || Array.isArray(answer) || pairs.length === 0) {
    return false;
  }

  const selections = answer as Record<string, unknown>;
  const expectedLeftIds = new Set(pairs.map((pair) => pair.id));
  const selectedLeftIds = Object.keys(selections);
  const selectedRightIds = selectedLeftIds.map((leftId) => selections[leftId]);
  return (
    selectedLeftIds.length === pairs.length &&
    selectedLeftIds.every((leftId) => expectedLeftIds.has(leftId)) &&
    new Set(selectedRightIds).size === pairs.length &&
    pairs.every((pair) => selections[pair.id] === pair.rightId)
  );
}
