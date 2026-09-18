import type { ImageMetadata } from "astro";

import geo01 from "../assets/work/geoswipe/01.png";
import geo02 from "../assets/work/geoswipe/02.png";
import geo03 from "../assets/work/geoswipe/03.png";
import geo04 from "../assets/work/geoswipe/04.png";
import geo05 from "../assets/work/geoswipe/05.png";
import geo06 from "../assets/work/geoswipe/06.png";
import atomix01 from "../assets/work/atomix/01.png";
import atomix02 from "../assets/work/atomix/02.png";
import atomix03 from "../assets/work/atomix/03.png";
import atomix04 from "../assets/work/atomix/04.png";
import atomix05 from "../assets/work/atomix/05.png";
import atomix06 from "../assets/work/atomix/06.png";
import atomix07 from "../assets/work/atomix/07.png";
import atomix08 from "../assets/work/atomix/08.png";
import vanaspati01 from "../assets/work/vanaspati/01.jpg";
import vanaspati02 from "../assets/work/vanaspati/02.jpg";
import vanaspati03 from "../assets/work/vanaspati/03.jpg";
import vanaspati04 from "../assets/work/vanaspati/04.jpg";
import vanaspati05 from "../assets/work/vanaspati/05.jpg";
import vanaspati06 from "../assets/work/vanaspati/06.jpg";
import vanaspati07 from "../assets/work/vanaspati/07.jpg";
import vanaspati08 from "../assets/work/vanaspati/08.jpg";
import hospital01 from "../assets/work/hospital/01.png";
import hospital02 from "../assets/work/hospital/02.png";
import hospital04 from "../assets/work/hospital/04.png";
import hospital07 from "../assets/work/hospital/07.png";
import hospital08 from "../assets/work/hospital/08.png";
import hospital11 from "../assets/work/hospital/11.png";
import hospital13 from "../assets/work/hospital/13.png";

import desk from "../assets/photos/kartik-desk.jpg";
import avatar from "../assets/photos/kartik-avatar.png";
import medallion from "../assets/photos/kartik-medallion.png";
import summit from "../assets/photos/kartik-summit-2.jpeg";
import atJsw from "../assets/photos/kartik-at-jsw.jpeg";
import jswTeam from "../assets/photos/jsw-team.jpg";
import ciia from "../assets/photos/ciia-5-geoswipe-booth.jpg";

import jswLogo from "../assets/logos/jsw.jpg";
import railwayLogo from "../assets/logos/central-railway.jpg";
import somaiyaLogo from "../assets/logos/somaiya.jpg";

export type Shot = { src: ImageMetadata; alt: string; caption: string };

