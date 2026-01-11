import { createClient } from '@supabase/supabase-js';

// NOTE: In a real deployment, these would come from process.env
// For this demo structure, we use placeholders if env vars are missing.
const supabaseUrl = process.env.SUPABASE_URL || 'https://fstfzoagkjvearegeoox.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdGZ6b2Fna2p2ZWFyZWdlb294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTA3OTYsImV4cCI6MjA4MzY2Njc5Nn0.vmfB83ViUNdjHCuLk6h6OhB65Xa4egX5Tt4gvW8WaN0';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if Supabase is actually connected
export const isSupabaseConfigured = (): boolean => {
  // Check if the variables actually have values (either from env or fallback)
  // avoiding the default placeholder if one was set
  return !!supabaseUrl && 
         !!supabaseKey && 
         supabaseUrl !== 'https://your-project.supabase.co';
};