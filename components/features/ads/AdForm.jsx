"use client";
import { useState, useEffect } from "react";

export default function AdForm({ initialData = null, onSubmit, onCancel, submitting = false, errors = {} }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        link: initialData?.link || "",
        position: initialData?.position || "",
        is_active: initialData?.is_active ?? true,
        start_date: initialData?.start_date || "",
        end_date: initialData?.end_date || "",
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(initialData?.image_url || "");

    useEffect(() => {
        setFormData({
            title: initialData?.title || "",
            description: initialData?.description || "",
            link: initialData?.link || "",
            position: initialData?.position || "",
            is_active: initialData?.is_active ?? true,
            start_date: initialData?.start_date || "",
            end_date: initialData?.end_date || "",
            image: null,
        });
        setImagePreview(initialData?.image_url || "");
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
                {initialData ? "تعديل الإعلان" : "إعلان جديد"}
            </h2>

            <form onSubmit={submit} className="space-y-4">
                {errors.form && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {errors.form}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        required
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرابط</label>
                    <input
                        type="url"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.link ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                    />
                    {errors.link && <p className="text-sm text-red-500 mt-1">{errors.link}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                    <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.position ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        required
                    >
                        <option value="">اختر الموقع</option>
                        <option value="home_banner">بانر الصفحة الرئيسية</option>
                        <option value="sidebar">الشريط الجانبي</option>
                        <option value="header">الرأس</option>
                        <option value="footer">التذييل</option>
                        <option value="popup">نافذة منبثقة</option>
                    </select>
                    {errors.position && <p className="text-sm text-red-500 mt-1">{errors.position}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">صورة الإعلان</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                    {imagePreview && (
                        <div className="mt-2">
                            <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded border" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.start_date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                        />
                        {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.end_date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                        />
                        {errors.end_date && <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>}
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="mr-2 text-sm font-medium text-gray-700">نشط</label>
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
                        {submitting ? "جاري الحفظ…" : (initialData ? "حفظ التعديلات" : "إضافة الإعلان")}
                    </button>
                </div>
            </form>
        </div>
    );
}
