import { motion } from "framer-motion";

const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -inset-[100px] opacity-30"
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
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 blur-[100px]" />
      </motion.div>

      <motion.div
        className="absolute -inset-[100px] opacity-25"
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
        <div className="absolute top-3/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-orange-400 to-red-600 blur-[100px]" />
      </motion.div>

      <motion.div
        className="absolute -inset-[100px] opacity-20"
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
        <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-red-600 to-yellow-300 blur-[100px]" />
      </motion.div>

      <motion.div
        className="absolute -inset-[100px] opacity-25"
        animate={{
          scale: [0.9, 1.1, 0.9],
          rotate: [20, -20, 20],
        }}
        transition={{
          duration: 22,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="absolute top-1/3 right-1/3 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600 blur-[100px]" />
      </motion.div>

      <motion.div
        className="absolute -inset-[100px] opacity-30"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [-30, 30, -30],
        }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-gradient-to-r from-orange-400 via-red-600 to-yellow-300 blur-[100px]" />
      </motion.div>
    </div>
  );
};

export default BackgroundAnimation;