import React from "react";
import { Link } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaSun,
  FaMoon,
} from "react-icons/fa";

const MenuOverlay = ({ navLinks, closeMenu, activeSection }) => {
  const { theme, toggleTheme } = useTheme();
  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const socialLinks = [
    {
      icon: <FaGithub className="w-8 h-8" />,
      url: "https://github.com/kelvintan127",
    },
    {
      icon: <FaInstagram className="w-8 h-8" />,
      url: "https://instagram.com/kelvintan27_",
    },
    {
      icon: <FaLinkedin className="w-8 h-8" />,
      url: "https://linkedin.com/in/kelvintan127",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial="closed"
        animate="open"
        exit="closed"
        variants={overlayVariants}
        className="fixed inset-0 z-50"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Fixed Background with Glass Effect */}
        <div
          className="fixed inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-2xl"
          style={{ position: "fixed", zIndex: 1 }}
        />

        {/* Gradient backgrounds with light mode colors */}
        <div
          className="fixed inset-0 overflow-hidden"
          style={{ position: "fixed", zIndex: 2 }}
        >
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-300/40 dark:bg-blue-500/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-50 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-purple-300/40 dark:bg-purple-500/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-40 w-[500px] h-[500px] bg-teal-300/40 dark:bg-yellow-500/30 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content Container */}
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          style={{ position: "fixed", zIndex: 3 }}
        >
          <div className="min-h-screen">
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeMenu}
                className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 backdrop-blur-lg border border-gray-200/50 dark:border-white/10 transition-all duration-300 group"
              >
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-450px)]">
              <nav className="space-y-6">
                {navLinks.map((nav, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="text-center"
                  >
                    <Link
                      to={nav.path}
                      spy={true}
                      smooth={true}
                      duration={500}
                      onClick={closeMenu}
                      className="group relative inline-block px-8 py-4"
                    >
                      <span
                        className={`relative z-10 text-3xl font-medium transition-colors duration-300
                        ${
                          activeSection === nav.path
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                        }`}
                      >
                        {nav.link}
                      </span>

                      {/* Hover Effect Background */}
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      />

                      {activeSection === nav.path && (
                        <motion.div
                          layoutId="activeSection"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Theme Toggle Button */}
            <div className="flex justify-center pt-4">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full transition-all duration-300"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <FaSun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <FaMoon className="w-6 h-6 text-gray-600" />
                )}
              </motion.div>
            </motion.button>
            </div>

            {/* Social Links */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center gap-6 py-12"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="text-center pb-8 px-4"
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm bg-gray-100/80 dark:bg-white/5 backdrop-blur-lg rounded-full px-4 py-2 inline-block border border-gray-200/50 dark:border-white/10">
                © 2025 Kelvin. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MenuOverlay;
