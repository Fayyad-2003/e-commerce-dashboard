"use client";
import { useState, useEffect } from "react";

export default function DiscountForm({ initialData = null, onSubmit, onCancel, submitting = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "order_total",
    value: initialData?.value ?? "",
    value_type: initialData?.value_type || "fixed",
    min_order_total: initialData?.min_order_total ?? "",
  });

  useEffect(() => {
    setFormData({
      name: initialData?.name || "",
      type: initialData?.type || "order_total",
      value: initialData?.value ?? "",
      value_type: initialData?.value_type || "fixed",
      min_order_total: initialData?.min_order_total ?? "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {initialData ? "تعديل الخصم" : "خصم جديد"}
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم الخصم</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="order_total">إجمالي الطلب</option>
            <option value="payment_method">طريقة الدفع</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="value"
            value={formData.value}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوع القيمة</label>
          <select
            name="value_type"
            value={formData.value_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fixed">مبلغ ثابت</option>
            <option value="percentage">نسبة مئوية</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للطلب</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="min_order_total"
            value={formData.min_order_total}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70"
          >
            {submitting ? "جاري الحفظ…" : (initialData ? "حفظ التعديلات" : "إضافة الخصم")}
          </button>
        </div>
      </form>
    </div>
  );
}