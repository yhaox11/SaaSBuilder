// Domain Models based on PRD

export interface Tenant {
  id: string; // UUID
  domain: string;
  name: string;
  logoUrl?: string;
  plan: 'startup' | 'business' | 'enterprise'; // Legacy, kept for compatibility, prefer Subscription interface below
  colors: {
    primary: string;
    secondary: string;
  };
  settings: {
    mfaRequired: boolean;
    featureFlags: Record<string, boolean>;
  };
}

export type UserRole = 'user' | 'influencer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string; // Changed from firstName/lastName to single name to match profile table simplicity
  role: UserRole;
  tenantId: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatar: string;
}

export interface MetricPoint {
  date: string;
  value: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number; // Percentage
  averageTicket: number;
  ticketGrowth: number; // Percentage
  newCustomers: number;
  customerGrowth: number; // Percentage
  revenueHistory: MetricPoint[];
}

export interface AIAnalysisResponse {
  insight: string;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface BusinessLead {
  id: string;
  name: string;
  address: string;
  rating?: number;
  phone?: string;
  website?: string;
  status: 'new' | 'saved';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'one_time';
}

export interface Subscription {
  status: string;
  plan: Plan;
  nextBillingDate: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PROSPECTING = 'PROSPECTING',
  // USERS removed - Single player mode
  SETTINGS = 'SETTINGS',
  BILLING = 'BILLING',
  AI_INSIGHTS = 'AI_INSIGHTS'
}