/**
 * Flowing light ribbons on deep navy, after the Pact brand art.
 * Pure SVG + CSS: two glowing waves drift and breathe; soft glows swell and settle.
 * Long cycles (14–22s) so it reads as breathing, never as flicker. Static under reduced motion.
 */
export function LivingBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_20%_0%,#0d2a78_0%,#071a4d_38%,#050f33_70%,#040b26_100%)] ${className}`}>
      {/* breathing glows */}
      <div className="lb-glow absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-[#1e7bff]/45 blur-[120px]" />
      <div className="lb-glow lb-d2 absolute top-[10%] -right-40 h-[34rem] w-[34rem] rounded-full bg-[#7c3aed]/40 blur-[130px]" />
      <div className="lb-glow lb-d3 absolute -bottom-48 left-[30%] h-[30rem] w-[44rem] rounded-full bg-[#2563eb]/35 blur-[120px]" />

      {/* light ribbons */}
      <svg className="absolute bottom-0 left-0 h-[58%] w-[200%] min-w-[1600px]" viewBox="0 0 2400 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lb-a" x1="0" x2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="0.25" stopColor="#38bdf8" />
            <stop offset="0.55" stopColor="#6366f1" />
            <stop offset="0.8" stopColor="#a855f7" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lb-b" x1="0" x2="1">
            <stop offset="0" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="0.3" stopColor="#7c3aed" />
            <stop offset="0.6" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lb-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b5bff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#3b5bff" stopOpacity="0" />
          </linearGradient>
          <filter id="lb-blur" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g className="lb-drift">
          <path d="M0 360 C 300 220, 600 220, 900 330 S 1500 470, 1800 330 S 2250 220, 2400 300 L2400 600 L0 600Z" fill="url(#lb-fill)" />
          <path className="lb-breathe" d="M0 360 C 300 220, 600 220, 900 330 S 1500 470, 1800 330 S 2250 220, 2400 300" fill="none" stroke="url(#lb-a)" strokeWidth="10" filter="url(#lb-blur)" />
          <path className="lb-breathe" d="M0 360 C 300 220, 600 220, 900 330 S 1500 470, 1800 330 S 2250 220, 2400 300" fill="none" stroke="url(#lb-a)" strokeWidth="2.2" />
        </g>
        <g className="lb-drift lb-rev">
          <path d="M0 470 C 400 520, 700 380, 1100 420 S 1700 560, 2000 450 S 2300 380, 2400 420" fill="none" stroke="url(#lb-b)" strokeWidth="8" opacity="0.8" filter="url(#lb-blur)" />
          <path d="M0 470 C 400 520, 700 380, 1100 420 S 1700 560, 2000 450 S 2300 380, 2400 420" fill="none" stroke="url(#lb-b)" strokeWidth="1.6" opacity="0.9" />
        </g>
      </svg>
      {/* fine grain keeps the gradients from banding */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
    </div>
  );
}
