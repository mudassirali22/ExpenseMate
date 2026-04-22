import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { StickyNote, Bell, Trash2, Pin, Plus, Calendar, Clock, AlertCircle, Search, BellRing, Pencil, X, ChevronDown, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const noteColors = [
  { name: 'Default', class: 'bg-surface-container text-on-surface-variant border-glass-border', dot: 'bg-on-surface-variant' },
  { name: 'Tax', class: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  { name: 'Strategy', class: 'bg-secondary/10 text-secondary border-secondary/20', dot: 'bg-secondary' },
  { name: 'Ideas', class: 'bg-tertiary/10 text-tertiary border-tertiary/20', dot: 'bg-tertiary' },
  { name: 'Personal', class: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
];

const priorityConfig = {
  High: { class: 'text-error bg-error/10 border-error/20', icon: AlertCircle },
  Medium: { class: 'text-secondary bg-secondary/10 border-secondary/20', icon: Clock },
  Low: { class: 'text-primary bg-primary/10 border-primary/20', icon: Calendar },
};

const Notes = () => {
  const { API, currencySymbol } = useAuth();
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState('Note');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [category, setCategory] = useState('Personal');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [remFilterPriority, setRemFilterPriority] = useState('All');
  const categories = ['All', 'Personal', 'Work', 'Finance', 'Ideas', 'Urgent', 'Important', 'Strategy', 'Travel'].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));
  const [showFilterDrop, setShowFilterDrop] = useState(false);
  const [noteFilterSearch, setNoteFilterSearch] = useState('');
  const filterRef = useRef(null);
  const [showRemFilterDrop, setShowRemFilterDrop] = useState(false);
  const [remFilterSearch, setRemFilterSearch] = useState('');
  const remFilterRef = useRef(null);

  // Reminder Form
  const [remDate, setRemDate] = useState('');
  const [remPriority, setRemPriority] = useState('Medium');
  const [remAmount, setRemAmount] = useState('');
  const [remDescription, setRemDescription] = useState('');

  // Inline Editing States
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', content: '', color: 0, isPinned: false, category: 'Personal',
    text: '', description: '', priority: 'Medium', dueDate: '', amount: ''
  });
  const [isSavingInline, setIsSavingInline] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchReminders();
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterDrop(false);
      if (remFilterRef.current && !remFilterRef.current.contains(e.target)) setShowRemFilterDrop(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for due reminders every 60 seconds → push to notification bell (non-blocking)
  useEffect(() => {
    const checkDue = () => {
      fetch(`${API}/api/v1/reminders/due`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) return;
          const tasks = data.flatMap(reminder => [
            fetch(`${API}/api/v1/notifications/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ message: `Reminder Due: ${reminder.text}`, type: 'REMINDER', link: '/notes' })
            }).catch(() => {}),
            fetch(`${API}/api/v1/reminders/notified/${reminder._id}`, {
              method: 'PUT', credentials: 'include'
            }).catch(() => {})
          ]);
          Promise.allSettled(tasks).catch(() => {});
        })
        .catch(() => {});
    };
    checkDue();
    const interval = setInterval(checkDue, 60000);
    return () => clearInterval(interval);
  }, [API]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API}/api/v1/notes/get`, { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setNotes(Array.isArray(data) ? data : []); }
    } catch { console.error("Failed to load notes"); }
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${API}/api/v1/reminders/get`, { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setReminders(Array.isArray(data) ? data : []); }
    } catch { console.error("Failed to load reminders"); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return toast.error('Title is required');
    setLoading(true);
    try {
      if (entryType === 'Note') {
        const res = await fetch(`${API}/api/v1/notes/add`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ title, content, color: colorIndex, isPinned, category }),
        });
        if (res.ok) { fetchNotes(); toast.success('Note saved!'); setShowAddModal(false); resetForm(); }
      } else {
        const res = await fetch(`${API}/api/v1/reminders/add`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            text: title,
            description: remDescription,
            priority: remPriority,
            dueDate: remDate || null,
            dueTime: remDate ? new Date(remDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            amount: remAmount ? Number(remAmount) : null,
            category: category,
          }),
        });
        if (res.ok) { fetchReminders(); toast.success('Reminder added!'); setShowAddModal(false); resetForm(); }
        else { const err = await res.json(); toast.error(err.message || 'Failed'); }
      }
    } catch { toast.error("Request failed"); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setTitle(''); setContent(''); setColorIndex(0); setIsPinned(false);
    setCategory('Personal'); setRemDate(''); setRemPriority('Medium'); setRemAmount('');
    setRemDescription('');
  };

  const confirmDelete = (type, id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm {type === 'note' ? 'Note' : 'Reminder'} Deletion</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Permanent removal? This action cannot be reversed and will clear the {type === 'note' ? 'note' : 'reminder'} from your database.
        </p>
        <div className="flex justify-end gap-2 mt-1" onPointerDownCapture={(e) => e.stopPropagation()}>
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const endpoint = type === 'note' ? `/api/v1/notes/delete/${id}` : `/api/v1/reminders/delete/${id}`;
                const res = await fetch(`${API}${endpoint}`, { method: 'DELETE', credentials: 'include' });
                if (res.ok) {
                  toast.success('Deleted', { id: 'del-succ-note', duration: 3000 });
                  if (type === 'note') fetchNotes();
                  else fetchReminders();
                }
              } catch {
                toast.error("Delete failed");
              }
            }}
            className="btn btn-danger !py-1.5 !px-3 !text-[10px]"
          >
            Delete Now
          </button>
        </div>
      </div>
    ), { duration: Infinity, className: '!bg-surface-container !border !border-glass-border !rounded-2xl !shadow-2xl' });
  };

  const startInlineEdit = (item, type) => {
    setEditingId(item._id);
    if (type === 'note') {
      setEditFormData({
        title: item.title,
        content: item.content,
        color: item.color,
        isPinned: item.isPinned,
        category: item.category
      });
    } else {
      setEditFormData({
        text: item.text,
        description: item.description,
        priority: item.priority,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
        amount: item.amount || '',
        category: item.category || 'Personal'
      });
    }
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({
      title: '', content: '', color: 0, isPinned: false, category: 'Personal',
      text: '', description: '', priority: 'Medium', dueDate: '', amount: ''
    });
  };

  const handleInlineSave = async (id, type) => {
    setIsSavingInline(true);
    try {
      if (type === 'note') {
        const res = await fetch(`${API}/api/v1/notes/update/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: editFormData.title,
            content: editFormData.content,
            color: editFormData.color,
            isPinned: editFormData.isPinned,
            category: editFormData.category
          }),
        });
        if (res.ok) {
          toast.success('Note updated');
          setEditingId(null);
          fetchNotes();
        }
      } else {
        const res = await fetch(`${API}/api/v1/reminders/update/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            text: editFormData.text,
            description: editFormData.description,
            priority: editFormData.priority,
            dueDate: editFormData.dueDate,
            amount: editFormData.amount ? Number(editFormData.amount) : null,
            category: editFormData.category || 'Personal'
          }),
        });
        if (res.ok) {
          toast.success('Reminder updated');
          setEditingId(null);
          fetchReminders();
        }
      }
    } catch {
      toast.error('Update failed');
    } finally {
      setIsSavingInline(false);
    }
  };

  const togglePin = async (noteId, currentPinState) => {
    try {
      const res = await fetch(`${API}/api/v1/notes/update/${noteId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ isPinned: !currentPinState }),
      });
      if (res.ok) { fetchNotes(); toast.success(!currentPinState ? 'Pinned' : 'Unpinned'); }
    } catch { toast.error('Failed to update pin'); }
  };

  const toggleComplete = async (remId, current) => {
    try {
      const res = await fetch(`${API}/api/v1/reminders/toggle/${remId}`, {
        method: 'PUT', credentials: 'include',
      });
      if (res.ok) { fetchReminders(); toast.success(current ? 'Marked incomplete' : 'Completed!'); }
    } catch { toast.error('Failed'); }
  };

  // Advanced Sort
  const [noteSort, setNoteSort] = useState('Newest');

  const sortedNotes = [...notes]
    .filter(n => filterType === 'All' || n.category === filterType)
    .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (b.isPinned !== a.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      return noteSort === 'Newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });

  const filteredReminders = [...reminders]
    .filter(r => remFilterPriority === 'All' || r.priority === remFilterPriority)
    .filter(r => !searchQuery ||
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="page-container animate-fade-in-up pb-10">

      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Notebook</p>
          <h1 className="page-title">Notes & Reminders</h1>
          <p className="page-subtitle">Record thoughts and set alerts for important events.</p>
        </div>
        <button onClick={() => { setEntryType('Note'); setShowAddModal(true); }} className="btn btn-primary text-xs">
          <Plus size={14} /> New Entry
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-surface-container p-1 rounded-xl border border-glass-border w-fit">
          {['notes', 'reminders'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-surface-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {tab === 'notes' ? 'Notes' : 'Reminders'}
            </button>
          ))}
        </div>
        <div className="relative max-w-[240px] w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="input-field !py-2 pl-9 text-xs" />
        </div>
      </div>

      {activeTab === 'notes' ? (
        <div className="space-y-6">
          {/* Category Filters + Sort */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterDrop(!showFilterDrop)}
                className="flex items-center gap-3 px-5 py-2.5 bg-surface-lowest border-2 border-glass-border rounded-xl hover:border-primary/30 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <StickyNote size={14} />
                </div>
                <div className="flex flex-col items-start min-w-[120px]">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 leading-none mb-1">Category</span>
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-tight leading-none">{filterType}</span>
                </div>
                <ChevronDown size={14} className={`text-on-surface-variant transition-transform duration-500 ${showFilterDrop ? 'rotate-180 text-primary' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilterDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 w-64 mt-2 bg-white border border-glass-border rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-3xl"
                  >
                    <div className="p-3 border-b border-glass-border flex items-center gap-3 bg-surface-container/10">
                      <Search size={12} className="text-primary" />
                      <input
                        type="text"
                        autoFocus
                        value={noteFilterSearch}
                        onChange={e => setNoteFilterSearch(e.target.value)}
                        placeholder="FILTER CATEGORIES..."
                        className="w-full bg-transparent text-[9px] font-black text-on-surface outline-none placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                      {categories.filter(c => c.toLowerCase().includes(noteFilterSearch.toLowerCase())).map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterType(cat);
                            setShowFilterDrop(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all border-2 mb-1 last:mb-0 ${filterType === cat
                            ? 'bg-primary/5 border-primary text-primary'
                            : 'bg-transparent border-transparent hover:bg-surface-high'
                            }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                          {filterType === cat && <Zap size={10} fill="currentColor" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <select
              value={noteSort}
              onChange={e => setNoteSort(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-on-surface-variant outline-none cursor-pointer hover:text-primary transition-colors"
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedNotes.map(note => {
              const theme = noteColors[note.color] || noteColors[0];
              const isEditing = editingId === note._id;

              return (
                <div key={note._id} className={`stat-card flex flex-col group relative overflow-hidden h-fit min-h-[180px] hover:shadow-xl transition-all duration-500 border-b-4 ${isEditing ? 'bg-surface-container border-primary' : theme.class}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {!isEditing && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => togglePin(note._id, note.isPinned)}
                          className={`p-1.5 rounded-lg transition-all ${note.isPinned ? 'text-primary bg-primary/10' : 'text-on-surface-variant opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-surface-container'}`}>
                          <Pin size={13} fill={note.isPinned ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={() => startInlineEdit(note, 'note')}
                          className="p-1.5 text-primary rounded-lg hover:bg-primary/10 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => confirmDelete('note', note._id)}
                          className="p-1.5 text-error rounded-lg hover:bg-error/10 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 flex flex-col h-full">
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-sm font-bold text-on-surface outline-none focus:border-primary"
                        placeholder="Title..."
                      />
                      <textarea
                        value={editFormData.content}
                        onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                        className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-[11px] font-medium text-on-surface-variant outline-none focus:border-primary resize-none flex-1 min-h-[80px]"
                        placeholder="Content..."
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={editFormData.category}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          className="bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest outline-none"
                        >
                          {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="flex gap-1.5">
                          {noteColors.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => setEditFormData({ ...editFormData, color: i })}
                              className={`w-4 h-4 rounded-full border-2 ${c.dot} ${editFormData.color === i ? 'border-on-surface' : 'border-transparent'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-glass-border/30">
                        <button
                          onClick={() => handleInlineSave(note._id, 'note')}
                          disabled={isSavingInline}
                          className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all"
                        >
                          {isSavingInline ? '...' : 'SAVE'}
                        </button>
                        <button
                          onClick={cancelInlineEdit}
                          className="flex-1 py-1.5 bg-surface-lowest text-on-surface-variant text-[10px] font-bold rounded-lg hover:bg-surface-container transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-on-surface leading-tight mb-3 line-clamp-2">{note.title}</h3>
                      <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed opacity-90 line-clamp-4 flex-1">{note.content}</p>

                      <div className="mt-4 flex flex-col gap-2 border-t border-glass-border/30 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="badge !bg-on-surface/5 !text-on-surface-variant text-[8px] font-black uppercase tracking-widest">
                            {note.category || 'General'}
                          </span>
                          <span className="text-[8px] font-bold text-on-surface-variant opacity-40 italic">
                            {Math.ceil((note.content?.length || 0) / 200)} min read
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <div onClick={() => { setEntryType('Note'); setShowAddModal(true); }}
              className="rounded-2xl border-2 border-dashed border-glass-border p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-all group min-h-[160px]">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={20} className="text-primary" />
              </div>
              <h4 className="font-bold text-on-surface text-sm">Create Note</h4>
              <p className="text-[10px] text-on-surface-variant mt-1">Write something down</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Priority Filters Dropdown */}
          <div className="relative" ref={remFilterRef}>
            <button 
              onClick={() => setShowRemFilterDrop(!showRemFilterDrop)}
              className="flex items-center gap-3 px-5 py-2.5 bg-surface-lowest border-2 border-glass-border rounded-xl hover:border-secondary/30 transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                <Bell size={14} />
              </div>
              <div className="flex flex-col items-start min-w-[120px]">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 leading-none mb-1">Priority</span>
                <span className="text-[10px] font-black text-on-surface uppercase tracking-tight leading-none">{remFilterPriority}</span>
              </div>
              <ChevronDown size={14} className={`text-on-surface-variant transition-transform duration-500 ${showRemFilterDrop ? 'rotate-180 text-secondary' : ''}`} />
            </button>

            <AnimatePresence>
              {showRemFilterDrop && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 w-56 mt-2 bg-white border border-glass-border rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-3xl"
                >
                  <div className="p-3 border-b border-glass-border bg-surface-container/10">
                    <input 
                      type="text" 
                      autoFocus 
                      value={remFilterSearch} 
                      onChange={e => setNoteFilterSearch(e.target.value)} 
                      placeholder="SEARCH PRIORITY..." 
                      className="w-full bg-transparent text-[9px] font-black text-on-surface outline-none placeholder:text-on-surface-variant/30 uppercase tracking-widest" 
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                    {['All', 'High', 'Medium', 'Low'].filter(p => p.toLowerCase().includes(noteFilterSearch.toLowerCase())).map(p => (
                      <button
                        key={p}
                        onClick={() => { 
                          setRemFilterPriority(p); 
                          setShowRemFilterDrop(false); 
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all border-2 mb-1 last:mb-0 ${remFilterPriority === p 
                          ? 'bg-secondary/10 border-secondary text-secondary' 
                          : 'bg-transparent border-transparent hover:bg-surface-high'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${p === 'High' ? 'bg-error' : p === 'Medium' ? 'bg-secondary' : p === 'Low' ? 'bg-primary' : 'bg-on-surface-variant opacity-40'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                        </div>
                        {remFilterPriority === p && <Zap size={10} fill="currentColor" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {filteredReminders.map(reminder => {
                const cfg = priorityConfig[reminder.priority] || priorityConfig.Medium;
                const Icon = cfg.icon;
                const dueDate = reminder.dueDate ? new Date(reminder.dueDate) : null;
                const isOverdue = dueDate && dueDate < new Date() && !reminder.isCompleted;
                const isEditing = editingId === reminder._id;

                // Days remaining detailing
                const daysDiff = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <div key={reminder._id} className={`stat-card !p-5 flex flex-col gap-4 group transition-all duration-300 ${reminder.isCompleted ? 'opacity-50' : 'hover:border-primary/30'} ${isEditing ? 'border-primary shadow-lg bg-surface-container' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {!isEditing && (
                          <button onClick={() => toggleComplete(reminder._id, reminder.isCompleted)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${reminder.isCompleted ? 'bg-success/10 text-success' : cfg.class}`}>
                            {reminder.isCompleted ? <AlertCircle size={18} /> : <Icon size={18} />}
                          </button>
                        )}
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editFormData.text}
                                onChange={(e) => setEditFormData({ ...editFormData, text: e.target.value })}
                                className="w-full bg-surface-lowest border border-glass-border rounded-lg px-3 py-2 text-sm font-bold text-on-surface outline-none focus:border-primary"
                                placeholder="Reminder text..."
                              />
                              <textarea
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                className="w-full bg-surface-lowest border border-glass-border rounded-lg px-3 py-2 text-[11px] font-medium text-on-surface-variant outline-none focus:border-primary resize-none min-h-[60px]"
                                placeholder="Description..."
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Priority</label>
                                  <select
                                    value={editFormData.priority}
                                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                                    className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase outline-none mt-1"
                                  >
                                    {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Due Date</label>
                                  <input
                                    type="date"
                                    value={editFormData.dueDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                                    className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none mt-1"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Category</label>
                                  <select
                                    value={editFormData.category}
                                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                    className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase outline-none mt-1"
                                  >
                                    {categories.filter(c => c !== 'All').map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Amount ({currencySymbol})</label>
                                <input
                                  type="number"
                                  value={editFormData.amount}
                                  onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                                  className="w-full bg-surface-lowest border border-glass-border rounded-lg px-3 py-2 text-xs font-black outline-none mt-1"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex gap-2 pt-2 border-t border-glass-border/30">
                                <button
                                  onClick={() => handleInlineSave(reminder._id, 'reminder')}
                                  disabled={isSavingInline}
                                  className="flex-1 py-2 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all"
                                >
                                  {isSavingInline ? '...' : 'SAVE CHANGES'}
                                </button>
                                <button
                                  onClick={cancelInlineEdit}
                                  className="flex-1 py-2 bg-surface-lowest text-on-surface-variant text-[10px] font-bold rounded-lg hover:bg-surface-container transition-all"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className={`text-sm font-bold text-on-surface truncate mb-1 ${reminder.isCompleted ? 'line-through opacity-60' : ''}`}>
                                {reminder.text}
                              </h4>
                              {reminder.description && (
                                <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-3 leading-relaxed opacity-70">
                                  {reminder.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${cfg.class.split(' ')[0]}`}>
                                  {reminder.priority}
                                </span>
                                {dueDate && (
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${isOverdue ? 'text-error' : 'text-on-surface-variant opacity-60'}`}>
                                      {isOverdue ? 'Overdue: ' : 'Due: '}{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    {!reminder.isCompleted && daysDiff !== null && (
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${daysDiff <= 1 ? 'bg-error/10 text-error' : 'bg-primary/5 text-primary/60'}`}>
                                        {daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : `${daysDiff}d left`}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {reminder.amount && (
                                  <span className="text-[10px] font-bold text-primary">{currencySymbol} {reminder.amount.toLocaleString()}</span>
                                )}
                                <span className="badge !bg-on-surface/5 !text-on-surface-variant text-[8px] font-black uppercase tracking-widest">
                                  {reminder.category || 'Personal'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {!isEditing && (
                        <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                          <button onClick={() => startInlineEdit(reminder, 'reminder')}
                            className="p-2 text-primary hover:bg-primary/10 transition-colors rounded-lg">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => confirmDelete('reminder', reminder._id)}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error/10">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredReminders.length === 0 && (
                <div className="stat-card py-16 text-center opacity-30">
                  <Bell size={36} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Reminders Found</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="stat-card">
                <h4 className="section-title text-sm mb-4 flex items-center gap-2">
                  <AlertCircle size={16} className="text-secondary" /> Quick Actions
                </h4>
                <button onClick={() => { setEntryType('Reminder'); setShowAddModal(true); }}
                  className="btn btn-outline w-full text-[10px] justify-center gap-2">
                  <Plus size={14} /> New Reminder
                </button>
              </div>
              <div className="stat-card">
                <p className="stat-label mb-3">Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Total</span>
                    <span className="font-bold text-on-surface">{reminders.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Completed</span>
                    <span className="font-bold text-success">{reminders.filter(r => r.isCompleted).length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Overdue</span>
                    <span className="font-bold text-error">
                      {reminders.filter(r => r.dueDate && new Date(r.dueDate) < new Date() && !r.isCompleted).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Create ${entryType}`}>
        <div className="flex bg-surface-container p-1 rounded-xl border border-glass-border w-fit mb-4">
          {['Note', 'Reminder'].map(type => (
            <button key={type} onClick={() => setEntryType(type)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${entryType === type ? 'bg-surface-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {type}
            </button>
          ))}
        </div>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="input-label">Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title" className="input-field" />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field cursor-pointer">
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {entryType === 'Note' ? (
            <>
              <div>
                <label className="input-label">Content</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="Details..." className="input-field h-28 resize-none" />
              </div>
              <div>
                <label className="input-label">Color</label>
                <div className="flex gap-3">
                  {noteColors.map((c, i) => (
                    <button key={i} type="button" onClick={() => setColorIndex(i)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${colorIndex === i ? 'scale-125 border-on-surface' : 'border-transparent opacity-60'} ${c.dot}`} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Due Date & Time</label>
                <input type="datetime-local" value={remDate} onChange={e => setRemDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select value={remPriority} onChange={e => setRemPriority(e.target.value)} className="input-field cursor-pointer">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Description (Optional)</label>
                <textarea value={remDescription} onChange={e => setRemDescription(e.target.value)} placeholder="Add some context..." className="input-field h-20 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="input-label">Amount ({currencySymbol}) (Optional)</label>
                <input type="number" value={remAmount} onChange={e => setRemAmount(e.target.value)} placeholder="e.g. 5000" className="input-field" />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : `Save ${entryType}`}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Notes;
