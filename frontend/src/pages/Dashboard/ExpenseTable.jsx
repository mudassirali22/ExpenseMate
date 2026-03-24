import React, { useState } from "react";
import { Trash2, Edit3, Search, Filter, Check, X } from "lucide-react";
import { toast } from 'react-hot-toast';

const ExpenseTable = ({ expenses = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = ["All", "Shopping", "Travel", "Food", "Salary", "Bills", "Entertainment", "Others"];

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || exp.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleSelectExpense = (expenseId) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(exp => exp._id));
    }
  };

const handleBulkDelete = () => {
    if (selectedExpenses.length === 0) return;
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete all selected expenses
      await Promise.all(selectedExpenses.map(id => onDelete(id)));
      setSelectedExpenses([]);
      setSelectMode(false);
      setShowDeleteModal(false);
      toast.success(`${selectedExpenses.length} expense(s) deleted`);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error('Failed to delete some expenses. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedExpenses([]);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Header */}
<div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  
  <div className="flex items-center gap-4">
    <h2 className="text-xl font-bold text-slate-800">
      All Expenses
    </h2>
    {selectMode && (
      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
        {selectedExpenses.length} selected
      </span>
    )}
  </div>

  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
    {!selectMode ? (
      <>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none w-full sm:w-auto transition-all cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={toggleSelectMode}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
        >
          Select
        </button>
      </>
    ) : (
      <div className="flex gap-2">
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
        >
          {selectedExpenses.length === filteredExpenses.length ? 'Deselect All' : 'Select All'}
        </button>
        <button
          onClick={handleBulkDelete}
          disabled={selectedExpenses.length === 0}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete ({selectedExpenses.length})
        </button>
        <button
          onClick={toggleSelectMode}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
        >
          <X size={16} />
        </button>
      </div>
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
                    checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
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
                Category
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
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition">
                  {selectMode && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(item._id)}
                        onChange={() => handleSelectExpense(item._id)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {item.title}
                  </td>

                  <td className="px-6 py-4 text-red-500 font-bold">
                    Rs = {item.amount?.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 capitalize text-slate-600">
                    {item.category}
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
                  No expenses found
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Expenses</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-red-500">{selectedExpenses.length}</span> expense record{selectedExpenses.length > 1 ? 's' : ''}? 
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

export default ExpenseTable;