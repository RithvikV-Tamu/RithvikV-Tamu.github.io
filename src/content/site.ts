// All site text and links live here. Edit this file to change what the page says.
// Wording is a first draft from Rithvik's own notes and repo descriptions.
// Replace it with answers from the content template when they are ready.
// Leave a field as "" to hide it on the page.

export const profile = {
  name: "Rithvik Vootukur",
  tagline: "Aerospace engineering student at Texas A&M University.",
  subline: "Research assistant in the Turbulence and Advanced Computations Laboratory.",
  github: "https://github.com/RithvikV-Tamu",
  linkedin: "",
  email: "",
  resume: "",
}

export const about = {
  paragraphs: [
    "I'm pursuing a B.S. in Aerospace Engineering at Texas A&M University. I work as a research assistant in Prof. Diego Donzis's Turbulence and Advanced Computations Laboratory, and I'm on the TAMU-SPIRIT 2 ISS payload capstone team.",
    "My strongest work combines aerospace engineering with scientific programming, simulation with physical interpretation, and CAD with trade studies.",
  ],
  facts: [
    { label: "Degree", value: "B.S. Aerospace Engineering" },
    { label: "School", value: "Texas A&M University, Engineering Honors" },
    { label: "Expected graduation", value: "May 2027" },
    { label: "Research", value: "TACL, Prof. Diego Donzis" },
  ],
}

// Mission stages drive the side altitude gauge and section labels.
// Altitudes are decorative, not data.
export const stages = [
  { id: "launch", label: "Launch", altitudeKm: 0, nav: "Top" },
  { id: "about", label: "Ascent", altitudeKm: 12, nav: "About" },
  { id: "work", label: "Orbit insertion", altitudeKm: 100, nav: "Work" },
  { id: "more", label: "Cruise", altitudeKm: 220, nav: "More" },
  { id: "toolkit", label: "Telemetry", altitudeKm: 300, nav: "Toolkit" },
  { id: "timeline", label: "Flight log", altitudeKm: 360, nav: "Timeline" },
  { id: "contact", label: "Downlink", altitudeKm: 400, nav: "Contact" },
] as const

export type VisualKind = "beam" | "conops" | "image" | "airfoil"

export interface FeaturedProject {
  id: string
  title: string
  category: string
  dates: string
  role: string
  summary: string
  points: string[]
  tools: string[]
  status: string
  visual: VisualKind
  image?: { src: string; alt: string; caption: string }
}

export const featured: FeaturedProject[] = [
  {
    id: "tacl",
    title: "Laser beam propagation through turbulence",
    category: "Computational research",
    dates: "June 2026 to present",
    role: "Research assistant, TACL (Prof. Diego Donzis)",
    summary:
      "I study how small-scale atmospheric turbulence affects Gaussian laser beams, focusing on scintillation (irradiance fluctuation) and beam wander. The goal is to find which turbulence scales matter and how that changes with propagation distance, focusing, beam size, wavelength and turbulence strength.",
    points: [
      "Set up controlled, multi-parameter sweeps with the lab's RIPTIDE propagation code",
      "Run cases on Linux and process the HDF5 output in Python",
      "Make figures for lab discussions",
      "300+ simulations run",
    ],
    tools: ["Python", "NumPy", "Matplotlib", "HDF5", "Linux"],
    status: "Ongoing",
    visual: "beam",
  },
  {
    id: "spirit",
    title: "TAMU-SPIRIT 2: ISS payload capstone",
    category: "Spacecraft systems",
    dates: "Fall 2026 to present",
    role: "Team lead and editor, system requirements review",
    summary:
      "Senior capstone designing experiments for a nominal six-month exposure on the International Space Station. Experiments are built and tested at Texas A&M, integrated into a payload carrier, launched, installed on the station and returned to the principal investigator.",
    points: [
      "Led and edited the system requirements review",
      "Wrote the General Passive Exposure sections: scope and operations, requirements and verification",
      "Battery and power trade studies for the PACT experiment",
    ],
    tools: ["Requirements", "Trade studies", "Excel", "LaTeX"],
    status: "In design. No hardware has flown.",
    visual: "conops",
  },
  {
    id: "blue-skies",
    title: "Search-and-rescue UAV concept",
    category: "NASA Gateways to Blue Skies",
    dates: "2023 to 2024",
    role: "Team lead, six-person team",
    summary:
      "A conceptual UAV for finding victims after natural disasters, proposed for NASA's 2024 Gateways to Blue Skies competition. I originated the spherical protective roll-cage concept and handled the team's graphics and materials research.",
    points: [
      "Coordinated weekly work, schedules and subsystem assignments",
      "SolidWorks geometry, sizing and weight estimates",
      "Materials comparisons and Blender renders",
      "14-page proposal and a roughly 20-minute presentation",
    ],
    tools: ["SolidWorks", "Blender", "Pugh charts"],
    status: "Concept proposal, completed",
    visual: "image",
    image: {
      src: "blue-skies-roll-cage",
      alt: "Render of a quadrotor UAV inside a spherical protective cage",
      caption: "Concept render from the team proposal. Not a built prototype.",
    },
  },
  {
    id: "aircraft",
    title: "Sailplane wing and airfoil studies",
    category: "Aircraft design",
    dates: "",
    role: "",
    summary:
      "I built a parametric SolidWorks wing and surrounding aircraft geometry for an AS 35 Mi sailplane and compared glider airfoil configurations.",
    points: [],
    tools: ["SolidWorks"],
    status: "",
    visual: "airfoil",
  },
]

