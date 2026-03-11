import { motion } from 'framer-motion';

export default function ProfessionalBackground() {
  return (
    <>
      {/* === LAYER 1: Base Gradient (Professional Navy) === */}
      <motion.div
        className="fixed inset-0 -z-20 pointer-events-none"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `linear-gradient(
            135deg,
            #0B1120 0%,
            #0F172A 25%,
            #0D141F 50%,
            #0F172A 75%,
            #0B1120 100%
          )`,
          backgroundSize: '200% 200%',
        }}
      />

      {/* === LAYER 2: Workspace Context Layer === */}
      {/* This creates a subtle "desk/workspace" feeling without needing an image */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none opacity-40"
        style={{
          background: `
            linear-gradient(0deg, rgba(255, 200, 100, 0.25) 0%, transparent 30%),
            radial-gradient(circle at 20% 40%, rgba(100, 150, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(255, 200, 100, 0.15) 0%, transparent 50%)
          `,
          backdropFilter: 'blur(40px)',
        }}
      />

      {/* === LAYER 3: Document Papers Silhouette Layer === */}
      <svg
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{ opacity: 0.35 }}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Subtle desk/workspace elements */}
        <defs>
          <pattern id="paper-texture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="none" opacity="0.1" />
            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Stack of document papers (left side) */}
        <g opacity="0.3">
          <rect x="50" y="200" width="300" height="400" fill="rgba(200,200,220,0.3)" rx="8" />
          <rect x="70" y="180" width="300" height="400" fill="rgba(180,180,200,0.25)" rx="8" />
          <rect x="90" y="160" width="300" height="400" fill="rgba(160,160,180,0.2)" rx="8" />
          
          {/* Document lines */}
          <line x1="120" y1="220" x2="320" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <line x1="120" y1="250" x2="320" y2="250" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <line x1="120" y1="280" x2="320" y2="280" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <line x1="120" y1="310" x2="300" y2="310" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </g>

        {/* Laptop glow (right side) */}
        <g opacity="0.25">
          <rect x="700" y="250" width="400" height="280" fill="rgba(100, 150, 255, 0.2)" rx="12" />
          <rect x="720" y="270" width="360" height="220" fill="rgba(150, 180, 255, 0.15)" rx="8" />
          
          {/* Screen elements */}
          <line x1="740" y1="300" x2="1060" y2="300" stroke="rgba(100, 150, 255, 0.3)" strokeWidth="2" />
          <line x1="740" y1="340" x2="1060" y2="340" stroke="rgba(100, 150, 255, 0.2)" strokeWidth="1.5" />
          <line x1="740" y1="370" x2="1000" y2="370" stroke="rgba(100, 150, 255, 0.15)" strokeWidth="1" />
        </g>
      </svg>

      {/* === LAYER 4: Soft Light Source Glows === */}
      {/* Soft purple glow - top right (light source effect) */}
      <motion.div
        className="fixed -top-40 right-0 w-96 h-96 bg-gradient-radial from-purple-500 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        style={{
          opacity: 0.25,
        }}
        animate={{
          y: [0, 20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Soft blue glow - bottom left (light source effect) */}
      <motion.div
        className="fixed -bottom-40 left-0 w-96 h-96 bg-gradient-radial from-blue-500 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        style={{
          opacity: 0.20,
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* === LAYER 5: Warm Workspace Lighting (subtle) === */}
      <motion.div
        className="fixed -top-48 -left-48 w-96 h-96 rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(255, 200, 100, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          opacity: 0.20,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* === LAYER 6: Grain Texture Overlay - Premium Feel === */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /></filter><rect width="100" height="100" fill="%23000" /><rect width="100" height="100" fill="%23fff" opacity="0.08" filter="url(%23noise)" /></svg>')
          `,
          backgroundSize: '100px 100px',
          animation: 'grain-texture 8s steps(10, end) infinite',
          mixBlendMode: 'overlay',
        }}
      />

      {/* === LAYER 7: Vignette Edge Effect === */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)
          `,
        }}
      />
    </>
  );
}
