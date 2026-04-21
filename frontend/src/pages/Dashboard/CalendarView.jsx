import React, { useState, useEffect, Activity } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Calculator, FileText, Share2, Plus, Calendar, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CalendarView = () => {
  const { API, currencySymbol } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Set default selection to today 
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [filterType, setFilterType] = useState('All Items');
  const [calendarView, setCalendarView] = useState('Month');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [actRes, remRes] = await Promise.all([
          fetch(`${API}/api/v1/dashboard/activities?limit=1000`, { credentials: 'include' }),
          fetch(`${API}/api/v1/reminders/get`, { credentials: 'include' })
        ]);
        const actData = await actRes.json();
        const remData = await remRes.json();
        
        // Normalize activities into incomes and expenses for the calendar grid dots
        const acts = Array.isArray(actData.activities) ? actData.activities : [];
        setIncomes(acts.filter(a => a.type === 'income'));
        setExpenses(acts.filter(a => a.type === 'expense' || a.type === 'tax' || a.type === 'portfolio'));
        setReminders(Array.isArray(remData) ? remData : []);
      } catch (err) { console.error(err); }
    };
    fetchAll();
  }, [API]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build mapped objects for fast calendar lookups
  const dayMap = {};
  
  const addToMap = (dateStr, item, type) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate();
      if (!dayMap[key]) dayMap[key] = { expenses: [], incomes: [], reminders: [] };
      dayMap[key][type].push(item);
    }
  };

  expenses.forEach(exp => addToMap(exp.date, exp, 'expenses'));
  incomes.forEach(inc => addToMap(inc.date, inc, 'incomes'));
  reminders.forEach(rem => addToMap(rem.dueDate, rem, 'reminders'));

  // Calculate Monthly Summary Stats
  const monthlyInflow = incomes.reduce((sum, inc) => {
    const d = new Date(inc.date);
    return (d.getMonth() === month && d.getFullYear() === year) ? sum + inc.amount : sum;
  }, 0);
  
  const monthlyOutflow = expenses.reduce((sum, exp) => {
    const d = new Date(exp.date);
    return (d.getMonth() === month && d.getFullYear() === year) ? sum + exp.amount : sum;
  }, 0);

  const pendingReminders = reminders.filter(rem => {
    const d = new Date(rem.dueDate);
    return d.getMonth() === month && d.getFullYear() === year && !rem.isCompleted;
  }).length;

  const getFilteredData = (day) => {
    const data = dayMap[day] || { expenses: [], incomes: [], reminders: [] };
    if (filterType === 'Income') return { expenses: [], incomes: data.incomes, reminders: [] };
    if (filterType === 'Expenses') return { expenses: data.expenses, incomes: [], reminders: [] };
    if (filterType === 'Reminders') return { expenses: [], incomes: [], reminders: data.reminders };
    return data;
  };

  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const selectedData = getFilteredData(selectedDay);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="page-container animate-fade-in-up pb-10">
      
      {/* Header Section */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg bg-surface-container border border-glass-border hover:bg-surface-high transition-colors"><ChevronLeft size={18} /></button>
            <div className="flex flex-col min-w-[140px]">
              <h1 className="text-2xl font-bold text-on-surface leading-tight">{monthName}</h1>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Activity Log</p>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-lg bg-surface-container border border-glass-border hover:bg-surface-high transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-glass-border">
          {['Month', 'Week'].map(view => (
            <button 
              key={view} 
              onClick={() => setCalendarView(view)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${calendarView === view ? 'bg-surface-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid Section */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-end">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-surface-container border border-glass-border rounded-lg py-2 px-4 text-[12px] font-bold uppercase tracking-widest text-on-surface focus:outline-none focus:border-primary/50 transition-colors w-fit"
            >
              <option value="All Items">All Items</option>
              <option value="Income">Income</option>
              <option value="Expenses">Expenses</option>
              <option value="Reminders">Reminders</option>
            </select>
          </div>

          <div className="stat-card !p-4 sm:!p-6 flex flex-col min-h-[500px]">
             <div className="grid grid-cols-7 gap-2 mb-4 px-1">
                {dayNames.map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">{d}</div>
                ))}
             </div>

             <div className="grid grid-cols-7 auto-rows-fr gap-2 flex-1 px-1">
                {(() => {
                  let renderDays = [];
                  
                  // Previous Month Buffers
                  renderDays = [...Array(firstDay)].map((_, i) => ({
                    day: new Date(year, month, 0).getDate() - firstDay + i + 1,
                    isBuffer: true
                  }));
                  // Current Month Days
                  renderDays = renderDays.concat([...Array(daysInMonth)].map((_, i) => ({
                    day: i + 1,
                    isBuffer: false
                  })));

                  // If Week View, mark any day outside the selected week as a buffer
                  if (calendarView === 'Week') {
                    const targetDateObj = new Date(year, month, selectedDay);
                    const dayOfWeek = targetDateObj.getDay(); 
                    const startOfWeek = selectedDay - dayOfWeek;
                    const endOfWeek = startOfWeek + 6;

                    renderDays = renderDays.map(dObj => {
                      if (dObj.isBuffer) return dObj;
                      if (dObj.day < startOfWeek || dObj.day > endOfWeek) {
                         return { ...dObj, isBuffer: true };
                      }
                      return dObj;
                    });
                  }

                  return renderDays.map((dObj, i) => {
                    if (dObj.isBuffer) {
                      return (
                        <div key={`buf-${i}`} className="rounded-xl border border-transparent opacity-10 flex items-start justify-end p-2 sm:p-3 text-[10px] font-bold">
                          {dObj.day}
                        </div>
                      );
                    }

                    const day = dObj.day;
                    const hasData = dayMap[day];
                    const it = isToday(day);
                    const isSelected = selectedDay === day;

                    return (
                      <div
                        key={`day-${day}`}
                        onClick={() => setSelectedDay(day)}
                        className={`rounded-xl flex flex-col p-2 sm:p-3 cursor-pointer relative transition-all border
                          ${isSelected
                            ? 'bg-primary/10 border-primary/40 shadow-sm z-10'
                            : 'bg-surface-lowest/40 hover:bg-surface-container border-glass-border'
                          }`}
                      >
                        <span className={`text-right text-xs font-bold ${isSelected ? 'text-primary' : it ? 'text-secondary font-black' : 'text-on-surface'}`}>
                          {day}
                        </span>

                        {hasData && (
                          <div className="mt-auto flex gap-1 justify-end flex-wrap">
                            {hasData.reminders.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-secondary" title="Tasks/Events" />}
                            {hasData.expenses.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-error" title="Expenses" />}
                            {hasData.incomes.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-success" title="Incomes" />}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
             </div>
          </div>
        </div>

        {/* Action & Detail Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="stat-card">
            <h3 className="section-title text-sm mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href='/subscriptions'}
                className="w-full flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-glass-border hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Calculator size={18} />
                </div>
                <div className="text-left">
                   <p className="text-xs font-bold text-on-surface">Manage Subscriptions</p>
                   <p className="text-[10px] text-on-surface-variant opacity-60">Set automatic entries</p>
                </div>
              </button>
              <button 
                onClick={() => window.location.href='/analytics'}
                className="w-full flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-glass-border hover:bg-secondary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div className="text-left">
                   <p className="text-xs font-bold text-on-surface">Financial Reports</p>
                   <p className="text-[10px] text-on-surface-variant opacity-60">Export period summary</p>
                </div>
              </button>
            </div>
          </div>

          <div className="stat-card flex-1 flex flex-col min-h-[400px]">
             <header className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-60">{monthName.split(' ')[0]}</p>
                   <h3 className="text-3xl font-bold text-on-surface">{selectedDay}</h3>
                </div>
                {isToday(selectedDay) && (
                   <span className="badge badge-primary px-3">Today</span>
                )}
             </header>

             <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[350px]">
                {selectedData.reminders.map((rem, i) => (
                  <div key={`rem-${i}`} onClick={() => navigate('/reminders')} className={`flex items-center justify-between p-3 rounded-xl bg-surface-container border border-glass-border hover:border-secondary/30 cursor-pointer transition-all ${rem.isCompleted ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                          <Bell size={16} />
                       </div>
                       <div className="truncate">
                          <h4 className={`text-xs font-bold text-on-surface truncate ${rem.isCompleted ? 'line-through' : ''}`}>{rem.text}</h4>
                          <div className="flex gap-2 items-center">
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase opacity-60">Task/Event</p>
                            {rem.dueTime && <p className="text-[9px] text-secondary font-bold uppercase opacity-60">{rem.dueTime}</p>}
                          </div>
                       </div>
                    </div>
                    {rem.amount && <div className="text-sm font-bold text-on-surface">{currencySymbol} {rem.amount.toLocaleString()}</div>}
                  </div>
                ))}

                {selectedData.incomes.map((inc, i) => (
                  <div key={`inc-${i}`} onClick={() => navigate('/transactions')} className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-glass-border hover:border-success/30 cursor-pointer transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                          <Plus size={16} />
                       </div>
                       <div className="truncate">
                          <h4 className="text-xs font-bold text-on-surface truncate">{inc.title}</h4>
                          <p className="text-[9px] text-on-surface-variant font-bold uppercase opacity-60">{inc.source}</p>
                       </div>
                    </div>
                    <div className="text-sm font-bold text-success">+{currencySymbol} {inc.amount.toLocaleString()}</div>
                  </div>
                ))}

                {selectedData.expenses.map((exp, i) => {
                  const targetRoute = exp.displayType === 'Subscription' ? '/subscriptions' 
                                    : exp.type === 'tax' ? '/tax-monitor' 
                                    : exp.displayType === 'Portfolio' ? '/portfolio' 
                                    : exp.displayType === 'Shared' ? '/shared-wallets' 
                                    : '/transactions';

                  return (
                  <div key={`exp-${i}`} onClick={() => navigate(targetRoute)} className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-glass-border hover:border-error/30 cursor-pointer transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center text-error shrink-0">
                          <Calculator size={16} />
                       </div>
                       <div className="truncate">
                          <h4 className="text-xs font-bold text-on-surface truncate">{exp.title}</h4>
                          <p className="text-[9px] text-on-surface-variant font-bold uppercase opacity-60">{exp.displayType || exp.category}</p>
                       </div>
                    </div>
                    <div className="text-sm font-bold text-error">-{currencySymbol} {exp.amount.toLocaleString()}</div>
                  </div>
                  );
                })}

                {selectedData.expenses.length === 0 && selectedData.incomes.length === 0 && selectedData.reminders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                    <Calendar size={40} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest max-w-[150px]">No activity for this date</p>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CalendarView;
