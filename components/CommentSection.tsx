import React, { useState } from 'react';
import { Comment } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (comment: { author: string; content: string }) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && content.trim()) {
      onAddComment({ author, content });
      setAuthor('');
      setContent('');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Comments ({comments.length})</h2>
      
      <div className="space-y-6 mb-10">
        {comments.length > 0 ? (
            comments.map(comment => (
            <div key={comment.id} className="bg-slate-100 dark:bg-slate-800 p-5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-teal-600 dark:text-teal-400">{comment.author}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{comment.date}</p>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
            </div>
            ))
        ) : (
            <p className="text-slate-500 dark:text-slate-400">Be the first to leave a comment.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Leave a Comment</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comment</label>
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-teal-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-teal-600 transition-colors duration-300"
            >
              Submit Comment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};