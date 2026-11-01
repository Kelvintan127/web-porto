/**
 * Single source of truth for personal facts.
 * Every value here traces to the CV (klveen.com/assets/Kelvin Tan CV.pdf),
 * the verified live site, or explicit instructions from Kelvin.
 * Nothing speculative goes in this file.
 */

export const profile = {
  name: "Kelvin Tan",
  title: "ERP Consultant & Software Developer",
  headline: "Connecting Business Processes with Technology",
  intro:
    "I work where business processes meet software. Currently an ERP consultant with a background in backend and full-stack development — most at home turning how a company actually operates into systems that hold up.",
  location: "Jakarta, Indonesia",
  email: "kelvintan127.kt@gmail.com",
  cvPath: "/assets/Kelvin Tan CV.pdf",
  links: {
    github: "https://github.com/kelvintan127",
    linkedin: "https://linkedin.com/in/kelvintan127",
  },
} as const;

export const about = {
  lede: "Hi, I'm Kelvin — a Computer Science graduate from BINUS University, currently working as an ERP Consultant.",
  paragraphs: [
    "My journey started in software development, where I built backend services, RESTful APIs, and full-stack web applications using C#, ASP.NET Core, Laravel, and JavaScript.",
    "Over time I became more interested in how technology supports business operations. Working with enterprise applications and ERP systems gave me a wider view of how technical solutions actually connect to real business processes.",
    "Outside of work, I spend time experimenting with web development, automation, infrastructure, and new tools.",
  ],
  facts: [
    { label: "Based in", value: "Jakarta, Indonesia" },
    { label: "Focus", value: "ERP consulting, backend development" },
    { label: "Education", value: "B.Sc. Computer Science, BINUS University (2025)" },
    { label: "Currently", value: "ERP Consultant" },
  ],
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Stack", href: "/#stack" },
  { label: "Playground", href: "/#playground" },
  { label: "Contact", href: "/#contact" },
];
