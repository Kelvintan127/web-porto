import { motion } from "framer-motion";
import { useTheme } from '../context/ThemeContext';

const BackgroundAnimation = () => {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className={`absolute -inset-[100px] ${theme === 'light' ? 'opacity-20' : 'opacity-30'}`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 15,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-blue-300 to-blue-500 dark:from-yellow-300 dark:to-orange-400 blur-[100px]" />
      </motion.div>

      <motion.div
        className={`absolute -inset-[100px] ${theme === 'light' ? 'opacity-15' : 'opacity-25'}`}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [45, 0, 45],
        }}
        transition={{
          duration: 18,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="absolute top-3/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-orange-400 dark:to-red-600 blur-[100px]" />
      </motion.div>

      <motion.div
        className={`absolute -inset-[100px] ${theme === 'light' ? 'opacity-10' : 'opacity-20'}`}
        animate={{
          scale: [1.1, 0.9, 1.1],
          rotate: [-45, 0, -45],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-500 to-blue-700 dark:from-red-600 dark:to-yellow-300 blur-[100px]" />
      </motion.div>
    </div>
  );
};

export default BackgroundAnimation;