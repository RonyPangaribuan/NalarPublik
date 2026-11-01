'use client'

import React from 'react'

interface TobaTopoBackgroundProps {
  className?: string
  variant?: 'hero' | 'full'
}

export function TobaTopoBackground({ className = '', variant = 'hero' }: TobaTopoBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* ── Layer 1: Iconic Lake Toba Photographic Panoramic Landscape (Full 100vh Viewport) ── */}
      <div className="absolute top-0 left-0 right-0 h-screen min-h-[700px] w-full overflow-hidden">
        {/* Real Scenic Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-[1.02] transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('/images/toba-hero.jpg')",
            backgroundPosition: 'center 40%',
          }}
        />

        {/* ── Layer 2: Editorial Subtle Gradient Wash ── */}
        {/* Soft, minimal vignette on the left for text readability, keeping the scenic vista clear and vivid */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent/10 dark:from-background/80 dark:via-background/50 dark:to-transparent/20" />
        
        {/* Vertical fade ONLY at the bottom 20% edge of the 100vh first fold */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-80% to-background dark:from-transparent dark:via-transparent dark:via-80% to-background" />
      </div>

      {/* ── Layer 3: Cartographic Grid & Geodetic Coordinate Overlays ── */}
      <svg
        className="absolute inset-0 w-full h-screen min-h-[700px] opacity-40 dark:opacity-25"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="cartoGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-slate-400/50 dark:text-slate-600/60"
              strokeDasharray="2 4"
            />
            {/* Geodetic Intersection Crosshairs */}
            <path
              d="M -5 0 L 5 0 M 0 -5 L 0 5"
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-500/70 dark:text-slate-400/70"
            />
          </pattern>
        </defs>

        <rect width="1440" height="900" fill="url(#cartoGrid)" />

        {/* Cartographic Coordinates */}
        <g className="font-mono text-[9px] fill-slate-600/70 dark:fill-slate-400/60 font-semibold select-none">
          <text x="36" y="60">02°35&apos;00&quot; N</text>
          <text x="36" y="280">02°25&apos;00&quot; N</text>
          <text x="36" y="500">02°15&apos;00&quot; N</text>

          <text x="380" y="850">99°04&apos;00&quot; E</text>
          <text x="740" y="850">99°10&apos;00&quot; E</text>
          <text x="1100" y="850">99°18&apos;00&quot; E</text>

          {/* Region Tag */}
          <text x="1160" y="65" className="text-[10px] font-bold tracking-widest fill-slate-600/70 dark:fill-slate-400/70">
            DANAU TOBA · KODE BPS 1212
          </text>
          <text x="1160" y="80" className="text-[9px] fill-slate-500/60 dark:fill-slate-500/60">
            ELEVASI PERMUKAAN AIR: 905 MDPL
          </text>
        </g>
      </svg>

      {/* ── Layer 4: Global Page Base Fade (For Lower Sections) ── */}
      <div className="absolute top-[100vh] bottom-0 left-0 right-0 bg-background transition-colors duration-300" />
    </div>
  )
}
