import { FlashcardItem, MindmapNode, PDFPageItem, TableColumn, TableRowData } from "../types";

export const MOCK_MINDMAP_ROOT: MindmapNode = {
  id: "mm-root",
  label: "Chemical Reactions & Equations",
  details: "Core concepts of chemical transformations, law of conservation of mass, and reaction types.",
  children: [
    {
      id: "mm-c1",
      label: "1. Types of Reactions",
      details: "Classification based on chemical bond changes.",
      children: [
        { id: "mm-c1-1", label: "Combination Reaction", details: "A + B → AB (e.g., 2Mg + O₂ → 2MgO)" },
        { id: "mm-c1-2", label: "Decomposition Reaction", details: "AB → A + B (Thermal, Electrolytic, Photolytic)" },
        { id: "mm-c1-3", label: "Displacement Reaction", details: "A + BC → AC + B (More reactive displaces less reactive)" },
        { id: "mm-c1-4", label: "Double Displacement", details: "AB + CD → AD + CB (Precipitation reactions)" },
      ],
    },
    {
      id: "mm-c2",
      label: "2. Chemical Equations & Balancing",
      details: "Representation and conservation laws.",
      children: [
        { id: "mm-c2-1", label: "Skeletal vs Balanced", details: "Equal number of atoms of each element on both sides." },
        { id: "mm-c2-2", label: "Law of Conservation of Mass", details: "Mass can neither be created nor destroyed in a chemical reaction." },
      ],
    },
    {
      id: "mm-c3",
      label: "3. Oxidation & Reduction (Redox)",
      details: "Electron transfer and oxygen/hydrogen exchange.",
      children: [
        { id: "mm-c3-1", label: "Oxidation", details: "Gain of oxygen or loss of hydrogen / electrons." },
        { id: "mm-c3-2", label: "Reduction", details: "Loss of oxygen or gain of hydrogen / electrons." },
        { id: "mm-c3-3", label: "Corrosion & Rancidity", details: "Real-world effects of slow oxidation." },
      ],
    },
  ],
};

export const MOCK_PDF_PAGES: PDFPageItem[] = [
  {
    pageNumber: 1,
    title: "Page 1: Introduction to Chemical Reactions",
    textContent:
      "A chemical reaction is a process in which one or more substances, called reactants, are converted to one or more different substances, known as products. Substances are either chemical elements or compounds.\n\nKey Indicators of a Chemical Reaction:\n• Evolution of gas\n• Change in color\n• Change in temperature\n• Formation of precipitate",
  },
  {
    pageNumber: 2,
    title: "Page 2: Balancing Chemical Equations",
    textContent:
      "According to the Law of Conservation of Mass, the total mass of the reactants must equal the total mass of the products in a chemical reaction.\n\nSteps to Balance Equations:\n1. Write the skeletal chemical equation.\n2. Count the number of atoms of each element on LHS and RHS.\n3. Equalize the atoms using small whole-number coefficients.",
  },
  {
    pageNumber: 3,
    title: "Page 3: Combination & Decomposition Reactions",
    textContent:
      "Combination Reaction: Two or more reactants combine to form a single product. Example: CaO + H₂O → Ca(OH)₂ + Heat (Exothermic reaction).\n\nDecomposition Reaction: A single compound breaks down into two or more simpler substances upon application of heat, light, or electricity.",
  },
  {
    pageNumber: 4,
    title: "Page 4: Displacement & Redox Processes",
    textContent:
      "Displacement Reaction: A reaction in which a more reactive element displaces a less reactive element from its solution. Example: Fe + CuSO₄ → FeSO₄ + Cu.\n\nRedox Reactions: Reactions where oxidation and reduction occur simultaneously.",
  },
];

export const MOCK_FLASHCARDS: FlashcardItem[] = [
  {
    id: "fc-1",
    category: "DEFINITIONS",
    frontText: "What is a Combination Reaction?",
    backText: "A reaction in which two or more substances combine to form a single new substance. Example: 2H₂ + O₂ → 2H₂O.",
  },
  {
    id: "fc-2",
    category: "CONSERVATION LAWS",
    frontText: "State the Law of Conservation of Mass.",
    backText: "Mass can neither be created nor destroyed in a chemical reaction. The total mass of reactants equals the total mass of products.",
  },
  {
    id: "fc-3",
    category: "REDOX",
    frontText: "What is Oxidation in terms of oxygen?",
    backText: "Oxidation is the chemical process of gaining oxygen or losing hydrogen during a chemical reaction.",
  },
  {
    id: "fc-4",
    category: "APPLICATION",
    frontText: "What is Corrosion?",
    backText: "The process in which metals are slowly eaten away by the action of air, moisture, or chemicals on their surface. Example: Rusting of iron (Fe₂O₃·xH₂O).",
  },
];

export const MOCK_TABLE_COLUMNS: TableColumn[] = [
  { key: "reactionType", title: "Reaction Type", width: 140 },
  { key: "generalFormula", title: "General Formula", width: 130 },
  { key: "example", title: "Chemical Example", width: 180 },
  { key: "characteristic", title: "Key Characteristic", width: 160 },
];

export const MOCK_TABLE_ROWS: TableRowData[] = [
  {
    id: "tr-1",
    reactionType: "Combination",
    generalFormula: "A + B → AB",
    example: "CaO + H₂O → Ca(OH)₂",
    characteristic: "Single product formed; heat released",
  },
  {
    id: "tr-2",
    reactionType: "Decomposition",
    generalFormula: "AB → A + B",
    example: "2Pb(NO₃)₂ → 2PbO + 4NO₂ + O₂",
    characteristic: "Requires heat, light, or electricity",
  },
  {
    id: "tr-3",
    reactionType: "Displacement",
    generalFormula: "A + BC → AC + B",
    example: "Zn + CuSO₄ → ZnSO₄ + Cu",
    characteristic: "More reactive element displaces weaker one",
  },
  {
    id: "tr-4",
    reactionType: "Double Displacement",
    generalFormula: "AB + CD → AD + CB",
    example: "Na₂SO₄ + BaCl₂ → BaSO₄ + 2NaCl",
    characteristic: "Ion exchange; precipitate formed",
  },
];
