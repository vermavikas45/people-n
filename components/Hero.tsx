import React from 'react';

interface HeroProps {
  bannerImageUrl: string;
}

export const Hero: React.FC<HeroProps> = ({ bannerImageUrl }) => {
  return (
    <div className="relative bg-slate-100 dark:bg-slate-800 text-white py-20 sm:py-32">
      <div className="absolute inset-0">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt="Hero banner for People^n"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-800"></div> // Placeholder for smooth loading
        )}
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/30"></div>
      </div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Maximizing The Collective Human Potential
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-200 dark:text-slate-300">
          Without the right culture and people systems, an organization is only a sum of its parts.
        </p>
      </div>
    </div>
  );
};