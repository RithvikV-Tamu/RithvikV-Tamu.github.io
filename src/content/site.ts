// All site text and links live here. Edit this file to change what the page says.
// The wording is built only from facts in Rithvik's own notes and repo
// descriptions. Swap in his own phrasing from the content template when ready.
// Leave a field as "" to hide it on the page.

export const profile = {
  name: "Rithvik Vootukur",
  tagline: "Aerospace engineering student at Texas A&M.",
  subline: "I study how turbulence distorts laser beams, and I lead an ISS payload capstone team.",
  github: "https://github.com/RithvikV-Tamu",
  linkedin: "https://www.linkedin.com/in/rithvik-vootukur",
  emails: [
    { label: "School Email", address: "rithvik_v@tamu.edu" },
    { label: "Personal Email", address: "vootukur.r@gmail.com" },
  ],
  // CV PDF in public/resume/. Copy updated versions from C:\Projects\Resumes.
  resumes: [
    { label: "Curriculum Vitae", short: "CV", href: `${import.meta.env.BASE_URL}resume/Rithvik_Vootukur_Curriculum_Vitae.pdf` },
  ],
}

export const about = {
  paragraphs: [
    "I study Aerospace Engineering at Texas A&M and graduate in May 2027.",
    "Most of my time goes to two projects. In Prof. Diego Donzis's Turbulence and Advanced Computations Laboratory, I run simulations of laser beams passing through turbulent air. On the TAMU-SPIRIT 2 capstone, I lead a 16-person team preparing experiments for the outside of the International Space Station.",
    "The work I'm best at sits between code and physics: setting up the runs, processing the output, and explaining what the plot actually shows. I also do CAD and trade studies, and I've tutored more than 30 students.",
  ],
  facts: [
    { label: "Degree", value: "B.S. Aerospace Engineering" },
    { label: "School", value: "Texas A&M University, Engineering Honors" },
    { label: "Graduating", value: "May 2027" },
    { label: "Research", value: "TACL, Prof. Diego Donzis" },
  ],
}

// Mission stages drive the side altitude gauge and section labels.
// Altitudes are decorative, not data.
// Sections are ordered by importance: work first, then supporting detail.
export const stages = [
  { id: "launch", label: "Takeoff", altitudeFt: 0, nav: "Top" },
  { id: "work", label: "Climb", altitudeFt: 15000, nav: "Work" },
  { id: "more", label: "Cruise", altitudeFt: 32000, nav: "More" },
  { id: "about", label: "Crew", altitudeFt: 38000, nav: "About" },
  { id: "toolkit", label: "Instruments", altitudeFt: 42000, nav: "Toolkit" },
  { id: "timeline", label: "Logbook", altitudeFt: 45000, nav: "Timeline" },
  { id: "contact", label: "Radio", altitudeFt: 50000, nav: "Contact" },
] as const

export const sectionIntros = {
  more: "Smaller projects: solvers, machine learning and tools I built for myself.",
  toolkit: "Hover or tap a tool to see where I've used it.",
}

// Short facts shown in the data strip along the bottom of the hero.
export const heroFacts = [
  { label: "Studying", detail: "Aerospace Engineering, Texas A&M" },
  { label: "Graduating", detail: "May 2027 · Engineering Honors" },
  { label: "Research", detail: "Laser beams through turbulence, TACL" },
  { label: "Leading", detail: "TAMU-SPIRIT 2" },
]

// Short facts between the featured work and the rest of the page.
// `count` is the number to animate up to, starting at `from` (default 0);
// `suffix` follows it. Counts of 10,000 and up show a thousands comma.
export const quickStats = [
  { count: 10000, suffix: "+", label: "RIPTIDE turbulence cases run" },
  { count: 16, suffix: "", label: "Students on the TAMU-SPIRIT 2 team I lead" },
  { count: 30, suffix: "+", label: "Students tutored, over 300 hours" },
  { count: 2027, from: 2021, suffix: "", label: "Graduating with a B.S., in May" },
]

// Interactive or static cards shown on a project's photo panel.
export type InsetKind = "beam" | "conops" | "image" | "airfoil"

// Background photo for a project panel (files in public/media/photos/).
// These are representative images, not photos of Rithvik's own hardware.
export interface PanelPhoto {
  name: string
  alt: string
  caption: string
  position: string
  textSide: "left" | "right"
}

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
  photo: PanelPhoto
  inset?: InsetKind
  image?: { src: string; alt: string; caption: string }
}

