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

export const playgroundProjects: {
  title: string;
  category: string;
  description: string;
  image: string;
  links: { label: string; href: string }[];
  technologies: string[];
}[] = [
  {
    title: "Home Server",
    category: "Self-hosted",
    description:
      "A home server running the services I use day to day: Nextcloud for my own files and sync, a stack of self-hosted tools behind a reverse proxy, and AI agents scheduled to run on their own.",
    image: "/assets/2.png",
    links: [],
    technologies: ["Linux", "Docker", "Nextcloud", "Reverse Proxy", "AI Agents"],
  },
];
