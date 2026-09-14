export type Metric = { value: string; label: string };
export type ExternalLink = { label: string; href: string };

export type Decision = {
  title: string;
  body: string;
  compare?: { before: Metric; after: Metric };
  facts: string[];
};

export type ArchitectureLane = {
  title: string;
  nodes: { name: string; detail: string; highlight?: boolean }[];
};

export type Project = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  category: string;
  year: string;
  role: string;
  timeline: string;
  summary: string;
  metrics: Metric[];
  stack: string[];
  award?: string;
  links: { live?: ExternalLink; code?: ExternalLink; demo?: ExternalLink };
  problem: string;
  approach: string;
  architecture: ArchitectureLane[];
  decisions: Decision[];
  outcome: string;
  resumeBullets: string[];
  tint: string;
};

export type SideProject = {
  id: string;
  name: string;
  context: string;
  summary: string;
  metrics: Metric[];
  stack: string[];
  link?: ExternalLink;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  mode: string;
  dates: string;
  summary: string;
  bullets: string[];
  stack: string[];
  stints?: { title: string; summary: string; metrics: Metric[] }[];
};

export type Recognition = {
  id: string;
  title: string;
  detail: string;
  project?: string;
  year: string;
  kind: "award" | "showcase" | "certification" | "sport" | "letter";
};

export const profile = {
  name: "Kartik Verma",
  headline: "Software engineer building interactive, AI-powered systems",
  tagline: "Building ideas. Creating impact.",
  description:
    "Kartik Verma is a Computer Engineering (Honours in AI & ML) student in Mumbai who builds gesture-controlled web apps, VR simulations and machine-learning systems, with real numbers behind every project.",
  location: "Mumbai, India",
  availability: "Open to software & ML internships",
  email: "kartikverma2204@gmail.com",
  intro: [
    "I'm Kartik, a Computer Engineering student at K. J. Somaiya Institute of Technology in Mumbai, specialising in AI and machine learning. I like building software people interact with physically: hands in front of a webcam, controllers in a VR lab, staff on a hospital floor.",
    "I care about owning the whole system (the interface, the API, the data model and the model behind the prediction) and about proving it works with real numbers rather than adjectives.",
  ],
  offKeyboard:
    "Away from the keyboard I play squash, and represented KJSIT and the University of Mumbai at the All India University Matches. I also play chess and badminton, and travel whenever I can.",
  links: {
    github: "https://github.com/Interior-Gardener",
    linkedin: "https://www.linkedin.com/in/kartikverma2204",
    leetcode: "https://leetcode.com/u/SUPER_VERMA/",
    coffee: "https://buymeacoffee.com/kartikverma2204",
    resumePdf: "/kartik-verma-resume.pdf",
    experienceCertificates: "https://drive.google.com/drive/folders/1nRzsFR2YOI64l5CHk0fAbBoBqdTHbZaa?usp=sharing",
    skillCertificates: "https://drive.google.com/drive/folders/1Ff6uF9Uy03du1FCA3_MS7-6T62kFYhBJ?usp=sharing",
  },
};

export const highlights: { value: string; count?: string; label: string }[] = [
  { value: "2", count: "2", label: "Competition podiums, including a national win" },
  { value: "3", count: "3", label: "Internships: JSW Steel, Claidroid, Central Railway" },
  { value: "9.04", count: "9.04", label: "CGPA, Honours in AI & ML" },
  { value: "6", count: "6", label: "Shipped projects you can explore here" },
];

export const education = {
  school: "K. J. Somaiya Institute of Technology",
  affiliation: "University of Mumbai",
  degree: "B.Tech, Computer Engineering",
  honours: "Honours in Artificial Intelligence & Machine Learning",
  dates: "May 2023 – Jul 2027",
  cgpa: "9.04",
  cgpaNote: "Average CGPA through semester VI",
  courses: [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
  ],
};

