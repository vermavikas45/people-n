
import React from 'react';

interface CallToActionProps {
  onNavigate: (page: 'articles') => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onNavigate }) => {
  const handleViewArticles = () => {
    onNavigate('articles');
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Ready to Dive Deeper?
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Explore the full collection of articles and join the conversation on maximizing the collective human potential.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={handleViewArticles}
            className="rounded-md bg-teal-500 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 transition-colors duration-300"
          >
            Explore All Articles
          </button>
        </div>
      </div>
    </div>
  );
};
