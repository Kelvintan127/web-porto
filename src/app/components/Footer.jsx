import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-blue-50/30 dark:bg-black/30 backdrop-blur-sm border-t border-blue-100 dark:border-gray-800"
    >
      <div className="max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12 py-6">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="flex flex-col md:flex-row justify-center items-center gap-4"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">
            © {currentYear} Kelvin Tan. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;