export const experience: Experience[] = [
  {
    id: "jsw",
    company: "JSW Steel",
    role: "Software Developer Intern",
    mode: "On-site",
    dates: "Jun 2025 – Jul 2025",
    summary:
      "Built the roll shop's asset-lifecycle system for a steel plant, from inventory and grinding to inspection, assembly and stand assignment.",
    bullets: [
      "Engineered a Flask + Oracle Database system spanning 16 modules and 42 REST routes to digitise the full industrial-asset lifecycle (inventory, grinding, inspection, assembly) across a 17-state roll-status workflow tracked over 12 relational tables.",
      "Built an Excel ingestion pipeline enforcing 40-column schema validation and 26 required-field checks, with transactional rollback and full audit-trail backups on every submission, plus business-rule validation (6-roll-per-stand capacity limits, duplicate-type position checks) for stand assignment.",
    ],
    stack: ["Flask", "Oracle Database", "SQL", "Pandas"],
  },
  {
    id: "claidroid",
    company: "Claidroid Technologies",
    role: "Machine Learning Intern",
    mode: "Remote · two virtual internships",
    dates: "Jun 2025 – Jul 2025 · Dec 2025 – Jan 2026",
    summary: "Two virtual internships, each shipping a complete machine-learning project from data to interface.",
    bullets: [
      "Built and deployed an NLP-based college FAQ chatbot (Flask, scikit-learn, NLTK) covering 75 intents, using WordNet-based augmentation to expand training data to 3,200+ examples; benchmarked 5 classifier families with GridSearchCV, achieving 92.7% test accuracy with a tuned Random Forest.",
      "Built a hospital readmission risk prediction system (Streamlit, XGBoost, SHAP) trained on 100K+ patient records and 13 clinical features, achieving 85.2% accuracy and 88.9% AUC-ROC, with SHAP-based explainability and an interactive analytics dashboard.",
    ],
    stack: ["scikit-learn", "NLTK", "Flask", "XGBoost", "SHAP", "Streamlit"],
    stints: [
      {
        title: "College FAQ chatbot",
        summary:
          "A 75-intent NLP classifier. WordNet synonym augmentation grew the training set to 3,200+ examples, and five classifier families were tuned with GridSearchCV.",
        metrics: [
          { value: "92.7%", label: "test accuracy" },
          { value: "75", label: "intents" },
        ],
      },
      {
        title: "Hospital readmission predictor",
        summary:
          "An XGBoost risk model trained on 100K+ patient records and 13 clinical features, explained with SHAP and wrapped in a Streamlit analytics dashboard.",
        metrics: [
          { value: "85.2%", label: "accuracy" },
          { value: "88.9%", label: "AUC-ROC" },
        ],
      },
    ],
  },
  {
    id: "central-railway",
    company: "Central Railway",
    role: "Technical Intern",
    mode: "On-site",
    dates: "Jul 2024 – Aug 2024",
    summary: "Worked alongside the engineering teams behind Mumbai's suburban EMU network.",
    bullets: [
      "Studied Mumbai's EMU railway operations, maintenance workflows, hardware infrastructure and safety protocols alongside engineering teams, building a working understanding of large-scale industrial systems.",
    ],
    stack: [],
  },
];

