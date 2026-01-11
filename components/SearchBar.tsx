import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, CreditCard, Settings, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  path: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: '1', label: 'Ir para Dashboard', category: 'Navegação', icon: LayoutDashboard, path: '/dashboard' },
  { id: '3', label: 'Faturas e Planos', category: 'Navegação', icon: CreditCard, path: '/billing' },
  { id: '4', label: 'Configurações da Plataforma', category: 'Navegação', icon: Settings, path: '/settings' },
  { id: '5', label: 'Comandos do Sistema', category: 'Ação', icon: Command, path: '/dashboard' },
];

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Scroll to minimize
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine state
  const isExpanded = !isScrolled || isFocused || isHovered;

  const filteredResults = MOCK_RESULTS.filter(r => 
    r.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setIsFocused(false);
    inputRef.current?.blur();
    setQuery('');
  };

  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`
          relative flex items-center
          transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          bg-[#161616]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50
          overflow-hidden
          ${isExpanded ? 'w-[450px] rounded-2xl h-12 px-4' : 'w-12 h-12 rounded-full justify-center cursor-pointer'}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        <Search 
          size={18} 
          className={`
            text-zinc-400 shrink-0 transition-transform duration-300
            ${!isExpanded ? 'scale-110 text-white' : ''}
          `} 
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Buscar ou navegar..."
          className={`
            bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500
            ml-3 w-full h-full
            transition-all duration-300
            ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'}
          `}
        />

        {/* Shortcut Hint */}
        <div className={`
            flex items-center gap-1 text-[10px] text-zinc-500 font-medium bg-white/5 px-2 py-1 rounded border border-white/5
            transition-opacity duration-300
            ${isExpanded && !query && !isFocused ? 'opacity-100' : 'opacity-0 hidden'}
        `}>
          <span className="text-xs">⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Results Dropdown */}
      <div className={`
        absolute top-14 w-[450px]
        bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden
        transition-all duration-300 origin-top
        ${isFocused && isExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
      `}>
        <div className="p-2">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">
            Sugestões
          </div>
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <button
                key={result.id}
                onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur before click
                    handleSelect(result.path);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                    <result.icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200 group-hover:text-white">{result.label}</div>
                    <div className="text-[10px] text-zinc-500">{result.category}</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-zinc-500 text-sm">
              Nenhum resultado para "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};