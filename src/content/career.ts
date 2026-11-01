export const experience = [
  {
    role: "ERP Consultant",
    company: "Current role",
    period: "Current",
    location: "",
    description: "Working as an ERP Consultant, connecting business processes with enterprise technology.",
    details: [],
    current: true,
  },
  {
    role: "SAP Consultant",
    company: "PT Astra International Tbk",
    period: "December 2025 — September 2026",
    location: "",
    description: "Supported SAP application rollout and implementation activities.",
    details: ["Application rollout support", "SAP implementation support"],
    current: false,
  },
  {
    role: "Backend Developer Intern",
    company: "PT Kalbe Farma Tbk",
    period: "February 2024 — February 2025",
    location: "",
    description: "Developed backend services for a scholarship system using C#, ASP.NET, PostgreSQL, and AWS-related implementation.",
    details: [
      "Scheduled automated tasks and jobs",
      "Worked on backend optimization and reliability",
    ],
    current: false,
  },
  {
    role: "Full Stack Developer (Volunteer)",
    company: "Cetiya Dhamma Manggala",
    period: "June 2024 — September 2024",
    location: "",
    description: "Developed a Laravel attendance application for Longevitology Therapy activities.",
    details: ["MySQL data persistence", "Authentication and role-based access control"],
    current: false,
  },
  {
    role: "Full Stack Developer",
    company: "BINUS University",
    period: "February 2023 — June 2023",
    location: "",
    description: "Developed an ASP.NET web application for a software design patterns course.",
    details: [],
    current: false,
  },
] as const;

export const skillGroups = [
  {
    category: "Languages",
    skills: ["C#", "C++", "C", "Java", "Python", "JavaScript", "TypeScript"],
    projectSlugs: ["ykk-scholarship-management", "longevitology-attendance", "bayar-cepat"],
  },
  {
    category: "Backend",
    skills: ["ASP.NET Core", "REST APIs", "WebSocket", "Laravel", "Express.js"],
    projectSlugs: ["ykk-scholarship-management", "longevitology-attendance", "bayar-cepat"],
  },
  {
    category: "Frontend",
    skills: ["React", "React Native", "Next.js", "HTML", "CSS", "JavaScript", "TypeScript"],
    projectSlugs: ["bayar-cepat", "jastipfully"],
  },
  {
    category: "Databases",
    skills: ["PostgreSQL", "MySQL", "MongoDB"],
    projectSlugs: ["ykk-scholarship-management", "longevitology-attendance"],
  },
  {
    category: "Tools & Infrastructure",
    skills: ["Git", "Docker", "Linux", "CI/CD", "Visual Studio Code", "AWS"],
    projectSlugs: ["ykk-scholarship-management"],
  },
  {
    category: "ERP & Enterprise",
    skills: ["SAP S/4HANA", "SAP MM", "SAP SD", "Enterprise applications"],
    projectSlugs: [],
  },
  {
    category: "Concepts",
    skills: ["Authentication", "JWT", "OAuth2", "System architecture", "Performance optimization", "Distributed systems"],
    projectSlugs: ["ykk-scholarship-management", "longevitology-attendance"],
  },
] as const;
