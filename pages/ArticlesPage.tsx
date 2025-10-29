
import React from 'react';
import { Article } from '../types';
import { ArticleList } from '../components/ArticleList';

interface ArticlesPageProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ articles, onSelectArticle }) => {
  return (
    <ArticleList 
        articles={articles} 
        onSelectArticle={onSelectArticle}
        title="All Articles"
    />
  );
};
