
import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onSelectArticle: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelectArticle }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-teal-500/20 ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
      <div className="p-6 sm:p-8">
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
            <span>By {article.author}</span>
            {article.date && (
                <>
                    <span className="mx-2">•</span>
                    <span>{article.date}</span>
                </>
            )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          {article.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <span key={tag} className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-medium px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6 sm:p-8 pt-4">
        <button
          onClick={() => onSelectArticle(article)}
          className="inline-block bg-teal-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-teal-600 transition-colors duration-300"
        >
          Read More
        </button>
      </div>
    </div>
  );
};
