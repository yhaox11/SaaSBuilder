import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Save, Lock, Bell, Globe, Moon, Shield, Loader2, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState('SaaSBuilder Inc.');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 pb-32 animate-fade-in-up">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-500 mt-2">Manage your workspace preferences and security.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 text-white font-medium rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border border-transparent transition-all"
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
            <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-semibold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
        </div>
      </header>

      <div className="space-y-6">
        {/* General Section */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Globe size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">General Information</h2>
              <p className="text-zinc-500 text-sm">Update your company details visible to users.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Company Name</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#161616] border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@saasbuilder.com"
                className="w-full bg-[#161616] border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-2">Workspace URL</label>
              <div className="flex">
                <span className="bg-[#111] border border-r-0 border-white/10 rounded-l-lg px-4 py-2.5 text-zinc-500 text-sm">
                  app.saasbuilder.com/
                </span>
                <input 
                  type="text" 
                  defaultValue="enterprise-demo"
                  className="flex-1 bg-[#161616] border border-white/10 rounded-r-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Shield size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Security</h2>
              <p className="text-zinc-500 text-sm">Manage access protocols and authentication.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#161616] rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <Lock size={18} className="text-zinc-400" />
                <div>
                  <h3 className="text-white font-medium text-sm">Two-Factor Authentication</h3>
                  <p className="text-zinc-500 text-xs">Require 2FA for all administrative accounts.</p>
                </div>
              </div>
              <button 
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${mfaEnabled ? 'bg-primary' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${mfaEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#161616] rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <Globe size={18} className="text-zinc-400" />
                <div>
                  <h3 className="text-white font-medium text-sm">Public API Access</h3>
                  <p className="text-zinc-500 text-xs">Enable public endpoints for your tenant.</p>
                </div>
              </div>
              <div className="w-12 h-6 rounded-full bg-zinc-700 p-1 cursor-not-allowed opacity-50">
                 <div className="w-4 h-4 rounded-full bg-white translate-x-0" />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8">
           <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Bell size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
              <p className="text-zinc-500 text-sm">Choose what you want to be notified about.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#161616] rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
                <Moon size={18} className="text-zinc-400" />
                <div>
                  <h3 className="text-white font-medium text-sm">Weekly Report</h3>
                  <p className="text-zinc-500 text-xs">Receive a weekly summary of your metrics via email.</p>
                </div>
            </div>
            <button 
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${emailNotifs ? 'bg-primary' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
          </div>
        </section>
      </div>
    </div>
  );
};