import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const IncomeEditModal = ({ income, onClose, onSave }) => {
  const [formData, setFormData] = useState(income);

  useEffect(() => {
    setFormData(income);
  }, [income]);

  // Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Modal Box */}
      <div className="bg-white w-[400px] rounded-3xl shadow-2xl p-6 relative animate-in fade-in duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Edit Income
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData?.title || ""}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData?.amount || ""}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Source
            </label>

            <select
              name="source"
              value={formData?.source || ""}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-violet-500 outline-none bg-white"
              required
            >
              <option value="" disabled>
                Select Source
              </option>

              {[
                "Salary",
                "Freelancing",
                "Business",
                "Investments",
                "Gift",
                "Other",
              ].map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition"
            >
              Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default IncomeEditModal;