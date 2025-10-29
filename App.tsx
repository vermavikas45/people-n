
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { Footer } from './components/Footer';
import { Article, Comment, Bio as BioType } from './types';
import { CallToAction } from './components/CallToAction';
import { Bio } from './components/Bio';
import { fetchArticles, fetchAssetUrl, fetchBioDescription } from './services/contentfulService';
import { ContentfulDebug } from './components/ContentfulDebug';
import { CONTENTFUL_CONFIG } from './config';
import { AboutPage } from './pages/AboutPage';
import { ArticlesPage } from './pages/ArticlesPage';

type Theme = 'light' | 'dark';
type Page = 'home' | 'articles' | 'about';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');
  const [bio, setBio] = useState<BioType | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const [fetchedArticles, bannerUrl, bioImageUrl, bioDescription] = await Promise.all([
          fetchArticles(),
          fetchAssetUrl('4bcVl2MVxuW5I5GDJNhmur'),
          fetchAssetUrl('Pg83pwXzFy1X5DozK4XZm'),
          fetchBioDescription()
        ]);
        
        setArticles(fetchedArticles);
        setBannerImageUrl(bannerUrl);

        setBio({
            name: "Vikas Verma",
            description: bioDescription,
            imageUrl: bioImageUrl,
        });

      } catch (err) {
        console.error("Failed to load content:", err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred while loading content.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // This effect handles URL changes for routing, including deep links and browser navigation.
    if (articles.length === 0) return;

    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const articleIdParam = urlParams.get('articleId');
      const pageParam = urlParams.get('page') as Page | null;

      if (articleIdParam) {
        const articleFromUrl = articles.find(a => a.id === articleIdParam);
        if (articleFromUrl) {
          setSelectedArticle(articleFromUrl);
          setCurrentPage('home'); // Treat article view as a special state
        }
      } else if (pageParam === 'about') {
        setSelectedArticle(null);
        setCurrentPage('about');
      } else if (pageParam === 'articles') {
        setSelectedArticle(null);
        setCurrentPage('articles');
      } else {
        setSelectedArticle(null);
        setCurrentPage('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [articles]);

  useEffect(() => {
    if (selectedArticle || currentPage !== 'home') {
      window.scrollTo(0, 0);
    }
  }, [selectedArticle, currentPage]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleNavigate = (page: Page) => {
    if (page === currentPage && !selectedArticle) return; // Avoid re-rendering the same page

    setCurrentPage(page);
    setSelectedArticle(null);
    const newUrl = page === 'home' ? window.location.pathname : `${window.location.pathname}?page=${page}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    const newUrl = `${window.location.pathname}?articleId=${article.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleGoBack = () => {
    // When going back from an article, navigate to the main articles page.
    handleNavigate('articles');
  };

  const handleGoHome = () => {
    handleNavigate('home');
  };

  const handleAddComment = (articleId: string, comment: Omit<Comment, 'id' | 'date'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    const updatedArticles = articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          comments: [...article.comments, newComment],
        };
      }
      return article;
    });

    setArticles(updatedArticles);

    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-lg shadow-md">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
              Configuration Error
            </h3>
            <p className="mt-2 text-red-700 dark:text-red-300">
              {error}
            </p>
             <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              Please check the Content Model Inspector below to diagnose the issue.
            </p>
          </div>
          <ContentfulDebug contentTypeId={CONTENTFUL_CONFIG.contentTypeId} />
        </div>
      );
    }
    
    if (selectedArticle) {
        return (
          <ArticleDetail
            article={selectedArticle}
            onGoBack={handleGoBack}
            onAddComment={handleAddComment}
          />
        );
    }
    
    switch(currentPage) {
        case 'articles':
            return <ArticlesPage articles={articles} onSelectArticle={handleSelectArticle} />;
        case 'about':
            return bio ? <AboutPage bio={bio} /> : null;
        case 'home':
        default:
            return (
              <>
                <Hero bannerImageUrl={bannerImageUrl} />
                <ArticleList
                  articles={articles}
                  onSelectArticle={handleSelectArticle}
                />
                <CallToAction onNavigate={handleNavigate} />
                {bio && <Bio {...bio} />}
              </>
            );
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onGoHome={handleGoHome} onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
