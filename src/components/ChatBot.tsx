import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hi! I'm your personal stylist. Need help finding the perfect outfit to match your sneakers?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.slice(1).map(m => ({ role: m.role, text: m.text })) // omit initial greeting
        }),
      });

      if (!response.ok) throw new Error('Response not OK');
      const data = await response.json();
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Oops! Something went wrong. Let's try that again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-orange-500 text-white shadow-xl hover:bg-orange-400 hover:scale-110 transition-all z-40 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-[400px] h-[500px] max-h-[80vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6" />
                <h3 className="font-bold tracking-widest uppercase text-sm">Stylist Bot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-br-sm' 
                      : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/5 rounded-2xl rounded-bl-sm p-3 text-sm text-slate-400 flex items-center space-x-1">
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20 shrink-0">
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a styling question..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
