import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const projects = [
  {
    id: 1,
    title: "Longevitology Attendance System",
    description:
      "An internal website for attendance system for the Longevitology Therapy Non-Profit Organization.",
    technologies: ["Laravel", "Bootstrap CSS"],
    image: "/assets/logo longevitology.jpeg", // Add your project screenshot
    liveLink: "https://csx.dhammamanggala.org",
    githubLink: "",
  },
  // You can easily add more projects here following the same structure
];

const Project = () => {
  return (
    <section
      className="relative w-full max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12 py-20"
      name="projects" id="projects"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 text-transparent bg-clip-text mb-4">
          My Projects
        </h2>
        <p className="text-gray-400 text-lg">
          Showcasing my latest work and experiments
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800/50 overflow-hidden"
          >
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-gray-100">
                {project.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-gray-800/50 border-gray-400 rounded-full text-gray-300"
                  >
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
                  className="px-4 py-2 rounded-lg bg-gray-900/50 border border-white text-gray-300 hover:bg-gray-800 hover:border-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Live Demo
                </motion.a>
                {project.githubLink && project.githubLink !== "" && (
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-gray-900/50 border border-white text-gray-300 hover:bg-gray-800 hover:border-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    GitHub
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Project;