export type MoreIcon = "nozzle" | "heat" | "wave" | "bot" | "dashboard" | "chart"

export interface MoreProject {
  name: string
  meta: string
  description: string
  icon: MoreIcon
  href?: string
  size: "wide" | "normal"
}

export const moreWork: MoreProject[] = [
  {
    name: "RS-25 nozzle solver",
    meta: "Python · Compressible flow",
    description:
      "1-D isentropic nozzle flow solver for an approximate RS-25 nozzle, using the area-Mach relation and Brent root finding, compared with public RS-25 data.",
    icon: "nozzle",
    href: "https://github.com/RithvikV-Tamu/rs25-nozzle-solver",
    size: "wide",
  },
  {
    name: "Heat transfer solvers",
    meta: "Python · Numerical methods",
    description:
      "1-D steady conduction solvers: 2nd and 4th-order finite differences and p=1, p=2 finite elements, with penalty boundary conditions, material interfaces and Richardson convergence checks.",
    icon: "heat",
    href: "https://github.com/RithvikV-Tamu/heat-transfer-solvers",
    size: "normal",
  },
  {
    name: "Bearing fault classification",
    meta: "Python · Machine learning",
    description:
      "Classifies Case Western Reserve University bearing vibration data with FFT features, logistic regression and a PyTorch MLP, using leak-free splits.",
    icon: "wave",
    href: "https://github.com/RithvikV-Tamu/bearing-fault-classification",
    size: "normal",
  },
  {
    name: "Organization Bot",
    meta: "Python · Automation",
    description:
      "Turns my capstone team's Discord conversations into a shared Google Sheets task tracker. GitHub Actions collects messages and a local Ollama model extracts tasks. Manual edits survive later runs.",
    icon: "bot",
    size: "wide",
  },
  {
    name: "Personal Dashboard",
    meta: "Tauri · React · Rust",
    description: "Private Windows desktop app for classes, exams, calendar, read-only Gmail triage, sports and news.",
    icon: "dashboard",
    size: "normal",
  },
  {
    name: "ETF Research",
    meta: "Next.js · TypeScript",
    description: "Private end-of-day ETF research tool with standard measurements, a scanner and a watchlist. Built for my own use, including on iPhone.",
    icon: "chart",
    size: "wide",
  },
]

export interface ToolGroup {
  name: string
  tools: { name: string; usedIn: string[] }[]
}

export const toolkit: ToolGroup[] = [
  {
    name: "Programming",
    tools: [
      { name: "Python", usedIn: ["TACL", "RS-25 nozzle", "Heat transfer", "Bearing faults", "Organization Bot"] },
      { name: "MATLAB", usedIn: ["Coursework"] },
      { name: "TypeScript / React", usedIn: ["Personal Dashboard", "ETF Research", "This site"] },
      { name: "Rust", usedIn: ["Personal Dashboard"] },
      { name: "C++", usedIn: [] },
      { name: "Fortran", usedIn: [] },
    ],
  },
  {
    name: "Scientific computing",
    tools: [
      { name: "NumPy / SciPy", usedIn: ["TACL", "RS-25 nozzle", "Heat transfer"] },
      { name: "Matplotlib", usedIn: ["TACL", "RS-25 nozzle", "Heat transfer"] },
      { name: "HDF5", usedIn: ["TACL"] },
      { name: "scikit-learn / PyTorch", usedIn: ["Bearing faults"] },
    ],
  },
  {
    name: "Design and analysis",
    tools: [
      { name: "SolidWorks", usedIn: ["Blue Skies", "Sailplane"] },
      { name: "Blender", usedIn: ["Blue Skies"] },
      { name: "Abaqus", usedIn: ["Coursework"] },
      { name: "XFOIL", usedIn: [] },
      { name: "FreeFlyer", usedIn: ["Coursework"] },
      { name: "Excel Solver", usedIn: ["Coursework"] },
    ],
  },
  {
    name: "Workflow",
    tools: [
      { name: "Linux", usedIn: ["TACL"] },
      { name: "Git / GitHub", usedIn: ["All software projects"] },
      { name: "SVN", usedIn: ["TACL"] },
      { name: "LaTeX", usedIn: ["TAMU-SPIRIT 2", "Coursework"] },
    ],
  },
]

export const timeline = [
  {
    title: "2022",
    heading: "Tutoring",
    text: "Started volunteering at a tutoring center for younger students, and later tutored privately and through Texas A&M's HELP program. 30+ students and 300+ hours.",
  },
  {
    title: "2023",
    heading: "NASA Gateways to Blue Skies",
    text: "Led a six-person team through a conceptual search-and-rescue UAV proposal for the 2024 competition.",
  },
  {
    title: "Jun 2026",
    heading: "Joined TACL",
    text: "Research assistant in Prof. Diego Donzis's lab, studying laser propagation through turbulence.",
  },
  {
    title: "Fall 2026",
    heading: "TAMU-SPIRIT 2 capstone",
    text: "Team lead and editor for the system requirements review of an ISS payload capstone.",
  },
  {
    title: "May 2027",
    heading: "Expected graduation",
    text: "B.S. Aerospace Engineering, Texas A&M University.",
  },
]
