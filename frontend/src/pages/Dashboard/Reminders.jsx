import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CircleCheck, CircleAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");
  const [adding, setAdding] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reminders/get`, {
        credentials: "include"
      });
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReminder = (reminderId) => {
    setSelectedReminders(prev =>
      prev.includes(reminderId)
        ? prev.filter(id => id !== reminderId)
        : [...prev, reminderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReminders.length === reminders.length) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(reminders.map(r => r._id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedReminders.length === 0) return;
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = selectedReminders.map(id =>
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reminders/delete/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      );

      await Promise.all(deletePromises);
      setReminders(reminders.filter(r => !selectedReminders.includes(r._id)));
      setSelectedReminders([]);
      setSelectMode(false);
      setShowDeleteModal(false);
      toast.success(`${selectedReminders.length} reminder(s) deleted`);
    } catch (error) {
      console.error('Error deleting reminders:', error);
      toast.error('Failed to delete some reminders. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newReminder.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reminders/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: newReminder, priority, category })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add reminder");

      setReminders([data, ...reminders]);
      setNewReminder("");
      toast.success("Note added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add reminder");
    } finally {
      setAdding(false);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reminders/toggle/${id}`, {
        method: "PUT",
        credentials: "include"
      });
      const updated = await res.json();
      setReminders(reminders.map(r => r._id === id ? updated : r));
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const deleteReminder = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reminders/delete/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      setReminders(reminders.filter(r => r._id !== id));
      toast.success("Deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Advanced Notes</h2>
          <p className="text-slate-500 font-medium">Organize your financial thoughts and future plans.</p>
          {selectMode && (
            <p className="text-sm text-slate-500 mt-1">
              {selectedReminders.length} selected
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectMode ? (
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm"
              >
                {selectedReminders.length === reminders.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedReminders.length === 0}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Selected ({selectedReminders.length})
              </button>
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedReminders([]);
                }}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectMode(true)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm"
            >
              Select Mode
            </button>
          )}
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-sm">
            <Bell size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-8">

        {/* Left: Add Form */}
        <div className="space-y-6">
          <form onSubmit={handleAdd} className="glass-panel p-8 space-y-6 sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} /> Create New Note
            </h3>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Content</label>
              <textarea
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="Write your note here... (e.g. Plan for next month's savings, check insurance rates...)"
                rows={6}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-indigo-600 transition-all font-medium text-slate-700 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none cursor-pointer font-bold text-slate-600"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none cursor-pointer font-bold text-slate-600"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={adding || !newReminder.trim()}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-indigo-100 mt-4"
            >
              {adding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
              Add to My List
            </button>
          </form>
        </div>

        {/* Right: List */}
        <div className="space-y-6">
          {reminders.length === 0 ? (
            <div className="py-32 text-center glass-panel">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CircleAlert size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 text-lg font-bold">Your note list is currently empty.</p>
              <p className="text-slate-300 text-sm">Add a note on the left to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reminders.map((memo) => (
                <div
                  key={memo._id}
                  onClick={() => selectMode && handleSelectReminder(memo._id)}
                  className={`glass-panel p-8 transition-all group relative overflow-hidden cursor-${selectMode ? 'pointer' : 'default'} ${memo.isCompleted ? 'opacity-60 bg-slate-50/50' : 'hover:shadow-xl hover:-translate-y-1'} ${selectMode && selectedReminders.includes(memo._id) ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''}`}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 opacity-20"></div>

                  <div className="flex items-start gap-6">
                    {selectMode ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectReminder(memo._id);
                        }}
                        className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedReminders.includes(memo._id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 hover:border-indigo-600'
                          }`}
                      >
                        {selectedReminders.includes(memo._id) && <CircleCheck size={18} />}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleComplete(memo._id)}
                        className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${memo.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-indigo-600'
                          }`}
                      >
                        {memo.isCompleted && <CircleCheck size={18} />}
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${memo.priority === 'High' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                            memo.priority === 'Medium' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                              'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                          {memo.priority} Priority
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {memo.category || 'Personal'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-auto">
                          {new Date(memo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <p className={`text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-lg ${memo.isCompleted ? 'line-through decoration-slate-300 decoration-2 text-slate-400' : ''}`}>
                        {memo.text}
                      </p>
                    </div>

                    {!selectMode && (
                      <button
                        onClick={() => deleteReminder(memo._id)}
                        className="flex-shrink-0 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
         <div className="fixed inset-0 backdrop-blur-[6px] flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Reminders</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-red-500">{selectedReminders.length}</span> reminder{selectedReminders.length > 1 ? 's' : ''}?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
