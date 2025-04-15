import React from "react";
import { Link } from "react-scroll";
import { ReactTyped } from "react-typed";
import { motion } from "framer-motion";

const LinkCV = "https://drive.google.com/file/d/1583m46NpYsrrSciTUs0Mehi0U4jbNpUO/view?usp=sharing";

const HomeSection = () => {
  return (
    <section
      className="relative w-full max-w-[1300px] flex items-center justify-center px-4 sm:px-6 md:px-8 min-h-screen"
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
                className="text-4xl sm:text-5xl md:text-6xl font-bold font-poppins bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 text-transparent bg-clip-text"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-200">
                I&apos;m a undergraduate student
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-300">
                at Binus University
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-400">
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
              <button
                className="px-4 py-2 w-full sm:w-auto text-base font-semibold rounded-lg 
    bg-gradient-to-r from-blue-300 via-purple-600 to-blue-600 
    animate-gradient-x transform hover:scale-105 transition-all duration-300 text-white"
              >
                Contact Me
              </button>
            </Link>
            <a 
              href="/assets/Kelvin Tan CV.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sm:w-auto button-color"
            >
              Download CV
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex items-center justify-center"
        >
          <img
            className="w-[70%] md:w-[90%] h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-all duration-500"
            src="assets/Hero3.png"
            alt="Hero illustration"
            loading="eager"
          />
        </motion.div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20 -z-10" />
    </section>
  );
};

export default HomeSection;
