
import React, { useState } from 'react';
import { Task, TaskDifficulty, SubTask } from '../types';
import { CheckCircle2, Circle, AlertCircle, Plus, Sparkles, Trash2, Gauge } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Props {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, difficulty: TaskDifficulty) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TheBattlefield: React.FC<Props> = ({ tasks, onToggleTask, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty>(TaskDifficulty.MEDIUM);
  const [loadingBreakdown, setLoadingBreakdown] = useState<string | null>(null);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, selectedDifficulty);
    setNewTaskTitle('');
    setSelectedDifficulty(TaskDifficulty.MEDIUM);
  };

  const triggerBreakdown = async (task: Task) => {
    setLoadingBreakdown(task.id);
    try {
      const subtaskTitles = await geminiService.breakdownHardTask(task);
      const newSubTasks: SubTask[] = subtaskTitles.map((title, idx) => ({
        id: Date.now().toString() + idx,
        title,
        completed: false
      }));
      onUpdateTask({ ...task, subTasks: [...task.subTasks, ...newSubTasks], difficulty: TaskDifficulty.EASY });
    } finally {
      setLoadingBreakdown(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          The Battlefield
          <span className="text-[10px] font-black bg-emerald-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Daily Actions</span>
        </h2>
      </div>

      {/* Main Input Area - White Rectangle with Black Font */}
      <div className="space-y-4 bg-white dark:bg-slate-800 p-5 md:p-7 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-xl transition-all">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Type your next mission..."
            className="flex-1 p-4 md:p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-400 font-bold"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <button 
            onClick={handleAddTask}
            className="bg-emerald-600 text-white p-4 md:p-5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center min-w-[60px] active:scale-95"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 px-1 pt-2">
          <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Gauge size={16} className="text-emerald-600" /> Priority:
          </span>
          <div className="flex gap-2">
            {[TaskDifficulty.EASY, TaskDifficulty.MEDIUM, TaskDifficulty.HARD].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`text-[10px] font-black px-5 py-2.5 rounded-xl transition-all border-2 shadow-sm ${
                  selectedDifficulty === diff 
                    ? diff === TaskDifficulty.HARD ? 'bg-rose-600 text-white border-rose-600' : 
                      diff === TaskDifficulty.MEDIUM ? 'bg-amber-500 text-white border-amber-500' : 
                      'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-600 hover:border-emerald-300'
                }`}
              >
                {diff.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {tasks.map(task => (
          <div key={task.id} className={`group relative bg-white dark:bg-slate-800 p-6 md:p-7 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-md hover:shadow-2xl transition-all ${task.status === 'completed' ? 'opacity-70 bg-slate-50/50' : ''}`}>
            <div className="flex items-start gap-5">
              <button onClick={() => onToggleTask(task.id)} className="mt-1 shrink-0 transition-transform active:scale-125">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                ) : (
                  <Circle className="text-slate-200 dark:text-slate-600 w-8 h-8 hover:text-emerald-400" strokeWidth={2.5} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className={`text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 truncate max-w-[240px] md:max-w-none ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-lg shadow-sm border ${
                    task.difficulty === TaskDifficulty.HARD ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    task.difficulty === TaskDifficulty.MEDIUM ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {task.difficulty}
                  </span>
                </div>
                
                {task.subTasks.length > 0 && (
                  <div className="mt-5 ml-2 space-y-3 border-l-4 border-emerald-100 dark:border-slate-700 pl-5">
                    {task.subTasks.map(sub => (
                      <div key={sub.id} className="flex items-center gap-4 text-sm font-bold text-slate-700 dark:text-slate-400">
                        <div className={`w-2.5 h-2.5 rounded-full ${sub.completed ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200 dark:bg-slate-600'}`} />
                        {sub.title}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-4 transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  {task.difficulty === TaskDifficulty.HARD && task.status === 'pending' && (
                    <button 
                      onClick={() => triggerBreakdown(task)}
                      disabled={loadingBreakdown === task.id}
                      className="flex items-center gap-2 text-[11px] font-black text-emerald-800 bg-emerald-50 border-2 border-emerald-200 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50 shadow-sm"
                    >
                      <Sparkles size={16} className="text-emerald-600" />
                      {loadingBreakdown === task.id ? 'Thinking...' : 'AI Strategy'}
                    </button>
                  )}
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-[11px] font-black text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-rose-100 rounded-xl hover:border-rose-300"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-100">
             <p className="text-slate-400 font-bold italic">No missions active. Plan your success above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheBattlefield;