export const projects: Project[] = [
  {
    slug: "geoswipe",
    name: "GeoSwipe",
    shortName: "GeoSwipe",
    tagline: "A heritage-exploration globe you steer with your bare hands.",
    category: "Full-stack · Computer vision · AI",
    year: "2025–26",
    role: "Full-stack engineering, computer vision and AI integration",
    timeline: "Jul 2025 – Sep 2026",
    summary:
      "GeoSwipe puts 126 of India's heritage sites on a live 3D globe and map that you control with hand gestures through your webcam. Every monument opens a hub of live news, weather, 360° views, 3D models, quizzes and an AI guide, and friends can challenge each other to real-time quiz duels.",
    metrics: [
      { value: "126", label: "heritage sites, 36 UNESCO" },
      { value: "9", label: "external APIs integrated" },
      { value: "2 ms", label: "cached lookup, down from 8.7 s" },
      { value: "780", label: "quiz questions" },
    ],
    stack: ["React 19", "Express 5", "MongoDB", "Three.js", "MediaPipe", "Socket.IO", "MapLibre GL", "Groq"],
    award: "Runner-up, AI-Robo Festival 2026 · Exhibited at CIIA-5",
    links: {
      live: { label: "Visit live site", href: "https://geoswipe.pages.dev" },
      code: { label: "Source code", href: "https://github.com/Interior-Gardener/Geoswipe" },
      demo: { label: "Watch demo", href: "https://drive.google.com/file/d/1Lyut5of0GenXbqDONxnpip1CccRIYmYt/view?usp=drivesdk" },
    },
    problem:
      "Heritage and geography are still taught from flat maps and lists of names. Students memorise places they never get to explore, and most map apps still expect a mouse, a keyboard and patience.",
    approach:
      "Put India's heritage on a living 3D globe, then take the mouse away. Hand tracking lets you fly, zoom and select in mid-air, while an LLM guide, live news and weather give every monument context.",
    architecture: [
      {
        title: "Browser",
        nodes: [
          { name: "React 19 interface", detail: "Globe, maps, monument hubs, trip planner" },
          { name: "MediaPipe hand tracking", detail: "9 gestures · 20 FPS · fully on-device", highlight: true },
          { name: "Three.js + MapLibre GL", detail: "3D globe and satellite maps" },
        ],
      },
      {
        title: "Express 5 API",
        nodes: [
          { name: "25 REST endpoints", detail: "Rate-limited proxy; API keys never reach the browser" },
          { name: "Socket.IO duel rooms", detail: "1v1 · 4 modes · 10 rounds" },
        ],
      },
      {
        title: "Data & cache",
        nodes: [
          { name: "Two-tier cache", detail: "In-memory map, then MongoDB, with per-resource TTLs", highlight: true },
          { name: "API key pool", detail: "Rotates on 429, 401 and 403 responses" },
          { name: "MongoDB", detail: "Sites, quiz questions, flags, images, cache" },
        ],
      },
      {
        title: "External services",
        nodes: [
          { name: "Groq LLM", detail: "Heritage guide, safety assistant, trip planner" },
          { name: "Live context", detail: "OpenWeatherMap, NewsAPI, Wikipedia, Unsplash" },
          { name: "Maps & places", detail: "MapTiler, Overpass (OpenStreetMap)" },
        ],
      },
    ],
    decisions: [
      {
        title: "Moving hand tracking into the browser",
        body: "The first version streamed base64-encoded webcam frames over a WebSocket to a Python worker. I ported the gesture classifier to JavaScript and ran MediaPipe's hand landmarker directly in the browser, on the GPU with a CPU fallback, so no camera frame ever leaves the device.",
        compare: {
          before: { value: "~3.2 GB/h", label: "webcam data uploaded per user" },
          after: { value: "0 frames", label: "leave the device" },
        },
        facts: [
          "9 gesture classes",
          "20 FPS inference cap",
          "5-frame stability threshold",
          "Matched the original classifier on 20,000 generated poses with 0 mismatches",
        ],
      },
      {
        title: "A two-tier cache that stretches free API tiers",
        body: "Every visitor to the same monument should share one upstream call. Requests hit an in-memory map, then a MongoDB cache with per-resource lifetimes; concurrent misses are de-duplicated, stale answers are served when a provider fails, and a pool of API keys rotates on rate-limit or auth errors.",
        compare: {
          before: { value: "8.7 s", label: "safe-places lookup, uncached" },
          after: { value: "2 ms", label: "the same lookup, cached" },
        },
        facts: ["News cached for 12 h", "Weather cached for 4 h, shared within ~1 km", "Map styles cached for 24 h", "Safe places cached for 7 days"],
      },
      {
        title: "Real-time 1v1 quiz duels",
        body: "Two players join with a room code and race through ten rounds across four modes: flags, geography trivia, India-wide heritage and single-monument questions. Rooms live in memory, are capped and swept every minute, and each socket is rate-limited so nobody can exhaust the server.",
        facts: ["4 game modes", "10 rounds per match", "500 concurrent rooms maximum", "30 room actions per 10 seconds per socket"],
      },
    ],
    outcome:
      "Runner-up at AI-Robo Festival 2026 and exhibited at the national-level CIIA-5 innovation showcase at Nehru Science Centre, Mumbai. GeoSwipe is live on Cloudflare Pages.",
    resumeBullets: [
      "Built a full-stack heritage-exploration platform (React 19, Express 5, MongoDB, Three.js, Socket.IO) integrating 9 external REST APIs across 126 heritage sites (36 UNESCO) with 780 quiz questions, plus a Groq-hosted LLM assistant for heritage Q&A, safety guidance and structured AI trip planning.",
      "Engineered a fully client-side MediaPipe gesture-recognition pipeline (9 gesture classes at 20 FPS), validated against the original implementation across 20,000 test poses with zero mismatches, replacing a legacy server relay that cost ~3.2 GB/hour per user.",
      "Designed a two-tier (in-memory + MongoDB) caching architecture with per-resource TTLs and API-key pooling, cutting a live lookup's response time from 8.7 s to 2 ms, and built a real-time 1v1 quiz-duel mode (4 modes, 10 rounds) over Socket.IO.",
    ],
    tint: "56 189 248",
  },
  {
    slug: "atomix",
    name: "Atomix",
    shortName: "Atomix",
    tagline: "A VR chemistry lab where students can get it wrong safely, with an AI tutor that knows exactly why.",
    category: "Unity · VR · AI",
    year: "2026",
    role: "Unity engineering, simulation design and AI integration",
    timeline: "Apr 2026 – Sep 2026",
    summary:
      "Atomix is a Unity 6 chemistry laboratory for VR headsets and desktop. Students pick a reaction, pour real quantities with their own hands and see exactly what went wrong when an experiment fails, then ask an in-lab AI assistant that can read the experiment in front of them.",
    metrics: [
      { value: "8", label: "chemical reactions simulated" },
      { value: "226/226", label: "automated tests passing" },
      { value: "~40K", label: "lines of C#" },
      { value: "18", label: "assessment tasks" },
    ],
    stack: ["Unity 6", "C#", "Unity XR", "Convai API", "ShaderGraph", "NUnit"],
    award: "Winner, IET Intech 2k26 (National level)",
    links: {
      live: { label: "Play on itch.io", href: "https://kushal-s0.itch.io/atomix" },
      code: { label: "Source code", href: "https://github.com/Interior-Gardener/Atomix" },
      demo: { label: "Watch demo", href: "https://drive.google.com/file/d/1W_kMqp_5rlrAXLKSB6BcBMAyuCfBuZzr/view" },
    },
    problem:
      "Lab access is the bottleneck in chemistry education. Reagents cost money, some reactions are genuinely dangerous, and a whole class usually watches one demonstration instead of running the experiment themselves.",
    approach:
      "Rebuild the lab bench as a room students can walk into, where quantities matter and mistakes cost nothing. Pair it with an AI assistant that sees the live experiment, so a student practising alone still gets real answers.",
    architecture: [
      {
        title: "Input",
        nodes: [
          { name: "VR headset", detail: "Grab, pour and heat with Unity XR controllers" },
          { name: "Desktop fallback", detail: "Keyboard and mouse, injected at runtime" },
        ],
      },
      {
        title: "Simulation",
        nodes: [
          { name: "Free-hand reaction engine", detail: "Validates quantity, order and heating time", highlight: true },
          { name: "Experiment context", detail: "Reaction, amounts poured, targets, attempts" },
        ],
      },
      {
        title: "Learning",
        nodes: [
          { name: "AI lab assistant", detail: "Convai REST API · voice and text", highlight: true },
          { name: "Offline knowledge base", detail: "Rule-based answers from live measurements" },
          { name: "Molecular animation & graphs", detail: "Bond changes, ΔH, Ea, ΔS, ΔG" },
        ],
      },
      {
        title: "Progress",
        nodes: [
          { name: "Experiment history", detail: "Up to 300 attempts, saved as JSON" },
          { name: "Assessment mode", detail: "18 timed tasks, coin economy, exam report" },
        ],
      },
    ],
    decisions: [
      {
        title: "A reaction engine instead of a scripted sequence",
        body: "Most lab simulators march you through fixed button presses. Atomix lets students pour freely and checks what actually happened (overdose, underdose, wrong order or heating time), then explains the chemistry behind the failure instead of a generic “try again”.",
        facts: ["8 inorganic reactions", "Quantity, order and heating-time validation", "Failure explanations tied to the student's own measurements"],
      },
      {
        title: "An assistant that knows what is on the bench",
        body: "The assistant receives the live experiment state: the reaction, what was poured, the target amounts and why an attempt failed. It talks to Convai over plain REST calls with push-to-talk voice or typed questions, and falls back to an offline, rule-based knowledge base when there is no connection.",
        facts: ["Voice and text input", "Grounded in live experiment data", "Offline fallback with no network required"],
      },
      {
        title: "Learning and assessment, not just a sandbox",
        body: "After a successful reaction, students can replay it as a live 3D molecular animation or study its energy-profile and entropy graphs. A separate testing lab turns everything into timed practical and theory tasks with a coin economy and a downloadable exam report.",
        facts: [
          "3D molecular animations for all 8 reactions",
          "ΔH, Ea, ΔS and ΔG graphs",
          "18 timed practical and theory tasks with HTML and CSV exam reports",
          "226 of 226 automated tests passing",
        ],
      },
    ],
    outcome: "Won IET Intech 2k26 at the national level. Atomix is playable on itch.io.",
    resumeBullets: [
      "Built a Unity 6 (C#) VR/desktop chemistry-lab simulator (~110 scripts, ~40,000 LOC) featuring 8 simulated inorganic reactions with a custom free-hand quantity-validation engine that detects overdose, underdose, wrong-order and heating-duration errors in real time.",
      "Developed an in-lab AI chemistry assistant (Convai API, voice + text) grounded in live experiment measurements, with an offline rule-based fallback for uninterrupted use, plus live in-engine 3D molecular animations (bond breaking/forming, electron transfer) for all 8 reactions.",
      "Built a separate assessment mode with 18 timed tasks (8 practical, 10 theoretical) and a coin-economy ranking system; validated the full simulation with 226/226 passing automated tests.",
    ],
    tint: "167 139 250",
  },
  {
    slug: "hospital-ops-sync",
    name: "Hospital Operations Sync Platform",
    shortName: "Hospital Ops Sync",
    tagline: "One live view of a hospital's beds, queues and stock, with models that forecast what runs out next.",
    category: "Full-stack · Machine learning",
    year: "2026",
    role: "Full-stack engineering and machine learning",
    timeline: "Jan 2026 · hackathon build",
    summary:
      "A hospital operations platform that gives doctors, nurses, administrators and receptionists their own live dashboards (beds, OPD queues, admissions, inventory and billing) backed by machine-learning models that predict wait times, stockouts and financial risk.",
    metrics: [
      { value: "6", label: "ML models in the product" },
      { value: "33", label: "database tables" },
      { value: "4", label: "role-based dashboards" },
      { value: "11", label: "feature modules" },
    ],
    stack: ["Django REST Framework", "React", "MySQL", "scikit-learn", "JWT", "Razorpay"],
    links: {
      code: { label: "Source code", href: "https://github.com/Interior-Gardener/Hospital-Operations-Sync-Platform" },
    },
    problem:
      "Hospital staff juggle beds, queues, stock and billing across disconnected tools. Shortages and long waits are usually discovered after they have already happened, and neighbouring hospitals have no quick way to share capacity.",
    approach:
      "Put every operational signal into one platform with a dashboard for each role, then add models that look ahead: how long the next patient will wait, which medicines will run out, and where money is being lost.",
    architecture: [
      {
        title: "Clients",
        nodes: [
          { name: "React dashboards", detail: "Doctor, nurse, admin and receptionist" },
          { name: "City capacity view", detail: "Anonymised bed and ICU availability" },
        ],
      },
      {
        title: "API",
        nodes: [
          { name: "Django REST Framework", detail: "11 apps behind JWT authentication" },
          { name: "Payments", detail: "Razorpay orders, verification and webhooks" },
        ],
      },
      {
        title: "Intelligence",
        nodes: [
          { name: "6 scikit-learn models", detail: "Wait time, stockout, profit and loss", highlight: true },
          { name: "Weather demand engine", detail: "Weather + air quality → medicine demand" },
        ],
      },
      {
        title: "Data & services",
        nodes: [
          { name: "MySQL", detail: "33-table relational schema" },
          { name: "OpenWeatherMap", detail: "Current weather and AQI, cached for 1 h" },
        ],
      },
    ],
    decisions: [
      {
        title: "Predictions where they change a decision",
        body: "Instead of one showcase model, each prediction sits where staff act on it: wait-time estimates in the OPD queue, stockout risk and days-to-stockout in inventory, and profit and loss-area forecasts on the billing dashboard. The wait-time estimate falls back to a rule-based calculation if the model fails, so the queue never goes blank.",
        facts: ["OPD wait-time regression", "Stockout classification + days-to-stockout regression", "Profit and loss-area prediction", "Rule-based fallback for wait times"],
      },
      {
        title: "Weather-aware medicine demand",
        body: "Live weather and air-quality readings from OpenWeatherMap feed a rule-based engine that maps conditions to likely disease spikes and recommends stock increases, such as extra antibiotics and inhalers when respiratory infections are likely. Responses are cached for an hour, with mock data when no API key is configured.",
        facts: ["Current weather + AQI", "Condition-to-disease mapping", "Recommended stock adjustments", "1-hour response cache"],
      },
      {
        title: "One platform, four roles, real payments",
        body: "Django REST Framework serves 11 feature apps behind JWT authentication over a 33-table MySQL schema. Each role gets its own dashboard, a public city view shares anonymised bed and ICU availability across hospitals, and billing runs through Razorpay with HMAC-SHA256 signature verification on every payment.",
        facts: ["11 Django feature apps", "33-table MySQL schema", "JWT authentication and role-based dashboards", "HMAC-SHA256 verified payments"],
      },
    ],
    outcome:
      "Built end to end as a hackathon project: a working platform covering OPD queues, beds, admissions, inventory, inter-hospital sharing and billing. The full source is on GitHub.",
    resumeBullets: [
      "Engineered a full-stack hospital operations platform (Django REST Framework, React, MySQL) with 11 feature modules across a 33-table schema, serving 4 role-based dashboards (Doctor, Nurse, Admin, Receptionist) for real-time bed occupancy, OPD queue management and inter-hospital capacity sharing.",
      "Trained and deployed 6 scikit-learn models across 3 prediction domains (OPD wait-time regression, inventory stockout classification + demand-depletion regression, and billing profit/loss prediction), plus a rule-based engine linking live OpenWeatherMap/AQI data to medicine-demand forecasting.",
      "Integrated a secure Razorpay payment gateway (order creation, HMAC-SHA256 webhook signature verification) for end-to-end billing and payment confirmation.",
    ],
    tint: "52 211 153",
  },
];

