// Central content for the single-page portfolio.
// Keeping copy here keeps section components clean and avoids JSX-text escaping issues.

export const SITE = {
  wordmark: "jovan.work",
  name: "Jovan Tan",
  email: "jovantanwork@gmail.com",
  location: "Singapore",
  github: "https://github.com/jovantan88",
  linkedin: "https://www.linkedin.com/in/jovan-tan-a01143248/",
};

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const HERO = {
  eyebrow: "Full-stack engineering · Applied AI",
  // Rendered as masked, staggered line reveals.
  lines: ["Frontier AI,"],
  // The final line carries an italic-serif accent word for academic gravitas.
  lastLinePre: "Made ",
  lastLineAccent: "tangible.",
  subhead:
    "i'm Jovan — a developer turning complex AI and data into products people actually use. From reinforcement-learning agents to an EdTech platform serving 1,000+ users.",
  primaryCta: { label: "Get in touch", href: "#contact" },
  secondaryCta: { label: "View work", href: "#work" },
};

// Tech wordmarks for the slow marquee (monochrome, low opacity).
export const STACK = [
  "Next.js",
  "React",
  "FastAPI",
  "PyTorch",
  "TensorFlow",
  "Supabase",
  "PostgreSQL",
  "TypeScript",
  "Tailwind CSS",
  "Scikit-learn",
  "Keras",
  "Flask",
  "Pandas",
  "NumPy",
];

export const VALUE = {
  eyebrow: "What I do",
  heading: "Turning hard problems into things people actually use.",
  supporting:
    "I work across the whole stack from training models to shipping the interface around them so research-grade ideas don't get stuck in a notebook.",
};

export type Stat = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  desc: string;
};

export const STATS: Stat[] = [
  {
    value: 6,
    decimals: 0,
    suffix: "x",
    label: "Hackathon wins",
    desc: "Building fast and shipping meaningful solutions.",
  },
  {
    value: 4,
    suffix: "+",
    label: "Years building",
    desc: "From freelance sites to production AI systems.",
  },
    {
    value: 2,
    label: "internships",
    desc: "Learning from the best and building real-world systems.",
  },
  {
    value: 1,
    label: "braincell left",
    desc: "After all those long nights of coding and debugging.",
  }
];

export const CASE_STUDY = {
  eyebrow: "Featured work",
  client: "'Sup",
  headline:
    "How I architected an AI EdTech platform from zero to 2,000+ active users and a Straits Times feature.",
  body:
    "As CTO I owned the full stack Next.js, FastAPI and Supabase and led a team of eight developers shipping fast in a startup environment. It's challenging, high-velocity work, and watching the platform grow to 2,000+ users and get covered by The Straits Times has been the most rewarding thing I've built.",
  tags: ["Next.js", "FastAPI", "Supabase", "Team leadership"],
  link: {
    label: "Read the Straits Times feature",
    href: "https://www.straitstimes.com/business/young-singaporeans-build-internship-entry-level-job-trackers-to-close-opportunity-gap",
  },
};

export const QUOTE = {
  text:
    "Living is an act of self-discovery. We enter an unknown world in search for our own reflection in what we create and in the people we meet. Sometimes, others reveal parts of us we couldn't see alone.\nYou can only meet someone as deeply as you've met yourself.",
  author: "A thought I return to",
  role: "On self-discovery and connection",
};