export const featured: FeaturedProject[] = [
  {
    id: "tacl",
    title: "Laser Beams Through Turbulence",
    category: "Computational Research",
    dates: "June 2026 to Present",
    role: "Research Assistant, TACL · Prof. Diego Donzis",
    summary:
      "Turbulent air makes a laser beam flicker and drift. I study which sizes of turbulent eddies cause it, and how that changes with distance, focusing, beam size, wavelength and turbulence strength.",
    points: [
      "Design controlled parameter sweeps for the lab's RIPTIDE propagation code",
      "Run the cases on the lab's Linux server and process the HDF5 output in Python",
      "Turn the results into figures for lab meetings",
      "10,000+ RIPTIDE cases run so far",
    ],
    tools: ["Python", "NumPy", "Matplotlib", "HDF5", "Linux"],
    status: "Ongoing",
    photo: {
      name: "tacl-lasers",
      alt: "Four orange laser beams shooting from a telescope dome into a starry sky",
      caption:
        "Representative image: laser guide stars at ESO's Very Large Telescope, used to measure and correct atmospheric turbulence. Credit: ESO/F. Kamphues (CC BY 4.0)",
      position: "68% 55%",
      textSide: "left",
    },
    inset: "beam",
  },
  {
    id: "spirit",
    title: "TAMU-SPIRIT 2: An ISS Payload",
    category: "Spacecraft Systems",
    dates: "Fall 2026 to Present",
    role: "Team Lead, 16-Person Senior Capstone Team",
    summary:
      "A Texas A&M and Aegis Aerospace program preparing four experiments for an external ISS platform based on NASA's MISSE design, with about six months of exposure in orbit. Click through the mission plan below.",
    points: [
      "Lead the 16-person team through the design reviews",
      "Edited and presented the System Definition Review: goals, requirements and verification, concept of operations, and the plan to PDR",
      "Wrote the passive exposure sections: scope, operations, requirements and verification",
      "Run Abaqus FEA for structures and battery trade studies for power and thermal planning",
    ],
    tools: ["Requirements", "Abaqus", "Trade Studies", "Excel", "LaTeX"],
    status: "In design. Nothing has flown yet.",
    photo: {
      name: "spirit-misse",
      alt: "Materials exposure sample trays mounted on the outside of the International Space Station",
      caption: "Representative image: NASA's MISSE-FF materials exposure platform on the ISS exterior, 2019. Photo: NASA",
      position: "38% 50%",
      textSide: "right",
    },
    inset: "conops",
  },
  {
    id: "blue-skies",
    title: "Search-and-Rescue Drone Concept",
    category: "NASA Gateways to Blue Skies",
    dates: "2023 to 2024",
    role: "Team Lead, Six-Person Team",
    summary:
      "For NASA's 2024 Gateways to Blue Skies competition, our team proposed a drone for finding people after natural disasters. I came up with its spherical protective roll cage, led the team, and handled the graphics and materials research.",
    points: [
      "Ran weekly coordination, schedules and subsystem assignments",
      "Modeled the cage in SolidWorks and estimated its size and weight",
      "Compared structural materials and made the Blender renders",
      "Delivered a 14-page proposal and a 20-minute presentation",
    ],
    tools: ["SolidWorks", "Blender", "Pugh Charts"],
    status: "Proposal completed. A concept, never built.",
    photo: {
      name: "blue-skies-hurricane",
      alt: "A hurricane seen from the International Space Station",
      caption: "Background: Hurricane Genevieve seen from the ISS, 2020. Photo: NASA",
      position: "62% 60%",
      textSide: "left",
    },
    inset: "image",
    image: {
      src: "blue-skies-roll-cage",
      alt: "Render of a quadrotor drone inside a spherical protective cage",
      caption: "Concept render from our team proposal. Not a built prototype.",
    },
  },
  {
    id: "aircraft",
    title: "AS 35 Mi Sailplane Wing Design",
    category: "Aircraft Design",
    dates: "",
    role: "Aerodynamic Design Project",
    summary:
      "A wing design study for the AS 35 Mi sailplane. I modeled the wing and the aircraft around it in SolidWorks, then ran an airfoil trade study to pick a section for it. Reshape an airfoil below to see how camber and thickness change its lift.",
    points: [
      "Built a parametric SolidWorks model of the wing and surrounding aircraft geometry, so the configuration could change quickly during design iteration",
      "Compared 10 glider airfoil candidates in XFOIL on aerodynamic performance metrics",
      "Documented the trade study used to select the airfoil",
    ],
    tools: ["SolidWorks", "XFOIL", "CAD", "Trade Studies"],
    status: "",
    photo: {
      name: "aircraft-sailplane",
      alt: "A white sailplane with long slender wings in flight against a pale sky",
      caption: "Representative image: NASA PIK-20E sailplane in flight, 1991. Photo: NASA",
      position: "50% 35%",
      textSide: "right",
    },
    inset: "airfoil",
  },
]