export const sideProjects: SideProject[] = [
  {
    id: "readmission",
    name: "Hospital Readmission Predictor",
    context: "Claidroid Technologies",
    summary:
      "Predicts readmission risk for diabetic patients from 13 clinical features. Trained on 100K+ patient records, explained with SHAP, and wrapped in an analytics dashboard.",
    metrics: [
      { value: "85.2%", label: "accuracy" },
      { value: "88.9%", label: "AUC-ROC" },
    ],
    stack: ["XGBoost", "SHAP", "Streamlit", "Pandas"],
    link: { label: "Source code", href: "https://github.com/Interior-Gardener/Hospital-Readmission-Predictor-by-Kartik-Verma" },
  },
  {
    id: "chatbot",
    name: "College FAQ Chatbot",
    context: "Claidroid Technologies",
    summary:
      "An NLP chatbot covering 75 intents. WordNet synonym augmentation expanded the training set to 3,200+ examples, and five classifier families were tuned with GridSearchCV.",
    metrics: [
      { value: "92.7%", label: "test accuracy" },
      { value: "5", label: "model families compared" },
    ],
    stack: ["scikit-learn", "NLTK", "Flask"],
    link: { label: "Source code", href: "https://github.com/Interior-Gardener/chatbot_internship" },
  },
  {
    id: "jsw",
    name: "Roll Shop Management System",
    context: "JSW Steel",
    summary:
      "Digitises the lifecycle of steel-mill rolls, bearings and chocks across inventory, grinding, inspection, assembly and stand assignment, with validated Excel ingestion and audit trails.",
    metrics: [
      { value: "42", label: "API routes" },
      { value: "17", label: "workflow states" },
    ],
    stack: ["Flask", "Oracle Database", "Pandas"],
  },
];

