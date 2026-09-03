import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { Language } from '../booking/types';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface LearningGuideProps {
  lang: Language;
}

export const LearningGuide: React.FC<LearningGuideProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: isEn
        ? "Assalamu Alaikum! I'm the Learning Guide. How can I help you discover the right learning path with Mahmoud?"
        : "السلام عليكم! أنا مرشد التعلم. كيف يمكنني مساعدتك في اكتشاف المسار التعليمي المناسب مع أستاذ محمود؟"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })).concat({ role: 'user', parts: [{ text: userMessage.content }] });

      const res = await fetch('/api/learning-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: isEn
            ? "I'm currently unable to respond. Please try again later, or contact Mahmoud directly on WhatsApp."
            : "عذراً، لا يمكنني الرد حالياً. يرجى المحاولة لاحقاً أو التواصل مع الأستاذ محمود مباشرة عبر واتساب."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl bg-[#87A878] text-white hover:bg-[#6F907D] transition-colors cursor-pointer flex items-center justify-center group"
          >
            <Sparkles className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out text-sm font-medium">
              {isEn ? 'Learning Guide' : 'مرشد التعلم'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-[#231D28] rounded-2xl shadow-2xl border border-[#87A878]/30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#EDE3D4] dark:bg-[#1E1923] border-b border-[#87A878]/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#87A878]" />
                <h3 className="font-serif font-medium text-[#362E3B] dark:text-[#F5E6D3]">
                  {isEn ? 'AI Learning Guide' : 'المرشد الذكي'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#362E3B]/70 dark:text-[#F5E6D3]/70 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#231D28]/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-[#362E3B] text-white dark:bg-[#F5E6D3] dark:text-[#362E3B]' 
                      : 'bg-[#87A878] text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#362E3B] text-white dark:bg-[#F5E6D3] dark:text-[#362E3B] rounded-tr-sm'
                      : 'bg-white dark:bg-[#1E1923] text-[#362E3B] dark:text-[#F5E6D3] border border-gray-100 dark:border-[#3E3545] rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#87A878] text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1E1923] border border-gray-100 dark:border-[#3E3545] rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#87A878] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#87A878] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#87A878] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-[#231D28] border-t border-gray-100 dark:border-[#3E3545]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isEn ? "Ask me anything..." : "اسألني أي شيء..."}
                  className="flex-1 bg-gray-50 dark:bg-[#1E1923] border border-gray-200 dark:border-[#3E3545] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#87A878] focus:ring-1 focus:ring-[#87A878] text-[#362E3B] dark:text-[#F5E6D3] placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-[#87A878] text-white rounded-xl hover:bg-[#6F907D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
