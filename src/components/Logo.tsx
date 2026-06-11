import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export default function Logo({ className = '', variant = 'dark', showText = true }: LogoProps) {
  // Dark variant uses white header text; Light variant uses dark slate text
  const primaryTextColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const accentTextColor = 'text-amber-400';
  const tealTextColor = 'text-teal-400';

  return (
    <div id="logistica_logo_brand" className={`flex items-center gap-3 ${className}`}>
      {/* High Quality SVG Vector Logo */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 160 160" 
          className="h-10 w-10 md:h-11 md:w-11 drop-shadow-md select-none"
          aria-hidden="true"
        >
          {/* Main Dark Circle Frame */}
          <circle cx="80" cy="80" r="76" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
          
          {/* Base bottom curved path (Road/Highway background segment) */}
          <path 
            d="M 12 100 C 20 40, 140 40, 148 100 C 148 135, 115 156, 80 156 C 45 156, 12 135, 12 100 Z" 
            fill="#1e293b" 
          />
          
          {/* Soft inner blue/slate gradient horizon shadow */}
          <path 
            d="M 18 102 C 30 75, 130 75, 142 102" 
            stroke="#334155" 
            strokeWidth="5" 
            fill="none" 
          />

          {/* Golden/White road stripes representing connectivity and onboarding paths */}
          {/* Left road lane boundary */}
          <path 
            d="M 22 134 C 40 100, 72 108, 76 156" 
            stroke="#ffffff" 
            strokeWidth="3.5" 
            fill="none" 
          />
          {/* Middle dividing dotted highway lines */}
          <path 
            d="M 52 142 C 65 112, 100 114, 114 152" 
            stroke="#ffffff" 
            strokeWidth="3" 
            strokeDasharray="7 5"
            fill="none" 
          />
          {/* Right road lane boundary */}
          <path 
            d="M 85 156 C 90 120, 122 110, 138 134" 
            stroke="#ffffff" 
            strokeWidth="3.5" 
            fill="none" 
          />

          {/* Overlapping People Team Icons */}
          {/* 1. Left Colleague (Turquoise-Blue) */}
          <circle cx="38" cy="45" r="11.5" fill="#1f6482" />
          <path 
            d="M 14 82 C 14 56, 62 56, 62 82 Z" 
            fill="#1f6482" 
          />

          {/* 2. Right Colleague (Golden-Yellow) */}
          <circle cx="122" cy="45" r="11.5" fill="#facc15" />
          <path 
            d="M 98 82 C 98 56, 146 56, 146 82 Z" 
            fill="#facc15" 
          />

          {/* 3. CENTER Master Leader/Mentor (Green-Teal, overlays both and taller) */}
          <path 
            d="M 44 82 C 44 48, 116 48, 116 82 Z" 
            fill="#30b3a2" 
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <circle cx="80" cy="32" r="14" fill="#30b3a2" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Typography block from the corporate logo image */}
      {showText && (
        <div id="logo_text_brand" className="flex flex-col select-none">
          <span className={`text-[15px] font-black tracking-wide leading-none uppercase font-sans ${primaryTextColor}`}>
            LOGÍSTICA
          </span>
          <span className={`text-[10px] font-extrabold tracking-wider leading-none mt-0.5 ${accentTextColor}`}>
            CONECTAMOS MAZ
          </span>
          <span className={`text-[9.5px] font-black tracking-[0.2em] leading-none text-right mt-0.5 ${tealTextColor}`}>
            PEOPLE
          </span>
        </div>
      )}
    </div>
  );
}
