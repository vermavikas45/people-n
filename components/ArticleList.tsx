
import React, { useState, useMemo } from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  title?: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelectArticle, title = "Featured Articles" }) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach(article => {
      article.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!activeTag) {
      return articles;
    }
    return articles.filter(article => article.tags.includes(activeTag));
  }, [articles, activeTag]);

  const TagButton: React.FC<{ tag: string | null; children: React.ReactNode }> = ({ tag, children }) => {
    const isActive = activeTag === tag;
    const baseClasses = "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300";
    const activeClasses = "bg-teal-500 text-white";
    const inactiveClasses = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600";
    
    return (
        <button onClick={() => setActiveTag(tag)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
  };

  return (
    <div id="articles" className="bg-slate-50 dark:bg-slate-900 py-12 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center text-slate-900 dark:text-white mb-8">
          {title}
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            <TagButton tag={null}>All</TagButton>
            {allTags.map(tag => (
                <TagButton key={tag} tag={tag}>{tag}</TagButton>
            ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onSelectArticle={onSelectArticle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
