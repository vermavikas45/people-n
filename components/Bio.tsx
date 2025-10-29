
import React from 'react';

interface BioProps {
  name: string;
  description: string;
  imageUrl: string;
}

export const Bio: React.FC<BioProps> = ({ name, description, imageUrl }) => {
  return (
    <div id="about" className="bg-white dark:bg-slate-900 py-16 sm:py-20 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
          {/* Image Column */}
          <div className="md:col-span-1 h-96 md:h-full">
            <img
              className="w-full h-full object-cover object-top"
              src={imageUrl}
              alt={`Portrait of ${name}`}
            />
          </div>

          {/* Text Column */}
          <div className="md:col-span-2 bg-slate-100 dark:bg-slate-800 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              About Me
            </h2>
            
            <div
              className="prose prose-lg max-w-none prose-p:text-slate-600 dark:prose-headings:text-slate-900 dark:prose-invert dark:prose-p:text-slate-300 dark:prose-headings:text-white"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
