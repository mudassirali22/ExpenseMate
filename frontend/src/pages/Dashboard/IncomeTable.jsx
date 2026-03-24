import React, { useState } from "react";
import { Trash2, Edit3, Search, Filter } from "lucide-react";
import { toast } from 'react-hot-toast';

const IncomeTable = ({ incomes = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIncomes, setSelectedIncomes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sources = ["All", "Salary", "Freelance", "Investments", "Business", "Gifts", "Others"];

  const filteredIncomes = incomes.filter((inc) => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === "All" || inc.source.toLowerCase() === sourceFilter.toLowerCase();
    return matchesSearch && matchesSource;
  });

  const handleSelectIncome = (incomeId) => {
    setSelectedIncomes(prev =>
      prev.includes(incomeId)
        ? prev.filter(id => id !== incomeId)
        : [...prev, incomeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIncomes.length === filteredIncomes.length) {
      setSelectedIncomes([]);
    } else {
      setSelectedIncomes(filteredIncomes.map(inc => inc._id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIncomes.length === 0) return;
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = selectedIncomes.map(id =>
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/income/delete/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      );

      await Promise.all(deletePromises);
      
      // Update parent state by calling onDelete for each deleted income
      selectedIncomes.forEach(id => onDelete && onDelete(id));
      
      setSelectedIncomes([]);
      setSelectMode(false);
      setShowDeleteModal(false);
      toast.success(`${selectedIncomes.length} income(s) deleted`);
    } catch (error) {
      console.error('Error deleting incomes:', error);
      toast.error('Failed to delete some incomes. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">
            All Income
          </h2>
          {selectMode && (
            <span className="text-sm text-slate-500">
              {selectedIncomes.length} selected
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {selectMode ? (
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm"
              >
                {selectedIncomes.length === filteredIncomes.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIncomes.length === 0}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Selected ({selectedIncomes.length})
              </button>
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedIncomes([]);
                }}
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search income..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none w-full sm:w-auto transition-all cursor-pointer"
                >
                  {sources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setSelectMode(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm whitespace-nowrap"
              >
                Select Mode
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">

          <thead className="bg-slate-50">
            <tr>
              {selectMode && (
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIncomes.length === filteredIncomes.length && filteredIncomes.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Title
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Source
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                Date
              </th>
              {!selectMode && (
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition">
                  {selectMode && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIncomes.includes(item._id)}
                        onChange={() => handleSelectIncome(item._id)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {item.title}
                  </td>

                  <td className="px-6 py-4 text-green-500 font-bold">
                    Rs = {item.amount?.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 capitalize text-slate-600">
                    {item.source}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.date).toLocaleDateString()}
                  </td>

                  {/* ACTION COLUMN */}
                  {!selectMode && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">

                        {/* Edit Button */}
                        <button
                          onClick={() => onEdit && onEdit(item)}
                          className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition"
                        >
                          <Edit3 size={18} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDelete && onDelete(item._id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectMode ? "6" : "5"} className="text-center py-12 text-slate-400">
                  No income found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-[6px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Incomes</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-red-500">{selectedIncomes.length}</span> income record{selectedIncomes.length > 1 ? 's' : ''}? 
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

export default IncomeTable;