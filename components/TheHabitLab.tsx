
import React from 'react';
import { Habit } from '../types';
import { Flame, CheckCircle, PlusCircle } from 'lucide-react';

interface Props {
  habits: Habit[];
  onCompleteHabit: (id: string) => void;
  isEmbedded?: boolean;
}

const TheHabitLab: React.FC<Props> = ({ habits, onCompleteHabit, isEmbedded }) => {
  return (
    <div className={`${isEmbedded ? '' : 'bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-700 shadow-xl h-full overflow-y-auto'}`}>
      <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        The Habit Lab
        <span className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl shadow-md"><Flame size={20} className="text-amber-500" /></span>
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group shadow-sm ${
              habit.completedToday 
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-800' 
                : 'bg-white dark:bg-slate-700/50 border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:shadow-xl'
            }`}
            onClick={() => onCompleteHabit(habit.id)}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl text-white shadow-xl transition-all group-hover:scale-110 active:scale-90 ${
                habit.completedToday ? 'bg-emerald-500' : 
                habit.color === 'sky' ? 'bg-sky-500 shadow-sky-200' :
                habit.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-200' :
                'bg-indigo-500 shadow-indigo-200'
              }`}>
                <PlusCircle size={22} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">{habit.name}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-black uppercase mt-1.5">
                  <Flame size={14} className="text-rose-500" />
                  {habit.streak} day streak
                </div>
              </div>
            </div>
            
            <div className={`p-3 rounded-full transition-all shadow-md ${habit.completedToday ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
              <CheckCircle size={28} strokeWidth={3} />
            </div>
          </div>
        ))}

        {habits.length === 0 && (
          <div className="text-center py-12 opacity-50 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold italic">Commit to excellence below.</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
          <Flame size={56} />
        </div>
        <p className="text-[11px] uppercase font-black text-emerald-400 mb-2 relative z-10 tracking-[0.2em]">Strategy: Habit Stacking</p>
        <p className="text-sm leading-relaxed text-slate-200 italic relative z-10 font-bold">
          "After I finish my morning coffee, I will open my notes for 5 minutes."
        </p>
      </div>
    </div>
  );
};

export default TheHabitLab;
