"use client";
import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import MenuOverlay from "./MenuOverlay";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

const DynamicBoxIcon = dynamic(() => import('boxicons').then(mod => mod.BoxIcon), {
  ssr: false
});

const Navbar = () => {
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
    { icon: <FaLinkedin className="w-6 h-6" />, url: "https://linkedin.com/in/kelvin-tan-21b559220" },
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "py-4 bg-black/60 backdrop-blur-lg" : "py-6"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/assets/2.png"
                alt="Logo"
                className="h-20 w-auto drop-shadow-3xl filter brightness-100 contrast-125"
              />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((nav, index) => (
                <Link
                  key={index}
                  to={nav.path}
                  spy={true}
                  smooth={true}
                  duration={500}
                  className={`cursor-pointer transition-colors duration-300 ${
                    activeSection === nav.path
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {nav.link}
                </Link>
              ))}
            </div>

            {/* Social Links section */}
            <div className="hidden md:flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setOpenNav(true)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all duration-300"
            >
              <svg
                className="w-6 h-6 text-gray-300"
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

      {/* Mobile Menu Overlay */}
      {openNav && (
        <MenuOverlay
          navLinks={navLinks}
          closeMenu={() => setOpenNav(false)}
          activeSection={activeSection}
        />
      )}
    </>
  );
};

export default Navbar;