import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  Map, 
  Sparkles
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const DockItem = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  label 
}: { 
  icon: React.ElementType, 
  isActive: boolean, 
  onClick: () => void,
  label: string
}) => {
  return (
    <div className="group relative flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`
          relative flex items-center justify-center w-12 h-12 rounded-2xl
          transition-all duration-300 ease-out
          hover:-translate-y-2 hover:scale-110
          ${isActive 
            ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
            : 'bg-transparent hover:bg-white/10'}
          border border-transparent hover:border-white/10
        `}
      >
        <Icon 
          size={24} 
          className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`} 
        />
        
        {/* Active Dot Indicator */}
        {isActive && (
          <span className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#10B981]" />
        )}
      </button>
      
      {/* Tooltip */}
      <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform duration-200 px-3 py-1 bg-gray-800 text-xs font-medium text-white rounded-lg border border-white/10 shadow-xl pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export const MacDock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="
        flex items-end gap-3 px-4 py-3
        bg-[#111]/60 backdrop-blur-2xl
        border border-white/10
        rounded-[2rem]
        shadow-2xl shadow-black/50
      ">
        <DockItem 
          icon={LayoutDashboard} 
          isActive={path === '/dashboard'} 
          onClick={() => navigate('/dashboard')} 
          label="Dashboard"
        />
        <DockItem 
          icon={Map} 
          isActive={path === '/prospecting'} 
          onClick={() => navigate('/prospecting')} 
          label="Prospecção"
        />
        
        {/* Divider */}
        <div className="w-[1px] h-10 bg-white/10 mx-1" />
        
        <DockItem 
          icon={Sparkles} 
          isActive={path === '/ai-insights'} 
          onClick={() => navigate('/ai-insights')} 
          label="AI Insights"
        />
        <DockItem 
          icon={CreditCard} 
          isActive={path === '/billing'} 
          onClick={() => navigate('/billing')} 
          label="Assinatura"
        />
        <DockItem 
          icon={Settings} 
          isActive={path === '/settings'} 
          onClick={() => navigate('/settings')} 
          label="Configurações"
        />
      </div>
    </div>
  );
};