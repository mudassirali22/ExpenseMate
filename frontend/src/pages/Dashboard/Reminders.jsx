import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Plus, Trash2, CheckCircle, Circle, X, Flag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Reminders = () => {
  const { API } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formText, setFormText] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formCategory, setFormCategory] = useState('Personal');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchReminders(); }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${API}/api/v1/reminders/get`, { credentials: 'include' });
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formText) return toast.error('Please enter a reminder');
    try {
      const res = await fetch(`${API}/api/v1/reminders/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ text: formText, priority: formPriority, category: formCategory }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Reminder added!'); fetchReminders();
      setShowModal(false); setFormText(''); setFormPriority('Medium'); setFormCategory('Personal');
    } catch (err) { toast.error(err.message); }
  };

  const toggleComplete = async (id, isCompleted) => {
    try {
      await fetch(`${API}/api/v1/reminders/update/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });
      fetchReminders();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/v1/reminders/delete/${id}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Deleted', { id: 'del-succ-rem', duration: 3000 }); fetchReminders();
    } catch (err) { toast.error('Failed'); }
  };

  const priorityColors = {
    High: 'text-error bg-error/10 border-error/20',
    Medium: 'text-secondary bg-secondary/10 border-secondary/20',
    Low: 'text-primary bg-primary/10 border-primary/20',
  };

  const filtered = reminders.filter(r => {
    if (filter === 'active') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  return (
    <div className="page-container animate-fade-in-up pb-24">

      {/* Reminders Header */}
      <header className="page-header flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="page-title uppercase">Task <span className="text-primary italic">Reminders</span></h1>
          <p className="page-subtitle max-w-lg opacity-70 uppercase tracking-widest">Manage your tasks and alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="btn btn-primary h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 group">
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            <span className="uppercase tracking-widest text-[11px]">Add Reminder</span>
          </button>
        </div>
      </header>

      {/* Persistence Filters */}
      <div className="flex gap-2 bg-surface-container p-1.5 rounded-2xl w-fit border border-glass-border shadow-inner mb-10">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filter === f ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((reminder) => (
          <div key={reminder._id} className={`glass-card p-6 rounded-[2rem] border border-glass-border flex items-center gap-6 group transition-all duration-500 hover:border-primary/30 ${reminder.isCompleted ? 'opacity-50 grayscale-[0.5]' : 'shadow-xl'}`}>
            <button onClick={() => toggleComplete(reminder._id, reminder.isCompleted)} className="shrink-0 transition-transform hover:scale-110 active:scale-90">
              {reminder.isCompleted
                ? <CheckCircle size={24} className="text-success" />
                : <Circle size={24} className="text-on-surface-variant opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all" />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold tracking-tight ${reminder.isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{reminder.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`badge ${reminder.priority === 'High' ? 'badge-error' : reminder.priority === 'Medium' ? 'badge-secondary' : 'badge-primary'}`}>
                  {reminder.priority}
                </span>
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 italic">{reminder.category}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(reminder._id)} className="w-10 h-10 rounded-xl bg-surface-low hover:bg-error hover:text-on-error text-on-surface-variant transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center border border-glass-border">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-glass-border rounded-[2.5rem] bg-surface-container/20 group/empty">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-lowest border border-glass-border flex items-center justify-center mb-6 opacity-40 group-hover/empty:scale-110 group-hover/empty:border-primary/30 transition-all duration-500">
              <Bell size={28} className="text-on-surface-variant group-hover/empty:text-primary transition-colors" />
            </div>
            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">No active reminders found.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay animate-fade-in z-[300]">
          <div className="modal-content !max-w-lg p-8 md:p-10 animate-scale-in glass-panel shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

            <header className="mb-8 relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight text-on-surface italic">Add <span className="text-primary not-italic">Reminder</span></h3>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50 mt-1">Set reminder details</p>
            </header>

            <form onSubmit={handleAdd} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="input-label ml-1">Reminder Name</label>
                <input
                  type="text"
                  value={formText}
                  onChange={e => setFormText(e.target.value)}
                  placeholder="Enter reminder name..."
                  className="input-field font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="input-label ml-1">Priority</label>
                  <div className="relative">
                    <select value={formPriority} onChange={e => setFormPriority(e.target.value)} className="input-field appearance-none cursor-pointer font-black uppercase tracking-widest text-xs">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-40">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="input-label ml-1">Category</label>
                  <div className="relative">
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="input-field appearance-none cursor-pointer font-black uppercase tracking-widest text-xs">
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Other">Other</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-40">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-6 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-error transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-8 py-3.5 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 group/btn">
                  <Plus size={16} strokeWidth={3} className="mr-2 group-hover:rotate-90 transition-transform" />
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lighting decor */}
      <div className="fixed bottom-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default Reminders;