export const ABOUT = {
  eyebrow: "About me",
  heading: "I build to learn, and learn to build better.",
  body:
    "I'm a 21-year-old developer who loves figuring out how things work. I'll be matriculating into NUS Business AI Systems, but my curiosity already takes me everywhere. From full-stack web development to the depths of reinforcement learning. I treat every project as a way to get sharper.",
  achievements: [
    {
      title: "2nd Place — IMDA Solid Pods Hackathon",
      year: "2024",
      highlight: true,
      href: "https://github.com/Solid-PODS",
    },
    {
      title: "1st Place — TRAE MiniMax Hackathon",
      year: "2026",
      highlight: true,
      href: "https://github.com/jovantan88/TRAE-Hackathon-2026-Winner",
    },
    {
      title: "3rd Place — PyCon SG 2026",
      year: "2026",
      highlight: true,
      href: "https://github.com/jovantan88/PyCon-2026-3rd",
    },
    {
      title: "5th Place (University) — GovTech AI CTF, out of 500+ teams",
      year: "2024",
      highlight: false,
      href: "https://www.tech.gov.sg/events/singapore-ai-ctf-2024/",
    },
    {
      title: "Honorable Mention — HackOMania",
      year: "2025",
      highlight: false,
      href: "https://hackomania2025.geekshacking.com/#challenges",
    },
    {
      title: "Finalist — Build for Impact",
      year: "2026",
      highlight: false,
      href: "https://github.com/jovantan88/Build-For-Impact-Hackathon-2026",
    },
  ],
};

export type SkillGroup = { title: string; items: string[] };

export const CAPABILITIES: SkillGroup[] = [
  {
    title: "Web development",
    items: [
      "React",
      "Next.js",
      "FastAPI",
      "React Native",
      "Firebase",
      "Supabase",
      "Google Cloud Platform",
      "UIUX",
      "Tailwind CSS",
    ],
  },
  {
    title: "Machine & deep learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "Keras",
      "Scikit-learn",
      "CNN",
      "Reinforcement learning",
      "Runpod",
      "Hugging Face",
    ],
  },
  {
    title: "Data & analytics",
    items: ["Pandas", "NumPy", "Plotly", "Seaborn", "Matplotlib", "Tableau", "Power BI"],
  },
];

export type Experience = {
  role: string;
  company: string;
  period: string;
  desc: string;
  skills: string[];
  link?: { label: string; href: string };
};

export const EXPERIENCES: Experience[] = [
  {
    role: "Chief Technology Officer",
    company: "'Sup (AI EdTech startup)",
    period: "Dec 2024 — Jun 2026",
    desc:
      "Architected and maintained a high-performance Next.js and FastAPI platform, growing it to 2,000+ users and a feature on The Straits Times. Led a team of eight to build and maintain the product.",
    skills: ["Next.js", "FastAPI", "Supabase", "Team leadership", "Scrum"],
  },
  {
    role: "Software Development Intern",
    company: "Industry Platform",
    period: "Mar 2024 — Jan 2025",
    desc:
      "My first deep dive into professional software. I built a registration system from scratch, automated CRM tasks with cron jobs, and shipped an AI business-card extractor.",
    skills: ["Flask", "Firebase", "Google Apps Script", "CRM automation"],
  },
  {
    role: "Freelance Programmer",
    company: "Self-employed",
    period: "May 2022 — Present",
    desc:
      "Where it all started. I help clients bring ideas to the web from initial design through to 24/7 hosting, learning to manage projects and deliver on time.",
    skills: ["Web development", "Hosting", "Client management"],
  },
];

export type Project = {
  title: string;
  category: string;
  desc: string;
  summary?: string;
  tags: string[];
  link?: string;
  code?: string;
  submission?: string;
};