export const recognition: Recognition[] = [
  { id: "iet", title: "Winner, IET Intech 2k26", detail: "National-level competition", project: "Atomix", year: "2025–26", kind: "award" },
  { id: "ciia", title: "National Innovation Showcase, CIIA-5", detail: "Nehru Science Centre, Mumbai", project: "GeoSwipe", year: "2025–26", kind: "showcase" },
  { id: "airobo", title: "Runner-up, AI-Robo Festival", detail: "Competition podium", project: "GeoSwipe", year: "2026", kind: "award" },
  { id: "aws", title: "AWS Academy Graduate", detail: "Cloud Foundations", year: "Certified", kind: "certification" },
  { id: "aiu", title: "All India University Matches, Squash", detail: "Represented KJSIT and the University of Mumbai", year: "2025–26", kind: "sport" },
  { id: "letters", title: "Letters of Appreciation", detail: "Somaiya, for CIIA-5 and AIU Squash", year: "2025–26", kind: "letter" },
];

export type Skill = { id: string; name: string; projects: string[] };

export const skillGroups: { title: string; skills: Skill[] }[] = [
  {
    title: "Languages",
    skills: [
      { id: "python", name: "Python", projects: ["hospital-ops-sync", "readmission", "chatbot", "jsw"] },
      { id: "javascript", name: "JavaScript", projects: ["geoswipe", "hospital-ops-sync"] },
      { id: "csharp", name: "C#", projects: ["atomix"] },
      { id: "sql", name: "SQL", projects: ["jsw", "hospital-ops-sync"] },
      { id: "java", name: "Java", projects: [] },
      { id: "c", name: "C", projects: [] },
    ],
  },
  {
    title: "Web",
    skills: [
      { id: "react", name: "React", projects: ["geoswipe", "hospital-ops-sync"] },
      { id: "express", name: "Node.js & Express", projects: ["geoswipe"] },
      { id: "django", name: "Django REST", projects: ["hospital-ops-sync"] },
      { id: "flask", name: "Flask", projects: ["jsw", "chatbot"] },
      { id: "socketio", name: "Socket.IO", projects: ["geoswipe"] },
      { id: "tailwind", name: "Tailwind CSS", projects: [] },
      { id: "bootstrap", name: "Bootstrap", projects: [] },
    ],
  },
  {
    title: "AI & data",
    skills: [
      { id: "sklearn", name: "scikit-learn", projects: ["hospital-ops-sync", "chatbot"] },
      { id: "xgboost", name: "XGBoost", projects: ["readmission"] },
      { id: "shap", name: "SHAP", projects: ["readmission"] },
      { id: "mediapipe", name: "MediaPipe", projects: ["geoswipe"] },
      { id: "nltk", name: "NLTK", projects: ["chatbot"] },
      { id: "pandas", name: "Pandas & NumPy", projects: ["jsw", "readmission"] },
      { id: "llm", name: "LLM APIs (Groq, Convai)", projects: ["geoswipe", "atomix"] },
      { id: "streamlit", name: "Streamlit", projects: ["readmission"] },
    ],
  },
  {
    title: "3D & XR",
    skills: [
      { id: "unity", name: "Unity 6", projects: ["atomix"] },
      { id: "unityxr", name: "Unity XR", projects: ["atomix"] },
      { id: "threejs", name: "Three.js", projects: ["geoswipe"] },
      { id: "maplibre", name: "MapLibre GL", projects: ["geoswipe"] },
    ],
  },
  {
    title: "Data & infrastructure",
    skills: [
      { id: "mongodb", name: "MongoDB", projects: ["geoswipe"] },
      { id: "mysql", name: "MySQL", projects: ["hospital-ops-sync"] },
      { id: "oracle", name: "Oracle Database", projects: ["jsw"] },
      { id: "git", name: "Git & GitHub", projects: ["geoswipe", "atomix", "hospital-ops-sync", "readmission", "chatbot", "jsw"] },
      { id: "cloudflare", name: "Cloudflare Pages", projects: ["geoswipe"] },
      { id: "aws", name: "AWS", projects: [] },
      { id: "docker", name: "Docker", projects: [] },
      { id: "redis", name: "Redis", projects: [] },
      { id: "supabase", name: "Supabase", projects: [] },
      { id: "render", name: "Render", projects: [] },
    ],
  },
];

export const resumeSkills: { label: string; items: string[] }[] = [
  { label: "Programming languages", items: ["C", "Java", "Python", "JavaScript", "C#"] },
  { label: "Frameworks & libraries", items: ["HTML5", "CSS3", "Bootstrap", "Tailwind", "React.js", "Node.js", "Express.js", "Flask", "Django"] },
  { label: "ML / data", items: ["scikit-learn", "XGBoost", "SHAP", "NLTK", "Pandas", "NumPy"] },
  { label: "Databases", items: ["MySQL", "MongoDB", "Oracle Database", "Supabase"] },
  { label: "Tools & platforms", items: ["Git", "GitHub", "Unity", "MongoDB Atlas", "Redis", "Render", "AWS", "Docker"] },
];

export const hobbies = ["Squash", "Chess", "Badminton", "Travelling"];

export const pages: { path: string; title: string }[] = [
  { path: "/", title: "Home" },
  { path: "/work/geoswipe", title: "GeoSwipe case study" },
  { path: "/work/atomix", title: "Atomix case study" },
  { path: "/work/hospital-ops-sync", title: "Hospital Operations Sync Platform case study" },
  { path: "/resume", title: "Résumé" },
];
