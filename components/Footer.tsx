import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} People<sup>n</sup>. All Rights Reserved.</p>
        <p className="text-sm mt-1">Maximizing the collective human potential.</p>
      </div>
    </footer>
  );
};