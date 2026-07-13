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
    "I'm Jovan — a developer turning complex AI and data into products people actually use. From reinforcement-learning agents to an EdTech platform serving 1,000+ users.",
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
    value: 2000,
    suffix: "+",
    label: "Active users",
    desc: "On the EdTech platform I architected and now lead.",
  },
  {
    value: 8,
    label: "Engineers led",
    desc: "Coordinating the team building 'Sup's product stack.",
  },
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
];

export const CASE_STUDY = {
  eyebrow: "Featured work",
  client: "'Sup",
  headline:
    "How I architected an AI EdTech platform from zero to 2,000+ active users and a Straits Times feature.",
  body:
    "As CTO I owned the full stack Next.js, FastAPI and Supabase and led a team of eight developers shipping fast in a startup environment. It's challenging, high-velocity work, and watching the platform grow to 2,000+ users and get covered by The Straits Times has been the most rewarding thing I've built.",
  tags: ["Next.js", "FastAPI", "Supabase", "Team leadership"],
  link: { label: "Visit supcareer.app", href: "https://www.supcareer.app" },
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
    { title: "2nd Place — IMDA Solid Pods Hackathon", year: "2024", highlight: true },
    { title: "1st Place — TRAE MiniMax Hackathon", year: "2026", highlight: true },
    { title: "3rd Place — PyCon SG 2026", year: "2026", highlight: true },
    { title: "5th Place (University) — GovTech AI CTF, out of 500+ teams", year: "2024", highlight: false },
    { title: "Honorable Mention — HackOMania", year: "2025", highlight: false },
    { title: "Finalist — Build for Impact", year: "2026", highlight: false },
  ],
};

export type SkillGroup = { title: string; items: string[] };

export const CAPABILITIES: SkillGroup[] = [
  {
    title: "Web development",
    items: [
      "React",
      "Next.js",
      "Flask",
      "FastAPI",
      "Tailwind CSS",
      "Firebase",
      "Supabase",
      "PostgreSQL",
      "MySQL",
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
      "RNN",
      "GAN",
      "DQN",
      "RAG",
      "AutoML",
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
    link: { label: "supcareer.app", href: "https://www.supcareer.app" },
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
      "Where it all started. I help clients bring ideas to the web — from initial design through to 24/7 hosting — learning to manage projects and deliver on time.",
    skills: ["Web development", "Hosting", "Client management"],
  },
];

export type Project = {
  title: string;
  category: string;
  desc: string;
  tags: string[];
  link?: string;
  code?: string;
};

export const PROJECTS: Project[] = [
  {
    title: "SG Career Snapshot",
    category: "Hackathon · PyCon SG 2026",
    desc:
      "Pick a job and get one dashboard showing the roles you can reach, the skills slipping under you, and the single government-funded move worth making — built on Singapore's SkillsFuture Skills Framework dataset with a Next.js, FastAPI and Supabase stack.",
    tags: ["Next.js", "FastAPI", "Supabase", "ML"],
    code: "https://github.com/jovantan88/pycon-2026",
  },
  {
    title: "Digital Wardrobe App",
    category: "Hackathon · TRAE 2026",
    desc:
      "A digital wardrobe app for cataloging clothes and planning outfits, built at the 2026 TRAE hackathon.",
    tags: ["Web app", "Hackathon"],
    code: "https://github.com/jovantan88/TRAE-Hackathon-2026",
  },
  {
    title: "Personal Book Reader",
    category: "Full-stack web app",
    desc:
      "A clean, ad-free reading platform that extracts text from PDFs, Word docs and EPUBs, with natural-sounding AI text-to-speech via Kokoro and Piper.",
    tags: ["Next.js", "Firebase", "AI TTS"],
    link: "https://book-app--pbook-c9fc1.asia-southeast1.hosted.app/",
  },
  {
    title: "HackOMania",
    category: "Hackathon · Honorable Mention",
    desc:
      "A web extension and app that dynamically injects event maps into subreddits, with GitHub auth and collaborative chat.",
    tags: ["Web extension", "Next.js"],
    link: "https://hack-o-mania-ongod.vercel.app/",
    code: "https://github.com/jovantan88/HackOMania-Ongod",
  },
  {
    title: "Kaggle Competitions",
    category: "Machine learning",
    desc:
      "Multiple competition finishes — three 3rd places and two 4th places — applying advanced ML to complex, real-world data challenges.",
    tags: ["Machine learning", "Data science"],
    link: "https://www.kaggle.com/",
    code: "https://github.com/jovantan88",
  },
  {
    title: "Solid Pods Hackathon",
    category: "Hackathon · 2nd Place",
    desc:
      "Explored decentralized data solutions built on Solid Pods, taking 2nd place in a fast, competitive build environment.",
    tags: ["Decentralized web", "Solid Pods"],
    code: "https://github.com/jovantan88",
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
    title: "Car Price Prediction",
    category: "Machine learning",
    desc: "A web app that predicts a car's price from its features, deployed end-to-end.",
    tags: ["Machine learning", "Full stack"],
    link: "https://devops-ca1-jovan-tan.onrender.com/",
    code: "https://gitlab.com/devops-ml-jovan/car-price-prediction",
  },
  {
    title: "Disability Awareness",
    category: "Web development",
    desc:
      "An in-depth site raising awareness of learning disabilities and how to support those who have them.",
    tags: ["Web development", "Accessibility"],
    link: "https://jovantan88.github.io/learning-disability-website/",
    code: "https://github.com/jovantan88/learning-disability-website",
  },
  {
    title: "GAN Project",
    category: "Deep learning",
    desc: "Generating images with several GAN architectures trained on the CIFAR-10 dataset.",
    tags: ["Deep learning", "GAN"],
    code: "https://github.com/jovantan88/Deep-Learning-School",
  },
  {
    title: "Gymnasium RL",
    category: "Reinforcement learning",
    desc: "Working through as many Gymnasium environments as possible to learn RL hands-on.",
    tags: ["Reinforcement learning"],
    code: "https://github.com/jovantan88",
  },
  {
    title: "RL Networks",
    category: "Reinforcement learning",
    desc: "Comparing many network architectures to solve the Pendulum control environment.",
    tags: ["Reinforcement learning"],
    code: "https://github.com/jovantan88",
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
