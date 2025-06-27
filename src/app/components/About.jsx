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
    <section id="about" className="relative py-20">
      {/* Content Container */}
      <div className="relative w-full max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 text-transparent bg-clip-text mb-4">
            About Me
          </h2>
          <p className="text-gray-400 text-lg">
            Passionate about creating web experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Decorative elements */}
              <div className="absolute inset-0 w-64 h-64 mx-auto rounded-full border border-gray-700/50 blur-sm"></div>
              <div className="absolute inset-0 w-64 h-64 mx-auto rounded-full border border-gray-600/30"></div>

              {/* Decorative dots */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 blur-sm opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-600 blur-sm opacity-60"></div>

              {/* Main image */}
              <img
                src="/assets/Kelvin Tan Image.png"
                alt="Developer portrait"
                className="relative z-10 w-56 h-64 mx-auto rounded-full object-cover object-top shadow-lg"
              />

              {/* Floating shapes */}
              <div className="absolute top-1/4 -left-8 w-4 h-4 border border-gray-700/50 rounded-full rotate-45 bg-gray-400 blur"></div>
              <div className="absolute bottom-1/4 -right-8 w-3 h-3 border border-gray-700/50 rounded-full bg-gray-400 blur"></div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Role Title */}
            <div className="flex flex-wrap gap-3">
              {Roles.map((role, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-400 text-lg rounded-lg"
                >
                  {role}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed">
             I&apos;m a back-end developer who enjoys building robust systems and is now learning front-end to level up as a full-stack developer.
            </p>

            {/* Skills Section */}
            <div className="space-y-4">
              <h4 className="text-blue-400 font-medium">Tech Stack</h4>

              <div className="flex flex-wrap gap-3">
                {Skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-400 text-sm rounded-lg"
                  >
                    <Icon icon={skill.icon} className="w-5 h-5" />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h4 className="text-blue-400 font-medium">Education</h4>
              <div className="bg-gray-900/50 border border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-400 backdrop-blur p-4 rounded-lg">
                <h5 className="text-blue-500">Binus University</h5>
                <p className="text-gray-400 text-sm">Computer Science Major</p>
                <p className="text-gray-400 text-sm">2021 - 2025</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                to="contact"
                spy={true}
                smooth={true}
                duration={500}
                className="inline-block px-6 py-3 rounded-lg bg-gray-900/50 border border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-400 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


export default About;
