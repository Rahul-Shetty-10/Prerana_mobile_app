import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResourceTabType } from "../../features/subjects/types";

export const LEARNING_STATE_STORAGE_KEY = "@prerana_learning_state";

export interface LearningState {
  selectedSubjectId: string;
  lastChapterId?: string;
  lastResourceId?: string;
  lastResourceTab?: ResourceTabType;
  lastWorkspaceTab?: string;
  lastVisitedAt?: string;
}

const DEFAULT_LEARNING_STATE: LearningState = {
  selectedSubjectId: "subj-phy-11", // Default Physics 11th
  lastChapterId: "ch-phy-11-1",
  lastResourceTab: "textbook",
  lastWorkspaceTab: "chapters",
  lastVisitedAt: new Date().toISOString(),
};

export async function getLearningState(): Promise<LearningState> {
  try {
    const jsonValue = await AsyncStorage.getItem(LEARNING_STATE_STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue) as Partial<LearningState>;
      return {
        ...DEFAULT_LEARNING_STATE,
        ...parsed,
      };
    }
  } catch (e) {
    // Fallback to default
  }
  return DEFAULT_LEARNING_STATE;
}

export async function saveLearningState(state: Partial<LearningState>): Promise<LearningState> {
  try {
    const current = await getLearningState();
    const updated: LearningState = {
      ...current,
      ...state,
      lastVisitedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(LEARNING_STATE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return {
      ...DEFAULT_LEARNING_STATE,
      ...state,
    };
  }
}

export async function clearLearningState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LEARNING_STATE_STORAGE_KEY);
  } catch (e) {
    // Ignore error on clear
  }
}
