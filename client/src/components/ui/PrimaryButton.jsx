import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function PrimaryButton({ children, onClick, delay = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      className="
        relative inline-flex items-center gap-2
        bg-green-vivid hover:bg-green-vivid-dark
        text-white font-semibold
        text-xl px-10 py-3
        rounded-lg cursor-pointer
        shadow-lg shadow-green-vivid/25
        transition-colors duration-200
        outline-none border-none
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0, 200, 83, 0.35)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      <ArrowRight size={20} strokeWidth={2.5} />
    </motion.button>
  );
}
