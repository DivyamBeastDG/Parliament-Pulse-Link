import React from 'react';

export function IndianEmblem({ className = "w-10 h-10 text-white" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 120" 
      fill="currentColor" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
    >
      {/* Lotus Base */}
      <path d="M20,105 Q50,120 80,105 Q50,112 20,105 Z" opacity="0.9"/>
      
      {/* Abacus (Base for Lions) */}
      <rect x="25" y="92" width="50" height="8" rx="1" />
      
      {/* Ashoka Chakra on Abacus (Minimalist Cutout) */}
      <circle cx="50" cy="96" r="2.5" fill="none" stroke="black" strokeWidth="0.8" opacity="0.4"/>
      <path d="M50,93.5 L50,98.5 M47.5,96 L52.5,96 M48.2,94.2 L51.8,97.8 M48.2,97.8 L51.8,94.2" stroke="black" strokeWidth="0.4" opacity="0.4"/>

      {/* Main Body (3 Lions Silhouette) */}
      <path d="M30,92 C30,65 35,55 50,55 C65,55 70,65 70,92 Z" />
      
      {/* Left Lion Profile */}
      <path d="M30,75 C22,75 20,65 25,60 C30,55 35,60 35,65 Z" />
      
      {/* Right Lion Profile */}
      <path d="M70,75 C78,75 80,65 75,60 C70,55 65,60 65,65 Z" />
      
      {/* Center Lion Face */}
      <path d="M40,55 C40,40 45,35 50,35 C55,35 60,40 60,55 Z" />
      
      {/* Ears / Mane Details */}
      <circle cx="41" cy="42" r="3.5" />
      <circle cx="59" cy="42" r="3.5" />
      
      {/* Subtle Mane Lines for Texture */}
      <path d="M45,45 L45,55 M50,42 L50,55 M55,45 L55,55" stroke="black" strokeWidth="0.6" opacity="0.15" />
    </svg>
  );
}