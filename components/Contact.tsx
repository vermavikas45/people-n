
import React from 'react';

export const Contact: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Contact Me
      </h2>
      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
        Have a question, an idea for collaboration, or just want to connect? I'd love to hear from you.
      </p>
      <a
        href="mailto:verma.vikas45@gmail.com"
        className="inline-block bg-teal-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors duration-300"
      >
        Send an Email
      </a>
    </div>
  );
};
