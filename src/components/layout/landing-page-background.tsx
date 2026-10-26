import React from 'react';
import blueBlurBg from '../../assets/blue_blur_background 3.gif';

export function LandingPageBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none bg-white select-none z-0"
      aria-hidden="true"
    >
      {/* Fluid Ambient GIF Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={typeof blueBlurBg === 'string' ? blueBlurBg : blueBlurBg.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center select-none animate-smooth-ambient"
          style={{
            filter: 'blur(55px) saturate(1.15)',
            transform: 'scale(1.08) translateZ(0)',
            opacity: 0.96,
          }}
        />
      </div>

      {/* Center luminous wash for contrast */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 75%)',
        }}
      />

      {/* Precision 50px Grid */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
            linear-gradient(to right, rgba(48, 82, 130, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(48, 82, 130, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          backgroundPosition: 'center center',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 1%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 88%, transparent 99%)',
          maskImage:
            'linear-gradient(to bottom, transparent 1%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 88%, transparent 99%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/70 to-transparent pointer-events-none" />
    </div>
  );
}
