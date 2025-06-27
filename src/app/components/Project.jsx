import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA ---
const projectsData = [
    {
        id: 1,
        title: "Longevitology Attendance System",
        description: "An internal website for attendance system for the Longevitology Therapy Non-Profit Organization.",
        technologies: ["Laravel", "Bootstrap CSS"],
        image: "/assets/logo longevitology.jpeg",
        liveLink: "https://csx.dhammamanggala.org",
        githubLink: "",
        type: "fullstack"
    },
    {
        id: 2,
        title: "Yayasan Khouw Kalbe",
        description: "A scholarship website for the Yayasan Khouw Kalbe. Built APIs to handle scholarship applications, user login, and admin features, ensuring secure and smooth data management.",
        technologies: ["C#", "ASP.NET Core", "PostgreSQL", "AWS"],
        image: "/assets/YKK.jpeg",
        liveLink: "https://e-ykk.yayasankhouwkalbe.org/",
        githubLink: "",
        type: "backend"
    },
    {
        id: 3,
        title: "Jastipfully",
        description: "A Landing page website for entrusted service company Jastipfully.",
        technologies: ["Nextjs", "Tailwind CSS"],
        image: "/assets/jastipfully.jpg",
        liveLink: "https://jastipfully.com",
        githubLink: "",
        type: "frontend"
    },
    {
        id: 4,
        title: "BayarCepat",
        description: "Backend server for the BayarCepat application, a modern payment processing system designed with a multi-merchant architecture and integrated with Midtrans payment gateway.",
        technologies: ["Node.js", "Express", "Prisma", "PostgreSQL", "Midtrans"],
        image: "/assets/bayar-cepat.png",
        liveLink: "",
        githubLink: "https://github.com/Kelvintan127/backend-bayarcepat",
        type: "backend"
    }
];

const experimentalData = [
    {
        id: 1,
        title: "IoT Lamp Switch",
        description: "This IoT project enables remote control of a physical lamp switch through a Next.js web interface, using an Express.js backend to trigger an ESP32 and servo motor.",
        technologies: ["Next.js", "Express.js", "Node.js", "ESP32", "Servo Motor"],
        image: "/assets/iot.png",
        liveLink: "",
        githubLink: "https://github.com/your-username/iot-lamp-switch",
        type: "fullstack"
    },
    {
        id: 2,
        title: "Live Chat Room",
        description: "A full-stack chat application built with Next.js, Express.js, and WebSockets to facilitate seamless, real-time messaging between multiple users.",
        technologies: ["Next.js", "Express.js", "Node.js", "WebSockets"],
        image: "/assets/livechat.png",
        liveLink: "",
        githubLink: "https://github.com/your-username/live-chat-room",
        type: "fullstack"
    }
];

// --- REUSABLE HOOK for Filtering and Pagination ---
const useProjectFilter = (projects) => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage, setProjectsPerPage] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            setProjectsPerPage(window.innerWidth < 768 ? 1 : 3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, projectsPerPage]);

    const filteredProjects = activeFilter === "all"
        ? projects
        : projects.filter(project => project.type === activeFilter);

    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

    return {
        activeFilter,
        setActiveFilter,
        currentPage,
        setCurrentPage,
        currentProjects,
        totalPages
    };
};


// --- REUSABLE COMPONENTS ---

const ProjectCard = ({ project }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800/50 overflow-hidden group"
    >
        <div className="relative w-full h-64 overflow-hidden bg-gray-800">
            <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-fill p-4 group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="p-6">
            <h3 className="text-xl font-bold mb-3 text-gray-100">{project.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-gray-800/50 border-gray-400 rounded-full text-gray-300">
                        {tech}
                    </span>
                ))}
            </div>
            <div className="flex gap-3">
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-lg bg-gray-900/50 border border-white text-gray-300 hover:bg-gray-800 hover:border-white font-semibold transition-all duration-300 ${!project.liveLink && "opacity-50 cursor-not-allowed"}`}
                >
                    Live Demo
                </motion.a>
                {project.githubLink && (
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-gray-900/50 border border-white text-gray-300 hover:bg-gray-800 hover:border-white font-semibold transition-all duration-300"
                    >
                        GitHub
                    </motion.a>
                )}
            </div>
        </div>
    </motion.div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => onPageChange(idx + 1)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${currentPage === idx + 1 ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                >
                    {idx + 1}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

const ProjectSection = ({ title, description, projects }) => {
    const { activeFilter, setActiveFilter, currentPage, setCurrentPage, currentProjects, totalPages } = useProjectFilter(projects);

    return (
        <div className="mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
            >
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 text-transparent bg-clip-text mb-4">
                    {title}
                </h2>
                <p className="text-gray-400 text-lg mb-8">{description}</p>
                <div className="flex justify-center gap-4 mb-8">
                    {["all", "frontend", "backend", "fullstack"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeFilter === type ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                    {currentProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </AnimatePresence>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};


// --- MAIN COMPONENT ---

const ProjectsPage = () => {
    return (
        <section
            className="relative w-full max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12 py-20"
            name="projects"
            id="projects"
        >
            <ProjectSection
                title="My Projects"
                description="Showcasing my latest work and contributions."
                projects={projectsData}
            />

            <ProjectSection
                title="My Experimental Projects"
                description="Fun ideas and prototypes I've been experimenting with."
                projects={experimentalData}
            />
        </section>
    );
};

export default ProjectsPage;