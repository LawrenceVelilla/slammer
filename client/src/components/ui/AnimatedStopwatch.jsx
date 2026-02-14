import { useState, useEffect, useRef, useCallback } from "react";

/* ── Animated Stopwatch SVG ──
   The hand position is computed each frame via requestAnimationFrame.
   No CSS transforms or rotation — just recalculating the line endpoint
   with sin/cos so the hand is always anchored to the face centre.     */
export default function AnimatedStopwatch({ size = 48, rpm = 15 }) {
  const raf = useRef(null);
  const start = useRef(null);
  const [angle, setAngle] = useState(-Math.PI / 2); // 12-o'clock

  const tick = useCallback(
    (ts) => {
      if (start.current === null) start.current = ts;
      const elapsed = (ts - start.current) / 1000; // seconds
      // rpm rotations per minute → radians per second
      const rad = ((rpm * 2 * Math.PI) / 60) * elapsed - Math.PI / 2;
      setAngle(rad);
      raf.current = requestAnimationFrame(tick);
    },
    [rpm]
  );

  useEffect(() => {
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tick]);

  /* ── Geometry ── */
  const cx = size / 2;
  const faceCy = size * 0.56;
  const faceR = size * 0.36;
  const handLen = faceR * 0.65;
  const tickOuter = faceR * 0.88;
  const tickInner = tickOuter * 0.75;
  const crownW = size * 0.12;
  const crownH = size * 0.15;
  const crownY = faceCy - faceR - crownH - 2;

  /* Hand tip computed from current angle */
  const hx = cx + Math.cos(angle) * handLen;
  const hy = faceCy + Math.sin(angle) * handLen;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      {/* Crown / push-button */}
      <rect
        x={cx - crownW / 2}
        y={crownY}
        width={crownW}
        height={crownH}
        rx={crownW / 3}
        fill="currentColor"
        opacity={0.6}
      />

      {/* Side lugs */}
      {[-45, 45].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        return (
          <line
            key={deg}
            x1={cx + Math.cos(rad) * (faceR + 2)}
            y1={faceCy + Math.sin(rad) * (faceR + 2)}
            x2={cx + Math.cos(rad) * (faceR + 6)}
            y2={faceCy + Math.sin(rad) * (faceR + 6)}
            stroke="currentColor"
            opacity={0.6}
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {/* Outer ring */}
      <circle
        cx={cx}
        cy={faceCy}
        r={faceR + 2}
        stroke="currentColor"
        opacity={0.6}
        strokeWidth={2}
        fill="none"
      />

      {/* Face */}
      <circle cx={cx} cy={faceCy} r={faceR} fill="#27272a" />

      {/* Tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * tickInner}
            y1={faceCy + Math.sin(a) * tickInner}
            x2={cx + Math.cos(a) * tickOuter}
            y2={faceCy + Math.sin(a) * tickOuter}
            stroke="currentColor"
            opacity={0.4}
            strokeWidth={i % 3 === 0 ? 1.8 : 0.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* Sweeping hand — just a line recomputed each frame */}
      <line
        x1={cx}
        y1={faceCy}
        x2={hx}
        y2={hy}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Centre dot */}
      <circle cx={cx} cy={faceCy} r={2} fill="currentColor" />
    </svg>
  );
}
