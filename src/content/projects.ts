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
  caseStudy: {
    problem: string;
    role: string;
    implementation: string;
    challenges?: string[];
    lessons?: string[];
    architecture?: { label: string; flow: string[] };
  };
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
    caseStudy: {
      problem:
        "Yayasan Khouw Kalbe administers a scholarship program through a public web system. Applicants and administrative staff need a secure system of record behind it, with data access separated by role rather than open to every caller.",
      role: "Backend developer intern at PT Kalbe Farma Tbk, building the REST API layer for the scholarship system.",
      implementation:
        "Built the ASP.NET Core backend around RESTful endpoints with JWT authentication and role-based access control, managed data persistence in PostgreSQL, and scheduled automated tasks and jobs with cron for data processing. Cloud deployment was handled on AWS.",
      architecture: {
        label: "Backend service structure",
        flow: ["Client web app", "ASP.NET Core REST API (JWT + RBAC)", "PostgreSQL", "AWS deployment with cron jobs"],
      },
    },
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
    caseStudy: {
      problem:
        "Longevitology Therapy activities at Cetiya Dhamma Manggala tracked attendance manually. Volunteers organizing sessions needed a simple web application so participant attendance was recorded consistently and could be reviewed afterwards.",
      role: "Volunteer full-stack developer, responsible for the whole Laravel application from data model to deployment on shared hosting.",
      implementation:
        "Built a Laravel web application for attendance management, storing data in MySQL integrated with the hosting provider, and implemented user authentication with role-based access control so organizers and participants saw different capabilities.",
      architecture: {
        label: "Application structure",
        flow: ["Browser", "Laravel application (auth + RBAC)", "MySQL on hosting provider"],
      },
    },
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
    caseStudy: {
      problem:
        "A POS product serving several merchants needs each merchant's products, transactions, and cashier accounts kept apart, while cashiers act only on behalf of their own store and payments settle through a gateway.",
      role: "Backend developer on the BayarCepat server, working on the Express.js API alongside the React Native and React clients.",
      implementation:
        "The backend runs on Express.js with Prisma over PostgreSQL, split into routes, controllers, services, and repositories. JWTs carry the caller's role, so merchant endpoints scope reads and writes to the owning merchant while cashier endpoints resolve the linked store. Payments go through the Midtrans client, with multer handling uploads and bcrypt hashing credentials.",
      challenges: [
        "Enforcing merchant isolation in every query rather than trusting the request body.",
        "Keeping the merchant and cashier role boundaries consistent across routes that share one transaction table.",
      ],
      lessons: [
        "Layering routes, services, and repositories made the permission rules readable in one place.",
        "Payment integrations push you toward idempotent, auditable transaction handling.",
      ],
      architecture: {
        label: "Server request path",
        flow: [
          "React Native POS / React app",
          "Express.js routes",
          "Controllers and services (JWT role checks)",
          "Prisma repositories",
          "PostgreSQL",
        ],
      },
    },
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
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion", "EmailJS"],
    contributions: ["Web development", "Responsive interface"],
    caseStudy: {
      problem:
        "Jastipfully needed a public page that explains an entrusted-service (jastip) offering without burying it in a template full of unrelated sections.",
      role: "Built the site end to end: layout, sections, and responsive behaviour.",
      implementation:
        "A Next.js 15 site with Tailwind CSS, built as static section components (carousel, ordering steps, shipping rates, testimonials, contact) rather than a CMS template, so copy and layout stay in version control. Shipping rates use country-flag data, the contact form posts through EmailJS, and Framer Motion handles the entry transitions.",
      architecture: {
        label: "Site composition",
        flow: ["Next.js app router page", "Section components", "EmailJS contact form", "Static hosting"],
      },
    },
    links: [{ label: "Live site", href: "https://jastipfully.com" }],
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
