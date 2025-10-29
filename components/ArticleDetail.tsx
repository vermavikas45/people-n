import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Article, Comment } from '../types';
import { CommentSection } from './CommentSection';
import { summarizeArticle, generateArticleAudio } from '../services/geminiService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { CloseIcon } from './icons/CloseIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface ArticleDetailProps {
  article: Article;
  onGoBack: () => void;
  onAddComment: (articleId: string, comment: Omit<Comment, 'id' | 'date'>) => void;
}

// Audio decoding helpers, as per Gemini API documentation.
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onGoBack, onAddComment }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing' | 'paused' | 'error'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup function to stop audio and release resources when the component unmounts
    return () => {
      audioSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setIsModalOpen(true);
    setSummary(''); // Clear previous summary
    const result = await summarizeArticle(article.content);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleAudioClick = async () => {
    // Generate audio if it doesn't exist
    if (audioState === 'idle') {
      setAudioState('generating');
      try {
        const base64Audio = await generateArticleAudio(article.content);
        if (!base64Audio) throw new Error("Audio generation failed.");

        // FIX: Cast window to 'any' to allow access to the prefixed webkitAudioContext for broader browser compatibility.
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

        source.onended = () => {
            setAudioState('idle');
            audioContextRef.current?.close();
            audioContextRef.current = null;
            audioSourceRef.current = null;
        };
        
        audioContextRef.current = audioContext;
        audioSourceRef.current = source;
        setAudioState('playing');

      } catch (error) {
        console.error("Failed to play audio:", error);
        setAudioState('error');
      }
    } else if (audioState === 'playing') {
      audioContextRef.current?.suspend();
      setAudioState('paused');
    } else if (audioState === 'paused') {
      audioContextRef.current?.resume();
      setAudioState('playing');
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSummary('');
  };

  const readingTime = useMemo(() => {
    const text = article.content.replace(/<[^>]*>?/gm, '');
    const wordsPerMinute = 225;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, [article.content]);

  const articleUrl = `${window.location.origin}${window.location.pathname}?articleId=${article.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };
  
  const renderAudioButton = () => {
    let text = 'Listen to Article';
    let icon = <SpeakerIcon />;
    let disabled = false;
    let buttonClass = "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600";

    switch(audioState) {
        case 'generating':
            text = 'Generating Audio...';
            disabled = true;
            break;
        case 'playing':
            text = 'Pause Audio';
            icon = <PauseIcon />;
            buttonClass = "bg-teal-100 dark:bg-teal-900";
            break;
        case 'paused':
            text = 'Resume Audio';
            icon = <PlayIcon />;
            buttonClass = "bg-teal-100 dark:bg-teal-900";
            break;
        case 'error':
            text = 'Audio Error';
            disabled = true;
            buttonClass = "bg-red-200 dark:bg-red-900";
            break;
    }

    return (
        <button 
            onClick={handleAudioClick}
            disabled={disabled}
            className={`inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-white rounded-lg transition-colors duration-300 ${buttonClass}`}
        >
            {icon}
            {text}
        </button>
    );
  };

  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(article.title);
  const encodedExcerpt = encodeURIComponent(article.excerpt);

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`;
  
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 mb-8 transition-colors duration-300"
          >
            <ArrowLeftIcon />
            Back to Articles
          </button>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">{article.title}</h1>
          <div className="flex items-center text-slate-500 dark:text-slate-400 mb-4 space-x-4">
              <span className="font-semibold">{article.author}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              {article.date && (
                <>
                  <span>{article.date}</span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                </>
              )}
              <span>{readingTime} min read</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map(tag => (
              <span key={tag} className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-sm font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-white rounded-lg transition-colors duration-300"
            >
              <SparklesIcon />
              Summarize with AI
            </button>
            {renderAudioButton()}
          </div>


          <div className="flex items-center gap-4 my-8 border-y border-slate-200 dark:border-slate-700 py-4">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Share this article:</p>
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
              aria-label="Share on Twitter"
            >
              <TwitterIcon />
            </a>
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
              aria-label="Share on LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <div className="relative">
              <button
                onClick={handleCopyLink}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
                aria-label="Copy article link"
              >
                <CopyIcon />
              </button>
              {isLinkCopied && (
                <div className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  Link Copied!
                </div>
              )}
            </div>
          </div>

          <div 
            className="prose prose-lg max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 dark:prose-invert dark:prose-p:text-slate-300 dark:prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
          
          <hr className="border-slate-200 dark:border-slate-700 my-12" />

          <CommentSection 
            comments={article.comments} 
            onAddComment={(comment) => onAddComment(article.id, comment)} 
          />
        </div>
      </div>

      {isModalOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            aria-labelledby="summary-modal-title"
            role="dialog"
            aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 id="summary-modal-title" className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <SparklesIcon />
                AI-Powered Summary
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div className="p-6">
              {isSummarizing ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{summary}</p>
                    <button 
                        onClick={handleCopy}
                        className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <CopyIcon />
                        {isCopied ? 'Copied!' : 'Copy Summary'}
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};