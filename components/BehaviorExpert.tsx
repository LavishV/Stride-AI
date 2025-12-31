
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { geminiService } from '../services/geminiService';
import { Brain, MessageSquare, ArrowRight, Zap, Coffee, Sparkles } from 'lucide-react';

interface Props {
  state: AppState;
  onOpenChat: () => void;
}

const BehaviorExpert: React.FC<Props> = ({ state, onOpenChat }) => {
  const [insight, setInsight] = useState<string>("Analyzing your patterns...");
  const [loading, setLoading] = useState(false);

  // Use a debounced effect to avoid spamming the API on every task change
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshInsight();
    }, 2000); // 2 second delay to debounce state changes
    return () => clearTimeout(timer);
  }, [state.tasks.filter(t => t.status === 'completed').length]);

  const refreshInsight = async () => {
    setLoading(true);
    try {
      const text = await geminiService.getBehavioralInsight(state);
      setInsight(text);
    } catch (e) {
      setInsight("Focus on small wins for now. Great work.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
            <Brain className="text-white" size={24} strokeWidth={2.5} />
          </div>
          Expert AI
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenChat}
            className="p-3 bg-white dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 rounded-2xl transition-all group border-2 border-emerald-100 shadow-sm"
            title="Chat with Stride AI"
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button 
            onClick={refreshInsight}
            disabled={loading}
            className="p-3 bg-white dark:bg-slate-700 hover:bg-slate-50 rounded-2xl transition-colors border-2 border-slate-100 shadow-sm"
            title="Refresh Analysis"
          >
            <Zap size={20} className={loading ? 'animate-spin text-amber-500' : 'text-slate-600 dark:text-slate-400'} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.2rem] relative shadow-xl overflow-hidden group min-h-[140px] flex items-center">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity">
             <Brain size={80} />
          </div>
          <p className="text-base md:text-lg text-slate-900 dark:text-slate-200 leading-tight font-black italic relative z-10">
            "{insight}"
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-[11px] font-black text-emerald-700 dark:text-slate-400 uppercase tracking-widest px-2">Daily Strategy</h3>
          <div 
            className="p-5 md:p-6 bg-white dark:bg-slate-700/50 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] flex items-center gap-5 hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer group shadow-md"
            onClick={onOpenChat}
          >
            <div className="bg-sky-100 dark:bg-sky-900/40 p-3.5 rounded-2xl text-sky-600 dark:text-sky-300 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-md">
              <Coffee size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-slate-900 dark:text-slate-100 truncate">10-Minute Win Mode</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate">Lower the barrier to entry</p>
            </div>
            <ArrowRight size={22} className="text-emerald-500 transition-transform group-hover:translate-x-2" strokeWidth={3} />
          </div>
        </div>
      </div>

      <button 
        onClick={onOpenChat}
        className="w-full flex items-center justify-center gap-4 py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.8rem] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 dark:shadow-none active:scale-95 mt-4"
      >
        <MessageSquare size={20} strokeWidth={2.5} />
        Initialize Neural Link
      </button>
    </div>
  );
};

export default BehaviorExpert;