// Mission plan for the TAMU-SPIRIT 2 loop, clockwise from Earth.
export const conopsSteps = [
  { label: "Build and Test", detail: "Experiments are built and tested at Texas A&M." },
  { label: "Integrate", detail: "The experiments are loaded into a payload carrier." },
  { label: "Launch", detail: "The carrier launches to the station on a Falcon 9." },
  { label: "Install on ISS", detail: "After docking, the robotic arm unloads the carrier and installs it outside." },
  { label: "~6 Months Exposure", detail: "Samples sit outside the station for a nominal six months." },
  { label: "Return to PI", detail: "The carrier is reloaded, reenters, splashes down and goes back to the researchers." },
]

export interface MoreProject {
  name: string
  meta: string
  description: string
  href?: string
}

export const moreWork: MoreProject[] = [
  {
    name: "RS-25 Nozzle Solver",
    meta: "Python · Compressible Flow",
    description:
      "Solves 1-D isentropic flow through an approximate RS‑25 nozzle with the area-Mach relation and Brent root finding, then compares the results with public RS‑25 data.",
    href: "https://github.com/RithvikV-Tamu/rs25-nozzle-solver",
  },
  {
    name: "Heat Transfer Solvers",
    meta: "Python · Numerical Methods",
    description:
      "1-D conduction with finite differences (2nd and 4th order) and finite elements (p=1, p=2), checked with Richardson convergence studies.",
    href: "https://github.com/RithvikV-Tamu/heat-transfer-solvers",
  },
  {
    name: "Bearing Fault Classification",
    meta: "Python · Machine Learning",
    description:
      "Sorts bearing vibration data into normal and three fault types using FFT features, logistic regression and a PyTorch neural network.",
    href: "https://github.com/RithvikV-Tamu/bearing-fault-classification",
  },
  {
    name: "Organization Bot",
    meta: "Python · Automation",
    description:
      "Turns my capstone team's Discord chat into a shared Google Sheets task tracker. A local AI model reads the messages, and manual edits are never overwritten.",
  },
  {
    name: "Personal Dashboard",
    meta: "Tauri · React · Rust",
    description: "A private Windows app for my classes, exams, calendar, mail, sports and news.",
  },
  {
    name: "ETF Research",
    meta: "Next.js · TypeScript",
    description: "A private ETF research tool with a scanner and watchlist that I use daily, including on my phone.",
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
      { name: "Python", usedIn: ["TACL", "RS-25 Nozzle", "Heat Transfer", "Bearing Faults", "Organization Bot"] },
      { name: "MATLAB", usedIn: ["Coursework"] },
      { name: "TypeScript / React", usedIn: ["Personal Dashboard", "ETF Research", "This site"] },
      { name: "Rust", usedIn: ["Personal Dashboard"] },
      { name: "C++", usedIn: [] },
      { name: "Fortran", usedIn: [] },
    ],
  },
  {
    name: "Scientific Computing",
    tools: [
      { name: "NumPy / SciPy", usedIn: ["TACL", "RS-25 Nozzle", "Heat Transfer"] },
      { name: "Matplotlib", usedIn: ["TACL", "RS-25 Nozzle", "Heat Transfer"] },
      { name: "HDF5", usedIn: ["TACL"] },
      { name: "scikit-learn / PyTorch", usedIn: ["Bearing Faults"] },
    ],
  },
  {
    name: "Design and Analysis",
    tools: [
      { name: "SolidWorks", usedIn: ["Blue Skies", "Sailplane"] },
      { name: "Blender", usedIn: ["Blue Skies"] },
      { name: "Abaqus", usedIn: ["TAMU-SPIRIT 2", "Coursework"] },
      { name: "XFOIL", usedIn: ["Sailplane"] },
      { name: "FreeFlyer", usedIn: ["Coursework"] },
      { name: "Excel Solver", usedIn: ["Coursework"] },
    ],
  },
  {
    name: "Workflow",
    tools: [
      { name: "Linux", usedIn: ["TACL"] },
      { name: "Git / GitHub", usedIn: ["All Software Projects"] },
      { name: "SVN", usedIn: ["TACL"] },
      { name: "LaTeX", usedIn: ["TAMU-SPIRIT 2", "Coursework"] },
    ],
  },
]

export const timeline = [
  {
    title: "2022",
    heading: "Started Tutoring",
    text: "Volunteered at a tutoring center, then tutored privately and through Texas A&M's HELP program. More than 30 students and 300 hours so far.",
  },
  {
    title: "2023",
    heading: "NASA Gateways to Blue Skies",
    text: "Led a six-person team through a search-and-rescue drone proposal for the 2024 competition.",
  },
  {
    title: "Jun 2026",
    heading: "Joined TACL",
    text: "Became a research assistant in Prof. Diego Donzis's lab, simulating laser beams in turbulence.",
  },
  {
    title: "Fall 2026",
    heading: "TAMU-SPIRIT 2",
    text: "Became team lead of the 16-person ISS payload capstone. Edited and presented the System Definition Review.",
  },
  {
    title: "May 2027",
    heading: "Graduation",
    text: "B.S. in Aerospace Engineering from Texas A&M.",
    upcoming: true,
  },
]
