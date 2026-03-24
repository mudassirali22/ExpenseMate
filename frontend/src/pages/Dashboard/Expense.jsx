import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, PenTool, DollarSign, Calendar, Tag, Loader2 } from "lucide-react";

const categories = [
  "Shopping",
  "Transport",
  "Food",
  "Salary",
  "Bills",
  "Entertainment",
  "Utilities",
  "Health",
  "Education",
  "Other"
];

const AddExpenseForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date),
    };

    try {
      const response = await fetch(
         `${import.meta.env.VITE_BACKEND_URL}/api/v1/expenses/add`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add expense");
      }

      toast.success("Expense Added Successfully");
      
      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });

    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto glass-panel overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white border-b border-white/20">
        <div className="flex items-center gap-3">
          <PlusCircle size={28} />
          <h2 className="text-xl font-bold">Add New Expense</h2>
        </div>
        <p className="text-indigo-100 text-sm mt-1">Fill in the details to track your spending.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <PenTool size={16} className="text-slate-400" /> Expense Title
          </label>
          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Weekly Groceries"
            className="input-box"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-slate-400" /> Amount
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="input-box"
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" /> Date
            </label>
            <input
              required
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-box"
            />
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Tag size={16} className="text-slate-400" /> Category
          </label>
          <select
            required
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-box cursor-pointer"
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            'Save Expense'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;