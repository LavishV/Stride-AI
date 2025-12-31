
import React, { useEffect, useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Sparkles, Target } from 'lucide-react';

const TheMotivator: React.FC = () => {
  const [quote, setQuote] = useState({ quote: 'Loading daily wisdom...', author: 'Behavioral Expert' });
  const [why, setWhy] = useState("");

  useEffect(() => {
    geminiService.getMotivationalQuote().then(setQuote);
  }, []);

  return (
    <div className="mb-8 md:mb-10 space-y-6">
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-emerald-900/30 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-md relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles size={160} />
        </div>
        <div className="flex items-start gap-4 md:gap-6 relative z-10">
          <div className="p-3 md:p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-lg shadow-emerald-100 dark:shadow-none shrink-0">
            <Sparkles size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-slate-100 italic leading-tight mb-3">
              "{quote.quote}"
            </p>
            <p className="text-[11px] md:text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-[0.2em] uppercase">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-5 md:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-lg focus-within:border-emerald-500 dark:focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50 dark:focus-within:ring-emerald-900/10 transition-all group">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl group-focus-within:bg-emerald-50 transition-colors">
          <Target className="text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-600 transition-colors" size={24} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          placeholder="Declare your 'Why' for today..." 
          className="flex-1 outline-none text-base md:text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-transparent"
          value={why}
          onChange={(e) => setWhy(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TheMotivator;
