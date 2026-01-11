import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Zap, HardDrive, Database, Loader2, Crown, ShieldCheck } from 'lucide-react';
import { fetchSubscriptionDetails } from '../services/dataService';
import { Subscription } from '../types';

interface BillingProps {
  tenantId: string;
}

export const Billing: React.FC<BillingProps> = ({ tenantId }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadBilling = async () => {
      setIsLoading(true);
      const data = await fetchSubscriptionDetails(tenantId);
      setSubscription(data);
      setIsLoading(false);
    };
    loadBilling();
  }, [tenantId]);

  if (isLoading) {
    return (
        <div className="w-full h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
    );
  }

  // Fallback se não tiver dados no banco ainda
  const planName = subscription?.plan?.name || "Plano Indefinido";
  const planPrice = subscription?.plan?.price || 0;
  const isLifetime = planName.toLowerCase() === 'lifetime';

  return (
    <div className="w-full max-w-7xl mx-auto p-6 pb-32 animate-fade-in-up">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Minha Assinatura</h1>
        <p className="text-zinc-500 mt-2">Gerencie seu plano de acesso e pagamentos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Plan Card */}
        <div className={`
            lg:col-span-2 rounded-2xl p-6 relative overflow-hidden border
            ${isLifetime 
                ? 'bg-gradient-to-br from-amber-500/10 to-[#0A0A0A] border-amber-500/20' 
                : 'bg-gradient-to-br from-[#10B981]/10 to-[#0A0A0A] border-[#10B981]/20'}
        `}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`font-semibold tracking-wider text-xs uppercase mb-1 block ${isLifetime ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Seu Plano
                </span>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    {planName}
                    {isLifetime && <Crown size={24} className="text-amber-500" />}
                </h2>
              </div>
              <span className={`text-black text-xs font-bold px-3 py-1 rounded-full ${isLifetime ? 'bg-amber-500' : 'bg-[#10B981]'}`}>
                {subscription?.status === 'active' ? 'ATIVO' : 'INATIVO'}
              </span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-white">R$ {planPrice}</span>
              <span className="text-zinc-400">/{isLifetime ? 'único' : 'mês'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Check size={16} className={isLifetime ? 'text-amber-500' : 'text-emerald-500'} />
                <span>Licença de Uso Individual</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Check size={16} className={isLifetime ? 'text-amber-500' : 'text-emerald-500'} />
                <span>Prospecção com IA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Check size={16} className={isLifetime ? 'text-amber-500' : 'text-emerald-500'} />
                <span>Suporte via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Check size={16} className={isLifetime ? 'text-amber-500' : 'text-emerald-500'} />
                <span>{isLifetime ? 'Acesso Vitalício Garantido' : 'Cobrança Mensal'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-zinc-400 font-medium text-sm mb-4">Método de Pagamento</h3>
            <div className="flex items-center gap-4 bg-[#161616] p-4 rounded-xl border border-white/5 mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                <CreditCard className="text-white" size={20} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Visa final 4242</p>
                <p className="text-zinc-500 text-xs">Expira 12/28</p>
              </div>
            </div>
          </div>
          <button className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm transition-colors">
            Alterar Cartão
          </button>
        </div>
      </div>

      {/* Account Limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Zap size={18} /></div>
            <h3 className="text-zinc-200 font-medium">Consultas IA</h3>
          </div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-zinc-400">Mensal</span>
            <span className="text-white">{isLifetime ? 'Ilimitado' : '500 Consultas'}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className={`h-2 rounded-full ${isLifetime ? 'bg-amber-500 w-full' : 'bg-purple-500 w-[45%]'}`}></div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Database size={18} /></div>
            <h3 className="text-zinc-200 font-medium">Leads Salvos</h3>
          </div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-zinc-400">Total</span>
            <span className="text-white">{isLifetime ? 'Ilimitado' : '1.000 Leads'}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className={`h-2 rounded-full ${isLifetime ? 'bg-amber-500 w-full' : 'bg-blue-500 w-[20%]'}`}></div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ShieldCheck size={18} /></div>
            <h3 className="text-zinc-200 font-medium">Status da Conta</h3>
          </div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-emerald-400">Verificado</span>
            <span className="text-white">Nível {isLifetime ? 'Pro' : 'Standard'}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};