import React, { useState, useEffect } from 'react';
import { analyzeBusinessMetrics } from '../services/geminiService';
import { DashboardMetrics, AIAnalysisResponse } from '../types';
import { Sparkles, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export const AiInsights = ({ data }: { data: DashboardMetrics }) => {
    const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        const result = await analyzeBusinessMetrics(data);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 pb-32">
            <header className="mb-10 mt-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-purple-400" />
                        AI Executive Analyst
                    </h1>
                    <p className="text-zinc-500 mt-2">Powered by Gemini 3 Flash</p>
                </div>
                <button 
                    onClick={runAnalysis}
                    disabled={loading}
                    className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {loading ? 'Analyzing...' : 'Generate New Report'}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </header>

            {!analysis && !loading && (
                 <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <p className="text-zinc-400 mb-4">Click generate to analyze your revenue metrics.</p>
                 </div>
            )}

            {loading && (
                <div className="space-y-4">
                    <div className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
                    <div className="h-24 bg-white/5 rounded-3xl animate-pulse delay-75"></div>
                </div>
            )}

            {analysis && (
                <div className="grid gap-6 animate-fade-in-up">
                    <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-2">Executive Summary</h3>
                        <p className="text-xl text-white leading-relaxed">{analysis.insight}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl">
                            <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-4 flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-400" />
                                Strategic Recommendation
                            </h3>
                            <p className="text-gray-300">{analysis.recommendation}</p>
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl">
                            <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} className={
                                    analysis.riskLevel === 'high' ? 'text-red-500' : 
                                    analysis.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                                } />
                                Risk Assessment
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className={`text-2xl font-bold capitalize ${
                                     analysis.riskLevel === 'high' ? 'text-red-500' : 
                                     analysis.riskLevel === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                                }`}>
                                    {analysis.riskLevel} Risk
                                </span>
                                <p className="text-sm text-zinc-500">
                                    Based on current volatility and growth trends.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
