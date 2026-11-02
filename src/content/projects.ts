export type Project = {
  slug: string;
  number: string;
  title: string;
  type: string;
  year: string;
  summary: string;
  image: string;
  role: string;
  features: string[];
  technologies: string[];
  screenshots?: { src: string; alt: string }[];
  links: { label: string; href: string }[];
  tags: string[];
};

export const projects: Project[] = [
  {
    slug: "ykk-scholarship-management",
    number: "01",
    title: "YKK Scholarship Management",
    type: "Enterprise web application",
    year: "2024 — 2025",
    summary: "Backend services for a scholarship programme run by Yayasan Khouw Kalbe.",
    image: "/assets/YKK.jpeg",
    role: "Backend developer intern at PT Kalbe Farma Tbk. Built the REST API layer behind the scholarship system.",
    features: [
      "RESTful endpoints for application and administrative workflows",
      "JWT authentication with role-based access control",
      "PostgreSQL data persistence",
      "Scheduled automated tasks and jobs for data processing",
      "AWS-backed deployment",
    ],
    technologies: ["C#", "ASP.NET Core", "PostgreSQL", "AWS"],
    links: [{ label: "Visit the site", href: "https://e-ykk.yayasankhouwkalbe.org/" }],
    tags: ["Backend", "Enterprise"],
  },
  {
    slug: "longevitology-attendance",
    number: "02",
    title: "Longevitology Attendance",
    type: "Full-stack web application",
    year: "2024",
    summary: "Attendance management for Longevitology Therapy activities at Cetiya Dhamma Manggala.",
    image: "/assets/logo longevitology.jpeg",
    role: "Volunteer full-stack developer. Built the Laravel application and set up its MySQL persistence on the hosting provider.",
    features: [
      "Attendance records for therapy sessions",
      "User authentication with role-based access control",
      "MySQL persistence integrated with the hosting provider",
    ],
    technologies: ["PHP", "Laravel", "MySQL"],
    links: [{ label: "Visit the site", href: "https://csx.dhammamanggala.org" }],
    tags: ["Full-stack", "Web"],
  },
  {
    slug: "bayar-cepat",
    number: "03",
    title: "Bayar Cepat",
    type: "POS and payment application",
    year: "2025",
    summary: "Point-of-sale and payment processing backend built around a multi-merchant architecture.",
    image: "/assets/bayar-cepat.png",
    role: "Backend developer on the BayarCepat server, working alongside the React Native and React clients.",
    features: [
      "Multi-merchant architecture with per-merchant data isolation",
      "Merchant and cashier roles resolved from the JWT",
      "Midtrans payment gateway integration",
      "Routes, controllers, services, and repositories over Prisma",
      "Credential hashing with bcrypt and uploads via multer",
    ],
    technologies: ["Express.js", "Prisma", "PostgreSQL", "Midtrans", "React Native"],
    links: [{ label: "Repository", href: "https://github.com/kelvintan127/backend-bayarcepat" }],
    tags: ["Backend", "Payments"],
  },
  {
    slug: "jastipfully",
    number: "04",
    title: "Jastipfully",
    type: "Landing site",
    year: "2025",
    summary: "Marketing site for an entrusted-service (jastip) company, built as focused section components.",
    image: "/assets/jastipfully.jpg",
    role: "Built the site end to end: layout, section components, and responsive behaviour.",
    features: [
      "Section components for ordering steps, shipping rates, and testimonials",
      "Country-flag data driving the shipping rate table",
      "Contact form submitting through EmailJS",
      "Framer Motion entry transitions",
    ],
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion", "EmailJS"],
    links: [{ label: "Visit the site", href: "https://jastipfully.com" }],
    tags: ["Frontend", "Web"],
  },
];

export const featuredProjects = projects.slice(0, 3);

export const playgroundProjects = [
  {
    title: "IoT Lamp Switch",
    category: "IoT",
    description:
      "A Next.js interface and Express.js backend that drive an ESP32 running a servo motor, so a physical wall switch can be toggled from a browser instead of by hand.",
    image: "/assets/iot.png",
    links: [],
    technologies: ["Next.js", "Express.js", "ESP32", "Servo"],
  },
  {
    title: "Live Chat Room",
    category: "Real-time",
    description:
      "A full-stack chat application built on Next.js and Express.js with Socket.IO, keeping a room's messages in sync in real time and persisting them through Prisma.",
    image: "/assets/livechat.png",
    links: [{ label: "Repository", href: "https://github.com/kelvintan127/livechat" }],
    technologies: ["Next.js", "Express.js", "Socket.IO", "Prisma"],
  },
  {
    title: "iServe Attendance Automation",
    category: "Automation",
    description:
      "A Puppeteer bot on an n8n schedule that runs a repetitive attendance flow twice a day, logging in, submitting the one-time code, detecting the current status, and taking achievement and description input through a Telegram bot.",
    image: "/assets/2.png",
    links: [{ label: "Repository", href: "https://github.com/kelvintan127/auto-serve" }],
    technologies: ["Node.js", "Puppeteer", "n8n", "Docker"],
  },
];
