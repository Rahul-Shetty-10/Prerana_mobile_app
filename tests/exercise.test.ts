import assert from "node:assert/strict";
import test from "node:test";
import {
  getMatchRightItems,
  isMatchFollowingAnswerCorrect,
  type MatchFollowingPair,
} from "../src/features/exercise/services/matchFollowing.ts";
import { buildQuizAttemptAnswers } from "../src/features/exercise/services/quizSubmission.ts";

const pairs: MatchFollowingPair[] = [
  { id: "left-a", rightId: "right-2", leftText: "A", rightText: "Two" },
  { id: "left-b", rightId: "right-1", leftText: "B", rightText: "One" },
];

test("match-following keeps backend right IDs when pairs are cross-mapped", () => {
  assert.deepEqual(getMatchRightItems(pairs), [
    { id: "right-2", text: "Two" },
    { id: "right-1", text: "One" },
  ]);
  assert.equal(
    isMatchFollowingAnswerCorrect(pairs, { "left-a": "right-2", "left-b": "right-1" }),
    true,
  );
  assert.equal(
    isMatchFollowingAnswerCorrect(pairs, { "left-a": "right-1", "left-b": "right-2" }),
    false,
  );
});

test("malformed or incomplete match answers fail closed", () => {
  assert.equal(isMatchFollowingAnswerCorrect(pairs, { "left-a": "right-2" }), false);
  assert.equal(isMatchFollowingAnswerCorrect(pairs, { "left-a": "right-2", "left-b": "right-1", extra: "right-3" }), false);
  assert.equal(isMatchFollowingAnswerCorrect(pairs, { "left-a": "right-2", "left-b": "right-2" }), false);
  assert.equal(isMatchFollowingAnswerCorrect(pairs, null), false);
  assert.equal(isMatchFollowingAnswerCorrect(pairs, []), false);
});

test("quiz submission serializes answered and skipped questions for the backend contract", () => {
  assert.deepEqual(
    buildQuizAttemptAnswers(
      [{ id: "q-1" }, { id: "q-2" }, { id: "q-3" }],
      { "q-1": "opt-a", "q-2": { "left-a": "right-b" }, "q-3": "" },
    ),
    [
      { questionId: "q-1", studentAnswer: "opt-a", isSkipped: false },
      { questionId: "q-2", studentAnswer: { "left-a": "right-b" }, isSkipped: false },
      { questionId: "q-3", isSkipped: true },
    ],
  );
});