export const PROJECTS: Project[] = [
  {
    title: "Seer — AI Image Detector",
    summary: "Spot AI-generated images with confidence scores and heatmaps that show where to look.",
    category: "Submission · TikTok TechJam 2026",
    desc:
      "An AI-generated image detector that pairs confidence scores with heatmaps showing where generated content may be. Built for TikTok TechJam 2026, with an interactive dashboard for exploring predictions and model robustness.",
    tags: ["Next.js", "PyTorch", "DINOv3", "Computer vision"],
    link: "https://techjam2026.glennwu.com/",
    code: "https://github.com/wuglenn/tiktok-techjam-2026",
    submission: "https://devpost.com/software/seer-ai-image-detector",
  },
  {
    title: "Showrunner",
    summary: "Turn a product URL into a narrated demo video, with AI planning, recording, and editing.",
    category: "Hackathon · Daytona 2026",
    desc:
      "Turn a product URL into a demo video. An AI crew plans the scenes, records the product in a Daytona sandbox, and edits the footage into an MP4 with voiceover, captions, and camera zooms.",
    tags: ["Next.js", "Daytona", "Playwright", "HyperFrames"],
    code: "https://github.com/jovantan88/daytona-hackathon-2026",
  },
  {
    title: "SIMS — Society Simulator",
    summary: "Explore how different audiences might react to an idea with AI personas and a virtual society.",
    category: "Hackathon · OpenAI Codex 2026",
    desc:
      "A virtual focus group for exploring how different audiences might react to a public statement or idea. Research, persona, and simulation agents work together to model responses, with an interactive society graph and comparisons between runs.",
    tags: ["Next.js", "FastAPI", "AI agents", "Simulation"],
    code: "https://github.com/jovantan88/codex-hackathon-2026",
  },
  {
    title: "Career Snapshot SG",
    summary: "Explore career paths, discover skill gaps, and find SkillsFuture upskilling opportunities.",
    category: "Hackathon · PyCon SG 2026",
    desc:
      "Find your next career move, starting with the skills you already have. Explore related roles, spot the gaps to work on, and identify opportunities for government-funded upskilling — all in a personal career snapshot and interactive map of Singapore's SkillsFuture data.",
    tags: ["Career exploration", "SkillsFuture"],
    code: "https://github.com/jovantan88/PyCon-2026-3rd",
  },
  {
    title: "COCO — Your AI Wardrobe",
    summary: "Digitise your wardrobe, try outfits on a virtual you, and get styling ideas for your next trip.",
    category: "Hackathon · TRAE 2026",
    desc:
      "A little less 'nothing to wear.' Turn the clothes you own into a digital closet, mix pieces, and preview outfits on a virtual version of yourself. Save your favourite looks, share them with friends, or get outfit ideas for your next trip based on the weather and local style.",
    tags: ["Virtual try-on", "Personal styling"],
    code: "https://github.com/jovantan88/TRAE-Hackathon-2026-Winner",
  },
  {
    title: "HackOMania",
    summary: "An extension and app that bring event maps and collaborative chats into Reddit communities.",
    category: "Hackathon · Honorable Mention",
    desc:
      "A web extension and app that dynamically injects event maps into subreddits, with GitHub auth and collaborative chat.",
    tags: ["Web extension", "Next.js"],
    link: "https://hack-o-mania-ongod.vercel.app/",
    code: "https://github.com/jovantan88/HackOMania-Ongod",
  },
  {
    title: "Solid Pods Hackathon",
    category: "Hackathon · 2nd Place",
    desc:
      "Explored decentralized data solutions built on Solid Pods, taking 2nd place in a fast, competitive build environment.",
    tags: ["Decentralized web", "Solid Pods"],
    code: "https://github.com/Solid-PODS",
  },
  {
    title: "AI CTF",
    category: "Cybersecurity · AI",
    desc:
      "5th place (University category) in GovTech's AI Capture The Flag, out of 500+ teams — adversarial problem-solving at the intersection of AI and security.",
    tags: ["AI", "Security", "CTF"],
  },
  {
    title: "Vegetable Prediction",
    category: "Deep learning",
    desc:
      "A full-stack image classifier reaching 99.4% accuracy with a custom CNN trained across 15 vegetable classes.",
    tags: ["Deep learning", "CNN", "Full stack"],
    link: "https://veggie-128d.onrender.com/",
    code: "https://gitlab.com/kyourandesu1/vegetable-prediction",
  },
  {
    title: "GAN Project",
    category: "Deep learning",
    desc: "Generating images with several GAN architectures trained on the CIFAR-10 dataset.",
    tags: ["Deep learning", "GAN"],
    code: "https://github.com/jovantan88/Deep-Learning-School",
  },
];

// Real associations — competitions and organisations Jovan has placed in or worked with.
export const RECOGNITION = {
  eyebrow: "Recognized through",
  orgs: ["GovTech AI CTF", "IMDA Solid Pods", "Kaggle", "HackOMania"],
};

export const FINAL_CTA = {
  heading: "Ready to build something?",
  supporting:
    "I'm always open to new projects, hackathons, and collaborations. If you have an idea or a challenge, let's connect and make it happen.",
};
