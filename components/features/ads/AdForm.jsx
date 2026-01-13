"use client";
import { useState, useEffect } from "react";

export default function AdForm({ initialData = null, onSubmit, onCancel, submitting = false, errors = {} }) {
    const [formData, setFormData] = useState({
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(initialData?.image_url || "");

    useEffect(() => {
        setFormData({
            image: null,
        });
        setImagePreview(initialData?.image_url || "");
    }, [initialData]);

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
            <h2 className="text-xl font-bold mb-6 text-gray-800 text-right">
                {initialData ? "تعديل الإعلان" : "إعلان جديد"}
            </h2>

            <form onSubmit={submit} className="space-y-6">
                {errors.form && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm text-right">
                        {errors.form}
                    </div>
                )}

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-50 transition-colors">
                    {imagePreview ? (
                        <div className="relative group w-full">
                            <img
                                src={imagePreview}
                                alt="Ad Preview"
                                className="w-full h-auto max-h-96 object-contain rounded-lg shadow"
                            />
                            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium rounded-lg">
                                تغيير الصورة
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center cursor-pointer space-y-2">
                            <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-gray-600 font-medium">اضغط لرفع صورة الإعلان</span>
                            <span className="text-gray-400 text-sm">JPG, PNG, WEBP (بحد أقصى 2MB)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                    {errors.image && <p className="text-sm text-red-500 mt-2 text-right w-full">{errors.image}</p>}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || (!formData.image && !initialData?.image_url)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-sm font-medium"
                    >
                        {submitting ? "جاري الحفظ…" : (initialData ? "حفظ التعديلات" : "إضافة الإعلان")}
                    </button>
                </div>
            </form>
        </div>
    );
}
