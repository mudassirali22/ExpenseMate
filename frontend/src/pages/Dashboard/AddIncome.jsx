import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, PenTool, DollarSign, Calendar, Tag, Loader2 } from "lucide-react";

const AddIncome = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
  });

  const incomeSources = [
    "Salary",
    "Freelancing",
    "Business",
    "Investments",
    "Gift",
    "Other",
  ];

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
        // "http://localhost:8000/api/v1/income/addIncome",
         `${import.meta.env.VITE_BACKEND_URL}/api/v1/income/addIncome`,
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
        throw new Error(data.message || "Failed to add income");
      }

      toast.success("Income Added Successfully");

       if (onSuccess) {
        onSuccess();
       }


      setFormData({
        title: "",
        amount: "",
        source: "",
        date: new Date().toISOString().split("T")[0],
      });

    } catch (error) {
      console.error(error.message);
      toast.error(error.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto glass-panel overflow-hidden animate-fade-in-up">

      {/* 🔵 HEADER */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white border-b border-white/20">
        <div className="flex items-center gap-3">
          <PlusCircle size={28} />
          <h2 className="text-xl font-bold">Add New Income</h2>
        </div>
        <p className="text-emerald-100 text-sm mt-1">
          Fill details to track your income.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <PenTool size={16} /> Income Title
          </label>

          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g Project Payment"
            className="input-box"
          />
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <DollarSign size={16} /> Amount
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

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar size={16} /> Date
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

        {/* Source */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <Tag size={16} /> Income Source
          </label>

          <select
            required
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="input-box cursor-pointer"
          >
            <option value="" disabled>
              Select Source
            </option>

            {incomeSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed !bg-gradient-to-r !from-emerald-500 !to-teal-600 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.5)]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            "Save Income"
          )}
        </button>

      </form>
    </div>
  );
};

export default AddIncome;