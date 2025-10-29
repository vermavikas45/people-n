import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { getChatbotResponse } from '../services/geminiService';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can I help you learn more about leadership, culture, or strategy today?",
      sender: 'ai',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { text: userInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const { chat, response } = await getChatbotResponse(chatRef.current, userInput);
      chatRef.current = chat;
      const aiMessage: Message = { text: response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        text: "Apologies, I encountered an error. Please try again.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-5 right-5 z-[99] transition-transform duration-300 ease-in-out ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-900"
          aria-label="Open chat"
        >
          <ChatIcon />
        </button>
      </div>

      <div
        className={`fixed bottom-0 right-0 z-[100] w-full h-full sm:bottom-5 sm:right-5 sm:w-96 sm:h-[70vh] flex flex-col bg-white dark:bg-slate-800 shadow-2xl rounded-t-2xl sm:rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-heading"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 id="chat-heading" className="text-lg font-bold text-slate-900 dark:text-white">AI Assistant</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user'
                  ? 'bg-teal-500 text-white rounded-br-none'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none">
                 <div className="flex items-center justify-center space-x-1 h-5">
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 w-full bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
