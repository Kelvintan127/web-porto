import {
  ServerIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  WrenchIcon,
  CpuChipIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export const gpaProgression = [
  { semester: 1, gpa: 3.73 },
  { semester: 2, gpa: 3.50 },
  { semester: 3, gpa: 2.83 },
  { semester: 4, gpa: 3.32 },
  { semester: 5, gpa: 2.33 },
  { semester: 6, gpa: 3.94 },
  { semester: 7, gpa: 3.89 },
];

export const activities = [
  {
    title: "First Year Program B2025 #AppliedManagementSkills #Collaboration",
    date: "Jun 2021 - Sep 2021",
    organization: "Student Development Center"
  },
  {
    title: "FEP Binusian 2025 - Orientation & Transition Program",
    date: "Aug 23-28, 2021",
    organization: "Student Development Center"
  },
  {
    title: "Excellence Program B2025 #AMS #Collaboration",
    date: "Sep 2021 - Jul 2022",
    organization: "Student Support Office @Kemanggisan"
  },
  {
    title: "Opening Binus Festival Semester Ganjil 2021/2022",
    date: "Dec 9, 2021",
    organization: "SCAC Binus University"
  },
  {
    title: "CEAFO 2022: The Potential of NFT, Cryptocurrency and the Blockchain Technology Behind It",
    date: "Dec 21, 2021",
    organization: "HIMTEK"
  },
  {
    title: "DV SOS 2023 \"Stop Judge Deaf People\" ",
    date: "Mei - Jul, 2022",
    organization: "KMBD Binus University"
  },
  {
    title: "Seminar Nasional Sumpah Pemuda: Peran Agama Membangun Bangsa",
    date: "Oct, 2023",
    organization: "Collaboration of 6 Religious Organization Binus University"
  }
];

export const courses = [
  { code: "COMP604700", name: "Algorithm and Programming", grade: "A" },
  { code: "COMP604800", name: "Data Structures", grade: "A" },
  { code: "COMP604900", name: "Algorithm Design and Analysis", grade: "A" },
  { code: "COMP682000", name: "Object Oriented Programming", grade: "A" },
  { code: "COMP610000", name: "Software Engineering", grade: "A" },
  { code: "COMP611500", name: "Object Oriented Analysis & Design", grade: "A" },
  { code: "COMP622600", name: "Competitive Programming", grade: "A" },
  { code: "COMP679900", name: "Database Technology", grade: "A" },
  { code: "COMP612200", name: "Framework Layer Architecture", grade: "A" },
  { code: "MATH618300", name: "Scientific Computing", grade: "A" },
  { code: "COMP680000", name: "Human and Computer Interaction", grade: "B+" },
  { code: "MATH603100", name: "Calculus", grade: "A-" },
  { code: "COMP679800", name: "Program Design Methods", grade: "A" },
  { code: "STAT617100", name: "Basic Statistics", grade: "B" },
  { code: "MATH603000", name: "Linear Algebra", grade: "B+" },
  { code: "MATH602500", name: "Discrete Mathematics", grade: "A-" },
  { code: "ENGL613100", name: "English for Written Business Communication", grade: "A" },
  { code: "ENTR651100", name: "Entrepreneurship: Market Validation", grade: "A-" },
  { code: "CHAR601500", name: "Character Building: Agama", grade: "A-" },
  { code: "CHAR601400", name: "Character Building: Kewarganegaraan", grade: "A-" },
  { code: "ENTR650900", name: "Entrepreneurship: Ideation", grade: "A-" },
  { code: "CPEN624700", name: "Computer Networks", grade: "B+" },
  { code: "CHAR601300", name: "Character Building: Pancasila", grade: "B+" },
  { code: "COMP606500", name: "Artificial Intelligence", grade: "A-" },
  { code: "COMP611400", name: "Pattern Software Design", grade: "A" },
  { code: "COMP610600", name: "Code Reengineering", grade: "A" },
  { code: "COMP610700", name: "Agile Software Development", grade: "B" },
  { code: "COMP676200", name: "Information Technology Practice in Industrial Experience", grade: "A" },
  { code: "COMP651400", name: "EES in Information Technology Industry", grade: "A" },
  { code: "COMP642600", name: "Industrial Experience in Information Technology", grade: "A" },
  { code: "COMP674700", name: "Pre-Thesis", grade: "A" },
  { code: "COMP669700", name: "Operating System", grade: "B-" },
  { code: "COMP606200", name: "Compilation Techniques", grade: "A" },
  { code: "COMP669600", name: "Research Methodology in Computer Science", grade: "A" },
  { code: "SCIE606200", name: "Computational Biology", grade: "A" },
  { code: "SCIE606300", name: "Computational Physics", grade: "A" },
  { code: "LANG602700", name: "Indonesian", grade: "A-" }
];

export const experiences = [
  {
    title: "Backend Developer Intern",
    company: "PT. Kalbe Farma Tbk",
    period: "February 2024 - February 2025",
    description: [
      "Developing backend services for a social organization that provides a scholarship system",
      "Implementing the services using C# and the ASP.NET framework.",
      "Managing data persistence with PostgreSQL database system",
      "Implementing cloud solutions on AWS for scalable application deployment",
      "Scheduling automated tasks and jobs using Cron Jobs for efficient data processing",
      "Optimizing performance and ensuring system reliability through best practices"
    ]
  },
  {
    title: "Full Stack Developer",
    company: "Bina Nusantara University",
    period: "February 2023 - June 2023",
    description: [
      "Developed an ASP.NET web application for pattern software design course."
    ]
  },
  {
    title: "Full Stack Developer",
    company: "Cetiya Dhamma Manggala",
    period: "June 2024 - September 2024",
    description: [
      "Volunteered to develop a Laravel web application for an attendance system for Longevitology Therapy.",
      "Managed data persistence with MySQL database systems integrated with the hosting provider.",
      "Implemented user authentication using RBAC (Role Based Access Control)."
    ]
  },
]

export const projects = [
  {
    title: "YKK",
    description: [
      "ASP.Net Backend for a Scholarship system from Yayasan Khouw Kalbe.",
      "Developed secure, scalable APIs with role-based access control (RBAC).",
      "Ensure API security, authentication (JWT)",
      "Applied best practices in making efficient .Net core application"
    ],
    tech: ["C#", ".Net", "PostgreSQL"],
    github: "https://e-ykk.yayasankhouwkalbe.org/"
  },
  {
    title: "Longevitology Attendance System",
    description: [
      "A simple Laravel attendance system project using Laravel",
      "Developed secure, scalable APIs with role-based access control (RBAC).",
    ],
    tech: ["PHP", "Laravel", "MySQL"],
    github: "https://csx.dhammamanggala.org/"
  },
  {
    title: "Bayar Cepat",
    description: [
      "Backend server for the BayarCepat application POS System", 
      "a modern payment processing system designed with a multi-merchant architecture and integrated with Midtrans payment gateway."
    ],
    tech: ["React Native", "Express.js", "React", "PostgreSQL", "Midtrans"],
    github: "https://github.com/Kelvintan127/backend-bayarcepat"
  }
]

export const publications = [
  {
    title: "Rust's Memory Safety Model: An Evaluation of Its Effectiveness in Preventing Common Vulnerabilities",
    publisher: "Elsevier",
    date: "November 25, 2023",
    url: "https://www.sciencedirect.com/science/article/pii/S1877050923016757",
    abstract: "Ensuring safe program operation is crucial for systems programming, and memory safety is a significant aspect of this. This paper assesses the memory safety strategies used in Rust and C++ programming languages. Rust is a modern language that has become popular due to its focus on safety, performance, and concurrency, whereas C++ is known for its efficiency and low-level programming capabilities.",
    highlights: [
      "Comparative analysis of Rust and C++ memory safety features",
      "Evaluation of ownership and borrowing model vs manual memory management",
      "Assessment of development tools and productivity impact",
      "Analysis of security implications for critical applications"
    ]
  }
];

export const recommendations = [
  {
    name: "Jonathan Purnama",
    title: "Mayora Development Program (MDP) Area Field Promotion Supervisor || Public Relations, Campaign, Events, Marketing Communication",
    date: "January 30, 2024",
    relationship: "Jonathan and Kevin studied together",
    text: "I highly recommend Kevin for their exceptional skills in software engineering, particularly in C++ and Rust programming language. Their expertise in designing robust and scalable solutions has been invaluable to every project they've been a part of. Their dedication, attention to detail, and ability to adapt to new technologies make them a valuable asset to any team.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQGfQQaYQkE6rQ/profile-displayphoto-shrink_100_100/B56ZPz_V.tG4AU-/0/1734965291664?e=1742428800&v=beta&t=4RMcwPsTvL2WR1CeYQ2G35B5IhXf1Y-pGwTtpvGAjGM"
  },
  {
    name: "Dylan Christiandi",
    title: "Frontend Developer",
    date: "February 13, 2025",
    relationship: "Dylan worked with Kevin on the same team",
    text: "I had the pleasure of working with Kevin during our internship and he quickly stood out with his strong problem solving skills and proactive approach. Despite working with a complex system, he grasped its intricacies quickly and navigated challenges with confidence like he always knew what he was doing.\nBeyond our internship, I also teamed up with Kevin in a hackathon, where his ability to think critically under pressure made a huge impact. He’s someone who can break down tough problems, communicate clearly, and execute solutions effectively.",
    image: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
  }
];


export const skills = [
  {
    category: "Programming Languages",
    icon: CodeBracketIcon,
    items: [
      { name: "C++", level: "Advanced" },
      { name: "C#", level: "Advanced" },
      { name: "C", level: "Advanced" },
      { name: "Java", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
      { name: "JavaScript", level: "advanced" },
      { name: "TypeScript", level: "Intermediate" },
    ]
  },
  {
    category: "Backend Development",
    icon: ServerIcon,
    items: [
      { name: "ASP.NET", level: "Advanced" },
      { name: "REST API", level: "Advanced" },
      { name: "WebSocket", level: "Advanced" },
      { name: "PostgreSQL", level: "Advanced" },
      { name: "MongoDB", level: "Advanced" }
    ]
  },
  {
    category: "Development Tools",
    icon: WrenchIcon,
    items: [
      { name: "Git", level: "Advanced" },
      { name: "Cursor", level: "Advanced" },
      { name: "Trae", level: "Advanced" },
      { name: "Visual Studio Code", level: "Advanced" },
      { name: "Docker Desktop", level: "Intermediate" },
      { name: "Linux", level: "Intermediate" },
      { name: "CI/CD", level: "Intermediate" }
    ]
  },
  {
    category: "Web Development",
    icon: GlobeAltIcon,
    items: [
      { name: "Web APIs", level: "Advanced" },
      { name: "Web Security", level: "Advanced" },
      { name: "Json Web Token Authentication", level: "Advanced" },
      { name: "Laravel", level: "Advanced" },
      { name: "OAuth2 Authentication", level: "Intermediate" },
      { name: "React", level: "Intermediate" },
      { name: "HTML/CSS", level: "Intermediate" },

    ]
  },
  {
    category: "System Design",
    icon: CpuChipIcon,
    items: [
      { name: "Distributed Systems", level: "Advanced" },
      { name: "High Performance", level: "Advanced" },
      { name: "System Architecture", level: "Advanced" },
      { name: "Memory Management", level: "Advanced" },
      { name: "Performance Optimization", level: "Advanced" },
    ]
  }
]
