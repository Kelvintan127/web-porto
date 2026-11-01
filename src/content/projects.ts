export type Project = {
  slug: string;
  number: string;
  title: string;
  type: string;
  year: string;
  summary: string;
  description: string;
  image: string;
  technologies: string[];
  contributions: string[];
  links: { label: string; href: string }[];
  tags: string[];
};

export const projects: Project[] = [
  {
    slug: "ykk-scholarship-management",
    number: "01",
    title: "YKK Scholarship Management System",
    type: "Backend / Enterprise Web Application",
    year: "2024 — 2025",
    summary: "Backend services supporting scholarship management processes for Yayasan Khouw Kalbe.",
    description:
      "A scholarship system backed by RESTful services for application and administrative workflows. The implementation used C#, ASP.NET Core, PostgreSQL, and AWS.",
    image: "/assets/YKK.jpeg",
    technologies: ["C#", "ASP.NET Core", "PostgreSQL", "AWS"],
    contributions: [
      "RESTful API development",
      "JWT authentication",
      "Role-based access control",
      "Database persistence",
      "Backend development practices",
    ],
    links: [
      { label: "Visit project", href: "https://e-ykk.yayasankhouwkalbe.org/" },
    ],
    tags: ["Backend", "Enterprise"],
  },
  {
    slug: "longevitology-attendance",
    number: "02",
    title: "Longevitology Attendance System",
    type: "Full-Stack Web Application",
    year: "2024",
    summary: "Attendance management application for Longevitology Therapy activities.",
    description:
      "A Laravel web application built to support attendance management. It used PHP, Laravel, and MySQL, with authenticated access and role-based permissions.",
    image: "/assets/logo longevitology.jpeg",
    technologies: ["PHP", "Laravel", "MySQL"],
    contributions: [
      "Web application development",
      "MySQL integration",
      "User authentication",
      "Role-based access control",
    ],
    links: [
      { label: "Visit project", href: "https://csx.dhammamanggala.org" },
    ],
    tags: ["Full-stack", "Web"],
  },
  {
    slug: "bayar-cepat",
    number: "03",
    title: "Bayar Cepat",
    type: "POS / Payment Application",
    year: "2025",
    summary: "Point-of-sale and payment processing application with multi-merchant architecture.",
    description:
      "A payment application using React Native, Express.js, and React, with Midtrans gateway integration and a multi-merchant architecture described in the project brief.",
    image: "/assets/bayar-cepat.png",
    technologies: ["React Native", "Express.js", "React", "Midtrans"],
    contributions: [
      "Backend server development",
      "POS application work",
      "Payment gateway integration",
      "Multi-merchant architecture",
    ],
    links: [
      { label: "Repository", href: "https://github.com/kelvintan127/backend-bayarcepat" },
    ],
    tags: ["Full-stack", "Payments"],
  },
  {
    slug: "jastipfully",
    number: "04",
    title: "Jastipfully",
    type: "Landing Page",
    year: "2025",
    summary: "A landing page for an entrusted-service company.",
    description:
      "A focused web project for presenting Jastipfully's service. The public site is built with Next.js and Tailwind CSS.",
    image: "/assets/jastipfully.jpg",
    technologies: ["Next.js", "Tailwind CSS"],
    contributions: ["Web development", "Responsive interface"],
    links: [{ label: "Live site", href: "https://jastipfully.com" }],
    tags: ["Frontend", "Web"],
  },
];

export const featuredProjects = projects.slice(0, 3);
export const playgroundProjects = [
  {
    title: "IoT Lamp Switch",
    category: "IoT",
    description: "A Next.js interface and Express.js backend that trigger an ESP32 and servo motor to control a physical lamp switch.",
    image: "/assets/iot.png",
    links: [
      { label: "Live demo", href: "#" },
      { label: "GitHub", href: "https://github.com/kelvintan127" },
    ],
    technologies: ["Next.js", "Express.js", "ESP32"],
  },
  {
    title: "Live Chat Room",
    category: "Backend",
    description: "A full-stack chat application using Next.js, Express.js, and WebSockets for real-time messaging.",
    image: "/assets/livechat.png",
    links: [{ label: "GitHub", href: "https://github.com/kelvintan127/livechat" }],
    technologies: ["Next.js", "Express.js", "WebSockets"],
  },
  {
    title: "Small systems, useful experiments",
    category: "Exploration",
    description: "A space for web development, automation, infrastructure, and new technology experiments. Public details stay limited to what can be verified.",
    image: "/assets/2.png",
    links: [{ label: "GitHub profile", href: "https://github.com/kelvintan127" }],
    technologies: ["Automation", "Infrastructure", "Web"],
  },
];
