import { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import BackgroundParticles from "./ui/BackgroundParticles";

export default function UploadPage() {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Background particles (z-0) ── */}
      <BackgroundParticles />

      {/* ── Foreground content (z-10) ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-6">
        {/* ── Title ── */}
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Upload Anki Flashcards
        </motion.h1>

        {/* ── Dropzone ── */}
        <motion.div
          className={`
            mt-14 w-full rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center
            py-20 px-8 cursor-pointer
            transition-colors duration-200
            ${
              hovering
                ? "border-green-500 bg-white/5"
                : "border-white/60 bg-transparent"
            }
          `}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* ── Upload icon ── */}
          <div
            className={`
              w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6
              transition-colors duration-200
              ${
                hovering
                  ? "border-green-500 text-green-500"
                  : "border-white/60 text-white/60"
              }
            `}
          >
            <Upload size={28} strokeWidth={2} />
          </div>

          {/* ── Instruction text ── */}
          <p
            className={`
              text-sm sm:text-base font-semibold text-center transition-colors duration-200
              ${hovering ? "text-green-400" : "text-white/80"}
            `}
          >
            Drag & drop Anki .txt file here, or click to select file
          </p>
        </motion.div>

        {/* ── Gleeful Cat ── */}
        <motion.img
          src="/gleeful-cat.svg"
          alt="Gleeful cat"
          draggable={false}
          className="w-44 sm:w-52 md:w-60 mt-10"
          initial={{ y: 160, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.7,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
        />
      </div>
    </motion.div>
  );
}
