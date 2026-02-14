import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2 } from "lucide-react";
import BackgroundParticles from "./ui/BackgroundParticles";
import { useSession } from "../context/SessionContext";

export default function UploadPage() {
  const [hovering, setHovering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { setDeckId } = useSession();

  async function handleFile(file) {
    if (!file || !file.name.endsWith(".txt")) {
      setError("Please upload a .txt file");
      return;
    }

    setFileName(file.name);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        headers: { "x-api-key": import.meta.env.VITE_API_KEY },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      // Store deck info in localStorage so it persists across sessions
      localStorage.setItem("slammer-deck-id", data.deckId);
      localStorage.setItem("slammer-deck-name", data.deckName);
      setDeckId(data.deckId || "");
      navigate("/ready");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setHovering(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setHovering(true);
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleInputChange(e) {
    const file = e.target.files[0];
    handleFile(file);
  }

  return (
    <motion.div
      className="relative min-h-screen w-full bg-charcoal overflow-hidden flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <BackgroundParticles />

      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-6">
        <motion.h1
          className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Upload Anki Flashcards
        </motion.h1>

        {/* ── Hidden file input ── */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleInputChange}
        />

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
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setHovering(false)}
          onClick={handleClick}
        >
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
            {uploading ? (
              <Loader2 size={28} strokeWidth={2} className="animate-spin" />
            ) : fileName ? (
              <FileText size={28} strokeWidth={2} />
            ) : (
              <Upload size={28} strokeWidth={2} />
            )}
          </div>

          <p
            className={`
              text-sm sm:text-base font-semibold text-center transition-colors duration-200
              ${hovering ? "text-green-400" : "text-white/80"}
            `}
          >
            {uploading
              ? "Uploading..."
              : fileName
              ? fileName
              : "Drag & drop Anki .txt file here, or click to select file"}
          </p>

          {error && (
            <p className="mt-4 text-red-400 text-sm font-medium">{error}</p>
          )}
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
