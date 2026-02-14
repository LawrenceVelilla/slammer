import { motion } from "framer-motion";

const particles = [
  {
    color: "bg-green-500",
    size: "w-72 h-72",
    initialX: "10%",
    initialY: "20%",
    animateX: ["10%", "15%", "8%", "10%"],
    animateY: ["20%", "30%", "15%", "20%"],
    duration: 20,
  },
  {
    color: "bg-orange-400",
    size: "w-64 h-64",
    initialX: "70%",
    initialY: "60%",
    animateX: ["70%", "75%", "65%", "70%"],
    animateY: ["60%", "50%", "65%", "60%"],
    duration: 25,
  },
  {
    color: "bg-yellow-400",
    size: "w-80 h-80",
    initialX: "50%",
    initialY: "80%",
    animateX: ["50%", "45%", "55%", "50%"],
    animateY: ["80%", "70%", "85%", "80%"],
    duration: 22,
  },
  {
    color: "bg-green-400",
    size: "w-56 h-56",
    initialX: "80%",
    initialY: "15%",
    animateX: ["80%", "85%", "78%", "80%"],
    animateY: ["15%", "25%", "10%", "15%"],
    duration: 18,
  },
  {
    color: "bg-amber-500",
    size: "w-60 h-60",
    initialX: "25%",
    initialY: "70%",
    animateX: ["25%", "30%", "20%", "25%"],
    animateY: ["70%", "60%", "75%", "70%"],
    duration: 24,
  },
  {
    color: "bg-emerald-500",
    size: "w-48 h-48",
    initialX: "40%",
    initialY: "10%",
    animateX: ["40%", "35%", "45%", "40%"],
    animateY: ["10%", "20%", "5%", "10%"],
    duration: 21,
  },
];

export default function BackgroundParticles() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${particle.color} ${particle.size} blur-3xl`}
          style={{
            left: particle.initialX,
            top: particle.initialY,
            opacity: 0.07,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            left: particle.animateX,
            top: particle.animateY,
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
