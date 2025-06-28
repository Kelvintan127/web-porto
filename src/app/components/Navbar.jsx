"use client";
import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from 'next/dynamic';
import MenuOverlay from "./MenuOverlay";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navLinks = [
    { link: "Home", path: "home" },
    { link: "About", path: "about" },
    { link: "Project", path: "projects" },
    { link: "Contact", path: "contact" },
  ];

  const socialLinks = [
    { icon: <FaGithub className="w-6 h-6" />, url: "https://github.com/kelvintan127" },
    { icon: <FaInstagram className="w-6 h-6" />, url: "https://instagram.com/kelvintan27_" },
    { icon: <FaLinkedin className="w-6 h-6" />, url: "https://linkedin.com/in/kelvintan127" },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50);

        // Find active section
        const sections = navLinks.map((link) => link.path);
        let currentSection = "";

        sections.forEach((section) => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (
              rect.top <= window.innerHeight / 2 &&
              rect.bottom >= window.innerHeight / 2
            ) {
              currentSection = section;
            }
          }
        });

        if (currentSection) {
          setActiveSection(currentSection);
        } else if (window.scrollY === 0) {
          setActiveSection("home");
        }
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "py-4 dark:bg-black/60 bg-white/60 backdrop-blur-lg shadow-lg" : "py-6"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo with hover effect */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/assets/2.png"
                alt="Logo"
                className="h-20 w-auto drop-shadow-3xl filter brightness-100 contrast-125 hover:brightness-110 transition-all duration-300"
              />
            </motion.div>

            {/* Desktop Navigation with hover effects */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((nav, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={nav.path}
                    spy={true}
                    smooth={true}
                    duration={500}
                    className={`relative cursor-pointer transition-all duration-300 px-4 py-2 rounded-lg ${
                      activeSection === nav.path
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                    }`}
                  >
                    {nav.link}
                    {activeSection === nav.path && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Theme Toggle and Social Links with animations */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <FaSun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <FaMoon className="w-5 h-5 text-gray-600" />
                  )}
                </motion.div>
              </motion.button>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            {/* Mobile Menu Button with animation */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpenNav(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-300"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay with animation */}
      <AnimatePresence>
        {openNav && (
          <MenuOverlay
            navLinks={navLinks}
            closeMenu={() => setOpenNav(false)}
            activeSection={activeSection}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;