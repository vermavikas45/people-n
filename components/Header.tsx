
import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
    onGoHome: () => void;
    onNavigate: (page: 'home' | 'articles' | 'about') => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, onNavigate, theme, onToggleTheme }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300"
            onClick={onGoHome}
            >
            People<sup className="text-lg top-[-0.5em] relative">n</sup>
          </div>
          <nav className="flex items-center space-x-8">
            <button onClick={() => onNavigate('home')} className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300">Home</button>
            <button onClick={() => onNavigate('articles')} className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300">Articles</button>
            <button onClick={() => onNavigate('about')} className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300">About</button>
            <button 
                onClick={onToggleTheme}
                className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
