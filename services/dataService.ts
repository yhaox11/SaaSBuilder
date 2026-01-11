import { supabase, isSupabaseConfigured } from './supabase';
import { DashboardMetrics, User, Subscription, Plan } from '../types';

// Fallback robusto
const EMPTY_METRICS: DashboardMetrics = {
  totalRevenue: 0,
  revenueGrowth: 0,
  averageTicket: 0,
  ticketGrowth: 0,
  newCustomers: 0,
  customerGrowth: 0,
  revenueHistory: [
    { date: 'Jan', value: 0 },
    { date: 'Fev', value: 0 },
    { date: 'Mar', value: 0 },
    { date: 'Abr', value: 0 },
    { date: 'Mai', value: 0 },
    { date: 'Jun', value: 0 }
  ]
};

// --- USERS SERVICE ---

export const fetchUsers = async (tenantId: string): Promise<User[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data.map((profile: any) => ({
    id: profile.id,
    name: profile.full_name || 'Unnamed User',
    email: profile.email,
    role: profile.role || 'user',
    tenantId: profile.tenant_id,
    status: profile.status || 'Active',
    lastActive: new Date(profile.last_active).toLocaleDateString('pt-BR'),
    avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`
  }));
};

// --- BILLING SERVICE ---

export const fetchSubscriptionDetails = async (tenantId: string): Promise<Subscription | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Tenta buscar a assinatura
    const { data: subData, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (
          id,
          name,
          price,
          interval
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle(); // maybeSingle evita erro se não existir

    // Se não existir assinatura ou der erro, retorna plano Free/Demo
    if (error || !subData) {
      return {
        status: 'inactive',
        plan: { 
            id: 'free_tier', 
            name: 'Plano Gratuito', 
            price: 0, 
            interval: 'month' 
        },
        nextBillingDate: new Date().toLocaleDateString('pt-BR')
      };
    }

    const planData = subData.plans as any; 
    
    // Override manual para o preço do plano Lifetime
    let price = planData?.price || 0;
    if (planData?.name?.toLowerCase() === 'lifetime') {
        price = 297;
    }

    // O nome agora virá diretamente do banco (ex: "Mensal" ou "Lifetime")
    return {
      status: subData.status,
      plan: {
        id: planData?.id || 'unknown',
        name: planData?.name || 'Plano Personalizado', 
        price: price,
        interval: planData?.interval || 'month'
      },
      nextBillingDate: new Date(subData.current_period_end).toLocaleDateString('pt-BR')
    };
  } catch (e) {
    console.error("Billing fetch error:", e);
    return null;
  }
};

// --- DASHBOARD METRICS SERVICE ---

export const fetchDashboardMetrics = async (tenantId: string): Promise<DashboardMetrics> => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured.");
    return EMPTY_METRICS;
  }

  try {
    // 1. Fetch Revenue History
    const { data: revenueData, error: revError } = await supabase
      .from('revenue_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: true })
      .limit(6);

    if (revError) {
        console.error("Error fetching revenue:", revError);
        // Não lançar erro, retornar vazio para não quebrar a UI
        return EMPTY_METRICS;
    }

    // Se não tiver dados, retorna vazio mas estruturado
    if (!revenueData || revenueData.length === 0) {
        return EMPTY_METRICS;
    }

    // Calcular Métricas baseadas nos dados reais
    const history = revenueData.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('pt-BR', { month: 'short' }),
        value: Number(d.value)
    }));

    const currentRevenue = history[history.length - 1]?.value || 0;
    const previousRevenue = history[history.length - 2]?.value || 0;
    
    // Evitar divisão por zero
    const revenueGrowth = previousRevenue === 0 ? 0 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // Buscar contagem de clientes (usando profiles como proxy para clientes neste modelo)
    const { count: customerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

    const totalCustomers = customerCount || 0;
    const avgTicket = totalCustomers > 0 ? currentRevenue / totalCustomers : 0;

    return {
        totalRevenue: currentRevenue,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        averageTicket: Number(avgTicket.toFixed(2)),
        ticketGrowth: 0, 
        newCustomers: totalCustomers, 
        customerGrowth: 0, 
        revenueHistory: history.length > 0 ? history : EMPTY_METRICS.revenueHistory
    };

  } catch (e) {
    console.error("Error fetching metrics:", e);
    return EMPTY_METRICS;
  }
};