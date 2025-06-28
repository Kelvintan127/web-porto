import React from "react";
import { Link } from "react-scroll";
import { ReactTyped } from "react-typed";
import { motion } from "framer-motion";

const LinkCV = "https://drive.google.com/file/d/1583m46NpYsrrSciTUs0Mehi0U4jbNpUO/view?usp=sharing";

const HomeSection = () => {
  return (
    <section
      className="relative w-full max-w-[1300px] flex items-center justify-center px-4 sm:px-6 md:px-8 min-h-screen dark:bg-transparent light:bg-white/80"
      name="home"
    >
      <div className="flex flex-col-reverse md:flex-row w-full gap-8 md:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center flex-1 space-y-6 text-center md:text-left"
        >
          <div className="space-y-4">
            <div className="art-lg-text">
              <ReactTyped
                loop
                typeSpeed={100}
                backSpeed={30}
                strings={["Hi, I'm Kelvin", "Welcome to my Portfolio"]}
                smartBackspace
                shuffle={false}
                backDelay={1}
                fadeOut={false}
                fadeOutDelay={100}
                loopCount={0}
                showCursor
                cursorChar="|"
                className="text-4xl sm:text-5xl md:text-6xl font-bold font-poppins bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 dark:from-blue-300 dark:via-blue-500 dark:to-blue-700 text-transparent bg-clip-text"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200">
                I'm a freshgraduate student
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300">
                from Binus University
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-500 dark:text-gray-400">
                Computer Science Major
              </h2>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Link to="contact" smooth={true} duration={400}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 w-full sm:w-auto text-base font-semibold rounded-lg 
                bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 
                dark:from-blue-300 dark:via-blue-500 dark:to-blue-700 
                text-white shadow-lg hover:shadow-xl
                transform transition-all duration-300"
              >
                Contact Me
              </motion.button>
            </Link>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/assets/Kelvin Tan CV.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 py-3 text-base font-semibold rounded-lg
                bg-blue-50 dark:bg-gray-900/50 
                border border-blue-200 dark:border-gray-400 
                text-blue-700 dark:text-gray-300 
                hover:bg-blue-100 dark:hover:bg-gray-800 
                shadow-lg hover:shadow-xl
                transition-all duration-300"
            >
              Download CV
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex items-center justify-center"
        >
          <motion.img
            whileHover={{ scale: 1.05 }}
            className="w-[70%] md:w-[90%] h-auto object-contain drop-shadow-2xl transition-all duration-500"
            src="assets/Hero3.png"
            alt="Hero illustration"
            loading="eager"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HomeSection;
