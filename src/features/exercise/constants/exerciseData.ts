import { ExerciseSessionPayload } from "../types";

export const MOCK_EXERCISE_EXPLORER: ExerciseSessionPayload = {
  id: "ex-explorer-01",
  subjectName: "General Science",
  trackName: "Explorer Track",
  trackType: "explorer",
  title: "Thermodynamics & Fundamental Physics — Practice Set 1",
  totalQuestions: 6,
  questions: [
    {
      id: "q-1",
      number: 1,
      type: "mcq",
      prompt: "Which law of thermodynamics defines the concept of absolute temperature and zero entropy at absolute zero?",
      instructions: "Select the correct option from the choices below:",
      mcqOptions: [
        { id: "opt-a", label: "A", text: "Zeroth Law of Thermodynamics" },
        { id: "opt-b", label: "B", text: "First Law of Thermodynamics" },
        { id: "opt-c", label: "C", text: "Second Law of Thermodynamics" },
        { id: "opt-d", label: "D", text: "Third Law of Thermodynamics" },
      ],
    },
    {
      id: "q-2",
      number: 2,
      type: "true_false",
      prompt: "In an isothermal process for an ideal gas, the total internal energy remains constant throughout the transition.",
      instructions: "Choose whether the statement is True or False:",
    },
    {
      id: "q-3",
      number: 3,
      type: "match",
      prompt: "Match each thermodynamic process in Column A with its defining mathematical condition in Column B:",
      instructions: "Match the corresponding items:",
      matchPairs: [
        { id: "pair-1", leftText: "Isothermal Process", rightText: "Temperature (T) = Constant" },
        { id: "pair-2", leftText: "Isochoric Process", rightText: "Volume (V) = Constant" },
        { id: "pair-3", leftText: "Isobaric Process", rightText: "Pressure (P) = Constant" },
        { id: "pair-4", leftText: "Adiabatic Process", rightText: "Heat Transfer (Q) = 0" },
      ],
    },
    {
      id: "q-4",
      number: 4,
      type: "fill_blank",
      prompt: "The SI unit of specific heat capacity is ________ per kilogram per Kelvin.",
      instructions: "Type your answer in the input box below:",
      fillBlankPlaceholder: "e.g., Joules",
    },
    {
      id: "q-5",
      number: 5,
      type: "mcq",
      prompt: "What is the maximum theoretical efficiency limit for any heat engine operating between two thermal reservoirs governed by?",
      instructions: "Select the correct option:",
      mcqOptions: [
        { id: "opt-5a", label: "A", text: "Joule Efficiency Cycle" },
        { id: "opt-5b", label: "B", text: "Carnot Efficiency Limit" },
        { id: "opt-5c", label: "C", text: "Diesel Efficiency Standard" },
        { id: "opt-5d", label: "D", text: "Rankine Vapor Cycle" },
      ],
    },
    {
      id: "q-6",
      number: 6,
      type: "reorder",
      prompt: "Arrange the following stages of a Carnot cycle in chronological order starting from isothermal expansion:",
      instructions: "Use the Up and Down buttons to arrange the items in correct sequence:",
      reorderItems: [
        { id: "ri-1", text: "Isothermal Expansion" },
        { id: "ri-2", text: "Adiabatic Expansion" },
        { id: "ri-3", text: "Isothermal Compression" },
        { id: "ri-4", text: "Adiabatic Compression" },
      ],
    },
  ],
};
