"use client";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import { Icon } from "@iconify/react";

const Skills = [
  { name: "HTML", icon: "vscode-icons:file-type-html" },
  { name: "CSS", icon: "logos:css-3" },
  { name: "JavaScript", icon: "logos:javascript" },
  { name: "React", icon: "logos:react" },
  { name: "Next.js", icon: "devicon:nextjs" },
  { name: "Tailwind CSS", icon: "devicon:tailwindcss" },
  { name: "C#", icon: "devicon:csharp" },
  { name: "C++", icon: "logos:c-plusplus" },
  { name: "Java", icon: "logos:java" },
  { name: "Prisma", icon: "simple-icons:prisma" },
  { name: "Laravel", icon: "devicon:laravel" },
  { name: "MySQL", icon: "logos:mysql" },
  { name: "PostgreSQL", icon: "logos:postgresql" },
  { name: "Go Lang", icon: "devicon:go" },
  { name: "Gin", icon: "logos:gin" },
  { name: "express", icon: "simple-icons:express" },
  { name: "redis", icon: "devicon:redis" },
  { name: "git", icon: "logos:git-icon" },
  { name: "github", icon: "akar-icons:github-fill" },
  { name: "docker", icon: "logos:docker-icon" },
  { name: "gitlab", icon: "material-icon-theme:gitlab" },
  
];

const Roles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
];

const About = () => {
  return (
    <section id="about" className="relative py-20 dark:bg-transparent light:bg-white/80">
      <div className="relative w-full max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 dark:from-blue-300 dark:via-blue-500 dark:to-blue-600 text-transparent bg-clip-text mb-4">
            About Me
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Passionate about creating web experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 w-64 h-64 mx-auto rounded-full border border-gray-200 dark:border-gray-700/50 blur-sm"></div>
              <div className="absolute inset-0 w-64 h-64 mx-auto rounded-full border border-gray-300 dark:border-gray-600/30"></div>

              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-300 to-blue-500 dark:from-yellow-300 dark:to-orange-400 blur-sm opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-orange-400 dark:to-red-600 blur-sm opacity-60"></div>

              <img
                src="/assets/Kelvin Tan Image.png"
                alt="Developer portrait"
                className="relative z-10 w-56 h-64 mx-auto rounded-full object-cover object-top shadow-lg hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-1/4 -left-8 w-4 h-4 border border-gray-300 dark:border-gray-700/50 rounded-full rotate-45 bg-gray-100 dark:bg-gray-400 blur"></div>
              <div className="absolute bottom-1/4 -right-8 w-3 h-3 border border-gray-300 dark:border-gray-700/50 rounded-full bg-gray-100 dark:bg-gray-400 blur"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-3">
              {Roles.map((role, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-400 text-blue-800 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800 text-lg rounded-lg transition-all duration-300"
                >
                  {role}
                </motion.span>
              ))}
            </div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              I'm a back-end developer who enjoys building robust systems and is now learning front-end to level up as a full-stack developer.
            </p>

            <div className="space-y-4">
              <h4 className="text-blue-600 dark:text-blue-400 font-medium">Tech Stack</h4>

              <div className="flex flex-wrap gap-3">
                {Skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-400 text-blue-800 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800 text-sm rounded-lg transition-all duration-300"
                  >
                    <Icon icon={skill.icon} className="w-5 h-5" />
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-blue-600 dark:text-blue-400 font-medium">Education</h4>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-400 text-gray-800 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800 backdrop-blur p-4 rounded-lg transition-all duration-300"
              >
                <h5 className="text-blue-700 dark:text-blue-500">Binus University</h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Computer Science Major</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">2021 - 2025</p>
              </motion.div>
            </div>

            <div className="pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="contact"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="inline-block px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-gray-900/50 dark:border dark:border-gray-400 text-white dark:text-gray-300 dark:hover:bg-gray-800 font-semibold transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  Get in Touch
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
