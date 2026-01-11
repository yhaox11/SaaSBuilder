import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface DashboardProps {
  data: DashboardMetrics;
  isLoading: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  prefix = "", 
  icon: Icon 
}: { 
  title: string, 
  value: string | number, 
  trend: number, 
  prefix?: string,
  icon: React.ElementType
}) => {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
      {/* Subtle glow effect on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-zinc-400 font-medium text-sm tracking-wide uppercase">{title}</h3>
        <div className="p-2 bg-white/5 rounded-xl border border-white/5">
          <Icon size={16} className="text-zinc-300" />
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : value}
        </span>
        
        <div className="flex items-center gap-2 mt-2">
          <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
            isPositive 
              ? 'text-emerald-400 bg-emerald-400/10' 
              : 'text-rose-400 bg-rose-400/10'
          }`}>
            {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-zinc-500 text-xs">vs. mês passado</span>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-pulse-slow text-primary font-bold text-xl tracking-widest">LOADING ENTERPRISE DATA...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 pb-32">
      <header className="mb-10 mt-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
          Dashboard de Faturamento
        </h1>
        <p className="text-zinc-500 mt-2">Uma visão geral da performance financeira do seu negócio.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          title="Faturamento Total" 
          value={data.totalRevenue} 
          trend={data.revenueGrowth} 
          prefix="R$ "
          icon={DollarSign}
        />
        <MetricCard 
          title="Ticket Médio" 
          value={data.averageTicket} 
          trend={data.ticketGrowth} 
          prefix="R$ "
          icon={CreditCard}
        />
        <MetricCard 
          title="Novos Clientes" 
          value={data.newCustomers} 
          trend={data.customerGrowth} 
          icon={Users}
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative">
         <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Receita nos Últimos 6 Meses</h2>
              <p className="text-zinc-500 text-sm mt-1">Uma visão geral da evolução do faturamento.</p>
            </div>
            {/* Chart Actions */}
            <div className="flex gap-2">
                {['7D', '1M', '3M', '6M', '1Y'].map((period) => (
                    <button 
                        key={period} 
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === '6M' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                        {period}
                    </button>
                ))}
            </div>
         </div>

         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueHistory}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                  tickFormatter={(val) => `R$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
