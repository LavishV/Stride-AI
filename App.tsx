
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, Task, TaskDifficulty } from './types';
import TheMotivator from './components/TheMotivator';
import TheBattlefield from './components/TheBattlefield';
import TheHabitLab from './components/TheHabitLab';
import BehaviorExpert from './components/BehaviorExpert';
import { geminiService } from './services/geminiService';
import { 
  Brain, LayoutDashboard, Calendar, Settings, Activity, 
  ArrowLeft, MessageSquare, Send, Sparkles, ChevronLeft, 
  ChevronRight, Plus, Trophy, History, BookOpen, Video, MapPin, 
  TrendingUp, CheckCircle2, Flame, Percent, Sun, Moon, Menu, X
} from 'lucide-react';

type View = 'dashboard' | 'blueprint' | 'analytics' | 'settings' | 'chat';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [weekOffset, setWeekOffset] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'ai', text: "Hello! I'm your ScholarSync Behavioral Assistant. How can I help you optimize your study habits today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<AppState>({
    username: "Alex",
    focusMode: false,
    tasks: [
      { 
        id: '1', 
        title: 'Cognitive Science Research Paper', 
        description: 'Need to cite 5 peer-reviewed journals.', 
        difficulty: TaskDifficulty.HARD, 
        status: 'pending', 
        subTasks: [], 
        dueDate: new Date().toISOString().split('T')[0]
      },
      { 
        id: '2', 
        title: 'Read Atomic Habits Chapter 2', 
        description: 'Identity-based habits.', 
        difficulty: TaskDifficulty.MEDIUM, 
        status: 'completed', 
        subTasks: [], 
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        completedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    habits: [
      { id: 'h1', name: 'Deep Work (90m)', streak: 5, completedToday: false, color: 'sky' },
      { id: 'h2', name: 'Exercise', streak: 12, completedToday: true, color: 'emerald' }
    ],
    moodLogs: [
      { id: 'm1', timestamp: Date.now(), score: 4, note: 'Feeling energetic' }
    ]
  });

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const taskCompletionRate = useMemo(() => 
    state.tasks.length > 0 
      ? (state.tasks.filter(t => t.status === 'completed').length / state.tasks.length) * 100 
      : 0, [state.tasks]);

  const habitCompletionRate = useMemo(() => 
    state.habits.length > 0
      ? (state.habits.filter(h => h.completedToday).length / state.habits.length) * 100
      : 0, [state.habits]);

  const combinedEfficiency = (taskCompletionRate + habitCompletionRate) / 2;

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await geminiService.getBehavioralInsight({
        ...state,
        moodLogs: [...state.moodLogs, { id: 'temp', timestamp: Date.now(), score: 3, note: userMsg }]
      });
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { 
        ...t, 
        status: t.status === 'completed' ? 'pending' : 'completed',
        completedAt: t.status === 'pending' ? new Date().toISOString() : undefined
      } : t)
    }));
  };

  const addTask = (title: string, difficulty: TaskDifficulty, dueDate?: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description: '',
      difficulty,
      status: 'pending',
      subTasks: [],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      type: 'task'
    };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const completeHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? Math.max(0, h.streak - 1) : h.streak + 1 } : h)
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-10">
            <div className="flex-[2] space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Good morning, {state.username}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">"Small steps are still steps forward."</p>
              </header>
              <TheMotivator />
              <section>
                <TheBattlefield 
                  tasks={state.tasks.filter(t => t.type !== 'exam')} 
                  onToggleTask={toggleTask} 
                  onAddTask={addTask} 
                  onUpdateTask={() => {}} 
                  onDeleteTask={(id) => setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))}
                />
              </section>
            </div>
            <div className="flex-1 space-y-6 md:space-y-8 h-fit lg:sticky lg:top-24">
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl p-6 md:p-8 overflow-hidden">
                <BehaviorExpert state={state} onOpenChat={() => setCurrentView('chat')} />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl p-6 md:p-8 overflow-hidden">
                <TheHabitLab habits={state.habits} onCompleteHabit={completeHabit} isEmbedded />
              </div>
            </div>
          </div>
        );
      case 'blueprint':
        const weekDaysArr = useMemo(() => {
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (weekOffset * 7)));
          return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
          });
        }, [weekOffset]);

        return (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-10 px-2 md:px-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">The Blueprint</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Strategic weekly mapping & exam prep.</p>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors dark:text-white"><ChevronLeft size={20}/></button>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm min-w-[120px] text-center">
                  {weekDaysArr[0].toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {weekDaysArr[6].toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                </span>
                <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors dark:text-white"><ChevronRight size={20}/></button>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              {weekDaysArr.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayTasks = state.tasks.filter(t => t.dueDate === dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div key={dateStr} className={`group flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2rem] border transition-all ${isToday ? 'border-emerald-200 ring-2 md:ring-4 ring-emerald-50 dark:ring-emerald-900/20' : 'border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                    <div className={`p-4 md:p-6 md:w-48 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r ${isToday ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50/30 dark:bg-slate-900/10 border-slate-50 dark:border-slate-800'} rounded-t-[1.5rem] md:rounded-tr-none md:rounded-l-[2rem]`}>
                      <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{date.toLocaleDateString(undefined, {weekday: 'long'})}</p>
                      <p className={`text-xl md:text-3xl font-black ${isToday ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>{date.getDate()}</p>
                    </div>
                    
                    <div className="flex-1 p-4 md:p-6 flex flex-wrap items-center gap-2 md:gap-3">
                      {dayTasks.length > 0 ? (
                        dayTasks.map(task => (
                          <div key={task.id} className={`px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl border text-xs md:text-sm font-bold transition-all hover:scale-[1.02] shadow-sm flex items-center gap-2 ${
                            task.type === 'exam' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                            task.type === 'webinar' ? 'bg-sky-50 border-sky-100 text-sky-800' :
                            'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200'
                          }`}>
                            {task.type === 'exam' && <BookOpen size={14} />}
                            {task.title}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-300 dark:text-slate-600 italic text-xs md:text-sm font-medium">Clear battlefield for this day.</p>
                      )}
                    </div>

                    <div className="p-4 md:p-6 md:w-56 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center rounded-b-[1.5rem] md:rounded-bl-none md:rounded-r-[2rem] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
                       <DailyAddButton onAdd={(val) => addTask(val, TaskDifficulty.MEDIUM, dateStr)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'analytics':
        const graphData = Array.from({ length: 7 }).map((_, i) => {
          const dayIndex = 6 - i;
          if (dayIndex === 6) return { tasks: taskCompletionRate, habits: habitCompletionRate };
          const noise = Math.sin(dayIndex * 2) * 15;
          return {
            tasks: Math.min(100, Math.max(5, taskCompletionRate - (dayIndex * 4) + noise)),
            habits: Math.min(100, Math.max(5, habitCompletionRate - (dayIndex * 2) - noise / 2)),
          };
        }).reverse();

        return (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 px-2 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 md:mb-8">Results of Focused Effort</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-6 md:p-10 shadow-xl relative overflow-hidden">
                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10 gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Behavioral Consistency</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Real-time tracking of your input vs. output</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 shadow-sm"></div> Tasks
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-sky-400 shadow-sm"></div> Habits
                       </div>
                    </div>
                 </div>

                 <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-6 px-2 relative z-10">
                    {graphData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-4 group">
                        <div className="w-full flex items-end justify-center gap-1 md:gap-2 h-full relative">
                           <div className="w-[40%] bg-emerald-500 rounded-t-lg md:rounded-t-xl transition-all duration-700" style={{height: `${Math.max(5, data.tasks)}%`}}></div>
                           <div className="w-[40%] bg-sky-400 rounded-t-lg md:rounded-t-xl transition-all duration-700" style={{height: `${Math.max(5, data.habits)}%`}}></div>
                        </div>
                        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tighter ${i === 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {i === 6 ? 'Today' : `D${i+1}`}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-6">
                 <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl flex flex-col justify-between h-[150px] md:h-[180px] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 rotate-12 transition-transform group-hover:scale-110"><CheckCircle2 size={100} /></div>
                    <div className="relative z-10">
                      <p className="text-4xl md:text-5xl font-black mb-1">{taskCompletionRate.toFixed(0)}%</p>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em]">Efficiency</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                       <TrendingUp size={16} className="text-emerald-200" /><span className="text-[10px] font-bold">Performance Index</span>
                    </div>
                 </div>
                 <div className="bg-gradient-to-br from-sky-500 to-sky-400 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl flex flex-col justify-between h-[150px] md:h-[180px] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 -rotate-12 transition-transform group-hover:scale-110"><Flame size={100} /></div>
                    <div className="relative z-10">
                      <p className="text-4xl md:text-5xl font-black mb-1">{habitCompletionRate.toFixed(0)}%</p>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em]">Habit Strength</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                       <Activity size={16} className="text-sky-100" /><span className="text-[10px] font-bold">Consistency Score</span>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 p-4 md:p-6 shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><Percent size={20} /></div>
                      <div>
                        <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">{combinedEfficiency.toFixed(0)}%</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Combined</p>
                      </div>
                    </div>
                    <Sparkles className="text-indigo-300" size={20} />
                 </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 font-semibold dark:text-slate-400">
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">Scholar Settings</h2>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 md:p-10 shadow-sm space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-[1.5rem] gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">Scholar Identity</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This name will appear in AI analysis</p>
                </div>
                <input 
                  type="text" 
                  value={state.username} 
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-6 py-3 rounded-2xl text-sm outline-none font-bold text-slate-800 dark:text-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all min-w-[200px]" 
                  onChange={(e) => setState({...state, username: e.target.value})} 
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-[1.5rem] gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">Visual Theme</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personalize your academic environment</p>
                </div>
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-6 py-3 rounded-2xl text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-all min-w-[200px] justify-center"
                >
                  {isDark ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
                </button>
              </div>
            </div>
          </div>
        );
      case 'chat':
        return (
          <div className="max-w-5xl mx-auto py-4 md:py-10 h-[calc(100vh-140px)] flex flex-col animate-in zoom-in-95 duration-500 px-2 md:px-0">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-4 md:mb-6 font-semibold w-fit dark:text-slate-400">
              <ArrowLeft size={18} /> Dashboard
            </button>
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
               <div className="p-4 md:p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-5">
                     <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                        <Brain size={24} />
                     </div>
                     <div>
                        <h2 className="text-base md:text-xl font-bold text-slate-800 dark:text-white">Behavioral Assistant</h2>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${isTyping ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                           <span className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{isTyping ? 'Thinking...' : 'Neural Link Active'}</span>
                        </div>
                     </div>
                  </div>
                  <Sparkles className="text-amber-400" size={24} />
               </div>
               <div className="flex-1 p-4 md:p-10 overflow-y-auto space-y-6 md:space-y-8 bg-[#fdfdfd] dark:bg-slate-900/50 scroll-smooth">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 md:gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                       <div className={`w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center text-xs font-black ${msg.role === 'ai' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white'}`}>
                        {msg.role === 'ai' ? 'AI' : 'U'}
                       </div>
                       <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-sm leading-relaxed shadow-sm max-w-[85%] md:max-w-[75%] ${
                         msg.role === 'ai' 
                          ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none' 
                          : 'bg-emerald-500 text-white rounded-tr-none'
                        }`}>
                          {msg.text}
                       </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-black">AI</div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>
               <div className="p-4 md:p-8 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="relative max-w-4xl mx-auto flex gap-3"
                  >
                     <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about focus, habits, or academic hacks..."
                        className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 md:p-5 pr-12 rounded-[1.5rem] md:rounded-[2rem] text-sm outline-none focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-900/20 transition-all border border-slate-100 dark:border-slate-700 dark:text-white"
                     />
                     <button 
                       type="submit"
                       disabled={isTyping || !chatInput.trim()}
                       className="bg-slate-900 dark:bg-emerald-600 text-white px-6 rounded-[1.5rem] hover:opacity-90 transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                     >
                        <Send size={18} />
                     </button>
                  </form>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-slate-950' : 'bg-[#f8fafc]'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Top Centric Nav Bar */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setCurrentView('dashboard')}
              >
                <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-transform group-hover:scale-105">
                  <Brain size={24} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight hidden sm:block">Stride AI</h1>
              </div>

              {/* Desktop Nav - Centric Position */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-3">
                <TopNavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
                <TopNavItem icon={<Calendar size={18} />} label="Blueprint" active={currentView === 'blueprint'} onClick={() => setCurrentView('blueprint')} />
                <TopNavItem icon={<Activity size={18} />} label="Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
                <TopNavItem icon={<MessageSquare size={18} />} label="AI Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
                <TopNavItem icon={<Settings size={18} />} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Profile / Theme Quick Toggle */}
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors hidden sm:block"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div 
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all"
                onClick={() => setCurrentView('settings')}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center font-black text-xs">
                  {state.username[0]}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden lg:block truncate max-w-[80px]">
                  {state.username}
                </span>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-slate-600 dark:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800 mt-3 flex flex-col gap-2 animate-in slide-in-from-top-4">
              <MobileNavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); setIsMenuOpen(false); }} />
              <MobileNavItem icon={<Calendar size={20} />} label="Blueprint" active={currentView === 'blueprint'} onClick={() => { setCurrentView('blueprint'); setIsMenuOpen(false); }} />
              <MobileNavItem icon={<Activity size={20} />} label="Analytics" active={currentView === 'analytics'} onClick={() => { setCurrentView('analytics'); setIsMenuOpen(false); }} />
              <MobileNavItem icon={<MessageSquare size={20} />} label="AI Chat" active={currentView === 'chat'} onClick={() => { setCurrentView('chat'); setIsMenuOpen(false); }} />
              <MobileNavItem icon={<Settings size={20} />} label="Settings" active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }} />
            </nav>
          )}
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// UI Components
const TopNavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
      active 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
    {active && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-600 rounded-t-full"></div>}
  </button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold transition-all ${
      active 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const DailyAddButton: React.FC<{onAdd: (val: string) => void}> = ({onAdd}) => {
  const [active, setActive] = useState(false);
  const [val, setVal] = useState('');

  if (active) {
    return (
      <div className="animate-in fade-in slide-in-from-top-2 duration-300 w-full">
        <input 
          autoFocus
          className="w-full text-xs font-bold p-3 bg-white dark:bg-slate-700 border border-emerald-200 dark:border-emerald-900 rounded-xl outline-none shadow-inner dark:text-white"
          placeholder="New plan..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && val.trim()) {
              onAdd(val);
              setActive(false);
              setVal('');
            }
            if (e.key === 'Escape') setActive(false);
          }}
          onBlur={() => setActive(false)}
        />
      </div>
    );
  }

  return (
    <button 
      onClick={() => setActive(true)}
      className="w-full py-2 md:py-3 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all border border-dashed border-slate-200 dark:border-slate-700"
    >
      <Plus size={16} />
      <span className="text-[10px] font-black uppercase tracking-widest">Add Plan</span>
    </button>
  );
};

export default App;