export const workMedia: Record<string, { cover: Shot; gallery: Shot[] }> = {
  geoswipe: {
    cover: {
      src: geo01,
      alt: "GeoSwipe's 3D globe running a geography quiz, with the gesture-control legend on screen",
      caption: "Gesture-controlled globe running a live geography quiz",
    },
    gallery: [
      {
        src: geo02,
        alt: "Heritage sites across Maharashtra plotted on a satellite map, with the multiplayer quiz, All India quiz, storybook and safety navigator dock",
        caption: "Heritage map with the feature dock: quizzes, storybook and safety navigator",
      },
      {
        src: geo05,
        alt: "Ajanta Caves selected on the map, with its UNESCO status and monument hub panel",
        caption: "Monument hub for Ajanta Caves, a UNESCO World Heritage Site",
      },
      {
        src: geo06,
        alt: "Gateway of India selected on the Mumbai map with its monument hub open",
        caption: "Gateway of India on the Mumbai map",
      },
      {
        src: geo03,
        alt: "An explorable 3D model of the Gateway of India with numbered annotations",
        caption: "Explorable, annotated 3D model of the monument",
      },
      {
        src: geo04,
        alt: "A 360-degree Street View of the Taj Mahal opened inside GeoSwipe",
        caption: "360° Street View of the Taj Mahal",
      },
    ],
  },
  atomix: {
    cover: {
      src: atomix03,
      alt: "Atomix's molecular animation of calcium oxide reacting with water, with pause, replay, 3D view and Ask AI controls",
      caption: "Live molecular animation of calcium oxide reacting with water",
    },
    gallery: [
      {
        src: atomix04,
        alt: "The reaction book and the interactive periodic table open in the Atomix lab",
        caption: "Reaction book and periodic table, open in the lab",
      },
      {
        src: atomix05,
        alt: "Energy profile graph for calcium oxide and water showing a 46 kJ/mol activation energy and a −65.2 kJ/mol enthalpy change",
        caption: "Energy profile: Ea = 46 kJ/mol, ΔH = −65.2 kJ/mol",
      },
      {
        src: atomix02,
        alt: "A successful calcium oxide and water reaction, with the lab assistant suggesting a litmus test",
        caption: "Reaction success, with the assistant suggesting the next step",
      },
      {
        src: atomix07,
        alt: "The Atomix lab with the AI lab assistant character standing beside the bench",
        caption: "The AI lab assistant, ready for voice or text questions",
      },
      {
        src: atomix06,
        alt: "Interactive periodic table highlighting iridium and listing the elements on the bench",
        caption: "Interactive periodic table that knows what's on the bench",
      },
      {
        src: atomix08,
        alt: "Assessment mode with a countdown timer, reagent readouts, a coin balance and the Apprentice rank",
        caption: "Assessment mode: timer, coins and rank",
      },
      {
        src: atomix01,
        alt: "The lab assistant explaining how to decompose iron sulfate by lighting the Bunsen burner",
        caption: "Step-by-step guidance for decomposing iron sulfate",
      },
    ],
  },
  vanaspati: {
    cover: {
      src: vanaspati01,
      alt: "Aerial view of the Vanaspatyam replica at dusk: ranks of brick-kerbed beds with white label boards either side of a central spine, a lily pond at the far end and transmission pylons overhead",
      caption: "Vanaspatyam, my college’s Ayurvedic garden, rebuilt from its plan",
    },
    gallery: [
      {
        src: vanaspati02,
        alt: "A bed’s printed plant card for Nityakalyani (Catharanthus roseus) with Marathi and Hindi names, Ayurvedic properties and two photographs",
        caption: "Hover a bed’s board and its printed plant card opens",
      },
      {
        src: vanaspati03,
        alt: "The procedurally generated learning garden at dusk, with six themed circular beds around a fountain",
        caption: "The learning garden: six beds arranged by what the plants treat",
      },
      {
        src: vanaspati04,
        alt: "The gateway page offering two doors: the Vanaspati learning garden and the Vanaspatyam replica of a real garden in Mumbai",
        caption: "Two gardens, the same plants",
      },
      {
        src: vanaspati07,
        alt: "A narrated guided tour stopping at tulsi, with the camera framing the plant and the tour card below",
        caption: "Narrated, camera-led guided tours",
      },
      {
        src: vanaspati06,
        alt: "A quiz question asking the visitor to click the correct plant in the 3D garden",
        caption: "A quiz you answer by clicking the plant in 3D",
      },
      {
        src: vanaspati05,
        alt: "The atlas constellation linking every plant to the complaints it treats",
        caption: "The atlas: every plant linked to what it treats",
      },
      {
        src: vanaspati08,
        alt: "The compendium of 30 medicinal plants in dark mode, with generated specimen plates beside photographs",
        caption: "30 plants, each with a generated specimen plate",
      },
    ],
  },
  "hospital-ops-sync": {
    cover: {
      src: hospital01,
      alt: "Admin dashboard showing total and available beds, OPD patients, active admissions and low-stock alerts",
      caption: "Real-time hospital operations dashboard",
    },
    gallery: [
      {
        src: hospital08,
        alt: "Inventory view with ML stock predictions flagging items that need reordering soon, with days left and risk scores",
        caption: "ML stock predictions with days left and risk scores",
      },
      {
        src: hospital04,
        alt: "ML wait-time prediction of 78 minutes for the OPD queue, with confidence, queue status and factors considered",
        caption: "OPD wait-time prediction with the factors behind it",
      },
      {
        src: hospital11,
        alt: "Recommended stock increases for respiratory-infection medicines driven by weather conditions",
        caption: "Weather-aware medicine demand recommendations",
      },
      {
        src: hospital13,
        alt: "Receptionist dashboard with billing totals, predicted profit and a loss-area risk indicator",
        caption: "Billing dashboard with profit and loss prediction",
      },
      {
        src: hospital07,
        alt: "Bed management grid showing available and under-maintenance beds by department",
        caption: "Bed management across departments",
      },
      {
        src: hospital02,
        alt: "Appointments management screen with pending approvals and today's appointments",
        caption: "Appointment approvals",
      },
    ],
  },
};

export const photos = {
  desk: {
    src: desk,
    alt: "Illustrated portrait of Kartik at his desk, smiling with his chin on his hand beside a laptop, books and a One Piece figure",
    caption: "",
  },
  avatar: { src: avatar, alt: "Kartik Verma", caption: "" },
  medallion: { src: medallion, alt: "Illustrated portrait of Kartik at his desk", caption: "" },
  summit: { src: summit, alt: "Kartik smiling on a hilltop with mountains behind him", caption: "Off the keyboard" },
  atJsw: {
    src: atJsw,
    alt: "Kartik reviewing Flask code for the roll shop system at his desk at JSW Steel",
    caption: "Building the roll shop system at JSW Steel",
  },
  jswTeam: {
    src: jswTeam,
    alt: "Kartik with fellow interns and engineers outside the JSW Steel office",
    caption: "Summer 2025 at JSW Steel",
  },
  ciia: {
    src: ciia,
    alt: "The GeoSwipe booth at the CIIA-5 national innovation showcase at Nehru Science Centre, Mumbai",
    caption: "GeoSwipe at CIIA-5, Nehru Science Centre, Mumbai",
  },
};

export const logos: Record<string, ImageMetadata> = {
  jsw: jswLogo,
  "central-railway": railwayLogo,
  somaiya: somaiyaLogo,
};
