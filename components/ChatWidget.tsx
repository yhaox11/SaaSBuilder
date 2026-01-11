import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react';
import { ChatMessage, DashboardMetrics } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatWidgetProps {
  metrics: DashboardMetrics | null;
}

// Simple Markdown Renderer Component
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split by newlines first to handle paragraphs and lists
  const lines = text.split('\n');

  return (
    <div className="text-sm leading-relaxed">
      {lines.map((line, i) => {
        // Handle bullet points (lines starting with *)
        if (line.trim().startsWith('* ')) {
          const content = line.trim().substring(2);
          return (
            <div key={i} className="flex gap-2 ml-1 mt-1 mb-1">
              <span className="text-emerald-400">•</span>
              <span><InlineStyles text={content} /></span>
            </div>
          );
        }

        // Standard lines
        return (
          <div key={i} className={`${line.trim() === '' ? 'h-2' : 'min-h-[20px]'}`}>
            <InlineStyles text={line} />
          </div>
        );
      })}
    </div>
  );
};

// Helper to handle bold (**text**) parsing
const InlineStyles: React.FC<{ text: string }> = ({ text }) => {
  // Regex to capture **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ metrics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Initial Welcome Message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Dashboard conectado. Analisando métricas em tempo real. O que você precisa saber?",
      timestamp: new Date()
    }
  ]);

  // Refs
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session when metrics are available
  useEffect(() => {
    if (metrics && !chatSessionRef.current) {
      try {
        // Format metrics into a readable context string
        const contextString = `
          Total Revenue: R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}
          Revenue Growth: ${metrics.revenueGrowth}%
          Average Ticket: R$ ${metrics.averageTicket.toLocaleString('pt-BR')}
          New Customers: ${metrics.newCustomers}
          Customer Growth: ${metrics.customerGrowth}%
        `;
        chatSessionRef.current = createChatSession(contextString);
      } catch (e) {
        console.error("Failed to initialize chat", e);
      }
    }
  }, [metrics]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Ensure session exists even if metrics failed (fallback)
    if (!chatSessionRef.current) {
       chatSessionRef.current = createChatSession();
    }

    const userText = input.trim();
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    // Update UI immediately
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "Sem resposta do modelo.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Erro de conexão. Tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={`
          mb-4 w-80 h-[450px] 
          bg-[#111]/90 backdrop-blur-2xl border border-white/10 
          rounded-3xl shadow-2xl flex flex-col overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none absolute bottom-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white leading-none">AI Assistant</h3>
              <span className="text-[10px] text-emerald-400 font-medium">Online • Conectado</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${msg.role === 'model' ? 'bg-white/5 border border-white/5' : 'bg-primary/20 border border-primary/20'}
              `}>
                {msg.role === 'model' ? (
                  <Sparkles size={14} className="text-emerald-400" />
                ) : (
                  <User size={14} className="text-primary" />
                )}
              </div>
              <div className={`space-y-1 max-w-[85%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div className={`
                  p-3 text-sm shadow-sm
                  ${msg.role === 'model' 
                    ? 'bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-zinc-300' 
                    : 'bg-primary text-black font-medium rounded-2xl rounded-tr-none'}
                `}>
                  <FormattedText text={msg.text} />
                </div>
                <span className="text-[10px] text-zinc-600 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                 <Sparkles size={14} className="text-emerald-400" />
               </div>
               <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-white/5 bg-black/20">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre sua receita, leads..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`
                absolute right-2 p-1.5 rounded-lg transition-all
                ${!input.trim() || isTyping 
                  ? 'bg-transparent text-zinc-600 cursor-not-allowed' 
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}
              `}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center justify-center w-14 h-14 rounded-full
          bg-[#111]/80 backdrop-blur-xl border border-white/10
          shadow-[0_8px_30px_rgba(0,0,0,0.5)]
          hover:scale-105 hover:border-emerald-500/30 hover:shadow-emerald-500/10
          active:scale-95
          transition-all duration-300 ease-out
        `}
      >
        <div className="relative">
          <div className={`transition-all duration-300 absolute inset-0 flex items-center justify-center ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
            <MessageSquare size={24} className="text-zinc-300 group-hover:text-white transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111] animate-pulse"></span>
          </div>
          
          <div className={`transition-all duration-300 absolute inset-0 flex items-center justify-center ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
             <X size={24} className="text-white" />
          </div>
        </div>
      </button>
    </div>
  );
};