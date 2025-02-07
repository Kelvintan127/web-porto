import React from "react";
import { Link } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaInstagram, FaLinkedin, FaTimes } from "react-icons/fa";

const MenuOverlay = ({ navLinks, closeMenu, activeSection }) => {
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
    { icon: <FaGithub className="w-8 h-8" />, url: "https://github.com/kelvintan127" },
    { icon: <FaInstagram className="w-8 h-8" />, url: "https://instagram.com/kelvintan27_" },
    { icon: <FaLinkedin className="w-8 h-8" />, url: "https://linkedin.com/in/kelvin-tan-21b559220" },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-2xl"
          style={{ position: "fixed", zIndex: 1 }}
        />

        {/* Fixed Background Gradients */}
        <div
          className="fixed inset-0 overflow-hidden"
          style={{ position: "fixed", zIndex: 2 }}
        >
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/30 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-blob"></div>
          <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-purple-500/30 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-40 w-[500px] h-[500px] bg-yellow-500/30 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeMenu}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 transition-all duration-300 group"
              >
                <svg
                  className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300"
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
            <div className="flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="/assets/2.png"
                  alt="Logo"
                  className="h-auto w-28 filter brightness-100 contrast-125"
                />
              </motion.div>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
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
                            ? "text-blue-400"
                            : "text-gray-300 group-hover:text-white"
                        }`}
                      >
                        {nav.link}
                      </span>

                      {/* Hover Effect Background */}
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-white/5 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
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

            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center gap-6 pb-12"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
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
              <p className="text-gray-400 text-sm bg-white/5 backdrop-blur-lg rounded-full px-4 py-2 inline-block border border-white/10">
                © 2024 Kelvin. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MenuOverlay;
