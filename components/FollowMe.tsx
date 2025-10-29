
import React from 'react';
import { LinkedInIcon } from './icons/LinkedInIcon';

export const FollowMe: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Follow Me
      </h2>
      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
        Connect with me on LinkedIn for more insights on leadership, culture, and strategy.
      </p>
      <a
        href="https://www.linkedin.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
      >
        <LinkedInIcon />
        Connect on LinkedIn
      </a>
    </div>
  );
};
