import { useRef, useEffect } from "react";

/**
 * Canvas-based Matrix Rain effect.
 *
 * Props:
 *  - width      : CSS width value (e.g. "15vw", "200px"). Defaults to "100%".
 *  - height     : CSS height value. Defaults to "100vh".
 *  - className  : Extra Tailwind / CSS classes.
 *  - style      : Extra inline styles.
 *  - charSet    : "katakana" | "binary". Defaults to "katakana".
 *  - color      : Column colour. Defaults to "#00ff41".
 *  - fontSize   : Font size in px. Defaults to 14.
 *  - speed      : Drop speed multiplier (1 = normal). Defaults to 1.
 */
export default function MatrixRain({
  width = "100%",
  height = "100vh",
  className = "",
  style = {},
  charSet = "katakana",
  color = "#00ff41",
  fontSize = 14,
  speed = 1,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    /* ── Character pool ── */
    const katakana =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const binary = "01";
    const chars = charSet === "binary" ? binary : katakana;

    /* ── Sizing helper ── */
    let columns = 0;
    let drops = [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const newCols = Math.floor(rect.width / fontSize);
      if (newCols !== columns) {
        const oldDrops = drops;
        drops = Array.from({ length: newCols }, (_, i) =>
          i < oldDrops.length ? oldDrops[i] : Math.random() * -100
        );
        columns = newCols;
      }
    }

    resize();
    window.addEventListener("resize", resize);

    /* ── Draw loop ── */
    let raf;
    const baseInterval = 45 / speed; // ms between frames
    let lastTime = 0;

    function draw(timestamp) {
      raf = requestAnimationFrame(draw);
      if (timestamp - lastTime < baseInterval) return;
      lastTime = timestamp;

      const rect = canvas.parentElement.getBoundingClientRect();

      // Fade trail
      ctx.fillStyle = "rgba(24, 24, 27, 0.15)"; // match #18181b bg
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        // Reset to top when past bottom (with randomness)
        if (y > rect.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [charSet, color, fontSize, speed]);

  return (
    <div
      className={className}
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
