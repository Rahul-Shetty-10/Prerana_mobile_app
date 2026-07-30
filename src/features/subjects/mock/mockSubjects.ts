import { SubjectMeta, ChapterItem } from "../types";

export interface MockSubject extends SubjectMeta {
  title: string;
  code: string;
  description: string;
  teacher: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  banner: string;
  estimatedDuration: string;
  chaptersList: ChapterItem[];
}

export const MOCK_SUBJECTS: MockSubject[] = [
  {
    id: "subj-maths",
    name: "Mathematics",
    title: "Mathematics",
    code: "MATH-A5",
    description: "Master algebraic foundations, geometry proofs, trigonometry functions, and coordinate reasoning.",
    teacher: "Dr. Amit Sharma",
    progress: 45,
    completedLessons: 18,
    totalLessons: 40,
    chapterCount: 6,
    partCount: 2,
    iconName: "calculator-outline",
    colorVariant: "blue",
    banner: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600",
    estimatedDuration: "45 Hours",
    chaptersList: [
      { id: "maths-chap-1", number: 1, partNumber: 1, title: "Real Numbers & Proofs", subtitle: "Euclid's division lemma, fundamental theorem of arithmetic." },
      { id: "maths-chap-2", number: 2, partNumber: 1, title: "Polynomials & Quadratic Equations", subtitle: "Roots, coefficients, and graphical representations." },
      { id: "maths-chap-3", number: 3, partNumber: 1, title: "Arithmetic Progressions", subtitle: "nth term formulas, sum of first n terms." },
      { id: "maths-chap-4", number: 4, partNumber: 2, title: "Triangles & Similarity Theorems", subtitle: "Thales theorem, Pythagoras theorem proofs." },
      { id: "maths-chap-5", number: 5, partNumber: 2, title: "Coordinate Geometry", subtitle: "Distance formula, section formula, and area of triangles." },
      { id: "maths-chap-6", number: 6, partNumber: 2, title: "Trigonometric Identities", subtitle: "Sine, cosine, tangent relations and height & distance applications." }
    ]
  },
  {
    id: "subj-physics",
    name: "Physics",
    title: "Physics",
    code: "PHYS-A5",
    description: "Explore electromagnetic principles, light refraction laws, electricity networks, and energy resources.",
    teacher: "Dr. Ramesh Kumar",
    progress: 30,
    completedLessons: 12,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "flask-outline",
    colorVariant: "coral",
    banner: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600",
    estimatedDuration: "50 Hours",
    chaptersList: [
      { id: "phys-chap-1", number: 1, partNumber: 1, title: "Light - Reflection & Refraction", subtitle: "Spherical mirrors, lens formula, and refractive indices." },
      { id: "phys-chap-2", number: 2, partNumber: 1, title: "The Human Eye & Optical Phenomena", subtitle: "Defects of vision, dispersion of light, atmospheric refraction." },
      { id: "phys-chap-3", number: 3, partNumber: 1, title: "Electricity & Circuits", subtitle: "Ohm's law, resistance combinations, and heating effects." },
      { id: "phys-chap-4", number: 4, partNumber: 2, title: "Magnetic Effects of Current", subtitle: "Electromagnetic induction, electric motors, and generators." },
      { id: "phys-chap-5", number: 5, partNumber: 2, title: "Sources of Energy", subtitle: "Fossil fuels, solar cells, biomass, and wind turbines." }
    ]
  },
  {
    id: "subj-chemistry",
    name: "Chemistry",
    title: "Chemistry",
    code: "CHEM-A5",
    description: "Deconstruct chemical equations, pH scales, metallic structures, and organic carbon molecules.",
    teacher: "Prof. Sunita Rao",
    progress: 60,
    completedLessons: 24,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "flask-outline",
    colorVariant: "amber",
    banner: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?q=80&w=600",
    estimatedDuration: "48 Hours",
    chaptersList: [
      { id: "chem-chap-1", number: 1, partNumber: 1, title: "Chemical Reactions & Equations", subtitle: "Types of chemical reactions, balancing equations." },
      { id: "chem-chap-2", number: 2, partNumber: 1, title: "Acids, Bases & Salts", subtitle: "pH scale, neutralization, and everyday chemistry." },
      { id: "chem-chap-3", number: 3, partNumber: 1, title: "Metals & Non-metals", subtitle: "Ionic compounds, metallurgical extraction, and corrosion." },
      { id: "chem-chap-4", number: 4, partNumber: 2, title: "Carbon & Its Compounds", subtitle: "Covalent bonds, functional groups, soaps, and detergents." },
      { id: "chem-chap-5", number: 5, partNumber: 2, title: "Periodic Classification", subtitle: "Mendeleev table, modern periodic law, trends in groups." }
    ]
  },
  {
    id: "subj-biology",
    name: "Biology",
    title: "Biology",
    code: "BIOL-A5",
    description: "Understand life processes, neurological coordination, genetic heritage, and ecological balance.",
    teacher: "Dr. Priya Nair",
    progress: 75,
    completedLessons: 30,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "leaf-outline",
    colorVariant: "emerald",
    banner: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600",
    estimatedDuration: "42 Hours",
    chaptersList: [
      { id: "biol-chap-1", number: 1, partNumber: 1, title: "Life Processes & Nutrition", subtitle: "Photosynthesis, respiration, transport, and excretion." },
      { id: "biol-chap-2", number: 2, partNumber: 1, title: "Control & Coordination", subtitle: "Nervous system, reflex arcs, plant hormones, animal endocrine." },
      { id: "biol-chap-3", number: 3, partNumber: 1, title: "Organism Reproduction", subtitle: "Fission, budding, vegetative propagation, sexual reproduction." },
      { id: "biol-chap-4", number: 4, partNumber: 2, title: "Heredity & Evolution", subtitle: "Mendelian inheritance, sex determination, speciation." },
      { id: "biol-chap-5", number: 5, partNumber: 2, title: "Our Environment", subtitle: "Ecosystems, food chains, waste management, ozone layer depletion." }
    ]
  },
  {
    id: "subj-compsci",
    name: "Computer Science",
    title: "Computer Science",
    code: "COMP-A5",
    description: "Learn logical algorithmic paradigms, structural databases, networking parameters, and script logic.",
    teacher: "Mr. Rajesh Sekhar",
    progress: 50,
    completedLessons: 20,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "desktop-outline",
    colorVariant: "purple",
    banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600",
    estimatedDuration: "40 Hours",
    chaptersList: [
      { id: "comp-chap-1", number: 1, partNumber: 1, title: "Introduction to Python Programming", subtitle: "Syntax, variables, conditional statements, and loops." },
      { id: "comp-chap-2", number: 2, partNumber: 1, title: "Data Structures & Arrays", subtitle: "Lists, tuples, dictionaries, and string manipulation." },
      { id: "comp-chap-3", number: 3, partNumber: 1, title: "Relational Database Management", subtitle: "SQL basics, SELECT queries, INSERT, UPDATE statements." },
      { id: "comp-chap-4", number: 4, partNumber: 2, title: "Computer Networks & Internet Protocols", subtitle: "IP addressing, DNS, TCP/IP stack, and client-server architectures." },
      { id: "comp-chap-5", number: 5, partNumber: 2, title: "Cybersecurity & Ethics", subtitle: "Malware types, encryption, digital footprints, and online safety." }
    ]
  },
  {
    id: "subj-english",
    name: "English",
    title: "English",
    code: "ENGL-A5",
    description: "Read narrative literary works, grammar modules, writing composition templates, and spoken modules.",
    teacher: "Mrs. Elizabeth Jones",
    progress: 80,
    completedLessons: 32,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "book-outline",
    colorVariant: "amber",
    banner: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
    estimatedDuration: "35 Hours",
    chaptersList: [
      { id: "engl-chap-1", number: 1, partNumber: 1, title: "A Letter to God", subtitle: "Lencho's faith, post office help, and core theme analysis." },
      { id: "engl-chap-2", number: 2, partNumber: 1, title: "Nelson Mandela - Long Walk to Freedom", subtitle: "Inauguration ceremony speech, struggle against apartheid." },
      { id: "engl-chap-3", number: 3, partNumber: 1, title: "Two Stories about Flying", subtitle: "His First Flight, Black Aeroplane story reviews." },
      { id: "engl-chap-4", number: 4, partNumber: 2, title: "From the Diary of Anne Frank", subtitle: "Life in the secret annex, school diary excerpts." },
      { id: "engl-chap-5", number: 5, partNumber: 2, title: "The Hundred Dresses", subtitle: "Peggy, Maddie, Wanda Petronski, and anti-bullying values." }
    ]
  },
  {
    id: "subj-history",
    name: "History",
    title: "History",
    code: "HIST-A5",
    description: "Trace industrial revolutions, nationalist movements, global wars, and colonial impacts.",
    teacher: "Dr. Vikram Hegde",
    progress: 20,
    completedLessons: 8,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "time-outline",
    colorVariant: "purple",
    banner: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600",
    estimatedDuration: "38 Hours",
    chaptersList: [
      { id: "hist-chap-1", number: 1, partNumber: 1, title: "The Rise of Nationalism in Europe", subtitle: "French revolution, nation-state concept, and unification processes." },
      { id: "hist-chap-2", number: 2, partNumber: 1, title: "Nationalism in India", subtitle: "Non-cooperation movement, civil disobedience, sense of collective belonging." },
      { id: "hist-chap-3", number: 3, partNumber: 1, title: "The Making of a Global World", subtitle: "Pre-modern world, silk routes, conquest, disease, trade." },
      { id: "hist-chap-4", number: 4, partNumber: 2, title: "The Age of Industrialisation", subtitle: "Hand labour, steam power, factories, and colonies." },
      { id: "hist-chap-5", number: 5, partNumber: 2, title: "Print Culture & the Modern World", subtitle: "First printed books, print revolution, impact on religious debates." }
    ]
  },
  {
    id: "subj-geography",
    name: "Geography",
    title: "Geography",
    code: "GEOG-A5",
    description: "Examine resource allocations, wild habitats, agricultural patterns, and mineral distributions.",
    teacher: "Mrs. Anjali Sen",
    progress: 90,
    completedLessons: 36,
    totalLessons: 40,
    chapterCount: 5,
    partCount: 2,
    iconName: "earth-outline",
    colorVariant: "emerald",
    banner: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600",
    estimatedDuration: "36 Hours",
    chaptersList: [
      { id: "geog-chap-1", number: 1, partNumber: 1, title: "Resources & Development", subtitle: "Classification of resources, land degradation, soil classification." },
      { id: "geog-chap-2", number: 2, partNumber: 1, title: "Forest & Wildlife Resources", subtitle: "Flora, fauna conservation, project tiger, and sacred groves." },
      { id: "geog-chap-3", number: 3, partNumber: 1, title: "Water Resources", subtitle: "Multipurpose river valley projects, rain water harvesting." },
      { id: "geog-chap-4", number: 4, partNumber: 2, title: "Agriculture", subtitle: "Types of farming, cropping seasons, major food crops." },
      { id: "geog-chap-5", number: 5, partNumber: 2, title: "Minerals & Energy Resources", subtitle: "Metallic minerals, coal, petroleum, natural gas, non-conventional energy." }
    ]
  }
];
